"use client"

import { Button, Card, CardContent, CardHeader, CardTitle } from "@wortle/ui"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { ConfirmPublishDialog } from "@/components/ConfirmPublishDialog"
import { DataTable } from "@/components/DataTable"
import { speciesColumns } from "@/components/speciesColumns"
import { trpc } from "@/trpc/client"

export default function SpeciesPage() {
  const router = useRouter()
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const { data: species, isLoading, error } = trpc.species.list.useQuery()

  const publishMutation = trpc.publish.species.useMutation({
    onSuccess: () => {
      setPublishDialogOpen(false)
    },
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Species ({species?.length ?? 0})</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPublishDialogOpen(true)}>
                Publish
              </Button>
              <Button asChild>
                <Link href="/species/new">Add Species</Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={speciesColumns}
            data={species ?? []}
            filterPlaceholder="Filter by ID, name..."
            onRowClick={(row) => router.push(`/species/${row.id}/edit`)}
          />
        </CardContent>
      </Card>
      <ConfirmPublishDialog
        speciesCount={species?.length ?? 0}
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        onConfirm={() => publishMutation.mutate()}
        isPublishing={publishMutation.isPending}
        error={publishMutation.error?.message}
      />
    </>
  )
}
