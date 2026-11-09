"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button, Card, CardContent, CardHeader, CardTitle } from "@wortle/ui"
import { ArrowLeft } from "lucide-react"

import { useRouter } from "next/navigation"

import { TaxonForm } from "@/components/TaxonForm"
import { useGoBack } from "@/hooks/useGoBack"
import { useTRPC } from "@/trpc/client"

export default function NewTaxonPage() {
  const router = useRouter()
  const goBack = useGoBack("/taxa")
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const listKey = trpc.taxa.list.queryKey()

  const createMutation = useMutation(
    trpc.taxa.create.mutationOptions({
      onMutate: async (newTaxon) => {
        await queryClient.cancelQueries({ queryKey: listKey })
        const previous = queryClient.getQueryData(listKey)
        queryClient.setQueryData(listKey, (old) => [...(old ?? []), newTaxon])
        return { previous }
      },
      onError: (_err, _newTaxon, context) => {
        if (context?.previous) {
          queryClient.setQueryData(listKey, context.previous)
        }
      },
      onSuccess: (_data, variables) => router.push(`/taxa/${variables.id}/edit`),
    }),
  )

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" aria-label="Go back" onClick={goBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>New Taxon</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <TaxonForm
            mode="new"
            onSubmit={(data) => createMutation.mutate(data)}
            onCancel={goBack}
            isPending={createMutation.isPending}
            error={createMutation.error}
          />
        </CardContent>
      </Card>
    </div>
  )
}
