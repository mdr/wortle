import { Iso8601Date } from "@/utils/brandedTypes"
import { toDateFromIso8601Date, toIso8601Date } from "@/utils/dateUtils"

export interface Clock {
  readonly now: () => Date
  readonly todayIso: () => Iso8601Date
  readonly setDate?: (date: Iso8601Date) => void
}

export class RealClock implements Clock {
  now = (): Date => new Date()
  todayIso = (): Iso8601Date => toIso8601Date(this.now())
}

export class FixedClock implements Clock {
  private fixedDate: Date

  constructor(fixedDate: Date) {
    this.fixedDate = fixedDate
  }

  now = (): Date => new Date(this.fixedDate.getTime())
  todayIso = (): Iso8601Date => toIso8601Date(this.fixedDate)
  setDate = (date: Iso8601Date): void => {
    this.fixedDate = toDateFromIso8601Date(date)
  }
}

export const defaultClock: Clock = new FixedClock(toDateFromIso8601Date(Iso8601Date("2026-06-08")))
