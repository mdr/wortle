import { GlossaryTerm } from "@/components/puzzle/glossary/GlossaryTerm"
import { glossary } from "@/lib/glossary"

interface TextRegion {
  type: "text"
  text: string
}

interface GlossaryRegion {
  type: "glossary"
  term: string
  displayText: string
}

type TipRegion = TextRegion | GlossaryRegion

export const parseTipRegions = (tip: string): TipRegion[] => {
  const regions: TipRegion[] = []
  const regex = /\[\[([^\]]+)\]\]/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(tip)) !== null) {
    if (match.index > lastIndex) {
      regions.push({ type: "text", text: tip.slice(lastIndex, match.index) })
    }

    const displayText = match[1]
    const term = displayText.toLowerCase()
    if (term in glossary) {
      regions.push({ type: "glossary", term, displayText })
    } else {
      regions.push({ type: "text", text: displayText })
    }

    lastIndex = regex.lastIndex
  }

  if (lastIndex < tip.length) {
    regions.push({ type: "text", text: tip.slice(lastIndex) })
  }

  return regions
}

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
