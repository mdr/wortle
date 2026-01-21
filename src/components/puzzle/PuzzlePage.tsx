import { useUmami } from "@danielgtmn/umami-react"
import { useEffect, useMemo, useRef } from "react"

import { useHistoryStore } from "@/components/app/GlobalDependenciesProvider"
import { AnswerInputCard } from "@/components/puzzle/answer/AnswerInputCard"
import { AnswerResult } from "@/components/puzzle/answer/AnswerResult"
import { AttemptHistory } from "@/components/puzzle/answer/AttemptHistory"
import { ImageGallery } from "@/components/puzzle/imageGallery/ImageGallery"
import { WhereAndWhenCard } from "@/components/puzzle/location/WhereAndWhenCard"
import { PuzzleHeader } from "@/components/puzzle/PuzzleHeader"
import { StatsPanel } from "@/components/puzzle/stats/StatsPanel"
import { useCorrectAnswerConfetti } from "@/components/puzzle/useCorrectAnswerConfetti"
import { Card } from "@/components/shadcn/Card"
import { Puzzle } from "@/lib/Puzzle"
import { selectIsCorrect, selectIsResolved, selectShowAttemptHistory } from "@/services/puzzle/puzzleSelectors"
import { PuzzleMode, PuzzleService } from "@/services/puzzle/PuzzleService"
import { PuzzleServiceContext, usePuzzleState } from "@/services/puzzle/puzzleServiceHooks"
import { Iso8601Date } from "@/utils/brandedTypes"

import { PuzzleTestIds } from "./PuzzleTestIds"

export { PuzzleMode }

export interface PuzzlePageProps {
  puzzle: Puzzle
  scheduledDate?: Iso8601Date
  mode: PuzzleMode
}

export const PuzzlePage = ({ puzzle, scheduledDate, mode }: PuzzlePageProps) => {
  const historyStore = useHistoryStore()
  const service = useMemo(
    () => new PuzzleService(puzzle, scheduledDate, mode, historyStore),
    [puzzle, scheduledDate, mode, historyStore],
  )

  return (
    <PuzzleServiceContext.Provider value={service}>
      <PuzzlePageContents />
    </PuzzleServiceContext.Provider>
  )
}

const PuzzlePageContents = () => {
  const { puzzle, scheduledDate, mode, attempts, statsSummary } = usePuzzleState()

  const isCorrect = usePuzzleState(selectIsCorrect)
  const isResolved = usePuzzleState(selectIsResolved)
  const showAttemptHistory = usePuzzleState(selectShowAttemptHistory)
  const { fireConfetti, panelRef: answerPanelRef } = useCorrectAnswerConfetti()
  const wasCorrectRef = useRef(isCorrect)
  const wasResolvedRef = useRef(isResolved)
  const { track } = useUmami()

  useEffect(() => {
    if (isCorrect && !wasCorrectRef.current) {
      fireConfetti()
    }
    wasCorrectRef.current = isCorrect
  }, [fireConfetti, isCorrect])

  useEffect(() => {
    if (isResolved && !wasResolvedRef.current) {
      track("puzzleCompleted", {
        puzzleId: puzzle.id,
        mode,
        attempts: attempts.length,
        correct: isCorrect,
        attempt1: attempts[0]?.speciesId,
        attempt2: attempts[1]?.speciesId,
        attempt3: attempts[2]?.speciesId,
      })
    }
    wasResolvedRef.current = isResolved
  }, [isResolved, track, puzzle.id, mode, attempts, isCorrect])

  return (
    <main className="bg-background min-h-screen" data-testid={PuzzleTestIds.page}>
      <PuzzleHeader puzzle={puzzle} scheduledDate={scheduledDate} />

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <Card className="overflow-hidden p-4">
              <ImageGallery />
            </Card>
          </div>

          <div className="space-y-4">
            <WhereAndWhenCard puzzle={puzzle} />

            {showAttemptHistory && !isResolved && <AttemptHistory attempts={attempts} />}

            {isResolved ? (
              <>
                <div ref={answerPanelRef}>
                  <AnswerResult />
                </div>
                {statsSummary && <StatsPanel summary={statsSummary} />}
              </>
            ) : (
              <AnswerInputCard />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
