"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { TaxonId } from "@wortle/shared"
import { Button, Card, CardContent, CardHeader, CardTitle } from "@wortle/ui"
import { ArrowLeft } from "lucide-react"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

import { ConfirmDeleteTaxonDialog } from "@/components/ConfirmDeleteTaxonDialog"
import { apiTaxonToFormData, TaxonForm } from "@/components/TaxonForm"
import { useGoBack } from "@/hooks/useGoBack"
import { useTRPC } from "@/trpc/client"

import { EditTaxonPageTestIds } from "./EditTaxonPageTestIds"

export default function EditTaxonPage() {
  const router = useRouter()
  const goBack = useGoBack("/taxa")
  const params = useParams<{ id: string }>()
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { data: taxon, isLoading } = useQuery(trpc.taxa.get.queryOptions(TaxonId(params.id)))

  const listKey = trpc.taxa.list.queryKey()

  const updateMutation = useMutation(
    trpc.taxa.update.mutationOptions({
      onMutate: async (updatedTaxon) => {
        const getKey = trpc.taxa.get.queryKey(updatedTaxon.id)
        await queryClient.cancelQueries({ queryKey: listKey })
        await queryClient.cancelQueries({ queryKey: getKey })
        const previousList = queryClient.getQueryData(listKey)
        const previousGet = queryClient.getQueryData(getKey)
        queryClient.setQueryData(listKey, (old) => old?.map((s) => (s.id === updatedTaxon.id ? updatedTaxon : s)))
        queryClient.setQueryData(getKey, updatedTaxon)
        return { previousList, previousGet }
      },
      onError: (_err, updatedTaxon, context) => {
        if (context?.previousList) {
          queryClient.setQueryData(listKey, context.previousList)
        }
        if (context?.previousGet) {
          queryClient.setQueryData(trpc.taxa.get.queryKey(updatedTaxon.id), context.previousGet)
        }
      },
      onSettled: (_data, _err, updatedTaxon) =>
        Promise.all([
          queryClient.invalidateQueries({ queryKey: listKey }),
          queryClient.invalidateQueries({ queryKey: trpc.taxa.get.queryKey(updatedTaxon.id) }),
        ]),
    }),
  )

  const deleteMutation = useMutation(
    trpc.taxa.delete.mutationOptions({
      onMutate: async (taxonId) => {
        await queryClient.cancelQueries({ queryKey: listKey })
        const previous = queryClient.getQueryData(listKey)
        queryClient.setQueryData(listKey, (old) => old?.filter((s) => s.id !== taxonId))
        return { previous }
      },
      onError: (_err, _input, context) => {
        if (context?.previous) {
          queryClient.setQueryData(listKey, context.previous)
        }
      },
      onSuccess: () => router.push("/taxa"),
      onSettled: () => queryClient.invalidateQueries({ queryKey: listKey }),
    }),
  )

  const confirmDelete = () => {
    deleteMutation.mutate(TaxonId(params.id))
    setDeleteDialogOpen(false)
  }

  if (isLoading) return <div>Loading...</div>
  if (!taxon) return <div>Taxon not found</div>

  const error = updateMutation.error ?? deleteMutation.error

  return (
    <div className="mx-auto max-w-3xl">
      <Card data-testid={EditTaxonPageTestIds.page}>
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
