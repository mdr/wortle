import type { Page } from "@playwright/test"

import type { Puzzle, PuzzlesJson } from "@/lib/Puzzle"
import { PuzzleId } from "@/lib/Puzzle"
import { defaultPuzzles } from "@/lib/puzzles"
import type { ScheduleEntry, ScheduleJson } from "@/lib/schedule"
import { Iso8601Date } from "@/utils/brandedTypes"

import {
  EndpointBehaviour,
  EndpointBehaviourManager,
  EndpointKey,
  handleEndpointBehaviour,
  StallResponse,
} from "./EndpointBehaviour.testUtils"

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

interface EndpointConfig<T> {
  routePattern: string
  endpointKey: EndpointKey
  handle: () => T
}

export class NetworkSimulator {
  private readonly behaviourManager = new EndpointBehaviourManager()
  private scheduleEntries: ScheduleEntry[] = DEFAULT_SCHEDULE_ENTRIES
  private puzzles: Puzzle[] = DEFAULT_PUZZLE_ENTRIES

  constructor(private readonly page: Page) {}

  simulateFetchScheduleSuccess = () => {
    this.behaviourManager.setBehaviour(EndpointKey.SCHEDULE, EndpointBehaviour.DEFAULT)
    this.scheduleEntries = DEFAULT_SCHEDULE_ENTRIES
  }

  setSchedule = (entries: ScheduleEntry[]) => {
    this.behaviourManager.setBehaviour(EndpointKey.SCHEDULE, EndpointBehaviour.DEFAULT)
    this.scheduleEntries = entries
  }

  simulateFetchScheduleError = () => {
    this.behaviourManager.setBehaviour(EndpointKey.SCHEDULE, EndpointBehaviour.ERROR)
  }

  simulateFetchScheduleStall = () =>
    this.behaviourManager.stall(EndpointKey.SCHEDULE, { schedule: this.scheduleEntries })

  simulateFetchPuzzlesSuccess = () => {
    this.behaviourManager.setBehaviour(EndpointKey.PUZZLES, EndpointBehaviour.DEFAULT)
    this.puzzles = DEFAULT_PUZZLE_ENTRIES
  }

  setPuzzles = (puzzles: Puzzle[]) => {
    this.behaviourManager.setBehaviour(EndpointKey.PUZZLES, EndpointBehaviour.DEFAULT)
    this.puzzles = puzzles
  }

  simulateFetchPuzzlesError = () => {
    this.behaviourManager.setBehaviour(EndpointKey.PUZZLES, EndpointBehaviour.ERROR)
  }

  simulateFetchPuzzlesStall = () => this.behaviourManager.stall(EndpointKey.PUZZLES, { puzzles: this.puzzles })

  simulateFetchAllError = () => {
    this.simulateFetchScheduleError()
    this.simulateFetchPuzzlesError()
  }

  simulateFetchAllSuccess = () => {
    this.simulateFetchScheduleSuccess()
    this.simulateFetchPuzzlesSuccess()
  }

  install = async () => {
    await this.installRoute<ScheduleJson>({
      routePattern: "**/data.wortle.app/schedule.json",
      endpointKey: EndpointKey.SCHEDULE,
      handle: () => ({ schedule: this.scheduleEntries }),
    })

    await this.installRoute<PuzzlesJson>({
      routePattern: "**/data.wortle.app/puzzles.json",
      endpointKey: EndpointKey.PUZZLES,
      handle: () => ({ puzzles: this.puzzles }),
    })
  }

  private installRoute = <T>(config: EndpointConfig<T>) =>
    this.page.route(config.routePattern, async (route) => {
      try {
        const json = handleEndpointBehaviour(this.behaviourManager.getBehaviour(config.endpointKey), config.handle)
        await route.fulfill({ json })
      } catch (error) {
        if (error instanceof StallResponse) {
          const json = await this.behaviourManager.waitForResolve<T>(config.endpointKey)
          await route.fulfill({ json })
        } else {
          await route.fulfill({ status: 500 })
        }
      }
    })
}
