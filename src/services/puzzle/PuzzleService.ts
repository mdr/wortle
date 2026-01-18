import { assert } from "tsafe"

import { AttemptResult, createAttemptResult } from "@/lib/AttemptResult"
import { calculateDailyStatsSummary, DailyStatsSummary } from "@/lib/gameStorage/dailyStatsSummary"
import { PassOrFail } from "@/lib/gameStorage/HistoryRecord"
import { HistoryStore } from "@/lib/gameStorage/HistoryStore"
import { Puzzle } from "@/lib/Puzzle"
import { getSpecies } from "@/lib/species/plants"
import { SpeciesId } from "@/lib/species/Species"
import { ImageIndex, Iso8601Date } from "@/utils/brandedTypes"
import { AbstractService } from "@/utils/providerish/AbstractService"
import { Option } from "@/utils/types/Option"

export const MAX_ATTEMPTS = 3

export interface ExistingAttempt {
  result?: PassOrFail
}

export const computeInitialOutcome = (
  mode: PuzzleMode,
  existingAttempt: ExistingAttempt | undefined,
  attemptsCount: number,
): Option<PuzzleOutcome> => {
  if (mode === PuzzleMode.REVIEW) return undefined

  if (mode === PuzzleMode.ARCHIVE && !existingAttempt) {
    return PuzzleOutcome.DID_NOT_ATTEMPT
  }

  if (!existingAttempt) return undefined

  const { result } = existingAttempt

  if (result === PassOrFail.PASS) {
    return PuzzleOutcome.CORRECT
  }

  if (result === PassOrFail.FAIL) {
    return attemptsCount >= MAX_ATTEMPTS ? PuzzleOutcome.OUT_OF_ATTEMPTS : PuzzleOutcome.GAVE_UP
  }

  // result is undefined - in progress or not completed
  if (mode === PuzzleMode.ARCHIVE) {
    return PuzzleOutcome.NOT_COMPLETED
  }

  return undefined
}

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

  attempts: AttemptResult[]
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
    private readonly historyStore: HistoryStore,
  ) {
    const history = mode !== PuzzleMode.REVIEW ? historyStore.load() : undefined
    const pastAttempts = history?.attempts ?? []
    const correctSpecies = getSpecies(puzzle.speciesId)

    // Find existing attempt for this date (may be in-progress or completed)
    const existingAttempt =
      mode !== PuzzleMode.REVIEW && scheduledDate
        ? pastAttempts.find((attempt) => attempt.date === scheduledDate)
        : undefined

    const submittedSpecies = existingAttempt?.submittedSpecies ?? []
    const attempts = submittedSpecies.map((speciesId) => {
      const species = getSpecies(speciesId)
      return createAttemptResult(species, correctSpecies)
    })

    const statsSummary =
      mode === PuzzleMode.DAILY ? calculateDailyStatsSummary(pastAttempts, scheduledDate!) : undefined
    super({
      puzzle,
      scheduledDate,
      mode,
      attempts,
      outcome: computeInitialOutcome(mode, existingAttempt, attempts.length),
      incorrectFeedbackText: undefined,
      selectedSpeciesId: undefined,
      searchQuery: "",
      imageGallery: { index: ImageIndex(0), isFullscreen: false },
      statsSummary,
    })
  }

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
    const attemptResult = createAttemptResult(species, correctSpecies)
    const nextAttempts = [...this.state.attempts, attemptResult]
    const incorrectFeedbackText = attemptResult.isCorrect
      ? undefined
      : attemptResult.genusMatch
        ? "Right genus - you're close!"
        : attemptResult.familyMatch
          ? "That's in the right family - have another go."
          : "That's not it - have another go."
    const isComplete = attemptResult.isCorrect || nextAttempts.length >= MAX_ATTEMPTS
    const result = isComplete ? (attemptResult.isCorrect ? PassOrFail.PASS : PassOrFail.FAIL) : undefined
    const outcome = attemptResult.isCorrect
      ? PuzzleOutcome.CORRECT
      : nextAttempts.length >= MAX_ATTEMPTS
        ? PuzzleOutcome.OUT_OF_ATTEMPTS
        : undefined
    this.updateState((draft) => {
      draft.attempts.push(attemptResult)
      draft.incorrectFeedbackText = incorrectFeedbackText
      draft.selectedSpeciesId = undefined
      draft.outcome = outcome
    })
    this.saveAttempt(
      nextAttempts.map((attempt) => attempt.speciesId),
      result,
    )
    return attemptResult.isCorrect
  }

  giveUp = (): void => {
    this.setState({ outcome: PuzzleOutcome.GAVE_UP, incorrectFeedbackText: undefined, selectedSpeciesId: undefined })
    this.saveAttempt(
      this.state.attempts.map((attempt) => attempt.speciesId),
      PassOrFail.FAIL,
    )
  }

  private readonly saveAttempt = (submittedSpecies: SpeciesId[], result?: PassOrFail): void => {
    if (this.mode === PuzzleMode.DAILY) {
      const scheduledDate = this.state.scheduledDate
      assert(scheduledDate, "PuzzleService requires a scheduled date in daily mode.")
      const nextHistory = this.historyStore.saveAttempt({
        date: scheduledDate,
        result,
        submittedSpecies,
      })
      this.setState({ statsSummary: calculateDailyStatsSummary(nextHistory.attempts, scheduledDate) })
    }
  }
}
