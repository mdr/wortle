import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/error-test")({
  component: () => {
    throw new Error("This is a test error to verify the error boundary works!")
  },
})
