import { PuzzleOutcome, PuzzleServiceState } from "./PuzzleService"

export const selectIsCorrect = (state: PuzzleServiceState): boolean => state.outcome === PuzzleOutcome.CORRECT

export const selectIsResolved = (state: PuzzleServiceState): boolean => state.outcome !== undefined

export const selectShowAttemptHistory = (state: PuzzleServiceState): boolean =>
  state.attempts.length > 0 && state.outcome !== PuzzleOutcome.GAVE_UP

export const isShareableOutcome = (outcome: PuzzleOutcome): boolean => {
  switch (outcome) {
    case PuzzleOutcome.CORRECT:
    case PuzzleOutcome.OUT_OF_ATTEMPTS:
      return true
    case PuzzleOutcome.GAVE_UP:
    case PuzzleOutcome.NOT_COMPLETED:
    case PuzzleOutcome.DID_NOT_ATTEMPT:
      return false
  }
}
