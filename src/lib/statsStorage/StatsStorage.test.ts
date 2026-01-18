import { describe, expect, it } from "vitest"

import { TestPuzzles, TestSpeciesIds } from "@/tests/playwright/testConstants.testUtils"
import { Iso8601Date } from "@/utils/brandedTypes"

import { DailyResult } from "./StatsStorage"
import { createDailyPuzzleRecord, createStatsStorage } from "./StatsStorage.testUtils"

describe("StatsStorage", () => {
  it("returns default stats when empty", () => {
    const statsStorage = createStatsStorage()
    expect(statsStorage.load()).toEqual({ history: [] })
  })

  it("persists and loads stats", () => {
    const statsStorage = createStatsStorage()
    statsStorage.recordDailyCompletion({
      date: Iso8601Date("2026-06-08"),
      puzzleId: TestPuzzles.daisy.id,
      result: DailyResult.PASS,
      attemptedSpeciesIds: [TestSpeciesIds.birdsFootTrefoil, TestPuzzles.herbRobert.speciesId],
    })
    statsStorage.saveDailyInProgress({
      date: Iso8601Date("2026-06-09"),
      attemptedSpeciesIds: [TestSpeciesIds.feverfew],
    })

    expect(statsStorage.load()).toEqual({
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

  it("clears stored stats", () => {
    const statsStorage = createStatsStorage()
    statsStorage.recordDailyCompletion(createDailyPuzzleRecord())

    statsStorage.clear()

    expect(statsStorage.load()).toEqual({ history: [] })
  })

  it("saves daily in-progress", () => {
    const statsStorage = createStatsStorage()

    statsStorage.saveDailyInProgress({
      date: Iso8601Date("2026-06-08"),
      attemptedSpeciesIds: [TestSpeciesIds.birdsFootTrefoil],
    })

    expect(statsStorage.load()).toMatchObject({
      dailyInProgress: {
        date: Iso8601Date("2026-06-08"),
        attemptedSpeciesIds: [TestSpeciesIds.birdsFootTrefoil],
      },
    })
  })

  it("clears daily in-progress", () => {
    const statsStorage = createStatsStorage()
    statsStorage.saveDailyInProgress({
      date: Iso8601Date("2026-06-08"),
      attemptedSpeciesIds: [TestSpeciesIds.birdsFootTrefoil],
    })

    statsStorage.clearDailyInProgress()

    expect(statsStorage.load()).toEqual({ history: [] })
  })

  it("records daily completion and clears in-progress", () => {
    const statsStorage = createStatsStorage()
    statsStorage.saveDailyInProgress({
      date: Iso8601Date("2026-06-08"),
      attemptedSpeciesIds: [TestSpeciesIds.birdsFootTrefoil],
    })
    const record = createDailyPuzzleRecord()

    statsStorage.recordDailyCompletion(record)

    expect(statsStorage.load().dailyInProgress).toBeUndefined()
    expect(statsStorage.load().history).toEqual([record])
  })

  it("replaces existing record for same date", () => {
    const statsStorage = createStatsStorage()
    const date = Iso8601Date("2026-06-08")
    statsStorage.recordDailyCompletion(createDailyPuzzleRecord({ date, result: DailyResult.FAIL }))

    statsStorage.recordDailyCompletion(createDailyPuzzleRecord({ date, result: DailyResult.PASS }))

    expect(statsStorage.load().history).toHaveLength(1)
    expect(statsStorage.load().history[0]?.result).toBe(DailyResult.PASS)
  })

  it("keeps history sorted by date", () => {
    const statsStorage = createStatsStorage()
    const earliest = Iso8601Date("2026-06-08")
    const middle = Iso8601Date("2026-06-09")
    const latest = Iso8601Date("2026-06-10")
    statsStorage.recordDailyCompletion(createDailyPuzzleRecord({ date: middle }))
    statsStorage.recordDailyCompletion(createDailyPuzzleRecord({ date: latest }))
    statsStorage.recordDailyCompletion(createDailyPuzzleRecord({ date: earliest }))

    const history = statsStorage.load().history
    expect(history.map((r) => r.date)).toEqual([earliest, middle, latest])
  })
})
