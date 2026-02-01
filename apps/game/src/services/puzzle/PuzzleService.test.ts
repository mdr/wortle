import { Iso8601Date, type Puzzle, TestSpeciesIds } from "@wortle/shared"
import { describe, expect, it } from "vitest"

import { PassOrFail } from "@/lib/gameStorage/HistoryRecord"
import { HistoryStore } from "@/lib/gameStorage/HistoryStore"
import {
  createHistoryStore,
  createInProgressEntry,
  createPuzzleHistoryEntry,
} from "@/lib/gameStorage/HistoryStore.testUtils"
import { createMemoryStorage } from "@/lib/gameStorage/storage.testUtils"
import { defaultPuzzles } from "@/lib/puzzles"
import { testSpeciesRepository } from "@/lib/species/testSpecies.testUtils"
import { TestDate, TestPuzzles } from "@/lib/testConstants.testUtils"
import { ImageIndex } from "@/utils/brandedTypes"

import { computeInitialOutcome, MAX_ATTEMPTS, PuzzleMode, PuzzleOutcome, PuzzleService } from "./PuzzleService"

describe("computeInitialOutcome", () => {
  describe("REVIEW mode", () => {
    it("returns undefined regardless of attempt state", () => {
      expect(computeInitialOutcome(PuzzleMode.REVIEW, undefined, 0)).toBeUndefined()
      expect(computeInitialOutcome(PuzzleMode.REVIEW, { result: PassOrFail.PASS }, 1)).toBeUndefined()
      expect(computeInitialOutcome(PuzzleMode.REVIEW, { result: PassOrFail.FAIL }, 3)).toBeUndefined()
    })
  })

  describe("ARCHIVE mode", () => {
    it("returns DID_NOT_ATTEMPT when no existing attempt", () => {
      expect(computeInitialOutcome(PuzzleMode.ARCHIVE, undefined, 0)).toBe(PuzzleOutcome.DID_NOT_ATTEMPT)
    })

    it("returns CORRECT when result is PASS", () => {
      expect(computeInitialOutcome(PuzzleMode.ARCHIVE, { result: PassOrFail.PASS }, 1)).toBe(PuzzleOutcome.CORRECT)
    })

    it("returns OUT_OF_ATTEMPTS when result is FAIL with max attempts", () => {
      expect(computeInitialOutcome(PuzzleMode.ARCHIVE, { result: PassOrFail.FAIL }, MAX_ATTEMPTS)).toBe(
        PuzzleOutcome.OUT_OF_ATTEMPTS,
      )
    })

    it("returns GAVE_UP when result is FAIL with fewer than max attempts", () => {
      expect(computeInitialOutcome(PuzzleMode.ARCHIVE, { result: PassOrFail.FAIL }, MAX_ATTEMPTS - 1)).toBe(
        PuzzleOutcome.GAVE_UP,
      )
    })

    it("returns NOT_COMPLETED when attempt exists but result is undefined", () => {
      expect(computeInitialOutcome(PuzzleMode.ARCHIVE, { result: undefined }, 1)).toBe(PuzzleOutcome.NOT_COMPLETED)
    })
  })

  describe("DAILY mode", () => {
    it("returns undefined when no existing attempt", () => {
      expect(computeInitialOutcome(PuzzleMode.DAILY, undefined, 0)).toBeUndefined()
    })

    it("returns CORRECT when result is PASS", () => {
      expect(computeInitialOutcome(PuzzleMode.DAILY, { result: PassOrFail.PASS }, 1)).toBe(PuzzleOutcome.CORRECT)
    })

    it("returns OUT_OF_ATTEMPTS when result is FAIL with max attempts", () => {
      expect(computeInitialOutcome(PuzzleMode.DAILY, { result: PassOrFail.FAIL }, MAX_ATTEMPTS)).toBe(
        PuzzleOutcome.OUT_OF_ATTEMPTS,
      )
    })

    it("returns GAVE_UP when result is FAIL with fewer than max attempts", () => {
      expect(computeInitialOutcome(PuzzleMode.DAILY, { result: PassOrFail.FAIL }, MAX_ATTEMPTS - 1)).toBe(
        PuzzleOutcome.GAVE_UP,
      )
    })

    it("returns undefined when attempt exists but result is undefined (in progress)", () => {
      expect(computeInitialOutcome(PuzzleMode.DAILY, { result: undefined }, 1)).toBeUndefined()
    })
  })
})

