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

import { PuzzleCompletion } from "./puzzleTypes"

export const MAX_ATTEMPTS = 3

export enum PuzzleMode {
  DAILY = "DAILY",
  REVIEW = "REVIEW",
  ARCHIVE = "ARCHIVE",
}

export interface PuzzleServiceActions {
  selectImageIndex: (index: ImageIndex) => void
  goToNextImage: () => void
  goToPreviousImage: () => void
  enterFullscreenImageMode: () => void
  exitFullscreenImageMode: () => void
  selectSpecies: (speciesId: SpeciesId) => void
  chooseDifferentPlant: () => void
  setSearchQuery: (query: string) => void
  submitAttempt: (speciesId: SpeciesId) => boolean
  giveUp: () => void
}

export interface ImageGalleryState {
  index: ImageIndex
  isFullscreen: boolean
}

export interface PuzzleServiceState {
  puzzle: Puzzle
  scheduledDate?: Iso8601Date
  mode: PuzzleMode
  attempts: AttemptFeedback[]
  gaveUp: boolean
  didNotAttempt: boolean
  incorrectFeedbackText?: string
  selectedSpeciesId: Option<SpeciesId>
  searchQuery: string
  statsSummary?: DailyStatsSummary
  imageGallery: ImageGalleryState
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

    // Handle in-progress state for daily mode
    const dailyInProgress = gameState?.dailyInProgress
    if (dailyInProgress && scheduledDate && dailyInProgress.date !== scheduledDate) {
      gameStorage.clearDailyInProgress()
    }
    const matchingInProgress = dailyInProgress && scheduledDate === dailyInProgress.date ? dailyInProgress : undefined

    const completedRecord =
      mode !== PuzzleMode.REVIEW && scheduledDate
        ? history.find((record) => record.date === scheduledDate && record.puzzleId === puzzle.id)
        : undefined

    const attemptedSpeciesIds = completedRecord?.attemptedSpeciesIds ?? matchingInProgress?.attemptedSpeciesIds ?? []
    const attempts = attemptedSpeciesIds.map((speciesId) => {
      const species = getSpecies(speciesId)
      return createAttemptFeedback(species, correctSpecies)
    })

    const gaveUp =
      completedRecord !== undefined && completedRecord.result === DailyResult.FAIL && attempts.length < MAX_ATTEMPTS
    const didNotAttempt = mode === PuzzleMode.ARCHIVE && completedRecord === undefined
    const statsSummary = mode === PuzzleMode.DAILY ? calculateDailyStatsSummary(gameStorage.load().history) : undefined
    super({
      puzzle,
      scheduledDate,
      mode,
      attempts,
      gaveUp: gaveUp || didNotAttempt,
      didNotAttempt,
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
    const completion =
      feedback.isCorrect || nextAttempts.length >= MAX_ATTEMPTS
        ? ({
            result: feedback.isCorrect ? DailyResult.PASS : DailyResult.FAIL,
            attemptedSpeciesIds: nextAttempts.map((attempt) => attempt.speciesId),
          } satisfies PuzzleCompletion)
        : undefined
    this.updateState((draft) => {
      draft.attempts.push(feedback)
      draft.incorrectFeedbackText = incorrectFeedbackText
      draft.selectedSpeciesId = undefined
    })
    if (completion) {
      this.updateStats(completion.result, completion.attemptedSpeciesIds)
    } else {
      this.saveDailyInProgress(nextAttempts.map((attempt) => attempt.speciesId))
    }
    return feedback.isCorrect
  }

  giveUp = (): void => {
    this.setState({ gaveUp: true, incorrectFeedbackText: undefined, selectedSpeciesId: undefined })
    const completion = {
      result: DailyResult.FAIL,
      attemptedSpeciesIds: this.state.attempts.map((attempt) => attempt.speciesId),
    }
    this.updateStats(completion.result, completion.attemptedSpeciesIds)
  }

  private readonly saveDailyInProgress = (attemptedSpeciesIds: SpeciesId[]): void => {
    if (this.mode === PuzzleMode.DAILY) {
      const scheduledDate = this.state.scheduledDate
      assert(scheduledDate, "PuzzleService requires a scheduled date in daily mode.")
      this.gameStorage.saveDailyInProgress({
        date: scheduledDate,
        attemptedSpeciesIds,
      })
    }
  }

  private readonly updateStats = (result: DailyResult, attemptedSpeciesIds: SpeciesId[]): void => {
    if (this.mode === PuzzleMode.DAILY) {
      const scheduledDate = this.state.scheduledDate
      assert(scheduledDate, "PuzzleService requires a scheduled date in daily mode.")
      const nextStats = this.gameStorage.recordDailyCompletion({
        date: scheduledDate,
        puzzleId: this.state.puzzle.id,
        result,
        attemptedSpeciesIds,
      })
      this.setState({ statsSummary: calculateDailyStatsSummary(nextStats.history) })
    }
  }
}
