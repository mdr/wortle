import { Toaster } from "@wortle/ui"

import EditTaxonPage from "@/app/taxa/[id]/edit/page"
import NewTaxonPage from "@/app/taxa/new/page"
import TaxaPage from "@/app/taxa/page"
import { NavLinks } from "@/components/NavLinks"
import { TRPCProvider } from "@/trpc/provider"

import { TestRoute, TestRouteOutlet, TestRouterProvider } from "./nextShims/TestRouter.testUtils"

const routes: TestRoute[] = [
  { path: "/taxa", render: () => <TaxaPage /> },
  { path: "/taxa/new", render: () => <NewTaxonPage /> },
  { path: "/taxa/:id/edit", render: () => <EditTaxonPage /> },
]

interface TestAppProps {
  initialPath: string
}

// Mirrors the client-side shell of src/app/layout.tsx (a server component), so the
// query cache survives navigation as it does in the real app.
export const TestApp = ({ initialPath }: TestAppProps) => (
  <TestRouterProvider initialPath={initialPath} routes={routes}>
    <header className="border-b">
      <div className="flex items-center gap-6 px-6 py-4">
        <h1 className="text-lg font-semibold">Wortle Admin</h1>
        <NavLinks />
      </div>
    </header>
    <TRPCProvider>
      <main className="px-6 py-8">
        <TestRouteOutlet />
      </main>
    </TRPCProvider>
    <Toaster />
  </TestRouterProvider>
)
