"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { Button } from "@wortle/ui"
import { z } from "zod"

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
  idTips: z.array(z.object({ value: z.string() })),
})

type FormData = z.infer<typeof formSchema>

export default function EditSpeciesPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { data: species, isLoading } = trpc.species.get.useQuery({ id: params.id })

  const updateMutation = trpc.species.update.useMutation({
    onSuccess: () => router.push("/species"),
  })

  const deleteMutation = trpc.species.delete.useMutation({
    onSuccess: () => router.push("/species"),
  })

  const handleDelete = () => {
    if (confirm(`Delete "${species?.commonName}"?`)) {
      deleteMutation.mutate({ id: params.id })
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
        idTips: species.idTips.map((t) => ({ value: t })),
      })
    }
  }, [species, form])

  const altNames = useFieldArray({ control: form.control, name: "alternativeCommonNames" })
  const tips = useFieldArray({ control: form.control, name: "idTips" })

  const onSubmit = (data: FormData) => {
    updateMutation.mutate({
      id: data.id,
      commonName: data.commonName,
      scientificName: data.scientificName,
      family: data.family,
      alternativeCommonNames: data.alternativeCommonNames.map((n) => n.value).filter(Boolean),
      links: species?.links ?? [],
      idTips: data.idTips.map((t) => t.value).filter(Boolean),
    })
  }

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
