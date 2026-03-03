"use client"

import { Button, Card, CardContent, CardHeader, CardTitle } from "@wortle/ui"
import { ArrowLeft } from "lucide-react"

import { useRouter } from "next/navigation"

import { TaxonForm } from "@/components/TaxonForm"
import { useGoBack } from "@/hooks/useGoBack"
import { trpc } from "@/trpc/client"

export default function NewTaxonPage() {
  const router = useRouter()
  const goBack = useGoBack("/taxa")
  const utils = trpc.useUtils()

  const createMutation = trpc.taxa.create.useMutation({
    onMutate: async (newTaxon) => {
      await utils.taxa.list.cancel()
      const previous = utils.taxa.list.getData()
      utils.taxa.list.setData(undefined, (old) => [...(old ?? []), newTaxon])
      return { previous }
    },
    onError: (_err, _newTaxon, context) => {
      if (context?.previous) {
        utils.taxa.list.setData(undefined, context.previous)
      }
    },
    onSuccess: (_data, variables) => router.push(`/taxa/${variables.id}/edit`),
  })

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
