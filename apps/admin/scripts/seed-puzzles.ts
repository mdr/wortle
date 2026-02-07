import {
  BucketName,
  CloudflareAccountId,
  CloudflareApiToken,
  ImageKey,
  MediaType,
  ObjectKey,
  PUZZLES_DATA_KEY,
  puzzlesDataJsonSchema,
} from "@wortle/shared"
import { Pool } from "@neondatabase/serverless"
import { sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/neon-serverless"
import { readFile } from "fs/promises"

import * as schema from "../src/db/schema"
import type { DbPuzzle, DbPuzzleImage } from "../src/db/puzzleTypes"
import { IMAGE_MEDIA_TYPES, imageMediaTypeExtension } from "../src/utils/imageMediaType"
import { R2BucketStorage } from "../src/utils/R2BucketStorage"

const DATA_URL = `https://data.wortle.app/${PUZZLES_DATA_KEY}`

const MEDIA_TYPE_BY_EXTENSION = new Map(
  IMAGE_MEDIA_TYPES.map((mediaType) => [imageMediaTypeExtension(mediaType), mediaType]),
)

const requireEnv = (name: string): string => {
  const value = process.env[name]
  if (!value) {
    console.error(`${name} environment variable is required`)
    process.exit(1)
  }
  return value
}

const main = async () => {
  const databaseUrl = requireEnv("DATABASE_URL")
  const accountId = CloudflareAccountId(requireEnv("CLOUDFLARE_ACCOUNT_ID"))
  const apiToken = CloudflareApiToken(requireEnv("CLOUDFLARE_API_TOKEN"))
  const originalsBucketName = BucketName(requireEnv("ORIGINALS_BUCKET_NAME"))

  const localFile = process.argv[2]

  console.log(localFile ? `Reading from local file: ${localFile}` : `Fetching from ${DATA_URL}`)

  const json: unknown = localFile
    ? JSON.parse(await readFile(localFile, "utf-8"))
    : await fetch(DATA_URL).then((r) => r.json())

  const parsed = puzzlesDataJsonSchema.safeParse(json)
  if (!parsed.success) {
    console.error("Invalid puzzles data:", parsed.error.message)
    process.exit(1)
  }

  const { puzzles } = parsed.data
  console.log(`Found ${puzzles.length} puzzles to import`)

  const storage = new R2BucketStorage({ accountId, apiToken })

  console.log("Verifying originals exist in R2...")

  const dbPuzzles: DbPuzzle[] = []

  for (const puzzle of puzzles) {
    const objects = await storage.listObjects(originalsBucketName, `${puzzle.id}/`)
    const objectKeys = new Set(objects.map((o) => o.key))

    const dbImages: DbPuzzleImage[] = []

    for (const image of puzzle.images) {
      let foundMediaType: MediaType | undefined
      for (const [ext, mediaType] of MEDIA_TYPE_BY_EXTENSION) {
        const candidateKey = ObjectKey(`${puzzle.id}/${image.imageKey}${ext}`)
        if (objectKeys.has(candidateKey)) {
          foundMediaType = mediaType
          break
        }
      }

      if (!foundMediaType) {
        console.error(
          `Missing original for puzzle ${puzzle.id}, image ${image.imageKey}. ` +
            `Expected one of: ${[...MEDIA_TYPE_BY_EXTENSION.keys()].map((ext) => `${puzzle.id}/${image.imageKey}${ext}`).join(", ")}`,
        )
        process.exit(1)
      }

      dbImages.push({
        imageKey: ImageKey(image.imageKey),
        caption: image.caption,
        mediaType: foundMediaType,
      })
    }

    dbPuzzles.push({
      ...puzzle,
      images: dbImages,
    })
  }

  console.log("All originals verified")

  const pool = new Pool({ connectionString: databaseUrl })
  const db = drizzle(pool, { schema })

  console.log("Inserting puzzles into database...")

  const values = dbPuzzles.map((p) => ({
    id: p.id,
    data: p,
    imagesSynced: false,
  }))

  await db
    .insert(schema.puzzles)
    .values(values)
    .onConflictDoUpdate({
      target: schema.puzzles.id,
      set: {
        data: sql`excluded.data`,
        imagesSynced: false,
      },
    })

  console.log(`Successfully imported ${puzzles.length} puzzles`)

  await pool.end()
}

main().catch((err: unknown) => {
  console.error(err)
  process.exit(1)
})
