"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { formatDate, Iso8601Date, PuzzleId, ScheduleEntry, TaxonId } from "@wortle/shared"
import { Button, Card, CardContent, CardHeader, CardTitle, toast } from "@wortle/ui"
import { Plus, Trash2 } from "lucide-react"

import { trpc } from "@/trpc/client"

interface ScheduleMap {
  byDate: Map<string, ScheduleEntry>
  byPuzzleId: Map<number, ScheduleEntry[]>
}

const buildScheduleMap = (entries: ScheduleEntry[]): ScheduleMap => {
  const byDate = new Map<string, ScheduleEntry>()
  const byPuzzleId = new Map<number, ScheduleEntry[]>()
  for (const entry of entries) {
    byDate.set(entry.date, entry)
    const existing = byPuzzleId.get(entry.puzzleId) ?? []
    existing.push(entry)
    byPuzzleId.set(entry.puzzleId, existing)
  }
  return { byDate, byPuzzleId }
}

const toIsoDate = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

const getDaysInMonth = (year: number, month: number): number => new Date(year, month + 1, 0).getDate()

const getFirstDayOfWeek = (year: number, month: number): number => (new Date(year, month, 1).getDay() + 6) % 7

interface PuzzleInfo {
  id: PuzzleId
  speciesId: TaxonId
  commonName: string
  observationDate: string
  scheduledDates: string[]
}

