import { describe, expect, it } from "vitest"

import { PassOrFail } from "@/lib/gameStorage/HistoryRecord"
import { HistoryStore } from "@/lib/gameStorage/HistoryStore"
import {
  createHistoryStore,
  createInProgressAttempt,
  createPuzzleAttempt,
} from "@/lib/gameStorage/HistoryStore.testUtils"
import { createMemoryStorage } from "@/lib/gameStorage/storage.testUtils"
import { getPuzzle } from "@/lib/puzzles"
import { TestDate, TestPuzzles, TestSpeciesIds } from "@/lib/testConstants.testUtils"
import { ImageIndex, Iso8601Date } from "@/utils/brandedTypes"

import { PuzzleMode, PuzzleOutcome, PuzzleService } from "./PuzzleService"

const puzzle = getPuzzle(TestPuzzles.daisy.id)

const makePuzzleService = (
  options: Partial<{ mode: PuzzleMode; historyStore: HistoryStore; date: Iso8601Date }> = {},
): PuzzleService => {
  const historyStore = options.historyStore ?? createHistoryStore()
  return new PuzzleService(puzzle, options.date ?? TestDate, options.mode ?? PuzzleMode.REVIEW, historyStore)
}

describe("PuzzleService", () => {
  describe("hydration", () => {
    it("hydrates completed daily puzzles from history", () => {
      const historyStore = new HistoryStore(createMemoryStorage())
      historyStore.saveAttempt({
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
      })
    })

    it("marks gave up when history shows a failure before max attempts", () => {
      const historyStore = new HistoryStore(createMemoryStorage())
      historyStore.saveAttempt({
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
      historyStore.saveAttempt({
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
      historyStore.saveAttempt({
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
      historyStore.saveAttempt({
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
      historyStore.saveAttempt({
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
    it("records a correct attempt and returns true", () => {
      const service = makePuzzleService()

      const result = service.submitAttempt(puzzle.speciesId)

      expect(result).toBe(true)
      expect(service.state).toMatchObject({
        attempts: [{ isCorrect: true }],
        selectedSpeciesId: undefined,
        incorrectFeedbackText: undefined,
      })
    })

    it("records an incorrect attempt and returns false", () => {
      const service = makePuzzleService()

      const result = service.submitAttempt(TestSpeciesIds.herbRobert)

      expect(result).toBe(false)
      expect(service.state).toMatchObject({
        attempts: [{ isCorrect: false }],
      })
      expect(service.state.incorrectFeedbackText).toBeDefined()
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
      expect(historyStore.load().attempts).toEqual([
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
      const outOfBoundsIndex = ImageIndex(puzzle.images.length + 2)

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

      service.selectImageIndex(ImageIndex(puzzle.images.length - 1))
      service.goToNextImage()
      expect(service.state.imageGallery.index).toBe(0)
    })
  })

  describe("goToPreviousImage", () => {
    it("moves back and wraps the image index", () => {
      const service = makePuzzleService()

      service.goToPreviousImage()
      expect(service.state.imageGallery.index).toBe(puzzle.images.length - 1)

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

      const attempts = historyStore.load().attempts
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

      expect(historyStore.load().attempts).toHaveLength(0)
    })

    it("restores in-progress attempts on daily puzzle hydration", () => {
      const historyStore = new HistoryStore(createMemoryStorage())
      historyStore.saveAttempt(
        createInProgressAttempt({
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
      const existingAttempt = createPuzzleAttempt({ date: Iso8601Date("2026-06-01") })
      historyStore.saveAttempt(existingAttempt)
      const service = makePuzzleService({ mode: PuzzleMode.DAILY, historyStore })

      service.submitAttempt(puzzle.speciesId)

      const history = historyStore.load()
      expect(history.attempts).toHaveLength(2)
      expect(history.attempts.find((a) => a.date === TestDate)?.result).toBe(PassOrFail.PASS)
    })

    it("does not restore in-progress for review mode", () => {
      const historyStore = new HistoryStore(createMemoryStorage())
      historyStore.saveAttempt(createInProgressAttempt())

      const service = makePuzzleService({ mode: PuzzleMode.REVIEW, historyStore })

      expect(service.state).toMatchObject({ attempts: [] })
    })

    it("preserves other attempts when viewing a review puzzle", () => {
      const historyStore = new HistoryStore(createMemoryStorage())
      const inProgress = createInProgressAttempt()
      historyStore.saveAttempt(inProgress)

      makePuzzleService({ mode: PuzzleMode.REVIEW, historyStore })

      expect(historyStore.load().attempts).toEqual([inProgress])
    })

    it("preserves other attempts when viewing an archived puzzle from a different day", () => {
      const historyStore = new HistoryStore(createMemoryStorage())
      const archiveDate = Iso8601Date("2026-06-01")
      const inProgress = createInProgressAttempt()
      historyStore.saveAttempt(inProgress)

      makePuzzleService({ mode: PuzzleMode.ARCHIVE, historyStore, date: archiveDate })

      expect(historyStore.load().attempts).toEqual([inProgress])
    })
  })
})
