import { ReactNode, useEffect } from "react"

import { type Iso8601Date } from "@/utils/brandedTypes"
import { type Clock } from "@/utils/Clock"

import { useGlobalDependencies } from "./GlobalDependenciesProvider"

export class TestHooks {
  constructor(private readonly clock: Clock) {}

  setClockDate = (date: Iso8601Date): void => {
    if (!this.clock.setDate) {
      throw new Error("Clock does not support setDate")
    }
    this.clock.setDate(date)
  }
}

const useInstallTestHooks = () => {
  const { clock } = useGlobalDependencies()
  useEffect(() => {
    window.testHooks = new TestHooks(clock)
    return () => {
      delete window.testHooks
    }
  }, [clock])
}

export const TestHooksProvider = ({ children }: { children: ReactNode }) => {
  useInstallTestHooks()
  return children
}
