"use client"

import {
  type ColumnDef,
  columnFilteringFeature,
  createFilteredRowModel,
  createSortedRowModel,
  flexRender,
  globalFilteringFeature,
  type RowData,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_datetime,
  sortFn_text,
  type SortingState,
  tableFeatures,
  useTable,
} from "@tanstack/react-table"
import { Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@wortle/ui"
import { useState } from "react"

const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  sortedRowModel: createSortedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text, datetime: sortFn_datetime },
})

export type DataTableFeatures = typeof dataTableFeatures

type DataTableProps<TData extends RowData> = {
  columns: ColumnDef<DataTableFeatures, TData>[]
  data: TData[]
  filterPlaceholder?: string
  onRowClick?: (row: TData) => void
}

export const DataTable = <TData extends RowData>({
  columns,
  data,
  filterPlaceholder = "Filter...",
  onRowClick,
}: DataTableProps<TData>) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")

  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
  })

  const rows = table.getRowModel().rows

  return (
    <div className="space-y-4">
      <Input
        placeholder={filterPlaceholder}
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={onRowClick ? "cursor-pointer" : ""}
                >
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
