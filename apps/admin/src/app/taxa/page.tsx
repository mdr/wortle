"use client"

import { Button, Card, CardContent, CardHeader, CardTitle } from "@wortle/ui"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { DataTable } from "@/components/DataTable"
import { taxaColumns } from "@/components/taxaColumns"
import { trpc } from "@/trpc/client"

export default function TaxaPage() {
  const router = useRouter()
  const { data: taxa, isLoading, error } = trpc.taxa.list.useQuery()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Taxa ({taxa?.length ?? 0})</CardTitle>
          <Button asChild>
            <Link href="/taxa/new">Add Taxon</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={taxaColumns}
          data={taxa ?? []}
          filterPlaceholder="Filter by ID, name..."
          onRowClick={(row) => router.push(`/taxa/${row.id}/edit`)}
        />
      </CardContent>
    </Card>
  )
}
