import { Award, Flame, TrendingUp } from "lucide-react"

import { type DailyStatsSummary } from "@/lib/gameStorage/dailyStatsSummary"

interface StatsSummaryGridProps {
  summary: DailyStatsSummary
}

export const StatsSummaryGrid = ({ summary }: StatsSummaryGridProps) => {
  const accuracy = Math.round(summary.winRate * 100)

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-muted rounded-lg p-3">
        <div className="mb-1 flex items-center gap-2">
          <TrendingUp className="text-primary size-4" />
          <span className="text-foreground/70 text-xs">Total</span>
        </div>
        <p className="text-foreground text-2xl font-bold">
          {summary.played} <span className="text-foreground/70 text-sm font-normal">quizzes played</span>
        </p>
      </div>
      <div className="bg-muted rounded-lg p-3">
        <div className="mb-1 flex items-center gap-2">
          <Award className="text-primary size-4" />
          <span className="text-foreground/70 text-xs">Accuracy</span>
        </div>
        <p className="text-foreground text-2xl font-bold">
          {accuracy}% <span className="text-foreground/70 text-sm font-normal">correct</span>
        </p>
      </div>
      <div className="bg-muted rounded-lg p-3">
        <div className="mb-1 flex items-center gap-2">
          <Flame className="size-4 text-orange-500" />
          <span className="text-foreground/70 text-xs">Streak</span>
        </div>
        <p className="text-foreground text-2xl font-bold">
          {summary.currentStreak} <span className="text-foreground/70 text-sm font-normal">in a row</span>
        </p>
      </div>
      <div className="bg-muted rounded-lg p-3">
        <div className="mb-1 flex items-center gap-2">
          <Award className="size-4 text-amber-500" />
          <span className="text-foreground/70 text-xs">Max Streak</span>
        </div>
        <p className="text-foreground text-2xl font-bold">
          {summary.maxStreak} <span className="text-foreground/70 text-sm font-normal">in a row</span>
        </p>
      </div>
    </div>
  )
}
