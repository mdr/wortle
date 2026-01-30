import { PGlite } from "@electric-sql/pglite"
import { drizzle } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"
import path from "path"
import { fileURLToPath } from "url"

import * as schema from "./schema"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const migrationsFolder = path.resolve(__dirname, "../../drizzle")

export const createTestDb = async () => {
  const client = new PGlite()
  const db = drizzle(client, { schema })

  await migrate(db, { migrationsFolder })

  return { db, client }
}
