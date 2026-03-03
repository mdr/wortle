"use client"

import { TaxonId } from "@wortle/shared"
import { Button, Card, CardContent, CardHeader, CardTitle } from "@wortle/ui"
import { ArrowLeft } from "lucide-react"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

import { ConfirmDeleteTaxonDialog } from "@/components/ConfirmDeleteTaxonDialog"
import { apiTaxonToFormData, TaxonForm } from "@/components/TaxonForm"
import { useGoBack } from "@/hooks/useGoBack"
import { trpc } from "@/trpc/client"

export default function EditTaxonPage() {
  const router = useRouter()
  const goBack = useGoBack("/taxa")
  const params = useParams<{ id: string }>()
  const utils = trpc.useUtils()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { data: taxon, isLoading } = trpc.taxa.get.useQuery(TaxonId(params.id))

  const updateMutation = trpc.taxa.update.useMutation({
    onMutate: async (updatedTaxon) => {
      await utils.taxa.list.cancel()
      await utils.taxa.get.cancel(updatedTaxon.id)
      const previousList = utils.taxa.list.getData()
      const previousGet = utils.taxa.get.getData(updatedTaxon.id)
      utils.taxa.list.setData(undefined, (old) => old?.map((s) => (s.id === updatedTaxon.id ? updatedTaxon : s)))
      utils.taxa.get.setData(updatedTaxon.id, updatedTaxon)
      return { previousList, previousGet }
    },
    onError: (_err, updatedTaxon, context) => {
      if (context?.previousList) {
        utils.taxa.list.setData(undefined, context.previousList)
      }
      if (context?.previousGet) {
        utils.taxa.get.setData(updatedTaxon.id, context.previousGet)
      }
    },
  })

  const deleteMutation = trpc.taxa.delete.useMutation({
    onMutate: async (taxonId) => {
      await utils.taxa.list.cancel()
      const previous = utils.taxa.list.getData()
      utils.taxa.list.setData(undefined, (old) => old?.filter((s) => s.id !== taxonId))
      return { previous }
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        utils.taxa.list.setData(undefined, context.previous)
      }
    },
    onSuccess: () => router.push("/taxa"),
  })

  const confirmDelete = () => {
    deleteMutation.mutate(TaxonId(params.id))
    setDeleteDialogOpen(false)
  }

  if (isLoading) return <div>Loading...</div>
  if (!taxon) return <div>Taxon not found</div>

  const error = updateMutation.error ?? deleteMutation.error

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" aria-label="Go back" onClick={goBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Edit Taxon</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <TaxonForm
            mode="edit"
            initialValues={apiTaxonToFormData(taxon)}
            onSubmit={(data) => updateMutation.mutate(data)}
            onCancel={goBack}
            isPending={updateMutation.isPending}
            error={error}
            onDelete={() => setDeleteDialogOpen(true)}
            isDeleting={deleteMutation.isPending}
          />
        </CardContent>
      </Card>

      <ConfirmDeleteTaxonDialog
        taxonName={taxon.commonName}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
