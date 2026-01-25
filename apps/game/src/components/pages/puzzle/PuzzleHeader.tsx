import { Link } from "@tanstack/react-router"

import { useSchedule } from "@/components/app/GlobalDependenciesProvider"
import { HeaderNav } from "@/components/shared/HeaderNav"
import { Puzzle } from "@/lib/Puzzle"
import { Iso8601Date } from "@/utils/brandedTypes"
import { formatDate } from "@/utils/dateUtils"
import { assetUrl } from "@/utils/utils"

import { PuzzleTestIds } from "./PuzzleTestIds"

interface PuzzleHeaderProps {
  puzzle: Puzzle
  scheduledDate?: Iso8601Date
}

export const PuzzleHeader = ({ puzzle, scheduledDate }: PuzzleHeaderProps) => {
  const schedule = useSchedule()
  const displayDate = scheduledDate ?? schedule.findFirstDateForPuzzle(puzzle.id)

  return (
    <header className="border-border bg-card min-w-[334px] border-b">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex flex-shrink-0 items-center gap-3" data-testid={PuzzleTestIds.homeLink}>
            <img src={assetUrl("/logo.png")} alt="" className="size-12 min-[520px]:size-20" />
            <div>
              <h1 className="text-foreground font-serif text-xl font-bold min-[520px]:text-2xl">Wortle</h1>
              <p className="text-muted-foreground hidden text-sm min-[520px]:block">Daily Wild Plant Quiz</p>
            </div>
          </Link>
          <div className="flex flex-shrink-0 items-center gap-4">
            <div className="text-right">
              {displayDate && (
                <p className="text-foreground text-sm font-medium whitespace-nowrap">{formatDate(displayDate)}</p>
              )}
              <p className="text-muted-foreground text-xs">Puzzle #{puzzle.id}</p>
            </div>
            <HeaderNav />
          </div>
        </div>
      </div>
    </header>
  )
}
