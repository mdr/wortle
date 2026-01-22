import { useQuery } from "@tanstack/react-query"
import { type ReactNode } from "react"
import { useSpinDelay } from "spin-delay"

import { dataApi } from "@/lib/data/DataApi"
import { type Schedule } from "@/lib/schedule"

import { LoadingErrorScreen } from "./LoadingErrorScreen"
import { LoadingScreen } from "./LoadingScreen"

interface DataLoaderProps {
  children: (schedule: Schedule) => ReactNode
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
    staleTime: 1000 * 60 * 60, // 1 hour
  })

  const showLoading = useSpinDelay(isPending, { delay: 500, minDuration: 300 })

  if (isSuccess) return <>{children(schedule)}</>

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
