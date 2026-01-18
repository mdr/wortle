import { getSpecies } from "@/lib/species/plants"
import { Species } from "@/lib/species/Species"

import { PuzzleOutcome, PuzzleServiceState } from "./PuzzleService"

export const selectCorrectSpecies = (state: PuzzleServiceState): Species => getSpecies(state.puzzle.speciesId)

export const selectIsCorrect = (state: PuzzleServiceState): boolean => state.outcome === PuzzleOutcome.CORRECT

export const selectIsResolved = (state: PuzzleServiceState): boolean => state.outcome !== undefined

export const selectShowAttemptHistory = (state: PuzzleServiceState): boolean =>
  state.attempts.length > 0 && state.outcome !== PuzzleOutcome.GAVE_UP
