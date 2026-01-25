import { Check, Share2 } from "lucide-react"
import { useState } from "react"

import { ShareResultTestIds } from "@/components/pages/puzzle/PuzzleTestIds"
import { Button } from "@/components/shadcn/Button"
import { PassOrFail } from "@/lib/gameStorage/HistoryRecord"
import { getResultMedal } from "@/lib/resultMedal"
import { PuzzleOutcome } from "@/services/puzzle/PuzzleService"
import { Iso8601Date } from "@/utils/brandedTypes"
import { formatDate } from "@/utils/dateUtils"
import { getOrdinal } from "@/utils/getOrdinal"

interface GenerateShareTextArgs {
  scheduledDate: Iso8601Date
  attemptCount: number
  outcome: PuzzleOutcome
}

export const generateShareText = ({ scheduledDate, attemptCount, outcome }: GenerateShareTextArgs): string => {
  const isCorrect = outcome === PuzzleOutcome.CORRECT
  const isGaveUpOrNotCompleted = outcome === PuzzleOutcome.GAVE_UP || outcome === PuzzleOutcome.NOT_COMPLETED
  const result = isCorrect ? PassOrFail.PASS : PassOrFail.FAIL
  const medal = isGaveUpOrNotCompleted ? "❌" : getResultMedal({ attemptCount, result })
  const attemptText = isGaveUpOrNotCompleted ? "gave up" : `${getOrdinal(attemptCount)} try`

  return `Wortle ${formatDate(scheduledDate, { dateStyle: "medium" })} ${medal} ${attemptText}

https://wortle.app`
}

const canShare = (): boolean => "share" in navigator && typeof navigator.share === "function"

export interface ShareResultButtonProps {
  scheduledDate: Iso8601Date
  attemptCount: number
  outcome: PuzzleOutcome
}

export const ShareResultButton = ({ scheduledDate, attemptCount, outcome }: ShareResultButtonProps) => {
  const [copied, setCopied] = useState(false)

  const shareText = generateShareText({ scheduledDate, attemptCount, outcome })

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
    <Button
      onClick={handleShare}
      variant="outline"
      className="w-full bg-transparent"
      size="sm"
      data-testid={ShareResultTestIds.button}
    >
      {copied ? (
        <span data-testid={ShareResultTestIds.copiedState}>
          <Check className="mr-2 inline size-4" />
          Copied!
        </span>
      ) : (
        <>
          <Share2 className="mr-2 size-4" />
          Share Result
        </>
      )}
    </Button>
  )
}