export const ScheduleCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined)

  const utils = trpc.useUtils()
  const { data: scheduleEntries = [] } = trpc.schedule.list.useQuery()
  const { data: puzzles = [] } = trpc.puzzles.list.useQuery()
  const { data: taxa = [] } = trpc.taxa.list.useQuery()

  const setMutation = trpc.schedule.set.useMutation({
    onSuccess: () => {
      void utils.schedule.list.invalidate()
      setSelectedDate(undefined)
      toast.success("Schedule updated")
    },
  })

  const removeMutation = trpc.schedule.remove.useMutation({
    onSuccess: () => {
      void utils.schedule.list.invalidate()
      setSelectedDate(undefined)
      toast.success("Schedule entry removed")
    },
  })

  const scheduleMap = useMemo(() => buildScheduleMap(scheduleEntries), [scheduleEntries])

  const taxaMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const t of taxa) {
      map.set(t.id, t.commonName)
    }
    return map
  }, [taxa])

  const puzzleInfos: PuzzleInfo[] = useMemo(
    () =>
      puzzles.map((p) => ({
        id: p.id,
        speciesId: p.speciesId,
        commonName: taxaMap.get(p.speciesId) ?? p.speciesId,
        observationDate: p.observationDate,
        scheduledDates: (scheduleMap.byPuzzleId.get(p.id) ?? []).map((e) => e.date),
      })),
    [puzzles, taxaMap, scheduleMap],
  )

  const sortedPuzzleInfos = useMemo(
    () =>
      [...puzzleInfos].sort((a, b) => {
        if (a.scheduledDates.length === 0 && b.scheduledDates.length > 0) return -1
        if (a.scheduledDates.length > 0 && b.scheduledDates.length === 0) return 1
        return a.observationDate.localeCompare(b.observationDate)
      }),
    [puzzleInfos],
  )

  const handleAssign = (puzzleId: PuzzleId) => {
    if (selectedDate === undefined) return
    setMutation.mutate({ date: Iso8601Date(selectedDate), puzzleId })
  }

  const handleRemove = (date: string) => {
    removeMutation.mutate(Iso8601Date(date))
  }

  const prevMonth = () =>
    setCurrentMonth((prev) =>
      prev.month === 0 ? { year: prev.year - 1, month: 11 } : { year: prev.year, month: prev.month - 1 },
    )

  const nextMonth = () =>
    setCurrentMonth((prev) =>
      prev.month === 11 ? { year: prev.year + 1, month: 0 } : { year: prev.year, month: prev.month + 1 },
    )

  const today = toIsoDate(new Date())
  const daysInMonth = getDaysInMonth(currentMonth.year, currentMonth.month)
  const firstDayOfWeek = getFirstDayOfWeek(currentMonth.year, currentMonth.month)
  const monthLabel = new Date(currentMonth.year, currentMonth.month).toLocaleString("default", {
    month: "long",
    year: "numeric",
  })

  const selectedEntry = selectedDate ? scheduleMap.byDate.get(selectedDate) : undefined

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{monthLabel}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={prevMonth}>
                Prev
              </Button>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                Next
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border-border overflow-hidden rounded-lg border">
            <div className="grid grid-cols-7">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div
                  key={day}
                  className="border-border text-muted-foreground bg-muted/40 border-b p-2 text-center text-sm font-medium"
                >
                  {day}
                </div>
              ))}
              {Array.from({ length: firstDayOfWeek }, (_, i) => (
                <div key={`empty-${i}`} className="border-border bg-muted/20 min-h-20 border-r border-b" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1
                const dateStr = toIsoDate(new Date(currentMonth.year, currentMonth.month, day))
                const entry = scheduleMap.byDate.get(dateStr)
                const isSelected = selectedDate === dateStr
                const isToday = dateStr === today

                const puzzleForDay = entry ? puzzles.find((p) => p.id === entry.puzzleId) : undefined
                const speciesName = puzzleForDay ? (taxaMap.get(puzzleForDay.speciesId) ?? "") : ""

                const isLastCol = (firstDayOfWeek + i) % 7 === 6
                const isLastRow = i + firstDayOfWeek >= (Math.ceil((daysInMonth + firstDayOfWeek) / 7) - 1) * 7

                return (
                  <div
                    key={day}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedDate(isSelected ? undefined : dateStr)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setSelectedDate(isSelected ? undefined : dateStr)
                      }
                    }}
                    className={[
                      "min-h-20 cursor-pointer p-1.5 text-left transition-colors",
                      !isLastCol ? "border-r" : "",
                      !isLastRow ? "border-b" : "",
                      "border-border",
                      isSelected ? "ring-primary bg-primary/5 ring-2 ring-inset" : "hover:bg-muted/50",
                      isToday && !isSelected ? "bg-muted/30" : "",
                      entry && !isSelected ? "bg-green-50 dark:bg-green-950/20" : "",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between">
                      <span className={["text-sm", isToday ? "font-bold" : ""].join(" ")}>{day}</span>
                      {entry && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemove(dateStr)
                          }}
                          className="text-muted-foreground hover:text-destructive rounded p-0.5 transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    {entry && (
                      <div className="mt-1 text-xs leading-tight">
                        <Link
                          href={`/puzzles/${entry.puzzleId}/edit`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-muted-foreground hover:text-foreground font-mono underline-offset-2 hover:underline"
                        >
                          #{entry.puzzleId}
                        </Link>
                        {speciesName && (
                          <div className="truncate">
                            <Link
                              href={`/taxa/${puzzleForDay?.speciesId}/edit`}
                              onClick={(e) => e.stopPropagation()}
                              className="underline-offset-2 hover:underline"
                            >
                              {speciesName}
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
              {(() => {
                const totalCells = firstDayOfWeek + daysInMonth
                const trailing = (7 - (totalCells % 7)) % 7
                return Array.from({ length: trailing }, (_, i) => (
                  <div key={`trailing-${i}`} className="border-border bg-muted/20 min-h-20 border-r last:border-r-0" />
                ))
              })()}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Puzzles</CardTitle>
          <p className="text-muted-foreground text-sm">
            {selectedDate === undefined
              ? "Select a date on the calendar to assign a puzzle"
              : selectedEntry
                ? `${formatDate(Iso8601Date(selectedDate))} — Puzzle #${selectedEntry.puzzleId}`
                : `Assign puzzle for ${formatDate(Iso8601Date(selectedDate))}`}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sortedPuzzleInfos.map((puzzle) => (
              <div
                key={puzzle.id}
                className="border-border flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <Link
                      href={`/puzzles/${puzzle.id}/edit`}
                      className="text-muted-foreground hover:text-foreground font-mono underline-offset-2 hover:underline"
                    >
                      #{puzzle.id}
                    </Link>
                    <Link
                      href={`/taxa/${puzzle.speciesId}/edit`}
                      className="truncate font-medium underline-offset-2 hover:underline"
                    >
                      {puzzle.commonName}
                    </Link>
                  </div>
                  <div className="mt-0.5 space-y-0.5 text-xs">
                    <div className="text-muted-foreground">
                      <span className="text-muted-foreground/60 inline-block w-18">Observed</span>
                      {formatDate(Iso8601Date(puzzle.observationDate), { dateStyle: "medium" })}
                    </div>
                    {puzzle.scheduledDates.length > 0 && (
                      <div>
                        <span className="text-muted-foreground/60 inline-block w-18">Scheduled</span>
                        <span className="text-green-600 dark:text-green-400">
                          {puzzle.scheduledDates
                            .map((d) => formatDate(Iso8601Date(d), { dateStyle: "medium" }))
                            .join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {selectedDate !== undefined && (
                  <Button
                    variant="outline"
                    size="xs"
                    className="shrink-0"
                    onClick={() => handleAssign(puzzle.id)}
                    disabled={setMutation.isPending}
                  >
                    <Plus className="h-3 w-3" />
                    Assign
                  </Button>
                )}
              </div>
            ))}
            {sortedPuzzleInfos.length === 0 && (
              <p className="text-muted-foreground py-4 text-center text-sm">No puzzles available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
