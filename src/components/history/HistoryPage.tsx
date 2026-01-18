import { Link } from "@tanstack/react-router"
import { ArrowLeft, Calendar } from "lucide-react"
import { useMemo } from "react"

import { useClock, useHistoryStore } from "@/components/app/GlobalDependenciesProvider"
import { Button } from "@/components/shadcn/Button"
import { Card } from "@/components/shadcn/Card"
import { StatsSummaryGrid } from "@/components/shared/StatsSummaryGrid"
import { calculateDailyStatsSummary } from "@/lib/gameStorage/dailyStatsSummary"
import { assetUrl } from "@/utils/utils"

import { HistoryItem } from "./HistoryItem"
import { HistoryTestIds } from "./HistoryTestIds"

export const HistoryPage = () => {
  const storage = useHistoryStore()
  const clock = useClock()
  const today = clock.todayIso()
  const history = useMemo(() => storage.load(), [storage])
  const summary = useMemo(() => calculateDailyStatsSummary(history.attempts), [history.attempts])
  const sortedAttempts = useMemo(
    () => [...history.attempts].sort((a, b) => b.date.localeCompare(a.date)),
    [history.attempts],
  )

  return (
    <main className="bg-background min-h-screen" data-testid={HistoryTestIds.page}>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Link to="/" className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center text-sm">
          <ArrowLeft className="mr-1 size-4" />
          Back to quiz
        </Link>

        <div className="mb-8 flex items-center gap-3">
          <img src={assetUrl("/logo.png")} alt="" className="size-20" />
          <h1 className="text-3xl font-bold">Your History</h1>
        </div>

        <div className="space-y-6">
          {sortedAttempts.length > 0 && (
            <Card className="p-4" data-testid={HistoryTestIds.stats}>
              <h2 className="text-foreground mb-3 font-serif text-lg font-semibold">Statistics</h2>
              <StatsSummaryGrid summary={summary} />
            </Card>
          )}

          <Card className="p-4">
            <h2 className="text-foreground mb-3 font-serif text-lg font-semibold">Recent Puzzles</h2>
            {sortedAttempts.length === 0 ? (
              <div className="py-8 text-center" data-testid={HistoryTestIds.emptyState}>
                <Calendar className="text-muted-foreground mx-auto mb-4 size-12" />
                <p className="text-muted-foreground mb-4">You haven't completed any puzzles yet.</p>
                <Link to="/daily">
                  <Button>Play today's puzzle</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedAttempts.map((attempt) => (
                  <HistoryItem key={attempt.date} attempt={attempt} isToday={attempt.date === today} />
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </main>
  )
}
