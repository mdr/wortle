import { getSpecies } from "@/lib/species/plants"
import { Species } from "@/lib/species/Species"

import { MAX_ATTEMPTS } from "./PuzzleService"
import { PuzzleServiceState } from "./PuzzleService"

export const selectCorrectSpecies = (state: PuzzleServiceState): Species => getSpecies(state.puzzle.speciesId)

export const selectIsCorrect = (state: PuzzleServiceState): boolean =>
  state.attempts.some((attempt) => attempt.isCorrect)

export const selectIsResolved = (state: PuzzleServiceState): boolean =>
  state.gaveUp || selectIsCorrect(state) || state.attempts.length >= MAX_ATTEMPTS

export const selectShowAttemptHistory = (state: PuzzleServiceState): boolean =>
  state.attempts.length > 0 && !state.gaveUp
