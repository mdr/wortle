import { Link } from "@tanstack/react-router"
import { Clock as ClockIcon, History } from "lucide-react"

import { useClock } from "@/components/app/GlobalDependenciesProvider"
import { ShareResultButton } from "@/components/puzzle/ShareResultButton"
import { Button } from "@/components/shadcn/Button"
import { Card } from "@/components/shadcn/Card"
import { StatsSummaryGrid } from "@/components/shared/StatsSummaryGrid"
import { type DailyStatsSummary } from "@/lib/gameStorage/dailyStatsSummary"
import { type Clock } from "@/utils/Clock"
import { formatDuration } from "@/utils/dateUtils"

interface StatsPanelProps {
  summary: DailyStatsSummary
}

const getTimeToNextWortle = (clock: Clock): string => {
  const now = clock.now()
  const tomorrow = new Date(now)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  tomorrow.setUTCHours(0, 0, 0, 0)
  return formatDuration(now, tomorrow)
}

export const StatsPanel = ({ summary }: StatsPanelProps) => {
  const clock = useClock()

  return (
    <Card className="p-4">
      <h3 className="text-foreground mb-3 font-serif text-lg font-semibold">Your Statistics</h3>
      <StatsSummaryGrid summary={summary} />

      <div className="mt-4 space-y-3 border-t pt-4">
        <div className="bg-muted flex items-center justify-between rounded-lg p-3">
          <div className="flex items-center gap-2">
            <ClockIcon className="text-foreground size-4" />
            <span className="text-foreground text-sm font-medium">Next Wortle</span>
          </div>
          <span className="text-foreground text-sm font-bold">{getTimeToNextWortle(clock)}</span>
        </div>

        <ShareResultButton />

        <Button asChild variant="outline" className="w-full bg-transparent" size="sm">
          <Link to="/history">
            <History className="mr-2 size-4" />
            View History
          </Link>
        </Button>
      </div>
    </Card>
  )
}
