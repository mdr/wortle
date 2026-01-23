import UmamiAnalytics from "@danielgtmn/umami-react"
import { StrictMode } from "react"

import { DataLoader } from "./DataLoader"
import { LoadedApp } from "./LoadedApp"
import { QueryProvider } from "./QueryProvider"

export interface AppProps {
  initialPath?: string
  disableNetworkRetries?: boolean
}

export const App = ({ initialPath, disableNetworkRetries }: AppProps) => (
  <StrictMode>
    {import.meta.env.PROD && (
      <UmamiAnalytics url="https://cloud.umami.is" websiteId="e9196c98-109f-4188-b531-40b430369c15" />
    )}
    <QueryProvider disableRetries={disableNetworkRetries}>
      <DataLoader>
        {(schedule, puzzles) => <LoadedApp schedule={schedule} puzzles={puzzles} initialPath={initialPath} />}
      </DataLoader>
    </QueryProvider>
  </StrictMode>
)
