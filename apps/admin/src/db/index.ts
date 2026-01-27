import { Pool } from "@neondatabase/serverless"
import { drizzle, type NeonDatabase } from "drizzle-orm/neon-serverless"

import * as schema from "./schema"

let _db: NeonDatabase<typeof schema> | undefined

export const getDb = () => {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set")
    }
    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    _db = drizzle(pool, { schema })
  }
  return _db
}
