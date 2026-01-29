"use client"

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
    onSuccess: () => router.push("/species"),
  })

  return (
    <div className="max-w-xl">
      <h2 className="mb-4 text-xl font-semibold">New Species</h2>
      <SpeciesForm
        mode="new"
        onSubmit={(data) => createMutation.mutate(data)}
        onCancel={() => router.push("/species")}
        isPending={createMutation.isPending}
        error={createMutation.error}
      />
    </div>
  )
}
