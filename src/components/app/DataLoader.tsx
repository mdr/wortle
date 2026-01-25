import { useQuery } from "@tanstack/react-query"
import { type ReactNode, useEffect, useRef } from "react"
import { useSpinDelay } from "spin-delay"

import { LoadingPage } from "@/components/pages/loading/LoadingPage"
import { LoadingErrorPage } from "@/components/pages/loadingError/LoadingErrorPage"
import { dataApi } from "@/lib/data/DataApi"
import { validateDataReferences } from "@/lib/data/validateDataReferences"
import { DefaultPuzzles, type Puzzles } from "@/lib/puzzles"
import { DefaultSchedule, type Schedule } from "@/lib/schedule"
import { DefaultSpeciesRepository, type SpeciesRepository } from "@/lib/species/Species"

interface DataLoaderProps {
  children: (schedule: Schedule, puzzles: Puzzles, speciesRepository: SpeciesRepository) => ReactNode
}

export const DataLoader = ({ children }: DataLoaderProps) => {
  const scheduleQuery = useQuery({
    queryKey: ["schedule"],
    queryFn: dataApi.fetchSchedule,
    select: (data) => new DefaultSchedule(data.schedule),
    staleTime: Infinity,
  })

  const puzzlesQuery = useQuery({
    queryKey: ["puzzles"],
    queryFn: dataApi.fetchPuzzles,
    select: (data) => new DefaultPuzzles(data.puzzles),
    staleTime: Infinity,
  })

  const speciesQuery = useQuery({
    queryKey: ["species"],
    queryFn: dataApi.fetchSpecies,
    select: (data) => new DefaultSpeciesRepository(data.species),
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

  const hasValidated = useRef(false)
  useEffect(() => {
    if (isSuccess && !hasValidated.current) {
      hasValidated.current = true
      validateDataReferences(scheduleQuery.data, puzzlesQuery.data, speciesQuery.data)
    }
  }, [isSuccess, scheduleQuery.data, puzzlesQuery.data, speciesQuery.data])

  if (isSuccess) {
    return children(scheduleQuery.data, puzzlesQuery.data, speciesQuery.data)
  }

  if (isError) {
    return <LoadingErrorPage message="Unable to load data." onRetry={refetch} isRetrying={isFetching} />
  }

  if (showLoading) return <LoadingPage />

  return null
}
