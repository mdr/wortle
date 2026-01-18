import { z } from "zod"

import { logger } from "@/utils/Logger"

import { HistoryRecord, historyRecordSchema, PuzzleAttempt } from "./HistoryRecord"

const STORAGE_KEY = "wortle:temp:5:history"

const upsertAttempt = (attempts: PuzzleAttempt[], attempt: PuzzleAttempt): PuzzleAttempt[] =>
  [...attempts.filter((a) => a.date !== attempt.date), attempt].sort((a, b) => a.date.localeCompare(b.date))

const defaultHistory: HistoryRecord = {
  attempts: [],
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

    try {
      const parsed: unknown = JSON.parse(raw)
      const result = historyRecordSchema.safeParse(parsed)
      if (!result.success) {
        logger.error("history.parseSchema", "Failed to parse history from storage", {
          zodError: z.treeifyError(result.error),
        })
        return defaultHistory
      }
      return result.data
    } catch (error) {
      logger.error("history.parseJson", "Failed to parse history from storage", undefined, error)
      return defaultHistory
    }
  }

  private readonly save = (history: HistoryRecord): void => {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(history))
  }

  private readonly update = (updater: (current: HistoryRecord) => HistoryRecord): HistoryRecord => {
    const next = updater(this.load())
    this.save(next)
    return next
  }

  saveAttempt = (attempt: PuzzleAttempt): HistoryRecord =>
    this.update((current) => ({
      attempts: upsertAttempt(current.attempts, attempt),
    }))
}
