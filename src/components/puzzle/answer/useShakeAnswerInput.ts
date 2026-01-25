import type { AnimationOptions, DOMKeyframesDefinition } from "motion/react"
import { useAnimate } from "motion/react"
import { useCallback } from "react"

const SHAKE_ANIMATION: DOMKeyframesDefinition = { x: [0, -6, 6, -4, 4, 0] }
const SHAKE_TRANSITION: AnimationOptions = { duration: 0.35, ease: "easeInOut" }

export const useShakeAnswerInput = () => {
  const [scope, animate] = useAnimate<HTMLDivElement>()
  const shake = useCallback(() => {
    animate(scope.current, SHAKE_ANIMATION, SHAKE_TRANSITION)
  }, [animate, scope])
  return { scope, shake }
}
