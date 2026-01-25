import { getOrdinal } from "@/utils/getOrdinal"

import { PassOrFail } from "./gameStorage/HistoryRecord"

interface ResultArgs {
  attemptCount: number
  result?: PassOrFail
  isToday?: boolean
}

export const getResultMedal = ({ attemptCount, result, isToday }: ResultArgs): string => {
  if (result === undefined) {
    return isToday ? "⏳" : "—"
  }
  if (result !== PassOrFail.PASS) return "❌"
  if (attemptCount === 1) return "🥇"
  if (attemptCount === 2) return "🥈"
  return "🥉"
}

export const getResultDescription = ({ attemptCount, result, isToday }: ResultArgs): string => {
  if (result === undefined) {
    return isToday ? "In progress" : "Not completed"
  }
  if (result !== PassOrFail.PASS) return "Incorrect"
  return `Correct on ${getOrdinal(attemptCount)} try`
}
