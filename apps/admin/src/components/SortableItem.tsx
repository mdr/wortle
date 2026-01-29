"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { type ReactNode } from "react"

interface SortableItemProps {
  id: string
  children: ReactNode
  showHandle?: boolean
}

export function SortableItem({ id, children, showHandle = true }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2">
      {showHandle && (
        <button
          type="button"
          className="cursor-grab touch-none rounded p-1 hover:bg-gray-100 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </button>
      )}
      <div className="flex-1">{children}</div>
    </div>
  )
}
