import { describe, expect, it } from "vitest"

import { DailyResult } from "@/lib/gameStorage/GameState"
import { GameStorage } from "@/lib/gameStorage/GameStorage"
import { createMemoryStorage } from "@/lib/gameStorage/storage.testUtils"
import { Puzzle } from "@/lib/Puzzle"
import { getPuzzle } from "@/lib/puzzles"
import { getSpecies } from "@/lib/species/plants"
import { Species } from "@/lib/species/Species"
import { TestPuzzles, TestSpeciesIds } from "@/lib/testConstants.testUtils"
import { Iso8601Date } from "@/utils/brandedTypes"

import { MAX_ATTEMPTS, PuzzleMode, PuzzleService } from "./PuzzleService"

const scheduledDate = Iso8601Date("2026-06-08")
const puzzleId = TestPuzzles.daisy.id
const getPuzzleData = (): { puzzle: Puzzle; correctSpecies: Species } => {
  const puzzle = getPuzzle(puzzleId)
  const correctSpecies = getSpecies(puzzle.speciesId)
  return { puzzle, correctSpecies }
}

const makePuzzleService = (options: Partial<{ mode: PuzzleMode; gameStorage: GameStorage }> = {}): PuzzleService => {
  const { puzzle, correctSpecies } = getPuzzleData()
  const gameStorage = options.gameStorage ?? new GameStorage(createMemoryStorage())
  return new PuzzleService(
    { puzzle, correctSpecies, scheduledDate },
    { mode: options.mode ?? PuzzleMode.REVIEW, gameStorage },
  )
}

