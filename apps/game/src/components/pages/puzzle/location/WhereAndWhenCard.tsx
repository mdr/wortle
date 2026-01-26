import { Card } from "@wortle/ui"

import { UkLocationMap } from "@/components/pages/puzzle/location/UkLocationMap"
import { Puzzle } from "@/lib/Puzzle"
import { ClassNameList } from "@/utils/brandedTypes"
import { formatDate } from "@/utils/dateUtils"

interface WhereAndWhenCardProps {
  puzzle: Puzzle
}

export const WhereAndWhenCard = ({ puzzle }: WhereAndWhenCardProps) => {
  const { location, habitat, observationDate } = puzzle
  const { description, coordinates } = location

  return (
    <Card className="p-4">
      <h2 className="text-foreground mb-1 font-serif text-2xl font-bold">Context</h2>
      <div className="flex flex-col gap-4 min-[440px]:flex-row">
        <UkLocationMap
          coordinates={coordinates}
          className={ClassNameList("border-border h-40 w-full shrink-0 rounded border min-[440px]:w-30")}
        />
        <div className="min-w-0 space-y-2 text-sm">
          <div className="flex gap-2">
            <span className="text-muted-foreground font-medium">Location:</span>
            <span className="text-foreground">{description}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground font-medium">Habitat:</span>
            <span className="text-foreground">{habitat}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-muted-foreground font-medium">Date:</span>
            <span className="text-foreground">{formatDate(observationDate)}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
