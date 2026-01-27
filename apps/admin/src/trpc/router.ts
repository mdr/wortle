import { SpeciesId } from "@wortle/shared"
import { TRPCError } from "@trpc/server"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { apiSpeciesSchema } from "@/api/types"
import { db } from "@/db"
import { species } from "@/db/schema"

import { publicProcedure, router } from "./init"

const speciesRouter = router({
  list: publicProcedure.query(async () => {
    const rows = await db.select().from(species)
    return rows.map((row) => row.data)
  }),

  get: publicProcedure.input(z.object({ id: z.string().transform(SpeciesId) })).query(async ({ input }) => {
    const rows = await db.select().from(species).where(eq(species.id, input.id))
    if (rows.length === 0) {
      throw new TRPCError({ code: "NOT_FOUND" })
    }
    return rows[0].data
  }),

  create: publicProcedure.input(apiSpeciesSchema).mutation(async ({ input }) => {
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

  update: publicProcedure.input(apiSpeciesSchema).mutation(async ({ input }) => {
    const result = await db.update(species).set({ data: input }).where(eq(species.id, input.id)).returning()
    if (result.length === 0) {
      throw new TRPCError({ code: "NOT_FOUND" })
    }
    return result[0].data
  }),

  delete: publicProcedure.input(z.object({ id: z.string().transform(SpeciesId) })).mutation(async ({ input }) => {
    const result = await db.delete(species).where(eq(species.id, input.id)).returning()
    if (result.length === 0) {
      throw new TRPCError({ code: "NOT_FOUND" })
    }
    return { success: true }
  }),
})

export const appRouter = router({
  species: speciesRouter,
})

export type AppRouter = typeof appRouter
