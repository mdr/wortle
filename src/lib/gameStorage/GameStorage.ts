import { z } from "zod"

import { logger } from "@/utils/Logger"

import { DailyPuzzleRecord, GameState, gameStateSchema } from "./GameState"

const STORAGE_KEY = "wortle:temp:4:stats"

const upsertRecord = (history: DailyPuzzleRecord[], record: DailyPuzzleRecord): DailyPuzzleRecord[] =>
  [...history.filter((r) => r.date !== record.date), record].sort((a, b) => a.date.localeCompare(b.date))

const defaultState: GameState = {
  history: [],
}

export class GameStorage {
  private readonly storage: Storage

  constructor(storage: Storage) {
    this.storage = storage
  }

  load = (): GameState => {
    const raw = this.storage.getItem(STORAGE_KEY)
    if (!raw) {
      return defaultState
    }

    try {
      const parsed: unknown = JSON.parse(raw)
      const result = gameStateSchema.safeParse(parsed)
      if (!result.success) {
        logger.error("stats.parseSchema", "Failed to parse game state from storage", {
          zodError: z.treeifyError(result.error),
        })
        return defaultState
      }
      return result.data
    } catch (error) {
      logger.error("stats.parseJson", "Failed to parse game state from storage", undefined, error)
      return defaultState
    }
  }

  private readonly save = (state: GameState): void => {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(state))
  }

  private readonly update = (updater: (current: GameState) => GameState): GameState => {
    const next = updater(this.load())
    this.save(next)
    return next
  }

  saveRecord = (record: DailyPuzzleRecord): GameState =>
    this.update((current) => ({
      history: upsertRecord(current.history, record),
    }))

  clear = (): void => {
    this.storage.removeItem(STORAGE_KEY)
  }
}
