import { useQuery } from "@tanstack/react-query"
import { type ReactNode } from "react"
import { useSpinDelay } from "spin-delay"

import { dataApi } from "@/lib/data/DataApi"
import { type Puzzles } from "@/lib/puzzles"
import { type Schedule } from "@/lib/schedule"
import { type SpeciesRepository } from "@/lib/species/Species"

import { LoadingErrorScreen } from "./LoadingErrorScreen"
import { LoadingScreen } from "./LoadingScreen"

interface DataLoaderProps {
  children: (schedule: Schedule, puzzles: Puzzles, speciesRepository: SpeciesRepository) => ReactNode
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

  const speciesQuery = useQuery({
    queryKey: ["species"],
    queryFn: dataApi.fetchSpecies,
    staleTime: Infinity,
  })

  const isPending = scheduleQuery.isPending || puzzlesQuery.isPending || speciesQuery.isPending
  const isSuccess = scheduleQuery.isSuccess && puzzlesQuery.isSuccess && speciesQuery.isSuccess
  const isError = scheduleQuery.isError || puzzlesQuery.isError || speciesQuery.isError
  const isFetching = scheduleQuery.isFetching || puzzlesQuery.isFetching || speciesQuery.isFetching

  const refetch = () => {
    if (scheduleQuery.isError) void scheduleQuery.refetch()
    if (puzzlesQuery.isError) void puzzlesQuery.refetch()
    if (speciesQuery.isError) void speciesQuery.refetch()
  }

  const showLoading = useSpinDelay(isPending, { delay: 500, minDuration: 300, ssr: false })

  if (isSuccess) {
    return children(scheduleQuery.data, puzzlesQuery.data, speciesQuery.data)
  }

  if (isError) {
    return <LoadingErrorScreen message="Unable to load data." onRetry={refetch} isRetrying={isFetching} />
  }

  if (showLoading) return <LoadingScreen />

  return null
}
