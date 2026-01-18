import { assert } from "tsafe"

import { AttemptFeedback, createAttemptFeedback } from "@/lib/AttemptFeedback"
import { calculateDailyStatsSummary, DailyStatsSummary } from "@/lib/gameStorage/dailyStatsSummary"
import { DailyResult } from "@/lib/gameStorage/GameState"
import { GameStorage } from "@/lib/gameStorage/GameStorage"
import { Puzzle } from "@/lib/Puzzle"
import { getSpecies } from "@/lib/species/plants"
import { SpeciesId } from "@/lib/species/Species"
import { ImageIndex, Iso8601Date } from "@/utils/brandedTypes"
import { AbstractService } from "@/utils/providerish/AbstractService"
import { Option } from "@/utils/types/Option"

export const MAX_ATTEMPTS = 3

export enum PuzzleMode {
  DAILY = "DAILY",
  REVIEW = "REVIEW",
  ARCHIVE = "ARCHIVE",
}

export enum PuzzleOutcome {
  CORRECT = "CORRECT",
  OUT_OF_ATTEMPTS = "OUT_OF_ATTEMPTS",
  GAVE_UP = "GAVE_UP",
  NOT_COMPLETED = "NOT_COMPLETED",
  DID_NOT_ATTEMPT = "DID_NOT_ATTEMPT",
}

export interface PuzzleServiceActions {
  selectImageIndex: (index: ImageIndex) => void
  goToNextImage: () => void
  goToPreviousImage: () => void
  enterFullscreenImageMode: () => void
  exitFullscreenImageMode: () => void

  setSearchQuery: (query: string) => void
  selectSpecies: (speciesId: SpeciesId) => void
  chooseDifferentPlant: () => void
  submitAttempt: (speciesId: SpeciesId) => boolean
  giveUp: () => void
}

export interface ImageGalleryState {
  index: ImageIndex
  isFullscreen: boolean
}

export interface PuzzleServiceState {
  puzzle: Puzzle
  mode: PuzzleMode
  scheduledDate?: Iso8601Date

  imageGallery: ImageGalleryState

  outcome: Option<PuzzleOutcome>

  attempts: AttemptFeedback[]
  searchQuery: string
  selectedSpeciesId: Option<SpeciesId>
  incorrectFeedbackText?: string

  statsSummary?: DailyStatsSummary
}

export class PuzzleService extends AbstractService<PuzzleServiceState> implements PuzzleServiceActions {
  constructor(
    puzzle: Puzzle,
    scheduledDate: Option<Iso8601Date>,
    private readonly mode: PuzzleMode,
    private readonly gameStorage: GameStorage,
  ) {
    const gameState = mode !== PuzzleMode.REVIEW ? gameStorage.load() : undefined
    const history = gameState?.history ?? []
    const correctSpecies = getSpecies(puzzle.speciesId)

    // Find existing record for this date (may be in-progress or completed)
    const existingRecord =
      mode !== PuzzleMode.REVIEW && scheduledDate
        ? history.find((record) => record.date === scheduledDate && record.puzzleId === puzzle.id)
        : undefined

    const attemptedSpeciesIds = existingRecord?.attemptedSpeciesIds ?? []
    const attempts = attemptedSpeciesIds.map((speciesId) => {
      const species = getSpecies(speciesId)
      return createAttemptFeedback(species, correctSpecies)
    })

    const computeInitialOutcome = (): Option<PuzzleOutcome> => {
      if (mode === PuzzleMode.REVIEW) return undefined

      if (mode === PuzzleMode.ARCHIVE && !existingRecord) {
        return PuzzleOutcome.DID_NOT_ATTEMPT
      }

      if (!existingRecord) return undefined

      const { result } = existingRecord

      if (result === DailyResult.PASS) {
        return PuzzleOutcome.CORRECT
      }

      if (result === DailyResult.FAIL) {
        return attempts.length >= MAX_ATTEMPTS ? PuzzleOutcome.OUT_OF_ATTEMPTS : PuzzleOutcome.GAVE_UP
      }

      // result is undefined - in progress or not completed
      if (mode === PuzzleMode.ARCHIVE) {
        return PuzzleOutcome.NOT_COMPLETED
      }

      return undefined
    }

    const statsSummary = mode === PuzzleMode.DAILY ? calculateDailyStatsSummary(history) : undefined
    super({
      puzzle,
      scheduledDate,
      mode,
      attempts,
      outcome: computeInitialOutcome(),
      incorrectFeedbackText: undefined,
      selectedSpeciesId: undefined,
      searchQuery: "",
      imageGallery: { index: ImageIndex(0), isFullscreen: false },
      statsSummary,
    })
  }

