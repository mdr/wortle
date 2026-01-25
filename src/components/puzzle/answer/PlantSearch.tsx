import { clsx } from "clsx"
import { useEffect, useId, useRef, useState } from "react"

import { useSpeciesRepository } from "@/components/app/GlobalDependenciesProvider"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/shadcn/Command"
import { usePuzzleServiceActions, usePuzzleState } from "@/services/puzzle/puzzleServiceHooks"

import { PuzzleTestIds } from "../PuzzleTestIds"

export const PlantSearch = () => {
  const { attempts, selectedSpeciesId, searchQuery } = usePuzzleState()
  const puzzleActions = usePuzzleServiceActions()
  const speciesRepository = useSpeciesRepository()
  const excludedSpeciesIds = attempts.map((attempt) => attempt.speciesId)
  const open = searchQuery.length > 0
  const { containerRef, handleFocus, handleBlur } = useScrollToLabelOnFocus(open)
  const inputId = useId()

  const filteredSpecies = speciesRepository.filterSpecies(searchQuery, excludedSpeciesIds)
  const selectedSpecies = selectedSpeciesId ? speciesRepository.findSpecies(selectedSpeciesId) : undefined

  if (selectedSpecies) {
    return (
      <div className="space-y-2">
        <div className="border-border bg-muted flex items-end justify-between rounded-lg border p-3">
          <div>
            <p className="text-foreground font-medium" data-testid={PuzzleTestIds.selectedPlantName}>
              {selectedSpecies.commonName}
            </p>
            <p className="text-foreground/70 text-xs italic">{selectedSpecies.scientificName}</p>
          </div>
          <p className="text-foreground/70 text-xs">{selectedSpecies.family}</p>
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
            {filteredSpecies.map((species) => (
              <CommandItem
                key={species.id}
                value={species.commonName}
                onSelect={() => puzzleActions.selectSpecies(species.id)}
                className="group"
                data-testid={PuzzleTestIds.plantOption}
              >
                <div className="flex flex-1 flex-col">
                  <span className="font-medium">{species.commonName}</span>
                  <span className="text-muted-foreground group-data-[selected=true]:text-primary-foreground/70 text-xs italic">
                    {species.scientificName}
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
