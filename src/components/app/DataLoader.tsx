import { useQuery } from "@tanstack/react-query"
import { type ReactNode } from "react"
import { useSpinDelay } from "spin-delay"

import { dataApi } from "@/lib/data/DataApi"
import { defaultPuzzles, type Puzzles } from "@/lib/puzzles"
import { type Schedule } from "@/lib/schedule"

import { LoadingErrorScreen } from "./LoadingErrorScreen"
import { LoadingScreen } from "./LoadingScreen"

interface DataLoaderProps {
  children: (schedule: Schedule, puzzles: Puzzles) => ReactNode
}

export const DataLoader = ({ children }: DataLoaderProps) => {
  const {
    data: schedule,
    isSuccess,
    isError,
    isPending,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["schedule"],
    queryFn: dataApi.fetchSchedule,
    staleTime: Infinity,
  })

  const showLoading = useSpinDelay(isPending, { delay: 500, minDuration: 300, ssr: false })

  if (isSuccess) return <>{children(schedule, defaultPuzzles)}</>

  if (isError) {
    return (
      <LoadingErrorScreen
        message="Unable to load today's puzzle schedule."
        onRetry={() => void refetch()}
        isRetrying={isFetching}
      />
    )
  }

  if (showLoading) return <LoadingScreen />

  return null
}
