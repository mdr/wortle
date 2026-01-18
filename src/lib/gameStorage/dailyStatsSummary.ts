import { Iso8601Date } from "@/utils/brandedTypes"
import { Option } from "@/utils/types/Option"

import { PassOrFail, PuzzleAttempt } from "./HistoryRecord"

export interface DailyStatsSummary {
  readonly played: number
  readonly wins: number
  readonly winRate: number
  readonly currentStreak: number
  readonly maxStreak: number
}

const isoDateToTimestamp = (isoDate: Iso8601Date): number => new Date(`${isoDate}T00:00:00Z`).getTime()

const getIsoDateWithOffset = (isoDate: Iso8601Date, days: number): Iso8601Date => {
  const date = new Date(`${isoDate}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  return Iso8601Date(`${year}-${month}-${day}`)
}

export const calculateDailyStatsSummary = (attempts: PuzzleAttempt[], today: Iso8601Date): DailyStatsSummary => {
  const emptySummary: DailyStatsSummary = {
    played: 0,
    wins: 0,
    winRate: 0,
    currentStreak: 0,
    maxStreak: 0,
  }

  // Exclude today's in-progress attempt from all calculations
  const isInProgressToday = (attempt: PuzzleAttempt): boolean => attempt.date === today && attempt.result === undefined

  const countableAttempts = attempts.filter((attempt) => !isInProgressToday(attempt))

  if (countableAttempts.length === 0) {
    return emptySummary
  }

  const played = countableAttempts.length
  const wins = countableAttempts.filter((attempt) => attempt.result === PassOrFail.PASS).length
  const winRate = wins / played

  const attemptsByDate = new Map<Iso8601Date, PuzzleAttempt>()
  countableAttempts.forEach((attempt) => {
    attemptsByDate.set(attempt.date, attempt)
  })

  const sortedDates = Array.from(attemptsByDate.keys()).sort(
    (left, right) => isoDateToTimestamp(left) - isoDateToTimestamp(right),
  )

  let maxStreak = 0
  let runningStreak = 0
  let previousDate: Option<Iso8601Date>

  sortedDates.forEach((date) => {
    const attempt = attemptsByDate.get(date)
    if (!attempt || attempt.result !== PassOrFail.PASS) {
      runningStreak = 0
      previousDate = date
      return
    }

    const isConsecutive = previousDate !== undefined && getIsoDateWithOffset(previousDate, 1) === date

    runningStreak = isConsecutive ? runningStreak + 1 : 1
    maxStreak = Math.max(maxStreak, runningStreak)
    previousDate = date
  })

  let currentStreak = 0
  const latestDate = sortedDates[sortedDates.length - 1]

  if (latestDate) {
    let cursor: Option<Iso8601Date> = latestDate
    while (cursor) {
      const attempt = attemptsByDate.get(cursor)
      if (!attempt || attempt.result !== PassOrFail.PASS) {
        break
      }
      currentStreak += 1
      const previousDate = getIsoDateWithOffset(cursor, -1)
      cursor = attemptsByDate.has(previousDate) ? previousDate : undefined
    }
  }

  return { played, wins, winRate, currentStreak, maxStreak }
}
