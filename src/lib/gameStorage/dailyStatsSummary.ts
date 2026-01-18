import { Iso8601Date } from "@/utils/brandedTypes"
import { Option } from "@/utils/types/Option"

import { DailyPuzzleRecord, DailyResult } from "./GameState"

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

export const calculateDailyStatsSummary = (history: DailyPuzzleRecord[]): DailyStatsSummary => {
  const emptySummary: DailyStatsSummary = {
    played: 0,
    wins: 0,
    winRate: 0,
    currentStreak: 0,
    maxStreak: 0,
  }

  if (history.length === 0) {
    return emptySummary
  }

  const played = history.length
  const wins = history.filter((record) => record.result === DailyResult.PASS).length
  const winRate = played === 0 ? 0 : wins / played

  const recordsByDate = new Map<Iso8601Date, DailyPuzzleRecord>()
  history.forEach((record) => {
    recordsByDate.set(record.date, record)
  })

  const sortedDates = Array.from(recordsByDate.keys()).sort(
    (left, right) => isoDateToTimestamp(left) - isoDateToTimestamp(right),
  )

  let maxStreak = 0
  let runningStreak = 0
  let previousDate: Option<Iso8601Date>

  sortedDates.forEach((date) => {
    const record = recordsByDate.get(date)
    if (!record || record.result !== DailyResult.PASS) {
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
      const record = recordsByDate.get(cursor)
      if (!record || record.result !== DailyResult.PASS) {
        break
      }
      currentStreak += 1
      const previousDate = getIsoDateWithOffset(cursor, -1)
      cursor = recordsByDate.has(previousDate) ? previousDate : undefined
    }
  }

  return { played, wins, winRate, currentStreak, maxStreak }
}
