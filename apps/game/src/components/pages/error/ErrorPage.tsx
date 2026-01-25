import { Link } from "@tanstack/react-router"
import { AlertTriangle, Home } from "lucide-react"
import { useEffect } from "react"

import { Button } from "@/components/shadcn/Button"
import { Card } from "@/components/shadcn/Card"
import { logger } from "@/utils/Logger"
import { assetUrl } from "@/utils/utils"

import { ErrorTestIds } from "./ErrorTestIds"

export interface ErrorPageProps {
  error: Error
}

export const ErrorPage = ({ error }: ErrorPageProps) => {
  useEffect(() => {
    logger.error("app.errorBoundary", "Unhandled error caught by error boundary", undefined, error)
  }, [error])
  return (
    <main className="bg-background min-h-screen" data-testid={ErrorTestIds.page}>
      <header className="border-border bg-card min-w-[334px] border-b">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex flex-shrink-0 items-center gap-3">
              <img src={assetUrl("/logo.png")} alt="" className="size-12 min-[440px]:size-20" />
              <div>
                <h1 className="text-foreground font-serif text-xl font-bold min-[440px]:text-2xl">Wortle</h1>
                <p className="text-muted-foreground hidden text-sm min-[440px]:block">Daily Wild Plant Quiz</p>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card className="p-8 text-center">
          <div className="mb-4 flex justify-center">
            <AlertTriangle className="text-destructive size-16" />
          </div>
          <h2 className="text-foreground mb-2 font-serif text-2xl font-bold">Something Went Wrong</h2>
          <p className="text-muted-foreground mb-4">An unexpected error occurred. Please try again.</p>
          <details className="mb-6 text-left">
            <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-sm">
              Technical details
            </summary>
            <pre className="bg-muted text-muted-foreground mt-2 overflow-auto rounded p-3 text-xs">{error.message}</pre>
          </details>
          <Link to="/">
            <Button>
              <Home className="size-4" />
              Back to Home
            </Button>
          </Link>
        </Card>
      </div>
    </main>
  )
}
