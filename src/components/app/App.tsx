import UmamiAnalytics from "@danielgtmn/umami-react"
import { StrictMode } from "react"

import { LoadedApp } from "./LoadedApp"
import { QueryProvider } from "./QueryProvider"
import { ScheduleLoader } from "./ScheduleLoader"

export interface AppProps {
  initialPath?: string
}

export const App = ({ initialPath }: AppProps) => (
  <StrictMode>
    {import.meta.env.PROD && (
      <UmamiAnalytics url="https://cloud.umami.is" websiteId="e9196c98-109f-4188-b531-40b430369c15" />
    )}
    <QueryProvider>
      <ScheduleLoader>{(schedule) => <LoadedApp schedule={schedule} initialPath={initialPath} />}</ScheduleLoader>
    </QueryProvider>
  </StrictMode>
)
