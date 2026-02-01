import { integer, jsonb, pgTable, text } from "drizzle-orm/pg-core"

import type { DbPuzzle, PuzzleId } from "./puzzleTypes"
import type { DbSpecies, SpeciesId } from "./types"

export const species = pgTable("species", {
  id: text("id").$type<SpeciesId>().primaryKey(),
  data: jsonb("data").$type<DbSpecies>().notNull(),
})

export const puzzles = pgTable("puzzles", {
  id: integer("id").$type<PuzzleId>().primaryKey(),
  data: jsonb("data").$type<DbPuzzle>().notNull(),
})
