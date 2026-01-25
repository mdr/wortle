import { Link } from "@tanstack/react-router"
import { Home, SearchX } from "lucide-react"

import { Button } from "@/components/shadcn/Button"
import { Card } from "@/components/shadcn/Card"
import { assetUrl } from "@/utils/utils"

import { NotFoundTestIds } from "./NotFoundTestIds"

export interface NotFoundPageProps {
  message?: string
}

export const NotFoundPage = ({ message = "The page you're looking for doesn't exist." }: NotFoundPageProps) => {
  return (
    <main className="bg-background min-h-screen" data-testid={NotFoundTestIds.page}>
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
            <SearchX className="text-muted-foreground size-16" />
          </div>
          <h2 className="text-foreground mb-2 font-serif text-2xl font-bold">Page Not Found</h2>
          <p className="text-muted-foreground mb-6">{message}</p>
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
