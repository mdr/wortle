import { speciesIdSchema, speciesJsonSchema } from "@wortle/shared"
import { TRPCError } from "@trpc/server"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { apiSpeciesSchema } from "@/api/types"
import { db } from "@/db"
import { species } from "@/db/schema"
import { toSpeciesData } from "@/db/toSpecies"
import { uploadToR2 } from "@/utils/r2"

import { protectedProcedure, router } from "./init"

const speciesRouter = router({
  list: protectedProcedure.query(async () => {
    const rows = await db.select().from(species)
    return rows.map((row) => row.data)
  }),

  get: protectedProcedure.input(z.object({ id: speciesIdSchema })).query(async ({ input }) => {
    const rows = await db.select().from(species).where(eq(species.id, input.id))
    if (rows.length === 0) {
      throw new TRPCError({ code: "NOT_FOUND" })
    }
    return rows[0].data
  }),

  create: protectedProcedure.input(apiSpeciesSchema).mutation(async ({ input }) => {
    return await db.transaction(async (tx) => {
      const existing = await tx.select().from(species).where(eq(species.id, input.id))
      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `Species with ID "${input.id}" already exists`,
        })
      }
      await tx.insert(species).values({ id: input.id, data: input })
      return input
    })
  }),

  update: protectedProcedure.input(apiSpeciesSchema).mutation(async ({ input }) => {
    const result = await db.update(species).set({ data: input }).where(eq(species.id, input.id)).returning()
    if (result.length === 0) {
      throw new TRPCError({ code: "NOT_FOUND" })
    }
    return result[0].data
  }),

  delete: protectedProcedure.input(z.object({ id: speciesIdSchema })).mutation(async ({ input }) => {
    const result = await db.delete(species).where(eq(species.id, input.id)).returning()
    if (result.length === 0) {
      throw new TRPCError({ code: "NOT_FOUND" })
    }
    return { success: true }
  }),
})

const publishRouter = router({
  species: protectedProcedure.mutation(async () => {
    const rows = await db.select().from(species)
    const speciesData = toSpeciesData(rows.map((row) => row.data))

    const validated = speciesJsonSchema.parse(speciesData)

    await uploadToR2({
      bucket: "wortle-data",
      key: "species.json",
      body: JSON.stringify(validated),
      contentType: "application/json",
    })

    return { success: true, speciesCount: validated.species.length }
  }),
})

export const appRouter = router({
  species: speciesRouter,
  publish: publishRouter,
})

export type AppRouter = typeof appRouter
