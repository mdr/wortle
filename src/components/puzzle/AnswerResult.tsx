import { Info } from "lucide-react"

import { TipWithGlossary } from "@/components/puzzle/TipWithGlossary"
import { Card } from "@/components/shadcn/Card"
import { AttemptFeedback } from "@/lib/AttemptFeedback"
import { getResultMedal } from "@/lib/resultMedal"
import { getSpecies } from "@/lib/species/plants"
import { selectCorrectSpecies, selectIsCorrect } from "@/services/puzzle/puzzleSelectors"
import { usePuzzleState } from "@/services/puzzle/puzzleServiceHooks"

import { AnswerTestIds } from "./PuzzleTestIds"

const getHintText = (attempt: AttemptFeedback): string | undefined => {
  if (attempt.isCorrect) return undefined
  if (attempt.genusMatch) return "Right genus!"
  if (attempt.familyMatch) return "Right family!"
  return undefined
}

export const AnswerResult = () => {
  const isCorrect = usePuzzleState(selectIsCorrect)
  const correctSpecies = usePuzzleState(selectCorrectSpecies)
  const { attempts, gaveUp, didNotAttempt } = usePuzzleState()
  const getHeading = () => {
    if (isCorrect) return "Correct!"
    if (didNotAttempt || gaveUp) return "Here's the answer"
    return "Out of attempts"
  }

  const getSubheading = () => {
    if (isCorrect) {
      const attemptCount = attempts.length
      if (attemptCount === 1) return "Got it on your first try!"
      return `Got it in ${attemptCount} attempts`
    }
    if (didNotAttempt) return "You didn't attempt this puzzle, but here's the answer"
    if (gaveUp) return "Better luck with the next one"
    return "You'll get the next one!"
  }

  const getCardStyle = () => {
    if (isCorrect) return "border-primary bg-primary/5"
    if (didNotAttempt) return "border-border bg-muted/30"
    return "border-destructive bg-destructive/5"
  }

  const renderIcon = () => {
    if (didNotAttempt) {
      return (
        <div className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
          <Info className="size-6" />
        </div>
      )
    }
    return <span className="text-5xl">{getResultMedal({ attemptCount: attempts.length, isCorrect })}</span>
  }

  return (
    <Card
      className={`p-6 ${getCardStyle()}`}
      data-testid={
        isCorrect
          ? AnswerTestIds.correct
          : didNotAttempt
            ? AnswerTestIds.didNotAttempt
            : gaveUp
              ? AnswerTestIds.gaveUp
              : AnswerTestIds.incorrect
      }
    >
      <div className="mb-4 flex items-center gap-3">
        {renderIcon()}
        <div>
          <h2 className="text-foreground font-serif text-2xl font-bold">{getHeading()}</h2>
          <p className="text-foreground/70 text-sm">{getSubheading()}</p>
        </div>
      </div>

      <div className="space-y-4 border-t pt-4">
        <div className="space-y-2">
          {attempts.length > 0 && (!isCorrect || attempts.length > 1) && (
            <div>
              <p className="text-foreground/70 mb-1 text-sm font-medium">
                Your {attempts.length === 1 ? "attempt" : "attempts"}:
              </p>
              <div className="space-y-2">
                {(isCorrect ? attempts.filter((attempt) => !attempt.isCorrect) : attempts).map((attempt, index) => {
                  const species = getSpecies(attempt.speciesId)
                  const hint = getHintText(attempt)
                  return (
                    <div key={attempt.speciesId} className="flex items-stretch gap-2">
                      <div className="text-muted-foreground flex w-6 items-center justify-center text-sm">
                        #{index + 1}
                      </div>
                      <div
                        className={`flex flex-1 items-stretch justify-between rounded-md border p-3 ${
                          attempt.isCorrect ? "border-primary/40 bg-primary/10" : "border-border bg-background"
                        }`}
                      >
                        <div>
                          <p className="text-foreground font-medium">{species.commonName}</p>
                          <p className="text-muted-foreground text-sm italic">{species.scientificName}</p>
                        </div>
                        <div className="flex flex-col items-end text-right">
                          {hint && <p className="text-muted-foreground text-sm font-medium">{hint}</p>}
                          <p className="text-muted-foreground mt-auto text-sm">{species.family}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {(!isCorrect || attempts.length !== 1) && (
            <p className="text-foreground/70 text-sm font-medium">
              {isCorrect ? "You correctly identified it as:" : "The answer was:"}
            </p>
          )}

          <div className="flex items-stretch gap-2">
            {isCorrect && attempts.length > 1 && (
              <div className="text-muted-foreground flex w-6 items-center justify-center text-sm">
                #{attempts.length}
              </div>
            )}
            <div className="border-border bg-background flex-1 rounded-lg border p-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-foreground text-2xl font-semibold">{correctSpecies.commonName}</p>
                  <p className="text-muted-foreground text-sm italic">{correctSpecies.scientificName}</p>
                </div>
                <p className="text-muted-foreground text-sm">{correctSpecies.family}</p>
              </div>
            </div>
          </div>
        </div>

        {correctSpecies.idTips.length > 0 && (
          <div className="bg-accent/10 rounded-lg p-4">
            <h3 className="text-foreground mb-2 font-serif text-lg font-semibold">Identification Tips</h3>
            <ul className="text-foreground list-inside list-disc space-y-2 text-sm">
              {correctSpecies.idTips.map((tip, index) => (
                <li key={index}>
                  <TipWithGlossary tip={tip} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {correctSpecies.links.length > 0 && (
          <div className="space-y-2">
            <p className="text-foreground text-sm font-medium">Learn more:</p>
            <div className="flex flex-wrap gap-2">
              {correctSpecies.links.map((link, index) => (
                <span key={link.name} className="flex items-center gap-2">
                  {index > 0 && <span className="text-muted-foreground">•</span>}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-sm underline-offset-4 hover:underline"
                  >
                    {link.name}
                  </a>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
