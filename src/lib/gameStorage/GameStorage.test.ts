import { describe, expect, it } from "vitest"

import { TestPuzzles, TestSpeciesIds } from "@/lib/testConstants.testUtils"
import { Iso8601Date } from "@/utils/brandedTypes"

import { DailyResult } from "./GameState"
import { createDailyPuzzleRecord, createGameStorage } from "./GameStorage.testUtils"

describe("GameStorage", () => {
  it("returns default state when empty", () => {
    const gameStorage = createGameStorage()
    expect(gameStorage.load()).toEqual({ history: [] })
  })

  it("persists and loads state", () => {
    const gameStorage = createGameStorage()
    gameStorage.recordDailyCompletion({
      date: Iso8601Date("2026-06-08"),
      puzzleId: TestPuzzles.daisy.id,
      result: DailyResult.PASS,
      attemptedSpeciesIds: [TestSpeciesIds.birdsFootTrefoil, TestPuzzles.herbRobert.speciesId],
    })
    gameStorage.saveDailyInProgress({
      date: Iso8601Date("2026-06-09"),
      attemptedSpeciesIds: [TestSpeciesIds.feverfew],
    })

    expect(gameStorage.load()).toEqual({
      history: [
        {
          date: Iso8601Date("2026-06-08"),
          puzzleId: TestPuzzles.daisy.id,
          result: DailyResult.PASS,
          attemptedSpeciesIds: [TestSpeciesIds.birdsFootTrefoil, TestPuzzles.herbRobert.speciesId],
        },
      ],
      dailyInProgress: {
        date: Iso8601Date("2026-06-09"),
        attemptedSpeciesIds: [TestSpeciesIds.feverfew],
      },
    })
  })

  it("clears stored state", () => {
    const gameStorage = createGameStorage()
    gameStorage.recordDailyCompletion(createDailyPuzzleRecord())

    gameStorage.clear()

    expect(gameStorage.load()).toEqual({ history: [] })
  })

  it("saves daily in-progress", () => {
    const gameStorage = createGameStorage()

    gameStorage.saveDailyInProgress({
      date: Iso8601Date("2026-06-08"),
      attemptedSpeciesIds: [TestSpeciesIds.birdsFootTrefoil],
    })

    expect(gameStorage.load()).toMatchObject({
      dailyInProgress: {
        date: Iso8601Date("2026-06-08"),
        attemptedSpeciesIds: [TestSpeciesIds.birdsFootTrefoil],
      },
    })
  })

  it("clears daily in-progress", () => {
    const gameStorage = createGameStorage()
    gameStorage.saveDailyInProgress({
      date: Iso8601Date("2026-06-08"),
      attemptedSpeciesIds: [TestSpeciesIds.birdsFootTrefoil],
    })

    gameStorage.clearDailyInProgress()

    expect(gameStorage.load()).toEqual({ history: [] })
  })

  it("records daily completion and clears in-progress", () => {
    const gameStorage = createGameStorage()
    gameStorage.saveDailyInProgress({
      date: Iso8601Date("2026-06-08"),
      attemptedSpeciesIds: [TestSpeciesIds.birdsFootTrefoil],
    })
    const record = createDailyPuzzleRecord()

    gameStorage.recordDailyCompletion(record)

    expect(gameStorage.load().dailyInProgress).toBeUndefined()
    expect(gameStorage.load().history).toEqual([record])
  })

  it("replaces existing record for same date", () => {
    const gameStorage = createGameStorage()
    const date = Iso8601Date("2026-06-08")
    gameStorage.recordDailyCompletion(createDailyPuzzleRecord({ date, result: DailyResult.FAIL }))

    gameStorage.recordDailyCompletion(createDailyPuzzleRecord({ date, result: DailyResult.PASS }))

    expect(gameStorage.load().history).toHaveLength(1)
    expect(gameStorage.load().history[0]?.result).toBe(DailyResult.PASS)
  })

  it("keeps history sorted by date", () => {
    const gameStorage = createGameStorage()
    const earliest = Iso8601Date("2026-06-08")
    const middle = Iso8601Date("2026-06-09")
    const latest = Iso8601Date("2026-06-10")
    gameStorage.recordDailyCompletion(createDailyPuzzleRecord({ date: middle }))
    gameStorage.recordDailyCompletion(createDailyPuzzleRecord({ date: latest }))
    gameStorage.recordDailyCompletion(createDailyPuzzleRecord({ date: earliest }))

    const history = gameStorage.load().history
    expect(history.map((r) => r.date)).toEqual([earliest, middle, latest])
  })
})