  addAttempt = (attempt: AttemptFeedback): void =>
    this.updateState((draft) => {
      draft.attempts.push(attempt)
    })

  selectSpecies = (speciesId: SpeciesId): void => {
    this.setState({ selectedSpeciesId: speciesId, searchQuery: "", incorrectFeedbackText: undefined })
  }

  chooseDifferentPlant = (): void => {
    this.setState({ selectedSpeciesId: undefined, searchQuery: "", incorrectFeedbackText: undefined })
  }

  setSearchQuery = (query: string): void => {
    this.setState({ searchQuery: query })
  }

  selectImageIndex = (index: ImageIndex): void => {
    assert(index < this.state.puzzle.images.length, `Invalid image index: ${index}`)
    this.setState({ imageGallery: { index } })
  }

  goToNextImage = (): void => {
    const { imageGallery, puzzle } = this.state
    this.selectImageIndex(ImageIndex(imageGallery.index === puzzle.images.length - 1 ? 0 : imageGallery.index + 1))
  }

  goToPreviousImage = (): void => {
    const { imageGallery, puzzle } = this.state
    this.selectImageIndex(ImageIndex(imageGallery.index === 0 ? puzzle.images.length - 1 : imageGallery.index - 1))
  }

  enterFullscreenImageMode = (): void => {
    this.setState({ imageGallery: { isFullscreen: true } })
  }

  exitFullscreenImageMode = (): void => {
    this.setState({ imageGallery: { isFullscreen: false } })
  }

  submitAttempt = (speciesId: SpeciesId): boolean => {
    const species = getSpecies(speciesId)
    const correctSpecies = getSpecies(this.state.puzzle.speciesId)
    const feedback = createAttemptFeedback(species, correctSpecies)
    const nextAttempts = [...this.state.attempts, feedback]
    const incorrectFeedbackText = feedback.isCorrect
      ? undefined
      : feedback.genusMatch
        ? "Right genus - you're close!"
        : feedback.familyMatch
          ? "That's in the right family - have another go."
          : "That's not it - have another go."
    const isComplete = feedback.isCorrect || nextAttempts.length >= MAX_ATTEMPTS
    const result = isComplete ? (feedback.isCorrect ? DailyResult.PASS : DailyResult.FAIL) : undefined
    const outcome = feedback.isCorrect
      ? PuzzleOutcome.CORRECT
      : nextAttempts.length >= MAX_ATTEMPTS
        ? PuzzleOutcome.OUT_OF_ATTEMPTS
        : undefined
    this.updateState((draft) => {
      draft.attempts.push(feedback)
      draft.incorrectFeedbackText = incorrectFeedbackText
      draft.selectedSpeciesId = undefined
      draft.outcome = outcome
    })
    this.saveRecord(
      nextAttempts.map((attempt) => attempt.speciesId),
      result,
    )
    return feedback.isCorrect
  }

  giveUp = (): void => {
    this.setState({ outcome: PuzzleOutcome.GAVE_UP, incorrectFeedbackText: undefined, selectedSpeciesId: undefined })
    this.saveRecord(
      this.state.attempts.map((attempt) => attempt.speciesId),
      DailyResult.FAIL,
    )
  }

  private readonly saveRecord = (attemptedSpeciesIds: SpeciesId[], result?: DailyResult): void => {
    if (this.mode === PuzzleMode.DAILY) {
      const scheduledDate = this.state.scheduledDate
      assert(scheduledDate, "PuzzleService requires a scheduled date in daily mode.")
      const nextStats = this.gameStorage.saveRecord({
        date: scheduledDate,
        puzzleId: this.state.puzzle.id,
        result,
        attemptedSpeciesIds,
      })
      this.setState({ statsSummary: calculateDailyStatsSummary(nextStats.history) })
    }
  }
}
