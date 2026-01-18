import { Card } from "@/components/shadcn/Card"
import { AttemptFeedback } from "@/lib/AttemptFeedback"
import { getSpecies } from "@/lib/species/plants"

import { AttemptHistoryTestIds } from "./PuzzleTestIds"

interface AttemptHistoryProps {
  attempts: AttemptFeedback[]
}

const getHintText = (attempt: AttemptFeedback): string | undefined => {
  if (attempt.isCorrect) return undefined
  if (attempt.genusMatch) return "Right genus!"
  if (attempt.familyMatch) return "Right family!"
  return undefined
}

const getAttemptStyles = (attempt: AttemptFeedback): string => {
  if (attempt.isCorrect) return "border-primary bg-primary/10"
  if (attempt.genusMatch || attempt.familyMatch) return "border-border bg-muted/60"
  return "border-destructive bg-destructive/10"
}

export const AttemptHistory = ({ attempts }: AttemptHistoryProps) => (
  <Card className="p-4" data-testid={AttemptHistoryTestIds.container}>
    <h3 className="text-muted-foreground mb-3 text-sm font-medium">Previous attempts</h3>
    <div className="space-y-2">
      {attempts.map((attempt, index) => {
        const species = getSpecies(attempt.speciesId)
        const hint = getHintText(attempt)
        return (
          <div key={attempt.speciesId} className="flex items-stretch gap-2">
            <div className="text-muted-foreground flex w-6 items-center justify-center text-sm">#{index + 1}</div>
            <div
              className={`flex flex-1 items-stretch justify-between rounded-md border p-3 ${getAttemptStyles(attempt)}`}
              data-testid={AttemptHistoryTestIds.item}
            >
              <div>
                <p className="text-foreground font-medium">{species.commonName}</p>
                <p className="text-muted-foreground text-sm italic">{species.scientificName}</p>
              </div>
              <div className="flex flex-col items-end text-right">
                {hint && (
                  <p className="text-muted-foreground text-sm font-medium" data-testid={AttemptHistoryTestIds.hint}>
                    {hint}
                  </p>
                )}
                <p className="text-muted-foreground mt-auto text-sm">{species.family}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  </Card>
)
