"use client"

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { zodResolver } from "@hookform/resolvers/zod"
import { CommonName, Family, ScientificName, TaxonId, Url } from "@wortle/shared"
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@wortle/ui"
import { Check, ChevronsUpDown, ExternalLink, Plus, Trash2 } from "lucide-react"
import { useEffect, useId, useRef, useState } from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

import { type ApiTaxon } from "@/api/types"
import { FAMILIES } from "@/constants/families"
import { validateGlossaryBrackets } from "@/utils/validateGlossaryBrackets"

import { SortableItem } from "./SortableItem"

const scientificNameSchema = z
  .string()
  .min(1, "Scientific name is required")
  .regex(/^[A-Z][a-z]+ [a-z]+(-[a-z]+)*$/, "Must be in format 'Genus species' (e.g., Taraxacum officinale)")

const formSchema = z.object({
  id: z
    .string()
    .min(1, "ID is required")
    .regex(/^2cd4p9h\.[a-z0-9]+$/, "Must be a valid BSBI DDb ID (e.g., 2cd4p9h.23w)"),
  commonName: z.string().min(1, "Common name is required"),
  scientificName: scientificNameSchema,
  family: z.enum(FAMILIES, { message: "Please select a family" }),
  alternativeCommonNames: z.array(z.object({ value: z.string().min(1, "Cannot be empty") })),
  alternativeScientificNames: z.array(z.object({ value: scientificNameSchema })),
  links: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      url: z.url({ message: "Must be a valid URL" }),
    }),
  ),
  idTips: z.array(
    z.object({
      value: z
        .string()
        .min(1, "Cannot be empty")
        .refine(validateGlossaryBrackets, { message: "Unmatched [[ or ]] brackets" }),
    }),
  ),
})

export type TaxonFormData = z.infer<typeof formSchema>

const formDataToApiTaxon = (data: TaxonFormData): ApiTaxon => ({
  id: TaxonId(data.id),
  commonName: CommonName(data.commonName),
  scientificName: ScientificName(data.scientificName),
  family: Family(data.family),
  alternativeCommonNames: data.alternativeCommonNames
    .map((n) => n.value)
    .filter(Boolean)
    .map(CommonName),
  alternativeScientificNames: data.alternativeScientificNames
    .map((n) => n.value)
    .filter(Boolean)
    .map(ScientificName),
  links: data.links.map((l) => ({ name: l.name, url: Url(l.url) })),
  idTips: data.idTips.map((t) => t.value).filter(Boolean),
})

export const apiTaxonToFormData = (taxon: ApiTaxon): TaxonFormData => ({
  id: taxon.id,
  commonName: taxon.commonName,
  scientificName: taxon.scientificName,
  family: taxon.family as TaxonFormData["family"],
  alternativeCommonNames: taxon.alternativeCommonNames.map((n) => ({ value: n })),
  alternativeScientificNames: taxon.alternativeScientificNames.map((n) => ({ value: n })),
  links: taxon.links.map((l) => ({ name: l.name, url: l.url })),
  idTips: taxon.idTips.map((t) => ({ value: t })),
})

const emptyFormData: TaxonFormData = {
  id: "",
  commonName: "",
  scientificName: "",
  family: undefined as unknown as TaxonFormData["family"],
  alternativeCommonNames: [],
  alternativeScientificNames: [],
  links: [],
  idTips: [],
}

type TaxonFormProps = {
  mode: "new" | "edit"
  initialValues?: TaxonFormData
  onSubmit: (data: ApiTaxon) => void
  onCancel: () => void
  isPending: boolean
  error?: { message: string } | null
  onDelete?: () => void
  isDeleting?: boolean
}

type FamilyComboboxProps = {
  value: string
  onChange: (value: string) => void
  id?: string
}

