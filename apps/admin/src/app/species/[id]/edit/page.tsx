"use client"

import { SpeciesId } from "@wortle/shared"
import { useParams, useRouter } from "next/navigation"

import { apiSpeciesToFormData, SpeciesForm } from "@/components/SpeciesForm"
import { trpc } from "@/trpc/client"

export default function EditSpeciesPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const utils = trpc.useUtils()
  const { data: species, isLoading } = trpc.species.get.useQuery({ id: SpeciesId(params.id) })

  const updateMutation = trpc.species.update.useMutation({
    onMutate: async (updatedSpecies) => {
      await utils.species.list.cancel()
      await utils.species.get.cancel({ id: updatedSpecies.id })
      const previousList = utils.species.list.getData()
      const previousGet = utils.species.get.getData({ id: updatedSpecies.id })
      utils.species.list.setData(undefined, (old) => old?.map((s) => (s.id === updatedSpecies.id ? updatedSpecies : s)))
      utils.species.get.setData({ id: updatedSpecies.id }, updatedSpecies)
      return { previousList, previousGet }
    },
    onError: (_err, updatedSpecies, context) => {
      if (context?.previousList) {
        utils.species.list.setData(undefined, context.previousList)
      }
      if (context?.previousGet) {
        utils.species.get.setData({ id: updatedSpecies.id }, context.previousGet)
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

  if (isLoading) return <div>Loading...</div>
  if (!species) return <div>Species not found</div>

  const error = updateMutation.error ?? deleteMutation.error

  return (
    <div className="max-w-xl">
      <h2 className="mb-4 text-xl font-semibold">Edit Species</h2>
      <SpeciesForm
        mode="edit"
        initialValues={apiSpeciesToFormData(species)}
        onSubmit={(data) => updateMutation.mutate(data)}
        onCancel={() => router.push("/species")}
        isPending={updateMutation.isPending}
        error={error}
        onDelete={handleDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  )
}