describe("PuzzleService", () => {
  describe("hydration", () => {
    it("hydrates completed daily puzzles from stats", () => {
      const storage = createMemoryStorage()
      const gameStorage = new GameStorage(storage)
      gameStorage.recordDailyCompletion({
        date: scheduledDate,
        puzzleId,
        result: DailyResult.PASS,
        attemptedSpeciesIds: [TestPuzzles.herbRobert.speciesId, TestPuzzles.daisy.speciesId],
      })

      const service = makePuzzleService({ mode: PuzzleMode.DAILY, gameStorage })

      expect(service.state.attempts).toHaveLength(2)
      expect(service.state.attempts[1]?.isCorrect).toBe(true)
      expect(service.state.gaveUp).toBe(false)
      expect(service.state.incorrectFeedbackText).toBeUndefined()
      expect(service.state.selectedSpecies).toBeUndefined()
    })

    it("marks gave up when daily stats show a failure before max attempts", () => {
      const storage = createMemoryStorage()
      const gameStorage = new GameStorage(storage)
      gameStorage.recordDailyCompletion({
        date: scheduledDate,
        puzzleId,
        result: DailyResult.FAIL,
        attemptedSpeciesIds: [TestPuzzles.herbRobert.speciesId],
      })

      const service = makePuzzleService({ mode: PuzzleMode.DAILY, gameStorage })

      expect(service.state.attempts).toHaveLength(1)
      expect(service.state.gaveUp).toBe(true)
    })

    it("does not mark gave up when daily failure uses all attempts", () => {
      const storage = createMemoryStorage()
      const gameStorage = new GameStorage(storage)
      gameStorage.recordDailyCompletion({
        date: scheduledDate,
        puzzleId,
        result: DailyResult.FAIL,
        attemptedSpeciesIds: [
          TestPuzzles.herbRobert.speciesId,
          TestPuzzles.tansy.speciesId,
          TestSpeciesIds.fieldScabious,
        ],
      })

      const service = makePuzzleService({ mode: PuzzleMode.DAILY, gameStorage })

      expect(service.state.attempts).toHaveLength(MAX_ATTEMPTS)
      expect(service.state.gaveUp).toBe(false)
    })

    it("ignores stats hydration for review mode", () => {
      const storage = createMemoryStorage()
      const gameStorage = new GameStorage(storage)
      gameStorage.recordDailyCompletion({
        date: scheduledDate,
        puzzleId,
        result: DailyResult.PASS,
        attemptedSpeciesIds: [TestPuzzles.daisy.speciesId],
      })

      const service = makePuzzleService({ mode: PuzzleMode.REVIEW, gameStorage })

      expect(service.state.attempts).toHaveLength(0)
      expect(service.state.gaveUp).toBe(false)
    })
  })

  describe("selectSpecies", () => {
    it("updates selected species and clears incorrect feedback", () => {
      const service = makePuzzleService()

      service.submitAttempt(TestPuzzles.herbRobert.speciesId)
      expect(service.state.incorrectFeedbackText).toBeDefined()

      service.selectSpecies(TestPuzzles.herbRobert.speciesId)
      expect(service.state.selectedSpecies?.id).toBe(TestPuzzles.herbRobert.speciesId)
      expect(service.state.incorrectFeedbackText).toBeUndefined()
    })
  })

  describe("chooseDifferentPlant", () => {
    it("clears selected species and incorrect feedback", () => {
      const service = makePuzzleService()

      service.selectSpecies(TestPuzzles.herbRobert.speciesId)
      service.submitAttempt(TestPuzzles.herbRobert.speciesId)

      service.chooseDifferentPlant()
      expect(service.state.selectedSpecies).toBeUndefined()
      expect(service.state.incorrectFeedbackText).toBeUndefined()
    })
  })

  describe("submitAttempt", () => {
    it("records a correct attempt and returns true", () => {
      const { correctSpecies } = getPuzzleData()
      const service = makePuzzleService()

      const result = service.submitAttempt(correctSpecies.id)

      expect(result).toBe(true)
      expect(service.state.attempts).toHaveLength(1)
      expect(service.state.attempts[0]?.isCorrect).toBe(true)
      expect(service.state.selectedSpecies).toBeUndefined()
      expect(service.state.incorrectFeedbackText).toBeUndefined()
    })

    it("records an incorrect attempt and returns false", () => {
      const service = makePuzzleService()

      const result = service.submitAttempt(TestPuzzles.herbRobert.speciesId)

      expect(result).toBe(false)
      expect(service.state.attempts).toHaveLength(1)
      expect(service.state.attempts[0]?.isCorrect).toBe(false)
      expect(service.state.incorrectFeedbackText).toBeDefined()
    })
  })

  describe("giveUp", () => {
    it("marks the puzzle as gave up and records stats in daily mode", () => {
      const gameStorage = new GameStorage(createMemoryStorage())
      const service = makePuzzleService({ mode: PuzzleMode.DAILY, gameStorage })

      service.submitAttempt(TestPuzzles.herbRobert.speciesId)
      service.giveUp()

      expect(service.state.gaveUp).toBe(true)
      expect(service.state.selectedSpecies).toBeUndefined()
      expect(service.state.incorrectFeedbackText).toBeUndefined()
      expect(gameStorage.load().history).toEqual([
        {
          date: scheduledDate,
          puzzleId,
          result: DailyResult.FAIL,
          attemptedSpeciesIds: [TestPuzzles.herbRobert.speciesId],
        },
      ])
    })
  })

  describe("selectImageIndex", () => {
    it("sets the current image index", () => {
      const service = makePuzzleService()

      service.selectImageIndex(2)

      expect(service.state.imageGalleryIndex).toBe(2)
    })

    it("throws for out-of-bounds indices", () => {
      const { puzzle } = getPuzzleData()
      const service = makePuzzleService()
      const outOfBoundsIndex = puzzle.images.length + 2

      expect(() => service.selectImageIndex(outOfBoundsIndex)).toThrow("Invalid image index")
    })
  })

  describe("goToNextImage", () => {
    it("advances and wraps the image index", () => {
      const { puzzle } = getPuzzleData()
      const service = makePuzzleService()

      service.goToNextImage()
      expect(service.state.imageGalleryIndex).toBe(1)

      service.selectImageIndex(puzzle.images.length - 1)
      service.goToNextImage()
      expect(service.state.imageGalleryIndex).toBe(0)
    })
  })

  describe("goToPreviousImage", () => {
    it("moves back and wraps the image index", () => {
      const { puzzle } = getPuzzleData()
      const service = makePuzzleService()

      service.goToPreviousImage()
      expect(service.state.imageGalleryIndex).toBe(puzzle.images.length - 1)

      service.selectImageIndex(1)
      service.goToPreviousImage()
      expect(service.state.imageGalleryIndex).toBe(0)
    })
  })

  describe("enterFullscreenImageMode", () => {
    it("sets fullscreen image mode to true", () => {
      const service = makePuzzleService()

      service.enterFullscreenImageMode()

      expect(service.state.isFullscreenImageMode).toBe(true)
    })
  })

  describe("exitFullscreenImageMode", () => {
    it("sets fullscreen image mode to false", () => {
      const service = makePuzzleService()

      service.enterFullscreenImageMode()
      service.exitFullscreenImageMode()

      expect(service.state.isFullscreenImageMode).toBe(false)
    })
  })

  describe("dailyInProgress", () => {
    it("saves in-progress after incorrect attempt in daily mode", () => {
      const gameStorage = new GameStorage(createMemoryStorage())
      const service = makePuzzleService({ mode: PuzzleMode.DAILY, gameStorage })

      service.submitAttempt(TestPuzzles.herbRobert.speciesId)

      expect(gameStorage.load().dailyInProgress).toEqual({
        date: scheduledDate,
        attemptedSpeciesIds: [TestPuzzles.herbRobert.speciesId],
      })
    })

    it("does not save in-progress in review mode", () => {
      const gameStorage = new GameStorage(createMemoryStorage())
      const service = makePuzzleService({ mode: PuzzleMode.REVIEW, gameStorage })

      service.submitAttempt(TestPuzzles.herbRobert.speciesId)

      expect(gameStorage.load().dailyInProgress).toBeUndefined()
    })

    it("restores in-progress attempts on daily puzzle hydration", () => {
      const gameStorage = new GameStorage(createMemoryStorage())
      gameStorage.saveDailyInProgress({
        date: scheduledDate,
        attemptedSpeciesIds: [TestPuzzles.herbRobert.speciesId, TestPuzzles.tansy.speciesId],
      })

      const service = makePuzzleService({ mode: PuzzleMode.DAILY, gameStorage })

      expect(service.state.attempts).toHaveLength(2)
      expect(service.state.attempts[0]?.speciesId).toBe(TestPuzzles.herbRobert.speciesId)
      expect(service.state.attempts[1]?.speciesId).toBe(TestPuzzles.tansy.speciesId)
    })

    it("clears in-progress when puzzle is completed", () => {
      const gameStorage = new GameStorage(createMemoryStorage())
      gameStorage.saveDailyInProgress({
        date: scheduledDate,
        attemptedSpeciesIds: [TestPuzzles.herbRobert.speciesId],
      })
      const { correctSpecies } = getPuzzleData()
      const service = makePuzzleService({ mode: PuzzleMode.DAILY, gameStorage })

      service.submitAttempt(correctSpecies.id)

      expect(gameStorage.load().dailyInProgress).toBeUndefined()
    })

    it("clears stale in-progress when date changes", () => {
      const gameStorage = new GameStorage(createMemoryStorage())
      gameStorage.saveDailyInProgress({
        date: Iso8601Date("2026-06-07"),
        attemptedSpeciesIds: [TestPuzzles.herbRobert.speciesId],
      })

      const service = makePuzzleService({ mode: PuzzleMode.DAILY, gameStorage })

      expect(gameStorage.load().dailyInProgress).toBeUndefined()
      expect(service.state.attempts).toHaveLength(0)
    })

    it("does not restore in-progress for review mode", () => {
      const gameStorage = new GameStorage(createMemoryStorage())
      gameStorage.saveDailyInProgress({
        date: scheduledDate,
        attemptedSpeciesIds: [TestPuzzles.herbRobert.speciesId],
      })

      const service = makePuzzleService({ mode: PuzzleMode.REVIEW, gameStorage })

      expect(service.state.attempts).toHaveLength(0)
    })

    it("viewing a review puzzle does not clear daily in-progress", () => {
      const gameStorage = new GameStorage(createMemoryStorage())
      gameStorage.saveDailyInProgress({
        date: scheduledDate,
        attemptedSpeciesIds: [TestPuzzles.herbRobert.speciesId],
      })

      makePuzzleService({ mode: PuzzleMode.REVIEW, gameStorage })

      expect(gameStorage.load().dailyInProgress).toEqual({
        date: scheduledDate,
        attemptedSpeciesIds: [TestPuzzles.herbRobert.speciesId],
      })
    })
  })
})
