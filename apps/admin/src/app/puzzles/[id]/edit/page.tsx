"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { PuzzleId } from "@wortle/shared"
import { Button, Card, CardContent, CardHeader, CardTitle } from "@wortle/ui"
import { ArrowLeft, Check, TriangleAlert } from "lucide-react"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

import { ConfirmDeletePuzzleDialog } from "@/components/ConfirmDeletePuzzleDialog"
import { apiPuzzleToFormData, FormMode, PuzzleForm } from "@/components/PuzzleForm"
import { useGoBack } from "@/hooks/useGoBack"
import { useTRPC } from "@/trpc/client"

export default function EditPuzzlePage() {
  const router = useRouter()
  const goBack = useGoBack("/puzzles")
  const params = useParams<{ id: string }>()
  const puzzleId = PuzzleId(Number(params.id))
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { data: puzzle, isLoading } = useQuery(trpc.puzzles.get.queryOptions(puzzleId))

  const listKey = trpc.puzzles.list.queryKey()

  const updateMutation = useMutation(
    trpc.puzzles.update.mutationOptions({
      onMutate: async (updatedPuzzle) => {
        const getKey = trpc.puzzles.get.queryKey(updatedPuzzle.id)
        await queryClient.cancelQueries({ queryKey: listKey })
        await queryClient.cancelQueries({ queryKey: getKey })
        const previousList = queryClient.getQueryData(listKey)
        const previousGet = queryClient.getQueryData(getKey)
        const optimistic = { ...updatedPuzzle, imagesSynced: false }
        queryClient.setQueryData(listKey, (old) => old?.map((p) => (p.id === updatedPuzzle.id ? optimistic : p)))
        queryClient.setQueryData(getKey, optimistic)
        return { previousList, previousGet }
      },
      onError: (_err, updatedPuzzle, context) => {
        if (context?.previousList) {
          queryClient.setQueryData(listKey, context.previousList)
        }
        if (context?.previousGet) {
          queryClient.setQueryData(trpc.puzzles.get.queryKey(updatedPuzzle.id), context.previousGet)
        }
      },
    }),
  )

  const deleteMutation = useMutation(
    trpc.puzzles.delete.mutationOptions({
      onMutate: async (id) => {
        await queryClient.cancelQueries({ queryKey: listKey })
        const previous = queryClient.getQueryData(listKey)
        queryClient.setQueryData(listKey, (old) => old?.filter((p) => p.id !== id))
        return { previous }
      },
      onError: (_err, _input, context) => {
        if (context?.previous) {
          queryClient.setQueryData(listKey, context.previous)
        }
      },
      onSuccess: () => router.push("/puzzles"),
    }),
  )

  const confirmDelete = () => {
    deleteMutation.mutate(puzzleId)
    setDeleteDialogOpen(false)
  }

  if (isLoading) return <div>Loading...</div>
  if (!puzzle) return <div>Puzzle not found</div>

  const error = updateMutation.error ?? deleteMutation.error

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" aria-label="Go back" onClick={goBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Edit Puzzle #{puzzle.id}</CardTitle>
            <span className="ml-auto">
              {puzzle.imagesSynced ? (
                <span className="flex items-center gap-1 text-sm font-normal text-green-600">
                  <Check className="h-4 w-4" /> Images synced
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sm font-normal text-amber-500">
                  <TriangleAlert className="h-4 w-4" /> Images pending sync
                </span>
              )}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <PuzzleForm
            mode={FormMode.EDIT}
            initialValues={apiPuzzleToFormData(puzzle)}
            onSubmit={(data) => updateMutation.mutate(data)}
            onCancel={goBack}
            isPending={updateMutation.isPending}
            error={error}
            onDelete={() => setDeleteDialogOpen(true)}
            isDeleting={deleteMutation.isPending}
          />
        </CardContent>
      </Card>

      <ConfirmDeletePuzzleDialog
        puzzleId={puzzle.id}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
