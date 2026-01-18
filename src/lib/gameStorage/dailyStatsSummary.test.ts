import { describe, expect, it } from "vitest"

import { Iso8601Date } from "@/utils/brandedTypes"

import { calculateDailyStatsSummary } from "./dailyStatsSummary"
import { PassOrFail } from "./HistoryRecord"
import { createPuzzleAttempt } from "./HistoryStore.testUtils"

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
      createPuzzleAttempt({ date: Iso8601Date("2026-06-08"), result: PassOrFail.PASS }),
      createPuzzleAttempt({ date: Iso8601Date("2026-06-09"), result: PassOrFail.PASS }),
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
      createPuzzleAttempt({ date: Iso8601Date("2026-06-08"), result: PassOrFail.PASS }),
      createPuzzleAttempt({ date: Iso8601Date("2026-06-10"), result: PassOrFail.FAIL }),
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
      createPuzzleAttempt({ date: Iso8601Date("2026-06-08"), result: PassOrFail.PASS }),
      createPuzzleAttempt({ date: Iso8601Date("2026-06-09"), result: undefined }),
      createPuzzleAttempt({ date: Iso8601Date("2026-06-10"), result: PassOrFail.PASS }),
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
    const history = [createPuzzleAttempt({ date: Iso8601Date("2026-06-08"), result: undefined })]

    expect(calculateDailyStatsSummary(history)).toEqual({
      played: 1,
      wins: 0,
      winRate: 0,
      currentStreak: 0,
      maxStreak: 0,
    })
  })
})
