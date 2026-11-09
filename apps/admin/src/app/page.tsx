"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { CalendarDays, Leaf, Puzzle, Upload } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@wortle/ui"

import { useTRPC } from "@/trpc/client"

export default function Home() {
  const trpc = useTRPC()
  const { data: taxa, isLoading: taxaLoading } = useQuery(trpc.taxa.list.queryOptions())
  const { data: puzzles, isLoading: puzzlesLoading } = useQuery(trpc.puzzles.list.queryOptions())
  const { data: schedule, isLoading: scheduleLoading } = useQuery(trpc.schedule.list.queryOptions())

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Link href="/taxa">
        <Card className="hover:bg-muted/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-green-100 p-2">
                <Leaf className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <CardTitle className="text-base">Taxa</CardTitle>
                <CardDescription>{taxaLoading ? "Loading\u2026" : `${taxa?.length ?? 0} entries`}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </Link>

      <Link href="/puzzles">
        <Card className="hover:bg-muted/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-amber-100 p-2">
                <Puzzle className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <CardTitle className="text-base">Puzzles</CardTitle>
                <CardDescription>
                  {puzzlesLoading ? "Loading\u2026" : `${puzzles?.length ?? 0} entries`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </Link>

      <Link href="/schedule">
        <Card className="hover:bg-muted/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-purple-100 p-2">
                <CalendarDays className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <CardTitle className="text-base">Schedule</CardTitle>
                <CardDescription>
                  {scheduleLoading ? "Loading\u2026" : `${schedule?.length ?? 0} entries`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </Link>

      <Link href="/publish">
        <Card className="hover:bg-muted/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-md bg-blue-100 p-2">
                <Upload className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <CardTitle className="text-base">Publish</CardTitle>
                <CardDescription>Deploy to production</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </Link>
    </div>
  )
}
