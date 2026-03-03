import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@wortle/ui"
import { clsx } from "clsx"
import { useEffect, useId, useRef, useState } from "react"

import { useTaxaRepository } from "@/components/app/GlobalDependenciesProvider"
import { usePuzzleServiceActions, usePuzzleState } from "@/services/puzzle/puzzleServiceHooks"

import { PuzzleTestIds } from "../PuzzleTestIds"

export const PlantSearch = () => {
  const { attempts, selectedTaxonId, searchQuery } = usePuzzleState()
  const puzzleActions = usePuzzleServiceActions()
  const taxaRepository = useTaxaRepository()
  const excludedTaxonIds = attempts.map((attempt) => attempt.taxonId)
  const open = searchQuery.length > 0
  const { containerRef, handleFocus, handleBlur } = useScrollToLabelOnFocus(open)
  const inputId = useId()

  const filteredTaxa = taxaRepository.filterTaxa(searchQuery, excludedTaxonIds)
  const selectedTaxon = selectedTaxonId ? taxaRepository.findTaxon(selectedTaxonId) : undefined

  if (selectedTaxon) {
    return (
      <div className="space-y-2">
        <div className="border-border bg-muted flex items-end justify-between rounded-lg border p-3">
          <div>
            <p className="text-foreground font-medium" data-testid={PuzzleTestIds.selectedPlantName}>
              {selectedTaxon.commonName}
            </p>
            <p className="text-foreground/70 text-xs italic">{selectedTaxon.scientificName}</p>
          </div>
          <p className="text-foreground/70 text-xs">{selectedTaxon.family}</p>
        </div>
        <button
          type="button"
          onClick={puzzleActions.chooseDifferentPlant}
          className="text-primary text-sm underline-offset-4 hover:underline"
          data-testid={PuzzleTestIds.chooseDifferentPlant}
        >
          Choose a different plant
        </button>
      </div>
    )
  }

  return (
    <div ref={containerRef}>
      <label htmlFor={inputId} className="text-foreground mb-2 block text-sm font-medium">
        Enter plant name
      </label>
      <Command className="rounded-lg border shadow-md" shouldFilter={false}>
        <CommandInput
          id={inputId}
          placeholder="Type common or scientific name..."
          value={searchQuery}
          onValueChange={puzzleActions.setSearchQuery}
          onFocus={handleFocus}
          onBlur={handleBlur}
          data-testid={PuzzleTestIds.searchInput}
        />
        <CommandList className={clsx({ hidden: !open })}>
          <CommandEmpty>No plants found. Try a different name.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            {filteredTaxa.map((taxon) => (
              <CommandItem
                key={taxon.id}
                value={taxon.commonName}
                onSelect={() => puzzleActions.selectTaxon(taxon.id)}
                className="group"
                data-testid={PuzzleTestIds.plantOption}
              >
                <div className="flex flex-1 flex-col">
                  <span className="font-medium">{taxon.commonName}</span>
                  <span className="text-muted-foreground group-data-[selected=true]:text-primary-foreground/70 text-xs italic">
                    {taxon.scientificName}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  )
}

// Keep the input and suggestions visible above mobile keyboards.
const useScrollToLabelOnFocus = (open: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const hasInteractedRef = useRef(false)

  const scrollToLabelIfMobile = () => {
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches
    if (!isCoarsePointer) return
    containerRef.current?.scrollIntoView({ block: "start" })
  }

  useEffect(() => {
    if (!open) return
    if (!hasInteractedRef.current) return
    scrollToLabelIfMobile()
  }, [open])

  useEffect(() => {
    if (!isFocused) return undefined
    if (!hasInteractedRef.current) return undefined

    const viewport = window.visualViewport
    const handleResize = () => {
      scrollToLabelIfMobile()
    }

    viewport?.addEventListener("resize", handleResize)

    return () => {
      viewport?.removeEventListener("resize", handleResize)
    }
  }, [isFocused])

  const handleFocus = () => {
    hasInteractedRef.current = true
    setIsFocused(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
  }

  return { containerRef, handleFocus, handleBlur }
}
