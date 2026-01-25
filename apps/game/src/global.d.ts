import { type TestHooks } from "@/components/app/TestHooksProvider"

declare global {
  interface Window {
    testHooks?: TestHooks
  }
}
