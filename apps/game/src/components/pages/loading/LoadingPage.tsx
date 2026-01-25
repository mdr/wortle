import { Loader2 } from "lucide-react"

import { assetUrl } from "@/utils/utils"

import { LoadingTestIds } from "./LoadingTestIds"

export const LoadingPage = () => (
  <main
    data-testid={LoadingTestIds.loadingScreen}
    className="bg-background flex min-h-screen flex-col items-center justify-center gap-6"
  >
    <img src={assetUrl("/logo.png")} alt="Wortle" className="size-20" />
    <Loader2 className="text-muted-foreground size-8 animate-spin" />
  </main>
)
