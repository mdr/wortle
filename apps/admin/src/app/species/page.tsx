"use client"

import { Button, Card, CardContent, CardHeader, CardTitle } from "@wortle/ui"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { DataTable } from "@/components/DataTable"
import { speciesColumns } from "@/components/speciesColumns"
import { trpc } from "@/trpc/client"

export default function SpeciesPage() {
  const router = useRouter()
  const { data: species, isLoading, error } = trpc.species.list.useQuery()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Species ({species?.length ?? 0})</CardTitle>
          <Button asChild>
            <Link href="/species/new">Add Species</Link>
          </Button>
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
  )
}
