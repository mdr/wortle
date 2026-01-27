import { jsonb, pgTable, text } from "drizzle-orm/pg-core"

import type { DbSpecies, SpeciesId } from "./types"

export const species = pgTable("species", {
  id: text("id").$type<SpeciesId>().primaryKey(),
  data: jsonb("data").$type<DbSpecies>().notNull(),
})
