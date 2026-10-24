"use client"

import { type Column, type ColumnDef, type RowData } from "@tanstack/react-table"
import { Button } from "@wortle/ui"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

import { type DataTableFeatures } from "@/components/DataTable"
import { type ApiTaxon } from "@/api/types"

const SortableHeader = <T extends RowData>({
  column,
  label,
}: {
  column: Column<DataTableFeatures, T>
  label: string
}) => {
  const sorted = column.getIsSorted()
  return (
    <Button variant="ghost" size="sm" className="-ml-3" onClick={() => column.toggleSorting()}>
      {label}
      {sorted === "asc" ? (
        <ArrowUp className="ml-2 h-4 w-4" />
      ) : sorted === "desc" ? (
        <ArrowDown className="ml-2 h-4 w-4" />
      ) : (
        <ArrowUpDown className="text-muted-foreground/50 ml-2 h-4 w-4" />
      )}
    </Button>
  )
}

export const taxaColumns: ColumnDef<DataTableFeatures, ApiTaxon>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <SortableHeader column={column} label="ID" />,
    cell: ({ row }) => <span className="font-mono text-sm">{row.getValue("id")}</span>,
  },
  {
    accessorKey: "commonName",
    header: ({ column }) => <SortableHeader column={column} label="Common Name" />,
  },
  {
    accessorKey: "scientificName",
    header: ({ column }) => <SortableHeader column={column} label="Scientific Name" />,
    cell: ({ row }) => <span className="italic">{row.getValue("scientificName")}</span>,
  },
  {
    accessorKey: "family",
    header: ({ column }) => <SortableHeader column={column} label="Family" />,
  },
]
