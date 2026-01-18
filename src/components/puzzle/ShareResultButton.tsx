import { Check, Share2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/shadcn/Button"
import { DailyResult } from "@/lib/gameStorage/GameState"
import { getResultMedal } from "@/lib/resultMedal"
import { PuzzleOutcome } from "@/services/puzzle/PuzzleService"
import { usePuzzleState } from "@/services/puzzle/puzzleServiceHooks"
import { Iso8601Date } from "@/utils/brandedTypes"
import { formatDate } from "@/utils/dateUtils"

export const isShareableOutcome = (outcome: PuzzleOutcome): boolean => {
  switch (outcome) {
    case PuzzleOutcome.CORRECT:
    case PuzzleOutcome.OUT_OF_ATTEMPTS:
      return true
    case PuzzleOutcome.GAVE_UP:
    case PuzzleOutcome.NOT_COMPLETED:
    case PuzzleOutcome.DID_NOT_ATTEMPT:
      return false
  }
}

const getOrdinal = (n: number): string => {
  if (n === 1) return "1st"
  if (n === 2) return "2nd"
  if (n === 3) return "3rd"
  return `${n}th`
}

const generateShareText = (scheduledDate: Iso8601Date, attemptCount: number, outcome: PuzzleOutcome): string => {
  const isCorrect = outcome === PuzzleOutcome.CORRECT
  const isGaveUpOrNotCompleted = outcome === PuzzleOutcome.GAVE_UP || outcome === PuzzleOutcome.NOT_COMPLETED
  const result = isCorrect ? DailyResult.PASS : DailyResult.FAIL
  const medal = isGaveUpOrNotCompleted ? "❌" : getResultMedal({ attemptCount, result })
  const attemptText = isGaveUpOrNotCompleted ? "gave up" : `${getOrdinal(attemptCount)} try`

  return `Wortle ${formatDate(scheduledDate, { dateStyle: "medium" })} ${medal} ${attemptText}

https://wortle.app`
}

const canShare = (): boolean => "share" in navigator && typeof navigator.share === "function"

export const ShareResultButton = () => {
  const { scheduledDate, attempts, outcome } = usePuzzleState()
  const [copied, setCopied] = useState(false)

  if (!scheduledDate || !outcome || !isShareableOutcome(outcome)) return null

  const shareText = generateShareText(scheduledDate, attempts.length, outcome)

  const handleShare = () => {
    const doShare = async () => {
      if (canShare()) {
        try {
          await navigator.share({ text: shareText })
          return
        } catch {
          // User cancelled or share failed, fall through to clipboard
        }
      }

      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    void doShare()
  }

  return (
    <Button onClick={handleShare} variant="outline" className="w-full bg-transparent" size="sm">
      {copied ? (
        <>
          <Check className="mr-2 size-4" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="mr-2 size-4" />
          Share Result
        </>
      )}
    </Button>
  )
}
