import "./globals.css"

import * as Sentry from "@sentry/react"
import ReactDOM from "react-dom/client"
import { assert } from "tsafe"

import { App } from "@/components/app/App"

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: "https://0f5fdd959504f11f438eca04a11996fe@o4507312909123584.ingest.de.sentry.io/4510693560221776",
  })
}

const rootElement = document.getElementById("root")
assert(rootElement, "Root element not found")

ReactDOM.createRoot(rootElement).render(<App />)
