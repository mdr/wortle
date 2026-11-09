import type { Page, Route } from "@playwright/test"
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"

import { FakePuzzleRepository } from "@/db/FakePuzzleRepository.testUtils"
import { FakeTaxaRepository } from "@/db/FakeTaxaRepository.testUtils"
import { router } from "@/trpc/init"
import { createTaxaRouter } from "@/trpc/taxaRouter"
import { testContext } from "@/trpc/testFactories.testUtils"

export enum TrpcProcedure {
  TAXA_UPDATE = "taxa.update",
}

interface Stall {
  resolve: () => void
}

// Serves the app's /api/trpc requests from the real tRPC routers, backed by fake repositories.
// Route handlers run in the Playwright test process, so this is server code running in Node.
export class TrpcSimulator {
  readonly taxaRepository = new FakeTaxaRepository()
  readonly puzzleRepository = new FakePuzzleRepository()

  private readonly appRouter = router({
    taxa: createTaxaRouter(this.taxaRepository, this.puzzleRepository),
  })

  private readonly stalls = new Map<string, Promise<undefined>>()

  constructor(private readonly page: Page) {}

  install = () => this.page.route("**/api/trpc/**", this.handle)

  stall = (procedure: TrpcProcedure): Stall => {
    const { promise, resolve } = Promise.withResolvers<undefined>()
    this.stalls.set(procedure, promise)
    return {
      resolve: () => {
        this.stalls.delete(procedure)
        resolve(undefined)
      },
    }
  }

  private readonly handle = async (route: Route) => {
    const request = route.request()
    const url = new URL(request.url())
    const procedures = url.pathname.replace(/^\/api\/trpc\//, "").split(",")
    await Promise.all(procedures.flatMap((procedure) => this.stalls.get(procedure) ?? []))

    const response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: new Request(url, {
        method: request.method(),
        headers: await request.allHeaders(),
        body: request.postData() ?? undefined,
      }),
      router: this.appRouter,
      createContext: () => testContext,
    })

    await route.fulfill({
      status: response.status,
      headers: Object.fromEntries(response.headers),
      body: await response.text(),
    })
  }
}
