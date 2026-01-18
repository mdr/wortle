import { describe, expect, it } from "vitest"

import { DailyResult } from "@/lib/gameStorage/GameState"
import { GameStorage } from "@/lib/gameStorage/GameStorage"
import { createDailyPuzzleRecord, createInProgressRecord } from "@/lib/gameStorage/GameStorage.testUtils"
import { createMemoryStorage } from "@/lib/gameStorage/storage.testUtils"
import { getPuzzle } from "@/lib/puzzles"
import { TestDate, TestPuzzles, TestSpeciesIds } from "@/lib/testConstants.testUtils"
import { ImageIndex, Iso8601Date } from "@/utils/brandedTypes"

import { PuzzleMode, PuzzleOutcome, PuzzleService } from "./PuzzleService"

const puzzle = getPuzzle(TestPuzzles.daisy.id)

const makePuzzleService = (
  options: Partial<{ mode: PuzzleMode; gameStorage: GameStorage; date: Iso8601Date }> = {},
): PuzzleService => {
  const gameStorage = options.gameStorage ?? new GameStorage(createMemoryStorage())
  return new PuzzleService(puzzle, options.date ?? TestDate, options.mode ?? PuzzleMode.REVIEW, gameStorage)
}

describe("PuzzleService", () => {
  describe("hydration", () => {
    it("hydrates completed daily puzzles from stats", () => {
      const storage = createMemoryStorage()
      const gameStorage = new GameStorage(storage)
      gameStorage.saveRecord({
        date: TestDate,
        puzzleId: puzzle.id,
        result: DailyResult.PASS,
        attemptedSpeciesIds: [TestPuzzles.herbRobert.speciesId, TestPuzzles.daisy.speciesId],
      })

      const service = makePuzzleService({ mode: PuzzleMode.DAILY, gameStorage })

      expect(service.state).toMatchObject({
        attempts: [{ isCorrect: false }, { isCorrect: true }],
        outcome: PuzzleOutcome.CORRECT,
        incorrectFeedbackText: undefined,
        selectedSpeciesId: undefined,
      })
    })

    it("marks gave up when daily stats show a failure before max attempts", () => {
      const storage = createMemoryStorage()
      const gameStorage = new GameStorage(storage)
      gameStorage.saveRecord({
        date: TestDate,
        puzzleId: puzzle.id,
        result: DailyResult.FAIL,
        attemptedSpeciesIds: [TestPuzzles.herbRobert.speciesId],
      })

      const service = makePuzzleService({ mode: PuzzleMode.DAILY, gameStorage })

      expect(service.state).toMatchObject({
        attempts: [{ isCorrect: false }],
        outcome: PuzzleOutcome.GAVE_UP,
      })
    })

    it("marks out of attempts when daily failure uses all attempts", () => {
      const storage = createMemoryStorage()
      const gameStorage = new GameStorage(storage)
      gameStorage.saveRecord({
        date: TestDate,
        puzzleId: puzzle.id,
        result: DailyResult.FAIL,
        attemptedSpeciesIds: [
          TestPuzzles.herbRobert.speciesId,
          TestPuzzles.tansy.speciesId,
          TestSpeciesIds.fieldScabious,
        ],
      })

      const service = makePuzzleService({ mode: PuzzleMode.DAILY, gameStorage })

      expect(service.state).toMatchObject({
        attempts: [{ isCorrect: false }, { isCorrect: false }, { isCorrect: false }],
        outcome: PuzzleOutcome.OUT_OF_ATTEMPTS,
      })
    })

    it("ignores stats hydration for review mode", () => {
      const storage = createMemoryStorage()
      const gameStorage = new GameStorage(storage)
      gameStorage.saveRecord({
        date: TestDate,
        puzzleId: puzzle.id,
        result: DailyResult.PASS,
        attemptedSpeciesIds: [TestPuzzles.daisy.speciesId],
      })

      const service = makePuzzleService({ mode: PuzzleMode.REVIEW, gameStorage })

      expect(service.state).toMatchObject({
        attempts: [],
        outcome: undefined,
      })
    })

    it("hydrates completed archive puzzles from stats", () => {
      const gameStorage = new GameStorage(createMemoryStorage())
      gameStorage.saveRecord({
        date: TestDate,
        puzzleId: puzzle.id,
        result: DailyResult.PASS,
        attemptedSpeciesIds: [TestPuzzles.herbRobert.speciesId, TestPuzzles.daisy.speciesId],
      })

      const service = makePuzzleService({ mode: PuzzleMode.ARCHIVE, gameStorage, date: TestDate })

      expect(service.state).toMatchObject({
        attempts: [{ isCorrect: false }, { isCorrect: true }],
        outcome: PuzzleOutcome.CORRECT,
      })
    })

    it("marks didNotAttempt for unattempted archive puzzles", () => {
      const gameStorage = new GameStorage(createMemoryStorage())

      const service = makePuzzleService({ mode: PuzzleMode.ARCHIVE, gameStorage })

      expect(service.state).toMatchObject({
        attempts: [],
        outcome: PuzzleOutcome.DID_NOT_ATTEMPT,
      })
    })

    it("marks gaveUp for archive puzzles where user gave up", () => {
      const gameStorage = new GameStorage(createMemoryStorage())
      gameStorage.saveRecord({
        date: TestDate,
        puzzleId: puzzle.id,
        result: DailyResult.FAIL,
        attemptedSpeciesIds: [TestPuzzles.herbRobert.speciesId],
      })

      const service = makePuzzleService({ mode: PuzzleMode.ARCHIVE, gameStorage, date: TestDate })

      expect(service.state).toMatchObject({
        attempts: [{ isCorrect: false }],
        outcome: PuzzleOutcome.GAVE_UP,
      })
    })
  })

  describe("selectSpecies", () => {
    it("updates selected species and clears incorrect feedback and search query", () => {
      const service = makePuzzleService()

      service.submitAttempt(TestPuzzles.herbRobert.speciesId)
      expect(service.state.incorrectFeedbackText).toBeDefined()

      service.setSearchQuery("herb")
      service.selectSpecies(TestPuzzles.herbRobert.speciesId)
      expect(service.state).toMatchObject({
        selectedSpeciesId: TestPuzzles.herbRobert.speciesId,
        incorrectFeedbackText: undefined,
        searchQuery: "",
      })
    })
  })

  describe("chooseDifferentPlant", () => {
    it("clears selected species, incorrect feedback, and search query", () => {
      const service = makePuzzleService()

      service.selectSpecies(TestPuzzles.herbRobert.speciesId)
      service.submitAttempt(TestPuzzles.herbRobert.speciesId)
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

      const result = service.submitAttempt(TestPuzzles.herbRobert.speciesId)

      expect(result).toBe(false)
      expect(service.state).toMatchObject({
        attempts: [{ isCorrect: false }],
      })
      expect(service.state.incorrectFeedbackText).toBeDefined()
    })
  })

  describe("giveUp", () => {
    it("marks the puzzle as gave up and records stats in daily mode", () => {
      const gameStorage = new GameStorage(createMemoryStorage())
      const service = makePuzzleService({ mode: PuzzleMode.DAILY, gameStorage })

      service.submitAttempt(TestPuzzles.herbRobert.speciesId)
      service.giveUp()

      expect(service.state).toMatchObject({
        outcome: PuzzleOutcome.GAVE_UP,
        selectedSpeciesId: undefined,
        incorrectFeedbackText: undefined,
      })
      expect(gameStorage.load().history).toEqual([
        {
          date: TestDate,
          puzzleId: puzzle.id,
          result: DailyResult.FAIL,
          attemptedSpeciesIds: [TestPuzzles.herbRobert.speciesId],
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
    it("saves record without result after incorrect attempt in daily mode", () => {
      const gameStorage = new GameStorage(createMemoryStorage())
      const service = makePuzzleService({ mode: PuzzleMode.DAILY, gameStorage })

      service.submitAttempt(TestPuzzles.herbRobert.speciesId)

      const history = gameStorage.load().history
      expect(history).toHaveLength(1)
      expect(history[0]).toEqual({
        date: TestDate,
        puzzleId: puzzle.id,
        attemptedSpeciesIds: [TestPuzzles.herbRobert.speciesId],
      })
    })

    it("does not save record in review mode", () => {
      const gameStorage = new GameStorage(createMemoryStorage())
      const service = makePuzzleService({ mode: PuzzleMode.REVIEW, gameStorage })

      service.submitAttempt(TestPuzzles.herbRobert.speciesId)

      expect(gameStorage.load().history).toHaveLength(0)
    })

    it("restores in-progress attempts on daily puzzle hydration", () => {
      const gameStorage = new GameStorage(createMemoryStorage())
      gameStorage.saveRecord(
        createInProgressRecord({
          attemptedSpeciesIds: [TestPuzzles.herbRobert.speciesId, TestPuzzles.tansy.speciesId],
        }),
      )

      const service = makePuzzleService({ mode: PuzzleMode.DAILY, gameStorage })

      expect(service.state).toMatchObject({
        attempts: [{ speciesId: TestPuzzles.herbRobert.speciesId }, { speciesId: TestPuzzles.tansy.speciesId }],
      })
    })

    it("sets result when puzzle is completed", () => {
      const gameStorage = new GameStorage(createMemoryStorage())
      const existingRecord = createDailyPuzzleRecord({ date: Iso8601Date("2026-06-01") })
      gameStorage.saveRecord(existingRecord)
      const service = makePuzzleService({ mode: PuzzleMode.DAILY, gameStorage })

      service.submitAttempt(puzzle.speciesId)

      const gameState = gameStorage.load()
      expect(gameState.history).toHaveLength(2)
      expect(gameState.history.find((r) => r.date === TestDate)?.result).toBe(DailyResult.PASS)
    })

    it("does not restore in-progress for review mode", () => {
      const gameStorage = new GameStorage(createMemoryStorage())
      gameStorage.saveRecord(createInProgressRecord())

      const service = makePuzzleService({ mode: PuzzleMode.REVIEW, gameStorage })

      expect(service.state).toMatchObject({ attempts: [] })
    })

    it("preserves other records when viewing a review puzzle", () => {
      const gameStorage = new GameStorage(createMemoryStorage())
      const inProgress = createInProgressRecord()
      gameStorage.saveRecord(inProgress)

      makePuzzleService({ mode: PuzzleMode.REVIEW, gameStorage })

      expect(gameStorage.load().history).toEqual([inProgress])
    })

    it("preserves other records when viewing an archived puzzle from a different day", () => {
      const gameStorage = new GameStorage(createMemoryStorage())
      const archiveDate = Iso8601Date("2026-06-01")
      const inProgress = createInProgressRecord()
      gameStorage.saveRecord(inProgress)

      makePuzzleService({ mode: PuzzleMode.ARCHIVE, gameStorage, date: archiveDate })

      expect(gameStorage.load().history).toEqual([inProgress])
    })
  })
})
