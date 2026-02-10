import { type Iso8601Date, Iso8601Date as parseIso8601Date } from "./puzzle"

type DateStyle = "full" | "long" | "medium" | "short"

export const formatDate = (
  isoDate: Iso8601Date,
  { locale, dateStyle = "long" }: { locale?: string; dateStyle?: DateStyle } = {},
): string => {
  const date = new Date(isoDate + "T00:00:00")
  return date.toLocaleDateString(locale, { dateStyle })
}

export const formatDuration = (from: Date, to: Date): string => {
  const diff = to.getTime() - from.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
}

export const toIso8601Date = (date: Date): Iso8601Date => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return parseIso8601Date(`${year}-${month}-${day}`)
}

export const toDateFromIso8601Date = (isoDate: Iso8601Date): Date => new Date(`${isoDate}T00:00:00Z`)

export const getNextDay = (date: Iso8601Date): Iso8601Date => {
  const d = new Date(`${date}T00:00:00`)
  d.setDate(d.getDate() + 1)
  return toIso8601Date(d)
}
