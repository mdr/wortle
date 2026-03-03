import { Iso8601Date, PuzzleId } from "@wortle/shared"
import { boolean, integer, jsonb, pgTable, text } from "drizzle-orm/pg-core"

import type { DbPuzzle } from "./puzzleTypes"
import type { DbTaxon, TaxonId } from "./types"

export const taxa = pgTable("species", {
  id: text("id").$type<TaxonId>().primaryKey(),
  data: jsonb("data").$type<DbTaxon>().notNull(),
})

export const puzzles = pgTable("puzzles", {
  id: integer("id").$type<PuzzleId>().primaryKey(),
  data: jsonb("data").$type<DbPuzzle>().notNull(),
  imagesSynced: boolean("images_synced").notNull().default(false),
})

export const scheduleEntries = pgTable("schedule_entries", {
  date: text("date").$type<Iso8601Date>().primaryKey(),
  puzzleId: integer("puzzle_id").$type<PuzzleId>().notNull(),
})
