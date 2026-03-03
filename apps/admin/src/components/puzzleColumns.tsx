"use client"

import { type Column, type ColumnDef } from "@tanstack/react-table"
import { Button } from "@wortle/ui"
import { ArrowDown, ArrowUp, ArrowUpDown, Check, TriangleAlert } from "lucide-react"

import { type ApiPuzzle } from "@/api/puzzleTypes"

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

export const puzzleColumns: ColumnDef<ApiPuzzle>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => <SortableHeader column={column} label="ID" />,
    cell: ({ row }) => <span className="font-mono text-sm">{row.getValue("id")}</span>,
  },
  {
    accessorKey: "speciesId",
    header: ({ column }) => <SortableHeader column={column} label="Taxon ID" />,
    cell: ({ row }) => <span className="font-mono text-sm">{row.getValue("speciesId")}</span>,
  },
  {
    accessorKey: "observationDate",
    header: ({ column }) => <SortableHeader column={column} label="Date" />,
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => <span>{row.original.location.description}</span>,
  },
  {
    accessorKey: "images",
    header: "Images",
    cell: ({ row }) => <span>{row.original.images.length}</span>,
  },
  {
    accessorKey: "imagesSynced",
    header: ({ column }) => <SortableHeader column={column} label="Images Synced" />,
    cell: ({ row }) =>
      row.original.imagesSynced ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <TriangleAlert className="h-4 w-4 text-amber-500" />
      ),
  },
]
