import { Pool } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless"

import { env } from "@/env"

import { PuzzleRepository } from "./PuzzleRepository"
import { ScheduleRepository } from "./ScheduleRepository"
import * as schema from "./schema"
import { SpeciesRepository } from "./SpeciesRepository"

const pool = new Pool({ connectionString: env.DATABASE_URL })

export const db = drizzle(pool, { schema })

export const speciesRepository = new SpeciesRepository(db)
export const puzzleRepository = new PuzzleRepository(db)
export const scheduleRepository = new ScheduleRepository(db)
