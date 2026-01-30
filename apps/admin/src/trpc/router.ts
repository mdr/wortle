import { router } from "./init"
import { publishRouter } from "./publishRouter"
import { speciesRouter } from "./speciesRouter"

export const appRouter = router({
  species: speciesRouter,
  publish: publishRouter,
})

export type AppRouter = typeof appRouter
