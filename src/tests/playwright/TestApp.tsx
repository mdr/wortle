import { App } from "@/components/app/App"

interface TestAppProps {
  initialPath?: string
}

export const TestApp = ({ initialPath = "/" }: TestAppProps) => <App initialPath={initialPath} disableNetworkRetries />
