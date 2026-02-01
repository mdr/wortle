import { Option } from "@wortle/shared"

import { CreateResult, DeleteResult, IPuzzleRepository, UpdateResult } from "./PuzzleRepository"
import { DbPuzzle, PuzzleId } from "./puzzleTypes"

export class FakePuzzleRepository implements IPuzzleRepository {
  private puzzles: Map<PuzzleId, DbPuzzle> = new Map()

  list = (): Promise<DbPuzzle[]> => Promise.resolve([...this.puzzles.values()])

  findById = (id: PuzzleId): Promise<Option<DbPuzzle>> => Promise.resolve(this.puzzles.get(id))

  create = (data: DbPuzzle): Promise<CreateResult> => {
    if (this.puzzles.has(data.id)) {
      return Promise.resolve(CreateResult.ALREADY_EXISTS)
    }
    this.puzzles.set(data.id, data)
    return Promise.resolve(CreateResult.CREATED)
  }

  update = (data: DbPuzzle): Promise<UpdateResult> => {
    if (!this.puzzles.has(data.id)) {
      return Promise.resolve(UpdateResult.NOT_FOUND)
    }
    this.puzzles.set(data.id, data)
    return Promise.resolve(UpdateResult.UPDATED)
  }

  delete = (id: PuzzleId): Promise<DeleteResult> => {
    if (!this.puzzles.has(id)) {
      return Promise.resolve(DeleteResult.NOT_FOUND)
    }
    this.puzzles.delete(id)
    return Promise.resolve(DeleteResult.DELETED)
  }
}
