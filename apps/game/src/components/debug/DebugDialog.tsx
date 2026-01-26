import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@wortle/ui"
import { useCallback, useEffect, useId, useState } from "react"

import { useClock, useHistoryStore } from "@/components/app/GlobalDependenciesProvider"
import { Iso8601Date } from "@/utils/brandedTypes"

declare global {
  interface Window {
    openDebug?: () => void
  }
}

export const DebugDialog = () => {
  const [open, setOpen] = useState(false)
  const [dateValue, setDateValue] = useState("")
  const dateInputId = useId()

  const clock = useClock()
  const historyStore = useHistoryStore()

  useEffect(() => {
    window.openDebug = () => setOpen(true)
    return () => {
      window.openDebug = undefined
    }
  }, [])

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      setOpen(newOpen)
      if (newOpen) {
        setDateValue(clock.todayIso())
      }
    },
    [clock],
  )

  const handleDateChange = useCallback(
    (newDate: string) => {
      setDateValue(newDate)
      if (clock.setDate && newDate) {
        clock.setDate(Iso8601Date(newDate))
      }
    },
    [clock],
  )

  const handleClearHistory = useCallback(() => {
    historyStore.clear()
  }, [historyStore])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Debug</DialogTitle>
          <DialogDescription>Development tools for testing</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor={dateInputId} className="text-sm font-medium">
              Override current date
            </label>
            <input
              id={dateInputId}
              type="date"
              value={dateValue}
              onChange={(e) => handleDateChange(e.target.value)}
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
            <p className="text-muted-foreground text-xs">
              Changes take effect immediately. Refresh the page to see updated puzzle.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Clear history</span>
            <Button variant="destructive" onClick={handleClearHistory}>
              Clear history
            </Button>
            <p className="text-muted-foreground text-xs">
              Removes all game history from local storage. Refresh the page to see updated state.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
