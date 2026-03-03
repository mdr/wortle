import { useQuery } from "@tanstack/react-query"
import { type ReactNode, useEffect, useRef } from "react"
import { useSpinDelay } from "spin-delay"

import { LoadingPage } from "@/components/pages/loading/LoadingPage"
import { LoadingErrorPage } from "@/components/pages/loadingError/LoadingErrorPage"
import { dataApi } from "@/lib/data/DataApi"
import { validateDataReferences } from "@/lib/data/validateDataReferences"
import { DefaultPuzzles, type Puzzles } from "@/lib/puzzles"
import { DefaultSchedule, type Schedule } from "@/lib/schedule"
import { DefaultTaxaRepository, type TaxaRepository } from "@/lib/taxa/Taxon"

interface DataLoaderProps {
  children: (schedule: Schedule, puzzles: Puzzles, taxaRepository: TaxaRepository) => ReactNode
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

  const taxaQuery = useQuery({
    queryKey: ["taxa"],
    queryFn: dataApi.fetchTaxa,
    select: (data) => new DefaultTaxaRepository(data.species),
    staleTime: Infinity,
  })

  const isPending = scheduleQuery.isPending || puzzlesQuery.isPending || taxaQuery.isPending
  const isSuccess = scheduleQuery.isSuccess && puzzlesQuery.isSuccess && taxaQuery.isSuccess
  const isError = scheduleQuery.isError || puzzlesQuery.isError || taxaQuery.isError
  const isFetching = scheduleQuery.isFetching || puzzlesQuery.isFetching || taxaQuery.isFetching

  const refetch = () => {
    if (scheduleQuery.isError) void scheduleQuery.refetch()
    if (puzzlesQuery.isError) void puzzlesQuery.refetch()
    if (taxaQuery.isError) void taxaQuery.refetch()
  }

  const showLoading = useSpinDelay(isPending, { delay: 500, minDuration: 300, ssr: false })

  const hasValidated = useRef(false)
  useEffect(() => {
    if (isSuccess && !hasValidated.current) {
      hasValidated.current = true
      validateDataReferences(scheduleQuery.data, puzzlesQuery.data, taxaQuery.data)
    }
  }, [isSuccess, scheduleQuery.data, puzzlesQuery.data, taxaQuery.data])

  if (isSuccess) {
    return children(scheduleQuery.data, puzzlesQuery.data, taxaQuery.data)
  }

  if (isError) {
    return <LoadingErrorPage message="Unable to load data." onRetry={refetch} isRetrying={isFetching} />
  }

  if (showLoading) return <LoadingPage />

  return null
}
