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

type ConfirmDeleteSpeciesDialogProps = {
  speciesName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export const ConfirmDeleteSpeciesDialog = ({
  speciesName,
  open,
  onOpenChange,
  onConfirm,
}: ConfirmDeleteSpeciesDialogProps) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete species?</AlertDialogTitle>
        <AlertDialogDescription>
          This will permanently delete "{speciesName}". This action cannot be undone.
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
