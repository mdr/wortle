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
import { ExternalLink } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { Button } from "@wortle/ui"
import { z } from "zod"

import { type ApiSpecies } from "@/api/types"
import { SortableItem } from "@/components/SortableItem"
import { FAMILIES } from "@/constants/families"
import { trpc } from "@/trpc/client"

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

type FormData = z.infer<typeof formSchema>

const formDataToApiSpecies = (data: FormData): ApiSpecies => ({
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

export default function EditSpeciesPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const utils = trpc.useUtils()
  const { data: species, isLoading } = trpc.species.get.useQuery({ id: SpeciesId(params.id) })

  const updateMutation = trpc.species.update.useMutation({
    onMutate: async (updatedSpecies) => {
      await utils.species.list.cancel()
      const previous = utils.species.list.getData()
      utils.species.list.setData(undefined, (old) => old?.map((s) => (s.id === updatedSpecies.id ? updatedSpecies : s)))
      return { previous }
    },
    onError: (_err, _updatedSpecies, context) => {
      if (context?.previous) {
        utils.species.list.setData(undefined, context.previous)
      }
    },
    onSuccess: () => router.push("/species"),
  })

  const deleteMutation = trpc.species.delete.useMutation({
    onMutate: async ({ id }) => {
      await utils.species.list.cancel()
      const previous = utils.species.list.getData()
      utils.species.list.setData(undefined, (old) => old?.filter((s) => s.id !== id))
      return { previous }
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        utils.species.list.setData(undefined, context.previous)
      }
    },
    onSuccess: () => router.push("/species"),
  })

  const handleDelete = () => {
    if (confirm(`Delete "${species?.commonName}"?`)) {
      deleteMutation.mutate({ id: SpeciesId(params.id) })
    }
  }

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      commonName: "",
      scientificName: "",
      family: undefined,
      alternativeCommonNames: [],
      links: [],
      idTips: [],
    },
  })

  useEffect(() => {
    if (species) {
      form.reset({
        id: species.id,
        commonName: species.commonName,
        scientificName: species.scientificName,
        family: species.family as FormData["family"],
        alternativeCommonNames: species.alternativeCommonNames.map((n) => ({ value: n })),
        links: species.links.map((l) => ({ name: l.name, url: l.url })),
        idTips: species.idTips.map((t) => ({ value: t })),
      })
    }
  }, [species, form])

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

  const onSubmit = (data: FormData) => updateMutation.mutate(formDataToApiSpecies(data))

  if (isLoading) return <div>Loading...</div>
  if (!species) return <div>Species not found</div>

  return (
    <div className="max-w-xl">
      <h2 className="mb-4 text-xl font-semibold">Edit Species</h2>
      <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">ID (BSBI DDB)</label>
          <input {...form.register("id")} className="w-full rounded border bg-gray-100 p-2" disabled />
          {form.formState.errors.id && <p className="mt-1 text-sm text-red-600">{form.formState.errors.id.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Scientific Name</label>
          <input
            {...form.register("scientificName")}
            className="w-full rounded border p-2"
            placeholder="Genus species"
          />
          {form.formState.errors.scientificName && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.scientificName.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Family</label>
          <select {...form.register("family")} className="w-full rounded border bg-white p-2">
            <option value="">Select a family...</option>
            {FAMILIES.map((family) => (
              <option key={family} value={family}>
                {family}
              </option>
            ))}
          </select>
          {form.formState.errors.family && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.family.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Common Name</label>
          <input {...form.register("commonName")} className="w-full rounded border p-2" />
          {form.formState.errors.commonName && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.commonName.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Alternative Common Names</label>
          <div className="space-y-2">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd(altNames.fields, altNames.move)}
            >
              <SortableContext items={altNames.fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                {altNames.fields.map((field, index) => (
                  <SortableItem key={field.id} id={field.id} showHandle={altNames.fields.length > 1}>
                    <div className="flex gap-2">
                      <input
                        {...form.register(`alternativeCommonNames.${index}.value`)}
                        className="flex-1 rounded border p-2"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={() => altNames.remove(index)}>
                        Remove
                      </Button>
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
            <Button type="button" variant="outline" size="sm" onClick={() => altNames.append({ value: "" })}>
              Add Name
            </Button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Links</label>
          <div className="space-y-2">
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
                        <div className="flex gap-2">
                          <input
                            {...form.register(`links.${index}.name`)}
                            placeholder="Name"
                            className={`w-1/3 rounded border p-2 ${nameError ? "border-red-500" : ""}`}
                          />
                          <input
                            {...form.register(`links.${index}.url`)}
                            placeholder="URL"
                            className={`flex-1 rounded border p-2 ${urlError ? "border-red-500" : ""}`}
                          />
                          <a
                            href={url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center rounded border px-2 ${
                              url && !urlError ? "hover:bg-gray-100" : "pointer-events-none opacity-30"
                            }`}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                          <Button type="button" variant="outline" size="sm" onClick={() => links.remove(index)}>
                            Remove
                          </Button>
                        </div>
                        {(nameError || urlError) && (
                          <p className="text-sm text-red-600">{nameError?.message || urlError?.message}</p>
                        )}
                      </div>
                    </SortableItem>
                  )
                })}
              </SortableContext>
            </DndContext>
            <Button type="button" variant="outline" size="sm" onClick={() => links.append({ name: "", url: "" })}>
              Add Link
            </Button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">ID Tips</label>
          <div className="space-y-2">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd(tips.fields, tips.move)}
            >
              <SortableContext items={tips.fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                {tips.fields.map((field, index) => (
                  <SortableItem key={field.id} id={field.id} showHandle={tips.fields.length > 1}>
                    <div className="flex gap-2">
                      <input {...form.register(`idTips.${index}.value`)} className="flex-1 rounded border p-2" />
                      <Button type="button" variant="outline" size="sm" onClick={() => tips.remove(index)}>
                        Remove
                      </Button>
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
            <Button type="button" variant="outline" size="sm" onClick={() => tips.append({ value: "" })}>
              Add Tip
            </Button>
          </div>
        </div>

        {updateMutation.error && <div className="text-sm text-red-600">{updateMutation.error.message}</div>}
        {deleteMutation.error && <div className="text-sm text-red-600">{deleteMutation.error.message}</div>}

        <div className="flex gap-2">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/species")}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="ml-auto"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </form>
    </div>
  )
}
