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

type ConfirmDeleteTaxonDialogProps = {
  taxonName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export const ConfirmDeleteTaxonDialog = ({
  taxonName,
  open,
  onOpenChange,
  onConfirm,
}: ConfirmDeleteTaxonDialogProps) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete taxon?</AlertDialogTitle>
        <AlertDialogDescription>
          This will permanently delete "{taxonName}". This action cannot be undone.
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
