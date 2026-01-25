import { assert } from "tsafe"

import { AttemptResult, createAttemptResult } from "@/lib/AttemptResult"
import { calculateDailyStatsSummary, DailyStatsSummary } from "@/lib/gameStorage/dailyStatsSummary"
import { PassOrFail } from "@/lib/gameStorage/HistoryRecord"
import { HistoryStore } from "@/lib/gameStorage/HistoryStore"
import { Puzzle } from "@/lib/Puzzle"
import { SpeciesId, SpeciesRepository } from "@/lib/species/Species"
import { ImageIndex, Iso8601Date } from "@/utils/brandedTypes"
import { AbstractService } from "@/utils/providerish/AbstractService"
import { Option } from "@/utils/types/Option"

export const MAX_ATTEMPTS = 3

export interface ExistingEntry {
  result?: PassOrFail
}

export const computeInitialOutcome = (
  mode: PuzzleMode,
  existingEntry: Option<ExistingEntry>,
  attemptsCount: number,
): Option<PuzzleOutcome> => {
  if (mode === PuzzleMode.REVIEW) return undefined

  if (mode === PuzzleMode.ARCHIVE && !existingEntry) {
    return PuzzleOutcome.DID_NOT_ATTEMPT
  }

  if (!existingEntry) return undefined

  const { result } = existingEntry

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
    private readonly speciesRepository: SpeciesRepository,
  ) {
    const history = mode !== PuzzleMode.REVIEW ? historyStore.load() : undefined
    const pastEntries = history?.entries ?? []
    const correctSpecies = speciesRepository.getSpecies(puzzle.speciesId)

    const existingEntry =
      mode !== PuzzleMode.REVIEW && scheduledDate
        ? pastEntries.find((entry) => entry.date === scheduledDate)
        : undefined

    const submittedSpecies = existingEntry?.submittedSpecies ?? []
    const attempts = submittedSpecies.map((speciesId) => {
      const species = speciesRepository.getSpecies(speciesId)
      return createAttemptResult(species, correctSpecies)
    })

    const statsSummary =
      mode === PuzzleMode.DAILY && scheduledDate ? calculateDailyStatsSummary(pastEntries, scheduledDate) : undefined
    super({
      puzzle,
      scheduledDate,
      mode,
      attempts,
      outcome: computeInitialOutcome(mode, existingEntry, attempts.length),
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
    const species = this.speciesRepository.getSpecies(speciesId)
    const correctSpecies = this.speciesRepository.getSpecies(this.state.puzzle.speciesId)
    const attemptResult = createAttemptResult(species, correctSpecies)
    const nextAttempts = [...this.state.attempts, attemptResult]
    const incorrectFeedbackText = attemptResult.isCorrect ? undefined : this.getIncorrectFeedbackText(attemptResult)
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
    this.saveEntry(
      nextAttempts.map((attempt) => attempt.speciesId),
      result,
    )
    return attemptResult.isCorrect
  }

  giveUp = (): void => {
    this.setState({ outcome: PuzzleOutcome.GAVE_UP, incorrectFeedbackText: undefined, selectedSpeciesId: undefined })
    this.saveEntry(
      this.state.attempts.map((attempt) => attempt.speciesId),
      PassOrFail.FAIL,
    )
  }

  private readonly saveEntry = (submittedSpecies: SpeciesId[], result?: PassOrFail): void => {
    if (this.mode === PuzzleMode.DAILY) {
      const scheduledDate = this.state.scheduledDate
      assert(scheduledDate, "PuzzleService requires a scheduled date in daily mode.")
      const nextHistory = this.historyStore.saveEntry({
        date: scheduledDate,
        result,
        submittedSpecies,
      })
      this.setState({ statsSummary: calculateDailyStatsSummary(nextHistory.entries, scheduledDate) })
    }
  }

  private readonly getIncorrectFeedbackText = (attemptResult: AttemptResult): string => {
    if (attemptResult.genusMatch) return "Right genus - you're close!"
    if (attemptResult.familyMatch) return "That's in the right family - have another go."
    return "That's not it - have another go."
  }
}
