import type { AnimationOptions, DOMKeyframesDefinition } from "motion/react"
import { useAnimate } from "motion/react"
import { useCallback } from "react"
import { assert } from "tsafe"

import { PlantSearch } from "@/components/puzzle/PlantSearch"
import { Button } from "@/components/shadcn/Button"
import { Card } from "@/components/shadcn/Card"
import { MAX_ATTEMPTS } from "@/services/puzzle/PuzzleService"
import { usePuzzleServiceActions, usePuzzleState } from "@/services/puzzle/puzzleServiceHooks"

import { PuzzleTestIds } from "./PuzzleTestIds"

const SHAKE_ANIMATION: DOMKeyframesDefinition = { x: [0, -6, 6, -4, 4, 0] }
const SHAKE_TRANSITION: AnimationOptions = { duration: 0.35, ease: "easeInOut" }

export const AnswerInputCard = () => {
  const [scope, animate] = useAnimate()
  const puzzleActions = usePuzzleServiceActions()
  const { attempts, incorrectFeedbackText, selectedSpecies } = usePuzzleState()

  const shake = useCallback(() => {
    animate(scope.current, SHAKE_ANIMATION, SHAKE_TRANSITION)
  }, [animate, scope])

  const handleSubmit = () => {
    assert(selectedSpecies, "Selected species is required to submit an answer.")
    const isCorrect = puzzleActions.submitAttempt(selectedSpecies.id)
    if (!isCorrect) {
      shake()
    }
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

          {selectedSpecies && (
            <Button onClick={handleSubmit} className="w-full" size="lg" data-testid={PuzzleTestIds.submitAnswer}>
              I'll go with this
            </Button>
          )}

          {incorrectFeedbackText && <p className="text-destructive text-sm font-medium">{incorrectFeedbackText}</p>}

          <button
            type="button"
            onClick={() => puzzleActions.giveUp()}
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
