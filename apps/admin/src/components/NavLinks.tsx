"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@wortle/ui"

const links = [
  { href: "/taxa", label: "Taxa" },
  { href: "/puzzles", label: "Puzzles" },
  { href: "/schedule", label: "Schedule" },
]

export const NavLinks = () => {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-4">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "text-sm",
            pathname.startsWith(link.href)
              ? "text-foreground font-medium"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
