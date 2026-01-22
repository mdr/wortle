import { AlertCircle, Loader2, RefreshCw } from "lucide-react"

import { Button } from "@/components/shadcn/Button"
import { Card } from "@/components/shadcn/Card"
import { assetUrl } from "@/utils/utils"

import { LoadingErrorTestIds } from "./LoadingErrorTestIds"

export interface LoadingErrorScreenProps {
  message?: string
  onRetry: () => void
  isRetrying: boolean
}

export const LoadingErrorScreen = ({
  message = "Something went wrong loading the app.",
  onRetry,
  isRetrying,
}: LoadingErrorScreenProps) => (
  <main
    data-testid={LoadingErrorTestIds.screen}
    className="bg-background flex min-h-screen flex-col items-center justify-center p-4"
  >
    <Card className="flex max-w-md flex-col items-center gap-6 p-8 text-center">
      <img src={assetUrl("/logo.png")} alt="Wortle" className="size-20" />
      <div className="flex flex-col items-center gap-2">
        <AlertCircle className="text-destructive size-10" />
        <h1 className="text-foreground font-serif text-xl font-bold">Unable to Load</h1>
        <p className="text-muted-foreground">{message}</p>
      </div>
      <Button data-testid={LoadingErrorTestIds.retryButton} onClick={onRetry} disabled={isRetrying}>
        {isRetrying ? <Loader2 className="animate-spin" /> : <RefreshCw />}
        {isRetrying ? "Retrying..." : "Try Again"}
      </Button>
    </Card>
  </main>
)
