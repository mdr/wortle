import { Option, SpeciesId } from "@wortle/shared"

import { CreateResult, DeleteResult, IPuzzleRepository, PuzzleWithSyncStatus, UpdateResult } from "./PuzzleRepository"
import { DbPuzzle, PuzzleId } from "./puzzleTypes"

export class FakePuzzleRepository implements IPuzzleRepository {
  private puzzles: Map<PuzzleId, DbPuzzle> = new Map()
  private syncStatus: Map<PuzzleId, boolean> = new Map()

  list = (): Promise<DbPuzzle[]> => Promise.resolve([...this.puzzles.values()])

  listWithSyncStatus = (): Promise<PuzzleWithSyncStatus[]> =>
    Promise.resolve(
      [...this.puzzles.entries()].map(([id, puzzle]) => ({
        puzzle,
        imagesSynced: this.syncStatus.get(id) ?? false,
      })),
    )

  findById = (id: PuzzleId): Promise<Option<DbPuzzle>> => Promise.resolve(this.puzzles.get(id))

  countBySpeciesId = (speciesId: SpeciesId): Promise<number> =>
    Promise.resolve([...this.puzzles.values()].filter((p) => p.speciesId === speciesId).length)

  create = (data: DbPuzzle): Promise<CreateResult> => {
    if (this.puzzles.has(data.id)) {
      return Promise.resolve(CreateResult.ALREADY_EXISTS)
    }
    this.puzzles.set(data.id, data)
    this.syncStatus.set(data.id, false)
    return Promise.resolve(CreateResult.CREATED)
  }

  update = (data: DbPuzzle): Promise<UpdateResult> => {
    if (!this.puzzles.has(data.id)) {
      return Promise.resolve(UpdateResult.NOT_FOUND)
    }
    this.puzzles.set(data.id, data)
    this.syncStatus.set(data.id, false)
    return Promise.resolve(UpdateResult.UPDATED)
  }

  delete = (id: PuzzleId): Promise<DeleteResult> => {
    if (!this.puzzles.has(id)) {
      return Promise.resolve(DeleteResult.NOT_FOUND)
    }
    this.puzzles.delete(id)
    this.syncStatus.delete(id)
    return Promise.resolve(DeleteResult.DELETED)
  }

  markImagesSynced = (ids: PuzzleId[]): Promise<void> => {
    for (const id of ids) {
      if (this.puzzles.has(id)) {
        this.syncStatus.set(id, true)
      }
    }
    return Promise.resolve()
  }
}
