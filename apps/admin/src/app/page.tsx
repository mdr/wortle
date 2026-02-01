"use client"

import Link from "next/link"
import { useState } from "react"
import { Leaf, Upload } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle, toast } from "@wortle/ui"

import { ConfirmPublishDialog } from "@/components/ConfirmPublishDialog"
import { trpc } from "@/trpc/client"

export default function Home() {
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const { data: species } = trpc.species.list.useQuery()

  const publishMutation = trpc.publish.all.useMutation({
    onSuccess: () => {
      setPublishDialogOpen(false)
      toast.success("Published successfully")
    },
    onError: () => {
      toast.error("Publish failed. Please try again.")
    },
  })

  const openPublishDialog = () => {
    publishMutation.reset()
    setPublishDialogOpen(true)
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/species">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-green-100 p-2">
                  <Leaf className="h-5 w-5 text-green-700" />
                </div>
                <div>
                  <CardTitle className="text-base">Species</CardTitle>
                  <CardDescription>{species?.length ?? 0} entries</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <button onClick={openPublishDialog} className="text-left">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-md bg-blue-100 p-2">
                  <Upload className="h-5 w-5 text-blue-700" />
                </div>
                <div>
                  <CardTitle className="text-base">Publish</CardTitle>
                  <CardDescription>Deploy to production</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </button>
      </div>

      <ConfirmPublishDialog
        speciesCount={species?.length ?? 0}
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        onConfirm={() => publishMutation.mutate()}
        isPublishing={publishMutation.isPending}
        error={publishMutation.error ? "Publish failed. Please try again." : undefined}
      />
    </>
  )
}
