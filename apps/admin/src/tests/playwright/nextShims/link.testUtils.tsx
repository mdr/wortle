import { ComponentProps } from "react"

import { useTestRouter } from "./TestRouter.testUtils"

// Aliased to "next/link" in playwright-ct.config.ts.

type LinkProps = Omit<ComponentProps<"a">, "href"> & { href: string }

const Link = ({ href, onClick, ...rest }: LinkProps) => {
  const { push } = useTestRouter()
  return (
    <a
      href={href}
      {...rest}
      onClick={(event) => {
        onClick?.(event)
        if (event.defaultPrevented || event.metaKey || event.ctrlKey) return
        event.preventDefault()
        push(href)
      }}
    />
  )
}

export default Link
