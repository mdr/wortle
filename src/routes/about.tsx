import { createFileRoute } from "@tanstack/react-router"

import { AboutPage } from "@/components/pages/about/AboutPage"

export const Route = createFileRoute("/about")({
  component: AboutPage,
})
