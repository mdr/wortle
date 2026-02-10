"use client"

import { PuzzleId } from "@wortle/shared"
import { Button, Card, CardContent, CardHeader, CardTitle } from "@wortle/ui"
import { ArrowLeft, Check, TriangleAlert } from "lucide-react"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"

import { ConfirmDeletePuzzleDialog } from "@/components/ConfirmDeletePuzzleDialog"
import { apiPuzzleToFormData, FormMode, PuzzleForm } from "@/components/PuzzleForm"
import { useGoBack } from "@/hooks/useGoBack"
import { trpc } from "@/trpc/client"

export default function EditPuzzlePage() {
  const router = useRouter()
  const goBack = useGoBack("/puzzles")
  const params = useParams<{ id: string }>()
  const puzzleId = PuzzleId(Number(params.id))
  const utils = trpc.useUtils()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const { data: puzzle, isLoading } = trpc.puzzles.get.useQuery(puzzleId)

  const updateMutation = trpc.puzzles.update.useMutation({
    onMutate: async (updatedPuzzle) => {
      await utils.puzzles.list.cancel()
      await utils.puzzles.get.cancel(updatedPuzzle.id)
      const previousList = utils.puzzles.list.getData()
      const previousGet = utils.puzzles.get.getData(updatedPuzzle.id)
      const optimistic = { ...updatedPuzzle, imagesSynced: false }
      utils.puzzles.list.setData(undefined, (old) => old?.map((p) => (p.id === updatedPuzzle.id ? optimistic : p)))
      utils.puzzles.get.setData(updatedPuzzle.id, optimistic)
      return { previousList, previousGet }
    },
    onError: (_err, updatedPuzzle, context) => {
      if (context?.previousList) {
        utils.puzzles.list.setData(undefined, context.previousList)
      }
      if (context?.previousGet) {
        utils.puzzles.get.setData(updatedPuzzle.id, context.previousGet)
      }
    },
  })

  const deleteMutation = trpc.puzzles.delete.useMutation({
    onMutate: async (id) => {
      await utils.puzzles.list.cancel()
      const previous = utils.puzzles.list.getData()
      utils.puzzles.list.setData(undefined, (old) => old?.filter((p) => p.id !== id))
      return { previous }
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        utils.puzzles.list.setData(undefined, context.previous)
      }
    },
    onSuccess: () => router.push("/puzzles"),
  })

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
