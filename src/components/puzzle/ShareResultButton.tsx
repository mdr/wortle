import { Check, Share2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/shadcn/Button"
import { getResultMedal } from "@/lib/resultMedal"
import { selectIsCorrect } from "@/services/puzzle/puzzleSelectors"
import { usePuzzleState } from "@/services/puzzle/puzzleServiceHooks"
import { Iso8601Date } from "@/utils/brandedTypes"
import { formatDate } from "@/utils/dateUtils"

const getOrdinal = (n: number): string => {
  if (n === 1) return "1st"
  if (n === 2) return "2nd"
  if (n === 3) return "3rd"
  return `${n}th`
}

const generateShareText = (
  scheduledDate: Iso8601Date,
  attemptCount: number,
  isCorrect: boolean,
  gaveUp: boolean,
): string => {
  const medal = gaveUp ? "❌" : getResultMedal({ attemptCount, isCorrect })
  const attemptText = gaveUp ? "gave up" : `${getOrdinal(attemptCount)} try`

  return `Wortle ${formatDate(scheduledDate, undefined, "medium")} ${medal} ${attemptText}

https://wortle.app`
}

const canShare = (): boolean => "share" in navigator && typeof navigator.share === "function"

export const ShareResultButton = () => {
  const { scheduledDate, attempts, gaveUp } = usePuzzleState()
  const isCorrect = usePuzzleState(selectIsCorrect)
  const [copied, setCopied] = useState(false)

  if (!scheduledDate) return null

  const shareText = generateShareText(scheduledDate, attempts.length, isCorrect, gaveUp)

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
