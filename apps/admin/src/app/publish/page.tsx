"use client"

import { useState } from "react"
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, toast } from "@wortle/ui"

import { ConfirmPublishDialog } from "@/components/ConfirmPublishDialog"
import { trpc } from "@/trpc/client"

export default function PublishPage() {
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const { data: taxa } = trpc.taxa.list.useQuery()
  const { data: puzzles } = trpc.puzzles.list.useQuery()
  const { data: schedule } = trpc.schedule.list.useQuery()

  const publishMutation = trpc.publish.all.useMutation({
    onSuccess: () => {
      setPublishDialogOpen(false)
      toast.success("Published successfully")
    },
  })

  const openPublishDialog = () => {
    publishMutation.reset()
    setPublishDialogOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Publish</CardTitle>
          <CardDescription>Deploy game data to production</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              This will upload {taxa?.length ?? 0} taxa, {puzzles?.length ?? 0} puzzles, and {schedule?.length ?? 0}{" "}
              schedule entries to the live data bucket. The changes will be visible to all users.
            </p>
            <Button onClick={openPublishDialog}>Publish to Production</Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmPublishDialog
        taxaCount={taxa?.length ?? 0}
        puzzleCount={puzzles?.length ?? 0}
        scheduleEntryCount={schedule?.length ?? 0}
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        onConfirm={() => publishMutation.mutate()}
        isPublishing={publishMutation.isPending}
        error={publishMutation.error ? "Publish failed. Please try again." : undefined}
      />
    </>
  )
}
