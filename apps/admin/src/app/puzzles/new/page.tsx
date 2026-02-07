"use client"

import { Button, Card, CardContent, CardHeader, CardTitle } from "@wortle/ui"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { FormMode, PuzzleForm } from "@/components/PuzzleForm"
import { trpc } from "@/trpc/client"

export default function NewPuzzlePage() {
  const router = useRouter()
  const utils = trpc.useUtils()

  const createMutation = trpc.puzzles.create.useMutation({
    onMutate: async (newPuzzle) => {
      await utils.puzzles.list.cancel()
      const previous = utils.puzzles.list.getData()
      utils.puzzles.list.setData(undefined, (old) => [...(old ?? []), { ...newPuzzle, imagesSynced: false }])
      return { previous }
    },
    onError: (_err, _newPuzzle, context) => {
      if (context?.previous) {
        utils.puzzles.list.setData(undefined, context.previous)
      }
    },
    onSuccess: (_data, variables) => router.push(`/puzzles/${variables.id}/edit`),
  })

  return (
    <div className="mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon-sm" asChild>
              <Link href="/puzzles" aria-label="Back to puzzles list">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <CardTitle>New Puzzle</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <PuzzleForm
            mode={FormMode.NEW}
            onSubmit={(data) => createMutation.mutate(data)}
            onCancel={() => router.push("/puzzles")}
            isPending={createMutation.isPending}
            error={createMutation.error}
          />
        </CardContent>
      </Card>
    </div>
  )
}
