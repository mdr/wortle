"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button, Card, CardContent, CardHeader, CardTitle } from "@wortle/ui"
import { ArrowLeft } from "lucide-react"

import { useRouter } from "next/navigation"

import { FormMode, PuzzleForm } from "@/components/PuzzleForm"
import { useGoBack } from "@/hooks/useGoBack"
import { useTRPC } from "@/trpc/client"

export default function NewPuzzlePage() {
  const router = useRouter()
  const goBack = useGoBack("/puzzles")
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const listKey = trpc.puzzles.list.queryKey()

  const createMutation = useMutation(
    trpc.puzzles.create.mutationOptions({
      onMutate: async (newPuzzle) => {
        await queryClient.cancelQueries({ queryKey: listKey })
        const previous = queryClient.getQueryData(listKey)
        queryClient.setQueryData(listKey, (old) => [...(old ?? []), { ...newPuzzle, imagesSynced: false }])
        return { previous }
      },
      onError: (_err, _newPuzzle, context) => {
        if (context?.previous) {
          queryClient.setQueryData(listKey, context.previous)
        }
      },
      onSuccess: (_data, variables) => router.push(`/puzzles/${variables.id}/edit`),
      onSettled: () => queryClient.invalidateQueries({ queryKey: listKey }),
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
            <CardTitle>New Puzzle</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <PuzzleForm
            mode={FormMode.NEW}
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
