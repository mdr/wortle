import { describe, expect, it } from "vitest"

import { Iso8601Date } from "@/utils/brandedTypes"

import { calculateDailyStatsSummary } from "./dailyStatsSummary"
import { DailyResult } from "./GameState"
import { createDailyPuzzleRecord } from "./GameStorage.testUtils"

describe("calculateDailyStatsSummary", () => {
  it("returns empty summary when history is empty", () => {
    const summary = calculateDailyStatsSummary([])
    expect(summary).toEqual({
      played: 0,
      wins: 0,
      winRate: 0,
      currentStreak: 0,
      maxStreak: 0,
    })
  })

  it("counts consecutive passes as streaks", () => {
    const history = [
      createDailyPuzzleRecord({ date: Iso8601Date("2026-06-08"), result: DailyResult.PASS }),
      createDailyPuzzleRecord({ date: Iso8601Date("2026-06-09"), result: DailyResult.PASS }),
    ]

    expect(calculateDailyStatsSummary(history)).toEqual({
      played: 2,
      wins: 2,
      winRate: 1,
      currentStreak: 2,
      maxStreak: 2,
    })
  })

  it("breaks streaks on gaps or failures", () => {
    const history = [
      createDailyPuzzleRecord({ date: Iso8601Date("2026-06-08"), result: DailyResult.PASS }),
      createDailyPuzzleRecord({ date: Iso8601Date("2026-06-10"), result: DailyResult.FAIL }),
    ]

    expect(calculateDailyStatsSummary(history)).toEqual({
      played: 2,
      wins: 1,
      winRate: 0.5,
      currentStreak: 0,
      maxStreak: 1,
    })
  })

  it("treats records without result (abandoned) as failures for streaks", () => {
    const history = [
      createDailyPuzzleRecord({ date: Iso8601Date("2026-06-08"), result: DailyResult.PASS }),
      createDailyPuzzleRecord({ date: Iso8601Date("2026-06-09"), result: undefined }),
      createDailyPuzzleRecord({ date: Iso8601Date("2026-06-10"), result: DailyResult.PASS }),
    ]

    expect(calculateDailyStatsSummary(history)).toEqual({
      played: 3,
      wins: 2,
      winRate: 2 / 3,
      currentStreak: 1,
      maxStreak: 1,
    })
  })

  it("counts records without result in played total", () => {
    const history = [createDailyPuzzleRecord({ date: Iso8601Date("2026-06-08"), result: undefined })]

    expect(calculateDailyStatsSummary(history)).toEqual({
      played: 1,
      wins: 0,
      winRate: 0,
      currentStreak: 0,
      maxStreak: 0,
    })
  })
})
