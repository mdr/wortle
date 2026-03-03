import type { Page } from "@playwright/test"
import {
  Iso8601Date,
  type Puzzle,
  PuzzleId,
  type PuzzlesData,
  SPECIES_DATA_KEY,
  type SpeciesData,
  type Taxon,
} from "@wortle/shared"

import { DEFAULT_DATA_URL } from "@/lib/data/DataApi"
import { defaultPuzzles } from "@/lib/puzzles"
import type { ScheduleData, ScheduleEntry } from "@/lib/schedule"
import { testTaxa } from "@/lib/taxa/testTaxa.testUtils"

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

export const DEFAULT_PUZZLES: Puzzle[] = defaultPuzzles.getAllPuzzleIds().map((id) => defaultPuzzles.getPuzzle(id))

export const DEFAULT_SPECIES: Taxon[] = testTaxa

interface EndpointConfig<T> {
  routePattern: string
  endpointKey: EndpointKey
  handle: () => T
}

export class NetworkSimulator {
  private readonly behaviourManager = new EndpointBehaviourManager()
  private scheduleEntries: ScheduleEntry[] = DEFAULT_SCHEDULE_ENTRIES
  private puzzles: Puzzle[] = DEFAULT_PUZZLES
  private species: Taxon[] = DEFAULT_SPECIES

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
    this.puzzles = DEFAULT_PUZZLES
  }

  setPuzzles = (puzzles: Puzzle[]) => {
    this.behaviourManager.setBehaviour(EndpointKey.PUZZLES, EndpointBehaviour.DEFAULT)
    this.puzzles = puzzles
  }

  simulateFetchPuzzlesError = () => {
    this.behaviourManager.setBehaviour(EndpointKey.PUZZLES, EndpointBehaviour.ERROR)
  }

  simulateFetchPuzzlesStall = () => this.behaviourManager.stall(EndpointKey.PUZZLES, { puzzles: this.puzzles })

  simulateFetchSpeciesSuccess = () => {
    this.behaviourManager.setBehaviour(EndpointKey.SPECIES, EndpointBehaviour.DEFAULT)
    this.species = DEFAULT_SPECIES
  }

  setSpecies = (species: Taxon[]) => {
    this.behaviourManager.setBehaviour(EndpointKey.SPECIES, EndpointBehaviour.DEFAULT)
    this.species = species
  }

  simulateFetchSpeciesError = () => {
    this.behaviourManager.setBehaviour(EndpointKey.SPECIES, EndpointBehaviour.ERROR)
  }

  simulateFetchSpeciesStall = () => this.behaviourManager.stall(EndpointKey.SPECIES, { species: this.species })

  simulateFetchAllError = () => {
    this.simulateFetchScheduleError()
    this.simulateFetchPuzzlesError()
    this.simulateFetchSpeciesError()
  }

  simulateFetchAllSuccess = () => {
    this.simulateFetchScheduleSuccess()
    this.simulateFetchPuzzlesSuccess()
    this.simulateFetchSpeciesSuccess()
  }

  install = async () => {
    await this.installRoute<ScheduleData>({
      routePattern: `${DEFAULT_DATA_URL}/schedule.json`,
      endpointKey: EndpointKey.SCHEDULE,
      handle: () => ({ schedule: this.scheduleEntries }),
    })

    await this.installRoute<PuzzlesData>({
      routePattern: `${DEFAULT_DATA_URL}/puzzles.json`,
      endpointKey: EndpointKey.PUZZLES,
      handle: () => ({ puzzles: this.puzzles }),
    })

    await this.installRoute<SpeciesData>({
      routePattern: `${DEFAULT_DATA_URL}/${SPECIES_DATA_KEY}`,
      endpointKey: EndpointKey.SPECIES,
      handle: () => ({ species: this.species }),
    })
  }

  private readonly installRoute = <T>(config: EndpointConfig<T>) =>
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
