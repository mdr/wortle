import { describe, expect, it } from "vitest"

import { TestPuzzles, TestSpeciesIds } from "@/lib/testConstants.testUtils"
import { Iso8601Date } from "@/utils/brandedTypes"

import { DailyResult } from "./GameState"
import { createDailyPuzzleRecord, createGameStorage, createInProgressRecord } from "./GameStorage.testUtils"

describe("GameStorage", () => {
  it("returns default state when empty", () => {
    const gameStorage = createGameStorage()
    expect(gameStorage.load()).toEqual({ history: [] })
  })

  it("persists and loads state", () => {
    const gameStorage = createGameStorage()
    gameStorage.saveRecord({
      date: Iso8601Date("2026-06-08"),
      puzzleId: TestPuzzles.daisy.id,
      result: DailyResult.PASS,
      attemptedSpeciesIds: [TestSpeciesIds.birdsFootTrefoil, TestPuzzles.herbRobert.speciesId],
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
    })
  })

  it("clears stored state", () => {
    const gameStorage = createGameStorage()
    gameStorage.saveRecord(createDailyPuzzleRecord())

    gameStorage.clear()

    expect(gameStorage.load()).toEqual({ history: [] })
  })

  it("saves in-progress record (without result)", () => {
    const gameStorage = createGameStorage()

    gameStorage.saveRecord(createInProgressRecord())

    expect(gameStorage.load()).toEqual({
      history: [createInProgressRecord()],
    })
  })

  it("updates in-progress record to completed", () => {
    const gameStorage = createGameStorage()
    const date = Iso8601Date("2026-06-08")
    gameStorage.saveRecord(createInProgressRecord({ date }))

    gameStorage.saveRecord(createDailyPuzzleRecord({ date, result: DailyResult.PASS }))

    expect(gameStorage.load().history).toHaveLength(1)
    expect(gameStorage.load().history[0]?.result).toBe(DailyResult.PASS)
  })

  it("replaces existing record for same date", () => {
    const gameStorage = createGameStorage()
    const date = Iso8601Date("2026-06-08")
    gameStorage.saveRecord(createDailyPuzzleRecord({ date, result: DailyResult.FAIL }))

    gameStorage.saveRecord(createDailyPuzzleRecord({ date, result: DailyResult.PASS }))

    expect(gameStorage.load().history).toHaveLength(1)
    expect(gameStorage.load().history[0]?.result).toBe(DailyResult.PASS)
  })

  it("keeps history sorted by date", () => {
    const gameStorage = createGameStorage()
    const earliest = Iso8601Date("2026-06-08")
    const middle = Iso8601Date("2026-06-09")
    const latest = Iso8601Date("2026-06-10")
    gameStorage.saveRecord(createDailyPuzzleRecord({ date: middle }))
    gameStorage.saveRecord(createDailyPuzzleRecord({ date: latest }))
    gameStorage.saveRecord(createDailyPuzzleRecord({ date: earliest }))

    const history = gameStorage.load().history
    expect(history.map((r) => r.date)).toEqual([earliest, middle, latest])
  })
})
