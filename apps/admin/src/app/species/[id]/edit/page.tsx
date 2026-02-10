"use client"

import { SpeciesId } from "@wortle/shared"
import { Button, Card, CardContent, CardHeader, CardTitle } from "@wortle/ui"
import { ArrowLeft } from "lucide-react"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

import { ConfirmDeleteSpeciesDialog } from "@/components/ConfirmDeleteSpeciesDialog"
import { apiSpeciesToFormData, SpeciesForm } from "@/components/SpeciesForm"
import { useGoBack } from "@/hooks/useGoBack"
import { trpc } from "@/trpc/client"

export default function EditSpeciesPage() {
  const router = useRouter()
  const goBack = useGoBack("/species")
  const params = useParams<{ id: string }>()
  const utils = trpc.useUtils()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { data: species, isLoading } = trpc.species.get.useQuery(SpeciesId(params.id))

  const updateMutation = trpc.species.update.useMutation({
    onMutate: async (updatedSpecies) => {
      await utils.species.list.cancel()
      await utils.species.get.cancel(updatedSpecies.id)
      const previousList = utils.species.list.getData()
      const previousGet = utils.species.get.getData(updatedSpecies.id)
      utils.species.list.setData(undefined, (old) => old?.map((s) => (s.id === updatedSpecies.id ? updatedSpecies : s)))
      utils.species.get.setData(updatedSpecies.id, updatedSpecies)
      return { previousList, previousGet }
    },
    onError: (_err, updatedSpecies, context) => {
      if (context?.previousList) {
        utils.species.list.setData(undefined, context.previousList)
      }
      if (context?.previousGet) {
        utils.species.get.setData(updatedSpecies.id, context.previousGet)
      }
    },
  })

  const deleteMutation = trpc.species.delete.useMutation({
    onMutate: async (speciesId) => {
      await utils.species.list.cancel()
      const previous = utils.species.list.getData()
      utils.species.list.setData(undefined, (old) => old?.filter((s) => s.id !== speciesId))
      return { previous }
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        utils.species.list.setData(undefined, context.previous)
      }
    },
    onSuccess: () => router.push("/species"),
  })

  const confirmDelete = () => {
    deleteMutation.mutate(SpeciesId(params.id))
    setDeleteDialogOpen(false)
  }

  if (isLoading) return <div>Loading...</div>
  if (!species) return <div>Species not found</div>

  const error = updateMutation.error ?? deleteMutation.error

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" aria-label="Go back" onClick={goBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Edit Species</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <SpeciesForm
            mode="edit"
            initialValues={apiSpeciesToFormData(species)}
            onSubmit={(data) => updateMutation.mutate(data)}
            onCancel={goBack}
            isPending={updateMutation.isPending}
            error={error}
            onDelete={() => setDeleteDialogOpen(true)}
            isDeleting={deleteMutation.isPending}
          />
        </CardContent>
      </Card>

      <ConfirmDeleteSpeciesDialog
        speciesName={species.commonName}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
