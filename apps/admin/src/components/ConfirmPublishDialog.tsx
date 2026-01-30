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

import type { Option } from "@wortle/shared"

type ConfirmPublishDialogProps = {
  speciesCount: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isPublishing: boolean
  error: Option<string>
}

export const ConfirmPublishDialog = ({
  speciesCount,
  open,
  onOpenChange,
  onConfirm,
  isPublishing,
  error,
}: ConfirmPublishDialogProps) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Publish species data?</AlertDialogTitle>
        <AlertDialogDescription>
          This will upload {speciesCount} species to the live data bucket. The changes will be visible to all users.
        </AlertDialogDescription>
      </AlertDialogHeader>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isPublishing}>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm} disabled={isPublishing}>
          {isPublishing ? "Publishing..." : "Publish"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)
