"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@wortle/ui"

type ConfirmDeletePuzzleDialogProps = {
  puzzleId: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export const ConfirmDeletePuzzleDialog = ({
  puzzleId,
  open,
  onOpenChange,
  onConfirm,
}: ConfirmDeletePuzzleDialogProps) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete puzzle?</AlertDialogTitle>
        <AlertDialogDescription>
          This will permanently delete puzzle #{puzzleId}. This action cannot be undone.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction variant="destructive" onClick={onConfirm}>
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)
