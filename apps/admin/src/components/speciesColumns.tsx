"use client"

import { type Column, type ColumnDef } from "@tanstack/react-table"
import { Button } from "@wortle/ui"
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"

import { type ApiSpecies } from "@/api/types"

const SortableHeader = <T,>({ column, label }: { column: Column<T>; label: string }) => {
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

export const speciesColumns: ColumnDef<ApiSpecies>[] = [
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