const FamilyCombobox = ({ value, onChange, id }: FamilyComboboxProps) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const filteredFamilies = FAMILIES.filter((family) => family.toLowerCase().includes(search.toLowerCase()))

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value || "Select a family..."}
          <ChevronsUpDown className="text-muted-foreground h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Search families..." value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandEmpty>No family found.</CommandEmpty>
            <CommandGroup>
              {filteredFamilies.map((family) => (
                <CommandItem
                  key={family}
                  value={family}
                  onSelect={() => {
                    onChange(family)
                    setOpen(false)
                    setSearch("")
                  }}
                >
                  <Check className={`mr-2 h-4 w-4 ${value === family ? "opacity-100" : "opacity-0"}`} />
                  {family}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export const TaxonForm = ({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  isPending,
  error,
  onDelete,
  isDeleting,
}: TaxonFormProps) => {
  const formId = useId()
  const form = useForm<TaxonFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues ?? emptyFormData,
  })

  const altNames = useFieldArray({ control: form.control, name: "alternativeCommonNames" })
  const altScientificNames = useFieldArray({ control: form.control, name: "alternativeScientificNames" })
  const links = useFieldArray({ control: form.control, name: "links" })
  const tips = useFieldArray({ control: form.control, name: "idTips" })

  const pendingFocusRef = useRef<"altNames" | "altScientificNames" | "links" | "tips" | null>(null)
  const prevIsPendingRef = useRef(isPending)

  // Reset form after successful save (isPending goes from true to false with no error)
  useEffect(() => {
    if (prevIsPendingRef.current && !isPending && !error) {
      form.reset(form.getValues())
    }
    prevIsPendingRef.current = isPending
  }, [isPending, error, form])

  useEffect(() => {
    if (pendingFocusRef.current === "altNames" && altNames.fields.length > 0) {
      form.setFocus(`alternativeCommonNames.${altNames.fields.length - 1}.value`)
      pendingFocusRef.current = null
    }
  }, [altNames.fields.length, form])

  useEffect(() => {
    if (pendingFocusRef.current === "altScientificNames" && altScientificNames.fields.length > 0) {
      form.setFocus(`alternativeScientificNames.${altScientificNames.fields.length - 1}.value`)
      pendingFocusRef.current = null
    }
  }, [altScientificNames.fields.length, form])

  useEffect(() => {
    if (pendingFocusRef.current === "links" && links.fields.length > 0) {
      form.setFocus(`links.${links.fields.length - 1}.name`)
      pendingFocusRef.current = null
    }
  }, [links.fields.length, form])

  useEffect(() => {
    if (pendingFocusRef.current === "tips" && tips.fields.length > 0) {
      form.setFocus(`idTips.${tips.fields.length - 1}.value`)
      pendingFocusRef.current = null
    }
  }, [tips.fields.length, form])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd =
    (fields: { id: string }[], move: (from: number, to: number) => void) => (event: DragEndEvent) => {
      const { active, over } = event
      if (over && active.id !== over.id) {
        const oldIndex = fields.findIndex((f) => f.id === active.id)
        const newIndex = fields.findIndex((f) => f.id === over.id)
        move(oldIndex, newIndex)
      }
    }

  const handleFormSubmit = (data: TaxonFormData) => onSubmit(formDataToApiTaxon(data))

  const isEditMode = mode === "edit"

  return (
    <form onSubmit={(e) => void form.handleSubmit(handleFormSubmit)(e)} className="space-y-6">
      <div className="space-y-1">
        <Label htmlFor={`${formId}-id`}>ID (BSBI DDB)</Label>
        <Input
          id={`${formId}-id`}
          {...form.register("id")}
          className={isEditMode ? "bg-muted" : ""}
          disabled={isEditMode}
        />
        {form.formState.errors.id && <p className="text-destructive text-sm">{form.formState.errors.id.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor={`${formId}-scientificName`}>Scientific Name</Label>
        <Input id={`${formId}-scientificName`} {...form.register("scientificName")} placeholder="Genus species" />
        {form.formState.errors.scientificName && (
          <p className="text-destructive text-sm">{form.formState.errors.scientificName.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor={`${formId}-family`}>Family</Label>
        <Controller
          control={form.control}
          name="family"
          render={({ field }) => (
            <FamilyCombobox id={`${formId}-family`} value={field.value} onChange={field.onChange} />
          )}
        />
        {form.formState.errors.family && (
          <p className="text-destructive text-sm">{form.formState.errors.family.message}</p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor={`${formId}-commonName`}>Common Name</Label>
        <Input id={`${formId}-commonName`} {...form.register("commonName")} />
        {form.formState.errors.commonName && (
          <p className="text-destructive text-sm">{form.formState.errors.commonName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Alternative Common Names</Label>
        <div className="space-y-2 rounded-md border p-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd(altNames.fields, altNames.move)}
          >
            <SortableContext items={altNames.fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              {altNames.fields.map((field, index) => {
                const error = form.formState.errors.alternativeCommonNames?.[index]?.value
                return (
                  <SortableItem key={field.id} id={field.id} showHandle={altNames.fields.length > 1}>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Input
                          {...form.register(`alternativeCommonNames.${index}.value`)}
                          className="flex-1"
                          aria-invalid={!!error}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => altNames.remove(index)}
                          aria-label="Remove name"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {error && <p className="text-destructive text-sm">{error.message}</p>}
                    </div>
                  </SortableItem>
                )
              })}
            </SortableContext>
          </DndContext>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              pendingFocusRef.current = "altNames"
              altNames.append({ value: "" })
            }}
          >
            <Plus className="h-4 w-4" />
            Add Name
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Alternative Scientific Names</Label>
        <div className="space-y-2 rounded-md border p-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd(altScientificNames.fields, altScientificNames.move)}
          >
            <SortableContext items={altScientificNames.fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              {altScientificNames.fields.map((field, index) => {
                const error = form.formState.errors.alternativeScientificNames?.[index]?.value
                return (
                  <SortableItem key={field.id} id={field.id} showHandle={altScientificNames.fields.length > 1}>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Input
                          {...form.register(`alternativeScientificNames.${index}.value`)}
                          className="flex-1"
                          placeholder="Genus species"
                          aria-invalid={!!error}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => altScientificNames.remove(index)}
                          aria-label="Remove name"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {error && <p className="text-destructive text-sm">{error.message}</p>}
                    </div>
                  </SortableItem>
                )
              })}
            </SortableContext>
          </DndContext>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              pendingFocusRef.current = "altScientificNames"
              altScientificNames.append({ value: "" })
            }}
          >
            <Plus className="h-4 w-4" />
            Add Name
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Links</Label>
        <div className="space-y-2 rounded-md border p-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd(links.fields, links.move)}
          >
            <SortableContext items={links.fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              {links.fields.map((field, index) => {
                const url = form.watch(`links.${index}.url`)
                const nameError = form.formState.errors.links?.[index]?.name
                const urlError = form.formState.errors.links?.[index]?.url
                return (
                  <SortableItem key={field.id} id={field.id} showHandle={links.fields.length > 1}>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Input
                          {...form.register(`links.${index}.name`)}
                          placeholder="Name"
                          className="w-40 shrink-0"
                          aria-invalid={!!nameError}
                        />
                        <Input
                          {...form.register(`links.${index}.url`)}
                          placeholder="URL"
                          className="flex-1"
                          aria-invalid={!!urlError}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          asChild
                          className={url && !urlError ? "" : "pointer-events-none opacity-30"}
                        >
                          <a href={url || "#"} target="_blank" rel="noopener noreferrer" aria-label="Open link">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => links.remove(index)}
                          aria-label="Remove link"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {(nameError || urlError) && (
                        <p className="text-destructive text-sm">{nameError?.message || urlError?.message}</p>
                      )}
                    </div>
                  </SortableItem>
                )
              })}
            </SortableContext>
          </DndContext>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              pendingFocusRef.current = "links"
              links.append({ name: "", url: "" })
            }}
          >
            <Plus className="h-4 w-4" />
            Add Link
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>ID Tips</Label>
        <div className="space-y-2 rounded-md border p-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd(tips.fields, tips.move)}
          >
            <SortableContext items={tips.fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              {tips.fields.map((field, index) => {
                const error = form.formState.errors.idTips?.[index]?.value
                return (
                  <SortableItem key={field.id} id={field.id} showHandle={tips.fields.length > 1}>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Input {...form.register(`idTips.${index}.value`)} className="flex-1" aria-invalid={!!error} />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => tips.remove(index)}
                          aria-label="Remove tip"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      {error && <p className="text-destructive text-sm">{error.message}</p>}
                    </div>
                  </SortableItem>
                )
              })}
            </SortableContext>
          </DndContext>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              pendingFocusRef.current = "tips"
              tips.append({ value: "" })
            }}
          >
            <Plus className="h-4 w-4" />
            Add Tip
          </Button>
        </div>
      </div>

      {error && <div className="text-destructive text-sm">{error.message}</div>}

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={!form.formState.isDirty || isPending}>
          {isPending ? (isEditMode ? "Saving..." : "Creating...") : isEditMode ? "Save" : "Create"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {isEditMode && onDelete && (
          <Button type="button" variant="destructive" onClick={onDelete} disabled={isDeleting} className="ml-auto">
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        )}
      </div>
    </form>
  )
}
