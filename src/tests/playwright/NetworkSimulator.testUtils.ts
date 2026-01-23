import type { Page } from "@playwright/test"

import type { Puzzle } from "@/lib/Puzzle"
import { PuzzleId } from "@/lib/Puzzle"
import { defaultPuzzles } from "@/lib/puzzles"
import type { ScheduleEntry } from "@/lib/schedule"
import { Iso8601Date } from "@/utils/brandedTypes"

export const DEFAULT_SCHEDULE_ENTRIES: ScheduleEntry[] = [
  { date: Iso8601Date("2026-06-08"), puzzleId: PuzzleId(43) },
  { date: Iso8601Date("2026-06-09"), puzzleId: PuzzleId(41) },
  { date: Iso8601Date("2026-06-10"), puzzleId: PuzzleId(42) },
  { date: Iso8601Date("2026-06-11"), puzzleId: PuzzleId(40) },
  { date: Iso8601Date("2026-06-12"), puzzleId: PuzzleId(44) },
]

export const DEFAULT_PUZZLE_ENTRIES: Puzzle[] = defaultPuzzles
  .getAllPuzzleIds()
  .map((id) => defaultPuzzles.getPuzzle(id))

type ResponseMode = "default" | "error" | "stall"

export class NetworkSimulator {
  private scheduleResponse: ResponseMode = "default"
  private customScheduleEntries?: ScheduleEntry[]
  private pendingScheduleResolve?: (entries: ScheduleEntry[]) => void

  private puzzlesResponse: ResponseMode = "default"
  private customPuzzleEntries?: Puzzle[]
  private pendingPuzzlesResolve?: (entries: Puzzle[]) => void

  constructor(private readonly page: Page) {}

  simulateFetchScheduleSuccess = () => {
    this.scheduleResponse = "default"
    this.customScheduleEntries = undefined
  }

  setSchedule = (entries: ScheduleEntry[]) => {
    this.scheduleResponse = "default"
    this.customScheduleEntries = entries
  }

  simulateFetchScheduleError = () => {
    this.scheduleResponse = "error"
  }

  simulateFetchScheduleStall = () => {
    this.scheduleResponse = "stall"
    return {
      resolve: (entries: ScheduleEntry[] = DEFAULT_SCHEDULE_ENTRIES) => {
        this.pendingScheduleResolve?.(entries)
      },
    }
  }

  simulateFetchPuzzlesSuccess = () => {
    this.puzzlesResponse = "default"
    this.customPuzzleEntries = undefined
  }

  setPuzzles = (entries: Puzzle[]) => {
    this.puzzlesResponse = "default"
    this.customPuzzleEntries = entries
  }

  simulateFetchPuzzlesError = () => {
    this.puzzlesResponse = "error"
  }

  simulateFetchPuzzlesStall = () => {
    this.puzzlesResponse = "stall"
    return {
      resolve: (entries: Puzzle[] = DEFAULT_PUZZLE_ENTRIES) => {
        this.pendingPuzzlesResolve?.(entries)
      },
    }
  }

  simulateFetchAllError = () => {
    this.simulateFetchScheduleError()
    this.simulateFetchPuzzlesError()
  }

  simulateFetchAllSuccess = () => {
    this.simulateFetchScheduleSuccess()
    this.simulateFetchPuzzlesSuccess()
  }

  install = async () => {
    await this.page.route("**/data.wortle.app/schedule.json", async (route) => {
      if (this.scheduleResponse === "error") {
        await route.fulfill({ status: 500 })
      } else if (this.scheduleResponse === "stall") {
        const entries = await new Promise<ScheduleEntry[]>((resolve) => {
          this.pendingScheduleResolve = resolve
        })
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ schedule: entries }),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ schedule: this.customScheduleEntries ?? DEFAULT_SCHEDULE_ENTRIES }),
        })
      }
    })

    await this.page.route("**/data.wortle.app/puzzles.json", async (route) => {
      if (this.puzzlesResponse === "error") {
        await route.fulfill({ status: 500 })
      } else if (this.puzzlesResponse === "stall") {
        const entries = await new Promise<Puzzle[]>((resolve) => {
          this.pendingPuzzlesResolve = resolve
        })
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ puzzles: entries }),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ puzzles: this.customPuzzleEntries ?? DEFAULT_PUZZLE_ENTRIES }),
        })
      }
    })
  }
}
