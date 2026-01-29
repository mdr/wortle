"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CommonName, Family, ScientificName, SpeciesId, Url } from "@wortle/shared"
import { ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import { useFieldArray, useForm } from "react-hook-form"
import { Button } from "@wortle/ui"
import { z } from "zod"

import { type ApiSpecies } from "@/api/types"
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

export default function NewSpeciesPage() {
  const router = useRouter()
  const utils = trpc.useUtils()
  const createMutation = trpc.species.create.useMutation({
    onMutate: async (newSpecies) => {
      await utils.species.list.cancel()
      const previous = utils.species.list.getData()
      utils.species.list.setData(undefined, (old) => [...(old ?? []), newSpecies])
      return { previous }
    },
    onError: (_err, _newSpecies, context) => {
      if (context?.previous) {
        utils.species.list.setData(undefined, context.previous)
      }
    },
    onSuccess: () => router.push("/species"),
  })

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

  const altNames = useFieldArray({ control: form.control, name: "alternativeCommonNames" })
  const links = useFieldArray({ control: form.control, name: "links" })
  const tips = useFieldArray({ control: form.control, name: "idTips" })

  const onSubmit = (data: FormData) => createMutation.mutate(formDataToApiSpecies(data))

  return (
    <div className="max-w-xl">
      <h2 className="mb-4 text-xl font-semibold">New Species</h2>
      <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">ID (BSBI DDB)</label>
          <input {...form.register("id")} className="w-full rounded border p-2" />
          {form.formState.errors.id && <p className="mt-1 text-sm text-red-600">{form.formState.errors.id.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Common Name</label>
          <input {...form.register("commonName")} className="w-full rounded border p-2" />
          {form.formState.errors.commonName && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.commonName.message}</p>
          )}
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
          <label className="mb-1 block text-sm font-medium">Alternative Common Names</label>
          <div className="space-y-2">
            {altNames.fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <input
                  {...form.register(`alternativeCommonNames.${index}.value`)}
                  className="flex-1 rounded border p-2"
                />
                <Button type="button" variant="outline" size="sm" onClick={() => altNames.remove(index)}>
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => altNames.append({ value: "" })}>
              Add Name
            </Button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Links</label>
          <div className="space-y-2">
            {links.fields.map((field, index) => {
              const url = form.watch(`links.${index}.url`)
              const nameError = form.formState.errors.links?.[index]?.name
              const urlError = form.formState.errors.links?.[index]?.url
              return (
                <div key={field.id} className="flex flex-col gap-1">
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
              )
            })}
            <Button type="button" variant="outline" size="sm" onClick={() => links.append({ name: "", url: "" })}>
              Add Link
            </Button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">ID Tips</label>
          <div className="space-y-2">
            {tips.fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <input {...form.register(`idTips.${index}.value`)} className="flex-1 rounded border p-2" />
                <Button type="button" variant="outline" size="sm" onClick={() => tips.remove(index)}>
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => tips.append({ value: "" })}>
              Add Tip
            </Button>
          </div>
        </div>

        {createMutation.error && <div className="text-sm text-red-600">{createMutation.error.message}</div>}

        <div className="flex gap-2">
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/species")}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
