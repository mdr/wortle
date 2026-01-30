"use client"

import { Button, Card, CardContent, CardHeader, CardTitle } from "@wortle/ui"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { SpeciesForm } from "@/components/SpeciesForm"
import { trpc } from "@/trpc/client"

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
    onSuccess: (_data, variables) => router.push(`/species/${variables.id}/edit`),
  })

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" asChild>
              <Link href="/species" aria-label="Back to species list">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <CardTitle>New Species</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <SpeciesForm
            mode="new"
            onSubmit={(data) => createMutation.mutate(data)}
            onCancel={() => router.push("/species")}
            isPending={createMutation.isPending}
            error={createMutation.error}
          />
        </CardContent>
      </Card>
    </div>
  )
}