const defaultPuzzle = defaultPuzzles.getPuzzle(TestPuzzles.daisy.id)

const makePuzzleService = (
  options: Partial<{ puzzle: Puzzle; mode: PuzzleMode; historyStore: HistoryStore; date: Iso8601Date }> = {},
): PuzzleService => {
  const puzzle = options.puzzle ?? defaultPuzzle
  const historyStore = options.historyStore ?? createHistoryStore()
  return new PuzzleService(
    puzzle,
    options.date ?? TestDate,
    options.mode ?? PuzzleMode.REVIEW,
    historyStore,
    testSpeciesRepository,
  )
}

describe("PuzzleService", () => {
  describe("hydration", () => {
    it("hydrates completed daily puzzles from history", () => {
      const historyStore = new HistoryStore(createMemoryStorage())
      historyStore.saveEntry({
        date: TestDate,
        result: PassOrFail.PASS,
        submittedSpecies: [TestSpeciesIds.herbRobert, TestSpeciesIds.daisy],
      })

      const service = makePuzzleService({ mode: PuzzleMode.DAILY, historyStore })

      expect(service.state).toMatchObject({
        attempts: [{ isCorrect: false }, { isCorrect: true }],
        outcome: PuzzleOutcome.CORRECT,
        incorrectFeedbackText: undefined,
        selectedSpeciesId: undefined,
        searchQuery: "",
        imageGallery: { index: 0, isFullscreen: false },
        statsSummary: { played: 1, wins: 1 },
      })
    })

    it("marks gave up when history shows a failure before max attempts", () => {
      const historyStore = new HistoryStore(createMemoryStorage())
      historyStore.saveEntry({
        date: TestDate,
        result: PassOrFail.FAIL,
        submittedSpecies: [TestSpeciesIds.herbRobert],
      })

      const service = makePuzzleService({ mode: PuzzleMode.DAILY, historyStore })

      expect(service.state).toMatchObject({
        attempts: [{ isCorrect: false }],
        outcome: PuzzleOutcome.GAVE_UP,
      })
    })

    it("marks out of attempts when failure uses all attempts", () => {
      const historyStore = new HistoryStore(createMemoryStorage())
      historyStore.saveEntry({
        date: TestDate,
        result: PassOrFail.FAIL,
        submittedSpecies: [TestSpeciesIds.herbRobert, TestSpeciesIds.tansy, TestSpeciesIds.fieldScabious],
      })

      const service = makePuzzleService({ mode: PuzzleMode.DAILY, historyStore })

      expect(service.state).toMatchObject({
        attempts: [{ isCorrect: false }, { isCorrect: false }, { isCorrect: false }],
        outcome: PuzzleOutcome.OUT_OF_ATTEMPTS,
      })
    })

    it("ignores history hydration for review mode", () => {
      const historyStore = new HistoryStore(createMemoryStorage())
      historyStore.saveEntry({
        date: TestDate,
        result: PassOrFail.PASS,
        submittedSpecies: [TestSpeciesIds.daisy],
      })

      const service = makePuzzleService({ mode: PuzzleMode.REVIEW, historyStore })

      expect(service.state).toMatchObject({
        attempts: [],
        outcome: undefined,
      })
    })

    it("hydrates completed archive puzzles from history", () => {
      const historyStore = new HistoryStore(createMemoryStorage())
      historyStore.saveEntry({
        date: TestDate,
        result: PassOrFail.PASS,
        submittedSpecies: [TestSpeciesIds.herbRobert, TestSpeciesIds.daisy],
      })

      const service = makePuzzleService({ mode: PuzzleMode.ARCHIVE, historyStore, date: TestDate })

      expect(service.state).toMatchObject({
        attempts: [{ isCorrect: false }, { isCorrect: true }],
        outcome: PuzzleOutcome.CORRECT,
      })
    })

    it("marks didNotAttempt for unattempted archive puzzles", () => {
      const historyStore = new HistoryStore(createMemoryStorage())

      const service = makePuzzleService({ mode: PuzzleMode.ARCHIVE, historyStore })

      expect(service.state).toMatchObject({
        attempts: [],
        outcome: PuzzleOutcome.DID_NOT_ATTEMPT,
      })
    })

    it("marks gaveUp for archive puzzles where user gave up", () => {
      const historyStore = new HistoryStore(createMemoryStorage())
      historyStore.saveEntry({
        date: TestDate,
        result: PassOrFail.FAIL,
        submittedSpecies: [TestSpeciesIds.herbRobert],
      })

      const service = makePuzzleService({ mode: PuzzleMode.ARCHIVE, historyStore, date: TestDate })

      expect(service.state).toMatchObject({
        attempts: [{ isCorrect: false }],
        outcome: PuzzleOutcome.GAVE_UP,
      })
    })
  })

  describe("selectSpecies", () => {
    it("updates selected species and clears incorrect feedback and search query", () => {
      const service = makePuzzleService()

      service.submitAttempt(TestSpeciesIds.herbRobert)
      expect(service.state.incorrectFeedbackText).toBeDefined()

      service.setSearchQuery("herb")
      service.selectSpecies(TestSpeciesIds.herbRobert)
      expect(service.state).toMatchObject({
        selectedSpeciesId: TestSpeciesIds.herbRobert,
        incorrectFeedbackText: undefined,
        searchQuery: "",
      })
    })
  })

  describe("chooseDifferentPlant", () => {
    it("clears selected species, incorrect feedback, and search query", () => {
      const service = makePuzzleService()

      service.selectSpecies(TestSpeciesIds.herbRobert)
      service.submitAttempt(TestSpeciesIds.herbRobert)
      service.setSearchQuery("tansy")

      service.chooseDifferentPlant()
      expect(service.state).toMatchObject({
        selectedSpeciesId: undefined,
        incorrectFeedbackText: undefined,
        searchQuery: "",
      })
    })
  })

  describe("setSearchQuery", () => {
    it("sets the search query", () => {
      const service = makePuzzleService()

      service.setSearchQuery("daisy")

      expect(service.state.searchQuery).toBe("daisy")
    })
  })

  describe("submitAttempt", () => {
    it("records a correct attempt and returns isCorrect and isCompleted", () => {
      const service = makePuzzleService()

      const result = service.submitAttempt(defaultPuzzle.speciesId)

      expect(result).toEqual({ isCorrect: true, isCompleted: true })
      expect(service.state).toMatchObject({
        attempts: [{ isCorrect: true }],
        selectedSpeciesId: undefined,
        incorrectFeedbackText: undefined,
      })
    })

    it("records an incorrect attempt with no match and returns not completed", () => {
      const service = makePuzzleService()

      const result = service.submitAttempt(TestSpeciesIds.herbRobert)

      expect(result).toEqual({ isCorrect: false, isCompleted: false })
      expect(service.state).toMatchObject({
        attempts: [{ isCorrect: false, genusMatch: false, familyMatch: false }],
        incorrectFeedbackText: "That's not it - have another go.",
        outcome: undefined,
      })
    })

    it("shows family match feedback when family matches but genus does not", () => {
      const service = makePuzzleService()

      const result = service.submitAttempt(TestSpeciesIds.tansy)

      expect(result).toEqual({ isCorrect: false, isCompleted: false })
      expect(service.state).toMatchObject({
        attempts: [{ isCorrect: false, genusMatch: false, familyMatch: true }],
        incorrectFeedbackText: "That's in the right family - have another go.",
      })
    })

    it("shows genus match feedback when genus matches", () => {
      const service = makePuzzleService({ puzzle: defaultPuzzles.getPuzzle(TestPuzzles.tansy.id) })

      const result = service.submitAttempt(TestSpeciesIds.feverfew)

      expect(result).toEqual({ isCorrect: false, isCompleted: false })
      expect(service.state).toMatchObject({
        attempts: [{ isCorrect: false, genusMatch: true, familyMatch: true }],
        incorrectFeedbackText: "Right genus - you're close!",
      })
    })

    it("sets OUT_OF_ATTEMPTS outcome after MAX_ATTEMPTS incorrect guesses", () => {
      const historyStore = new HistoryStore(createMemoryStorage())
      const service = makePuzzleService({ mode: PuzzleMode.DAILY, historyStore })

      service.submitAttempt(TestSpeciesIds.herbRobert)
      service.submitAttempt(TestSpeciesIds.tansy)
      service.submitAttempt(TestSpeciesIds.birdsFootTrefoil)

      expect(service.state).toMatchObject({
        attempts: [{ isCorrect: false }, { isCorrect: false }, { isCorrect: false }],
        outcome: PuzzleOutcome.OUT_OF_ATTEMPTS,
        statsSummary: { played: 1, wins: 0 },
      })
      expect(historyStore.load().entries).toEqual([
        {
          date: TestDate,
          result: PassOrFail.FAIL,
          submittedSpecies: [TestSpeciesIds.herbRobert, TestSpeciesIds.tansy, TestSpeciesIds.birdsFootTrefoil],
        },
      ])
    })
  })

  describe("giveUp", () => {
    it("marks the puzzle as gave up and saves attempt in daily mode", () => {
      const historyStore = new HistoryStore(createMemoryStorage())
      const service = makePuzzleService({ mode: PuzzleMode.DAILY, historyStore })

      service.submitAttempt(TestSpeciesIds.herbRobert)
      service.giveUp()

      expect(service.state).toMatchObject({
        outcome: PuzzleOutcome.GAVE_UP,
        selectedSpeciesId: undefined,
        incorrectFeedbackText: undefined,
      })
      expect(historyStore.load().entries).toEqual([
        {
          date: TestDate,
          result: PassOrFail.FAIL,
          submittedSpecies: [TestSpeciesIds.herbRobert],
        },
      ])
    })
  })

  describe("selectImageIndex", () => {
    it("sets the current image index", () => {
      const service = makePuzzleService()

      service.selectImageIndex(ImageIndex(2))

      expect(service.state.imageGallery.index).toBe(2)
    })

    it("throws for out-of-bounds indices", () => {
      const service = makePuzzleService()
      const outOfBoundsIndex = ImageIndex(defaultPuzzle.images.length + 2)

      expect(() => service.selectImageIndex(outOfBoundsIndex)).toThrow("Invalid image index")
    })

    it("rejects negative indices via branded type", () => {
      expect(() => ImageIndex(-1)).toThrow()
    })

    it("rejects non-integer indices via branded type", () => {
      expect(() => ImageIndex(1.5)).toThrow()
    })
  })

  describe("goToNextImage", () => {
    it("advances and wraps the image index", () => {
      const service = makePuzzleService()

      service.goToNextImage()
      expect(service.state.imageGallery.index).toBe(1)

      service.selectImageIndex(ImageIndex(defaultPuzzle.images.length - 1))
      service.goToNextImage()
      expect(service.state.imageGallery.index).toBe(0)
    })
  })

  describe("goToPreviousImage", () => {
    it("moves back and wraps the image index", () => {
      const service = makePuzzleService()

      service.goToPreviousImage()
      expect(service.state.imageGallery.index).toBe(defaultPuzzle.images.length - 1)

      service.selectImageIndex(ImageIndex(1))
      service.goToPreviousImage()
      expect(service.state.imageGallery.index).toBe(0)
    })
  })

  describe("enterFullscreenImageMode", () => {
    it("sets fullscreen image mode to true", () => {
      const service = makePuzzleService()

      service.enterFullscreenImageMode()

      expect(service.state.imageGallery.isFullscreen).toBe(true)
    })
  })

  describe("exitFullscreenImageMode", () => {
    it("sets fullscreen image mode to false", () => {
      const service = makePuzzleService()

      service.enterFullscreenImageMode()
      service.exitFullscreenImageMode()

      expect(service.state.imageGallery.isFullscreen).toBe(false)
    })
  })

  describe("inProgress", () => {
    it("saves attempt without result after incorrect attempt in daily mode", () => {
      const historyStore = new HistoryStore(createMemoryStorage())
      const service = makePuzzleService({ mode: PuzzleMode.DAILY, historyStore })

      service.submitAttempt(TestSpeciesIds.herbRobert)

      const attempts = historyStore.load().entries
      expect(attempts).toHaveLength(1)
      expect(attempts[0]).toEqual({
        date: TestDate,
        submittedSpecies: [TestSpeciesIds.herbRobert],
      })
    })

    it("does not save attempt in review mode", () => {
      const historyStore = new HistoryStore(createMemoryStorage())
      const service = makePuzzleService({ mode: PuzzleMode.REVIEW, historyStore })

      service.submitAttempt(TestSpeciesIds.herbRobert)

      expect(historyStore.load().entries).toHaveLength(0)
    })

    it("restores in-progress attempts on daily puzzle hydration", () => {
      const historyStore = new HistoryStore(createMemoryStorage())
      historyStore.saveEntry(
        createInProgressEntry({
          submittedSpecies: [TestSpeciesIds.herbRobert, TestSpeciesIds.tansy],
        }),
      )

      const service = makePuzzleService({ mode: PuzzleMode.DAILY, historyStore })

      expect(service.state).toMatchObject({
        attempts: [{ speciesId: TestSpeciesIds.herbRobert }, { speciesId: TestSpeciesIds.tansy }],
      })
    })

    it("sets result when puzzle is completed", () => {
      const historyStore = new HistoryStore(createMemoryStorage())
      const existingEntry = createPuzzleHistoryEntry({ date: Iso8601Date("2026-06-01") })
      historyStore.saveEntry(existingEntry)
      const service = makePuzzleService({ mode: PuzzleMode.DAILY, historyStore })

      service.submitAttempt(defaultPuzzle.speciesId)

      const history = historyStore.load()
      expect(history.entries).toHaveLength(2)
      expect(history.entries.find((a) => a.date === TestDate)?.result).toBe(PassOrFail.PASS)
    })

    it("does not restore in-progress for review mode", () => {
      const historyStore = new HistoryStore(createMemoryStorage())
      historyStore.saveEntry(createInProgressEntry())

      const service = makePuzzleService({ mode: PuzzleMode.REVIEW, historyStore })

      expect(service.state).toMatchObject({ attempts: [] })
    })

    it("preserves other attempts when viewing a review puzzle", () => {
      const historyStore = new HistoryStore(createMemoryStorage())
      const inProgress = createInProgressEntry()
      historyStore.saveEntry(inProgress)

      makePuzzleService({ mode: PuzzleMode.REVIEW, historyStore })

      expect(historyStore.load().entries).toEqual([inProgress])
    })

    it("preserves other attempts when viewing an archived puzzle from a different day", () => {
      const historyStore = new HistoryStore(createMemoryStorage())
      const archiveDate = Iso8601Date("2026-06-01")
      const inProgress = createInProgressEntry()
      historyStore.saveEntry(inProgress)

      makePuzzleService({ mode: PuzzleMode.ARCHIVE, historyStore, date: archiveDate })

      expect(historyStore.load().entries).toEqual([inProgress])
    })
  })
})
