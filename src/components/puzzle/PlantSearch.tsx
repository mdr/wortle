import { clsx } from "clsx"
import { useEffect, useId, useRef, useState } from "react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/shadcn/Command"
import { getAllSpecies } from "@/lib/species/plants"
import { filterSpecies, Species } from "@/lib/species/Species"
import { usePuzzleServiceActions, usePuzzleState } from "@/services/puzzle/puzzleServiceHooks"

import { PuzzleTestIds } from "./PuzzleTestIds"

export const PlantSearch = () => {
  const { attempts, selectedSpecies } = usePuzzleState((state) => state)
  const puzzleActions = usePuzzleServiceActions()
  const excludedSpeciesIds = attempts.map((attempt) => attempt.speciesId)
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const { containerRef, handleFocus, handleBlur } = useScrollToLabelOnFocus(open)
  const inputId = useId()

  const allSpecies = getAllSpecies()

  const handleSelect = (species: Species) => {
    puzzleActions.selectSpecies(species.id)
    setQuery("")
    setOpen(false)
  }

  const filteredSpecies = filterSpecies(allSpecies, query, excludedSpeciesIds)

  const handleClear = () => {
    puzzleActions.chooseDifferentPlant()
    setQuery("")
  }

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
          onClick={handleClear}
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
          value={query}
          onValueChange={(value) => {
            setQuery(value)
            setOpen(value.length > 0)
          }}
          onFocus={() => {
            handleFocus()
            if (query.length > 0) setOpen(true)
          }}
          onBlur={() => {
            handleBlur()
          }}
          data-testid={PuzzleTestIds.searchInput}
        />
        <CommandList className={clsx({ hidden: !open })}>
          <CommandEmpty>No plants found. Try a different name.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            {filteredSpecies.map((species) => (
              <CommandItem
                key={species.id}
                value={species.commonName}
                onSelect={() => handleSelect(species)}
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
