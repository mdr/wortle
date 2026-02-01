"use client"

import { Button, Card, CardContent, CardHeader, CardTitle } from "@wortle/ui"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { DataTable } from "@/components/DataTable"
import { puzzleColumns } from "@/components/puzzleColumns"
import { trpc } from "@/trpc/client"

export default function PuzzlesPage() {
  const router = useRouter()
  const { data: puzzles, isLoading, error } = trpc.puzzles.list.useQuery()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Puzzles ({puzzles?.length ?? 0})</CardTitle>
          <Button asChild>
            <Link href="/puzzles/new">Add Puzzle</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={puzzleColumns}
          data={puzzles ?? []}
          filterPlaceholder="Filter by ID, species..."
          onRowClick={(row) => router.push(`/puzzles/${row.id}/edit`)}
        />
      </CardContent>
    </Card>
  )
}
