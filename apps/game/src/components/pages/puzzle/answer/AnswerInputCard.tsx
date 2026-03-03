import { useUmami } from "@danielgtmn/umami-react"
import { TaxonId } from "@wortle/shared"
import { Button, Card } from "@wortle/ui"
import { assert } from "tsafe"

import { PlantSearch } from "@/components/pages/puzzle/answer/PlantSearch"
import { useShakeAnswerInput } from "@/components/pages/puzzle/answer/useShakeAnswerInput"
import { MAX_ATTEMPTS } from "@/services/puzzle/PuzzleService"
import { usePuzzleServiceActions, usePuzzleState } from "@/services/puzzle/puzzleServiceHooks"

import { PuzzleTestIds } from "../PuzzleTestIds"

export const AnswerInputCard = () => {
  const { scope, shake } = useShakeAnswerInput()
  const puzzleActions = usePuzzleServiceActions()
  const { puzzle, mode, attempts, incorrectFeedbackText, selectedTaxonId } = usePuzzleState()
  const { track } = useUmami()

  const trackPuzzleCompleted = (correct: boolean, attemptTaxonIds: TaxonId[]) => {
    track("puzzleCompleted", {
      puzzleId: puzzle.id,
      mode,
      attempts: attemptTaxonIds.length,
      correct,
      attempt1: attemptTaxonIds[0],
      attempt2: attemptTaxonIds[1],
      attempt3: attemptTaxonIds[2],
    })
  }

  const handleSubmit = () => {
    assert(selectedTaxonId, "Selected taxon is required to submit an answer.")
    const { isCorrect, isCompleted } = puzzleActions.submitAttempt(selectedTaxonId)
    if (!isCorrect) {
      shake()
    }
    if (isCompleted) {
      trackPuzzleCompleted(isCorrect, [...attempts.map((a) => a.taxonId), selectedTaxonId])
    }
  }

  const handleGiveUp = () => {
    puzzleActions.giveUp()
    trackPuzzleCompleted(
      false,
      attempts.map((a) => a.taxonId),
    )
  }

  return (
    <div ref={scope}>
      <Card className="p-6">
        <div className="mb-2 flex flex-col gap-1 min-[440px]:flex-row min-[440px]:items-center min-[440px]:justify-between">
          <h2 className="text-foreground font-serif text-2xl font-bold">Can you identify this plant?</h2>
          <span className="text-muted-foreground text-sm" data-testid={PuzzleTestIds.attemptCounter}>
            Attempt {attempts.length + 1} of {MAX_ATTEMPTS}
          </span>
        </div>
        <p className="text-muted-foreground text-sm">
          Study the photographs and enter the common or scientific name of the plant you think this is.
        </p>

        <div className="space-y-4">
          <PlantSearch />

          {selectedTaxonId && (
            <Button onClick={handleSubmit} className="w-full" size="lg" data-testid={PuzzleTestIds.submitAnswer}>
              I'll go with this
            </Button>
          )}

          {incorrectFeedbackText && <p className="text-destructive text-sm font-medium">{incorrectFeedbackText}</p>}

          <button
            type="button"
            onClick={handleGiveUp}
            className="text-muted-foreground hover:text-foreground w-full text-sm"
            data-testid={PuzzleTestIds.giveUp}
          >
            Give up and show answer
          </button>
        </div>
      </Card>
    </div>
  )
}
