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
  puzzleCount: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isPublishing: boolean
  error: Option<string>
}

export const ConfirmPublishDialog = ({
  speciesCount,
  puzzleCount,
  open,
  onOpenChange,
  onConfirm,
  isPublishing,
  error,
}: ConfirmPublishDialogProps) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Publish game data?</AlertDialogTitle>
        <AlertDialogDescription>
          This will upload {speciesCount} species and {puzzleCount} puzzles to the live data bucket. The changes will be
          visible to all users.
        </AlertDialogDescription>
      </AlertDialogHeader>
      {error && (
        <div className="bg-destructive/10 border-destructive/30 rounded-md border px-4 py-3">
          <p className="text-destructive text-sm font-medium">{error}</p>
        </div>
      )}
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isPublishing}>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={(e) => {
            e.preventDefault()
            onConfirm()
          }}
          disabled={isPublishing}
        >
          {isPublishing ? "Publishing..." : "Publish"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)
