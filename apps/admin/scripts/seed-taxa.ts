import { speciesDataJsonSchema, SPECIES_DATA_KEY } from "@wortle/shared"
import { Pool } from "@neondatabase/serverless"
import { sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/neon-serverless"
import { readFile } from "fs/promises"

import * as schema from "../src/db/schema"

const DATA_URL = `https://data.wortle.app/${SPECIES_DATA_KEY}`

const main = async () => {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error("DATABASE_URL environment variable is required")
    process.exit(1)
  }

  const localFile = process.argv[2]

  console.log(localFile ? `Reading from local file: ${localFile}` : `Fetching from ${DATA_URL}`)

  const json: unknown = localFile
    ? JSON.parse(await readFile(localFile, "utf-8"))
    : await fetch(DATA_URL).then((r) => r.json())

  const parsed = speciesDataJsonSchema.safeParse(json)
  if (!parsed.success) {
    console.error("Invalid species data:", parsed.error.message)
    process.exit(1)
  }

  const { species } = parsed.data
  console.log(`Found ${species.length} taxa to import`)

  const pool = new Pool({ connectionString: databaseUrl })
  const db = drizzle(pool, { schema })

  console.log("Inserting taxa into database...")

  const values = species.map((s) => ({
    id: s.id,
    data: s,
  }))

  await db
    .insert(schema.taxa)
    .values(values)
    .onConflictDoUpdate({
      target: schema.taxa.id,
      set: {
        data: sql`excluded.data`,
      },
    })

  console.log(`Successfully imported ${species.length} taxa`)

  await pool.end()
}

main().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
