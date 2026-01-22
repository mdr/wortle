import type { Page } from "@playwright/test"

export interface ScheduleEntry {
  date: string
  puzzleId: number
}

export const DEFAULT_SCHEDULE_ENTRIES: ScheduleEntry[] = [
  { date: "2026-06-08", puzzleId: 43 },
  { date: "2026-06-09", puzzleId: 41 },
  { date: "2026-06-10", puzzleId: 42 },
  { date: "2026-06-11", puzzleId: 40 },
  { date: "2026-06-12", puzzleId: 44 },
]

export class NetworkSimulator {
  private scheduleResponse: "default" | "error" | "stall" = "default"
  private customEntries?: ScheduleEntry[]
  private pendingResolve?: (entries: ScheduleEntry[]) => void

  constructor(private readonly page: Page) {}

  simulateFetchScheduleSuccess = () => {
    this.scheduleResponse = "default"
    this.customEntries = undefined
  }

  setSchedule = (entries: ScheduleEntry[]) => {
    this.scheduleResponse = "default"
    this.customEntries = entries
  }

  simulateFetchScheduleError = () => {
    this.scheduleResponse = "error"
  }

  simulateFetchScheduleStall = () => {
    this.scheduleResponse = "stall"
    return {
      resolve: (entries: ScheduleEntry[] = DEFAULT_SCHEDULE_ENTRIES) => {
        this.pendingResolve?.(entries)
      },
    }
  }

  install = async () => {
    await this.page.route("**/data.wortle.app/schedule.json", async (route) => {
      if (this.scheduleResponse === "error") {
        await route.fulfill({ status: 500 })
      } else if (this.scheduleResponse === "stall") {
        const entries = await new Promise<ScheduleEntry[]>((resolve) => {
          this.pendingResolve = resolve
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
          body: JSON.stringify({ schedule: this.customEntries ?? DEFAULT_SCHEDULE_ENTRIES }),
        })
      }
    })
  }
}
