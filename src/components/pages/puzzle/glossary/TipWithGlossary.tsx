import { GlossaryTerm } from "@/components/pages/puzzle/glossary/GlossaryTerm"
import { parseTipRegions } from "@/components/pages/puzzle/glossary/parseTipRegions"

export interface TipWithGlossaryProps {
  tip: string
}

export const TipWithGlossary = ({ tip }: TipWithGlossaryProps) => {
  const regions = parseTipRegions(tip)

  const nodes = regions.map((region, index) =>
    region.type === "text" ? (
      region.text
    ) : (
      <GlossaryTerm key={index} term={region.term}>
        {region.displayText}
      </GlossaryTerm>
    ),
  )

  return nodes.length === 1 ? nodes[0] : nodes
}
