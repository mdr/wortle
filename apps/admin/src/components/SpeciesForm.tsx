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
import { CommonName, Family, ScientificName, SpeciesId, Url } from "@wortle/shared"
import { Button, Input, Label } from "@wortle/ui"
import { ExternalLink, Plus, Trash2 } from "lucide-react"
import { useId } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

import { type ApiSpecies } from "@/api/types"
import { FAMILIES } from "@/constants/families"

import { SortableItem } from "./SortableItem"

const formSchema = z.object({
  id: z
    .string()
    .min(1, "ID is required")
    .regex(/^2cd4p9h\.[a-z0-9]+$/, "Must be a valid BSBI DDb ID (e.g., 2cd4p9h.23w)"),
  commonName: z.string().min(1, "Common name is required"),
  scientificName: z
    .string()
    .min(1, "Scientific name is required")
    .regex(/^[A-Z][a-z]+ [a-z]+(-[a-z]+)*$/, "Must be in format 'Genus species' (e.g., Taraxacum officinale)"),
  family: z.enum(FAMILIES, { message: "Please select a family" }),
  alternativeCommonNames: z.array(z.object({ value: z.string() })),
  links: z.array(
    z.object({
      name: z.string().min(1, "Name is required"),
      url: z.url({ message: "Must be a valid URL" }),
    }),
  ),
  idTips: z.array(z.object({ value: z.string() })),
})

export type SpeciesFormData = z.infer<typeof formSchema>

const formDataToApiSpecies = (data: SpeciesFormData): ApiSpecies => ({
  id: SpeciesId(data.id),
  commonName: CommonName(data.commonName),
  scientificName: ScientificName(data.scientificName),
  family: Family(data.family),
  alternativeCommonNames: data.alternativeCommonNames
    .map((n) => n.value)
    .filter(Boolean)
    .map(CommonName),
  links: data.links.map((l) => ({ name: l.name, url: Url(l.url) })),
  idTips: data.idTips.map((t) => t.value).filter(Boolean),
})

export const apiSpeciesToFormData = (species: ApiSpecies): SpeciesFormData => ({
  id: species.id,
  commonName: species.commonName,
  scientificName: species.scientificName,
  family: species.family as SpeciesFormData["family"],
  alternativeCommonNames: species.alternativeCommonNames.map((n) => ({ value: n })),
  links: species.links.map((l) => ({ name: l.name, url: l.url })),
  idTips: species.idTips.map((t) => ({ value: t })),
})

const emptyFormData: SpeciesFormData = {
  id: "",
  commonName: "",
  scientificName: "",
  family: undefined as unknown as SpeciesFormData["family"],
  alternativeCommonNames: [],
  links: [],
  idTips: [],
}

type SpeciesFormProps = {
  mode: "new" | "edit"
  initialValues?: SpeciesFormData
  onSubmit: (data: ApiSpecies) => void
  onCancel: () => void
  isPending: boolean
  error?: { message: string } | null
  onDelete?: () => void
  isDeleting?: boolean
}

export const SpeciesForm = ({
  mode,
  initialValues,
  onSubmit,
  onCancel,
  isPending,
  error,
  onDelete,
  isDeleting,
}: SpeciesFormProps) => {
  const formId = useId()
  const form = useForm<SpeciesFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues ?? emptyFormData,
  })

  const altNames = useFieldArray({ control: form.control, name: "alternativeCommonNames" })
  const links = useFieldArray({ control: form.control, name: "links" })
  const tips = useFieldArray({ control: form.control, name: "idTips" })

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

  const handleFormSubmit = (data: SpeciesFormData) => onSubmit(formDataToApiSpecies(data))

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
        <select
          id={`${formId}-family`}
          {...form.register("family")}
          className="border-input bg-background text-foreground focus-visible:ring-ring/50 flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
        >
          <option value="">Select a family...</option>
          {FAMILIES.map((family) => (
            <option key={family} value={family}>
              {family}
            </option>
          ))}
        </select>
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
        <div className="bg-muted/30 space-y-2 rounded-md border p-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd(altNames.fields, altNames.move)}
          >
            <SortableContext items={altNames.fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              {altNames.fields.map((field, index) => (
                <SortableItem key={field.id} id={field.id} showHandle={altNames.fields.length > 1}>
                  <div className="flex items-center gap-2">
                    <Input {...form.register(`alternativeCommonNames.${index}.value`)} className="flex-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => altNames.remove(index)}
                      aria-label="Remove name"
                    >
                      <Trash2 className="text-muted-foreground h-4 w-4" />
                    </Button>
                  </div>
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>
          <Button type="button" variant="outline" size="sm" onClick={() => altNames.append({ value: "" })}>
            <Plus className="h-4 w-4" />
            Add Name
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Links</Label>
        <div className="bg-muted/30 space-y-2 rounded-md border p-3">
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
                          className="w-1/3"
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
                            <ExternalLink className="text-muted-foreground h-4 w-4" />
                          </a>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => links.remove(index)}
                          aria-label="Remove link"
                        >
                          <Trash2 className="text-muted-foreground h-4 w-4" />
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
          <Button type="button" variant="outline" size="sm" onClick={() => links.append({ name: "", url: "" })}>
            <Plus className="h-4 w-4" />
            Add Link
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>ID Tips</Label>
        <div className="bg-muted/30 space-y-2 rounded-md border p-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd(tips.fields, tips.move)}
          >
            <SortableContext items={tips.fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              {tips.fields.map((field, index) => (
                <SortableItem key={field.id} id={field.id} showHandle={tips.fields.length > 1}>
                  <div className="flex items-center gap-2">
                    <Input {...form.register(`idTips.${index}.value`)} className="flex-1" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => tips.remove(index)}
                      aria-label="Remove tip"
                    >
                      <Trash2 className="text-muted-foreground h-4 w-4" />
                    </Button>
                  </div>
                </SortableItem>
              ))}
            </SortableContext>
          </DndContext>
          <Button type="button" variant="outline" size="sm" onClick={() => tips.append({ value: "" })}>
            <Plus className="h-4 w-4" />
            Add Tip
          </Button>
        </div>
      </div>

      {error && <div className="text-destructive text-sm">{error.message}</div>}

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
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
