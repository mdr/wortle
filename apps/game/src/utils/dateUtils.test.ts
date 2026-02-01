import { Iso8601Date } from "@wortle/shared"
import { describe, expect, it } from "vitest"

import { formatDate, formatDuration, getNextDay, toDateFromIso8601Date, toIso8601Date } from "./dateUtils"

describe("formatDate", () => {
  it("formats with long style by default", () => {
    expect(formatDate(Iso8601Date("2025-12-21"), { locale: "en-GB" })).toBe("21 December 2025")
  })

  it("handles single digit day", () => {
    expect(formatDate(Iso8601Date("2025-01-05"), { locale: "en-GB" })).toBe("5 January 2025")
  })

  it("formats with medium style", () => {
    expect(formatDate(Iso8601Date("2025-12-21"), { locale: "en-GB", dateStyle: "medium" })).toBe("21 Dec 2025")
  })

  it("formats with short style", () => {
    expect(formatDate(Iso8601Date("2025-12-21"), { locale: "en-GB", dateStyle: "short" })).toBe("21/12/2025")
  })
})

describe("formatDuration", () => {
  it("formats hours and minutes", () => {
    const from = new Date("2025-01-01T10:00:00")
    const to = new Date("2025-01-01T15:30:00")
    expect(formatDuration(from, to)).toBe("5h 30m")
  })

  it("handles zero minutes", () => {
    const from = new Date("2025-01-01T10:00:00")
    const to = new Date("2025-01-01T12:00:00")
    expect(formatDuration(from, to)).toBe("2h 0m")
  })

  it("handles zero hours", () => {
    const from = new Date("2025-01-01T10:00:00")
    const to = new Date("2025-01-01T10:45:00")
    expect(formatDuration(from, to)).toBe("0h 45m")
  })

  it("handles durations over 24 hours", () => {
    const from = new Date("2025-01-01T10:00:00")
    const to = new Date("2025-01-02T14:30:00")
    expect(formatDuration(from, to)).toBe("28h 30m")
  })

  it("handles same time", () => {
    const time = new Date("2025-01-01T10:00:00")
    expect(formatDuration(time, time)).toBe("0h 0m")
  })
})

describe("toIso8601Date", () => {
  it("formats a Date into ISO date string", () => {
    const date = new Date("2025-06-08T15:45:30")
    expect(toIso8601Date(date)).toBe("2025-06-08")
  })

  it("pads single digit months and days", () => {
    const date = new Date("2025-01-05T00:00:00")
    expect(toIso8601Date(date)).toBe("2025-01-05")
  })
})

describe("toDateFromIso8601Date", () => {
  it("parses ISO date into a Date at UTC midnight", () => {
    const date = toDateFromIso8601Date(Iso8601Date("2025-06-08"))
    expect(date.toISOString()).toBe("2025-06-08T00:00:00.000Z")
  })
})

describe("getNextDay", () => {
  it("returns the next day", () => {
    expect(getNextDay(Iso8601Date("2025-06-08"))).toBe("2025-06-09")
  })

  it("handles month boundaries", () => {
    expect(getNextDay(Iso8601Date("2025-01-31"))).toBe("2025-02-01")
  })

  it("handles year boundaries", () => {
    expect(getNextDay(Iso8601Date("2025-12-31"))).toBe("2026-01-01")
  })
})
