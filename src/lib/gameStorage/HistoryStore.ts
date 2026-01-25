import { z } from "zod"

import { logger } from "@/utils/Logger"

import { HistoryRecord, historyRecordSchema, PuzzleHistoryEntry } from "./HistoryRecord"

const STORAGE_KEY = "wortle:temp:6:history"

const upsertEntry = (entries: PuzzleHistoryEntry[], entry: PuzzleHistoryEntry): PuzzleHistoryEntry[] =>
  [...entries.filter((e) => e.date !== entry.date), entry].sort((a, b) => a.date.localeCompare(b.date))

const defaultHistory: HistoryRecord = {
  entries: [],
}

export class HistoryStore {
  private readonly storage: Storage

  constructor(storage: Storage) {
    this.storage = storage
  }

  load = (): HistoryRecord => {
    const raw = this.storage.getItem(STORAGE_KEY)
    if (!raw) {
      return defaultHistory
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch (error) {
      logger.error("history.parseJson", "Failed to parse history from storage", undefined, error)
      return defaultHistory
    }

    const result = historyRecordSchema.safeParse(parsed)
    if (!result.success) {
      logger.error("history.parseSchema", "Failed to parse history from storage", {
        zodError: z.treeifyError(result.error),
      })
      return defaultHistory
    }
    return result.data
  }

  private readonly save = (history: HistoryRecord): void => {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(history))
  }

  private readonly update = (updater: (current: HistoryRecord) => HistoryRecord): HistoryRecord => {
    const next = updater(this.load())
    this.save(next)
    return next
  }

  saveEntry = (entry: PuzzleHistoryEntry): HistoryRecord =>
    this.update((current) => ({
      entries: upsertEntry(current.entries, entry),
    }))

  clear = (): void => {
    this.save(defaultHistory)
  }
}
