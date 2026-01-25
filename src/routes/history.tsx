import { createFileRoute } from "@tanstack/react-router"

import { HistoryPage } from "@/components/pages/history/HistoryPage"

export const Route = createFileRoute("/history")({
  component: HistoryPage,
})
