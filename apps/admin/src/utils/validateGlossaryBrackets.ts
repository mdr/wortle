/**
 * Validates that [[ and ]] glossary link brackets are properly paired.
 * Each [[ must have a matching ]] that comes after it. Nesting is not allowed.
 */
export const validateGlossaryBrackets = (text: string): boolean => {
  let isOpen = false
  let i = 0
  while (i < text.length) {
    if (text.slice(i, i + 2) === "[[") {
      if (isOpen) return false
      isOpen = true
      i += 2
    } else if (text.slice(i, i + 2) === "]]") {
      if (!isOpen) return false
      isOpen = false
      i += 2
    } else {
      i++
    }
  }
  return !isOpen
}
