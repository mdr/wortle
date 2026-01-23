import { useQuery } from "@tanstack/react-query"
import { type ReactNode } from "react"
import { useSpinDelay } from "spin-delay"

import { dataApi } from "@/lib/data/DataApi"
import { type Puzzles } from "@/lib/puzzles"
import { type Schedule } from "@/lib/schedule"

import { LoadingErrorScreen } from "./LoadingErrorScreen"
import { LoadingScreen } from "./LoadingScreen"

interface DataLoaderProps {
  children: (schedule: Schedule, puzzles: Puzzles) => ReactNode
}

export const DataLoader = ({ children }: DataLoaderProps) => {
  const scheduleQuery = useQuery({
    queryKey: ["schedule"],
    queryFn: dataApi.fetchSchedule,
    staleTime: Infinity,
  })

  const puzzlesQuery = useQuery({
    queryKey: ["puzzles"],
    queryFn: dataApi.fetchPuzzles,
    staleTime: Infinity,
  })

  const isPending = scheduleQuery.isPending || puzzlesQuery.isPending
  const isError = scheduleQuery.isError || puzzlesQuery.isError
  const isFetching = scheduleQuery.isFetching || puzzlesQuery.isFetching

  const refetch = () => {
    if (scheduleQuery.isError) void scheduleQuery.refetch()
    if (puzzlesQuery.isError) void puzzlesQuery.refetch()
  }

  const showLoading = useSpinDelay(isPending, { delay: 500, minDuration: 300, ssr: false })

  if (scheduleQuery.isSuccess && puzzlesQuery.isSuccess) {
    return <>{children(scheduleQuery.data, puzzlesQuery.data)}</>
  }

  if (isError) {
    return <LoadingErrorScreen message="Unable to load data." onRetry={refetch} isRetrying={isFetching} />
  }

  if (showLoading) return <LoadingScreen />

  return null
}
