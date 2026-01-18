import { describe, expect, it } from "vitest"

import { PassOrFail } from "./gameStorage/HistoryRecord"
import { getResultDescription, getResultMedal } from "./resultMedal"

describe("getResultMedal", () => {
  it("returns gold medal for correct on 1st attempt", () => {
    expect(getResultMedal({ attemptCount: 1, result: PassOrFail.PASS })).toBe("🥇")
  })

  it("returns silver medal for correct on 2nd attempt", () => {
    expect(getResultMedal({ attemptCount: 2, result: PassOrFail.PASS })).toBe("🥈")
  })

  it("returns bronze medal for correct on 3rd attempt", () => {
    expect(getResultMedal({ attemptCount: 3, result: PassOrFail.PASS })).toBe("🥉")
  })

  it("returns bronze medal for correct on 4th+ attempt", () => {
    expect(getResultMedal({ attemptCount: 4, result: PassOrFail.PASS })).toBe("🥉")
    expect(getResultMedal({ attemptCount: 10, result: PassOrFail.PASS })).toBe("🥉")
  })

  it("returns X for incorrect answer", () => {
    expect(getResultMedal({ attemptCount: 1, result: PassOrFail.FAIL })).toBe("❌")
    expect(getResultMedal({ attemptCount: 3, result: PassOrFail.FAIL })).toBe("❌")
  })

  it("returns hourglass for in-progress (today)", () => {
    expect(getResultMedal({ attemptCount: 1, result: undefined, isToday: true })).toBe("⏳")
  })

  it("returns mdash for not-completed (past)", () => {
    expect(getResultMedal({ attemptCount: 1, result: undefined, isToday: false })).toBe("—")
    expect(getResultMedal({ attemptCount: 1, result: undefined })).toBe("—")
  })
})

describe("getResultDescription", () => {
  it("returns ordinal description for correct answers", () => {
    expect(getResultDescription({ attemptCount: 1, result: PassOrFail.PASS })).toBe("Correct on 1st try")
    expect(getResultDescription({ attemptCount: 2, result: PassOrFail.PASS })).toBe("Correct on 2nd try")
    expect(getResultDescription({ attemptCount: 3, result: PassOrFail.PASS })).toBe("Correct on 3rd try")
    expect(getResultDescription({ attemptCount: 4, result: PassOrFail.PASS })).toBe("Correct on 4th try")
  })

  it("returns 'Incorrect' for incorrect answers", () => {
    expect(getResultDescription({ attemptCount: 1, result: PassOrFail.FAIL })).toBe("Incorrect")
    expect(getResultDescription({ attemptCount: 3, result: PassOrFail.FAIL })).toBe("Incorrect")
  })

  it("returns 'In progress' for in-progress (today)", () => {
    expect(getResultDescription({ attemptCount: 1, result: undefined, isToday: true })).toBe("In progress")
  })

  it("returns 'Not completed' for not-completed (past)", () => {
    expect(getResultDescription({ attemptCount: 1, result: undefined, isToday: false })).toBe("Not completed")
    expect(getResultDescription({ attemptCount: 1, result: undefined })).toBe("Not completed")
  })
})
