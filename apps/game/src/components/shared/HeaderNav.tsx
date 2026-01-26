import { Link } from "@tanstack/react-router"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@wortle/ui"
import { HelpCircle, History, Menu } from "lucide-react"

import { SharedTestIds } from "./SharedTestIds"

const iconButtonClass =
  "flex size-12 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"

export const HeaderNav = () => (
  <>
    {/* Mobile: Menu with dropdown */}
    <div className="min-[520px]:hidden">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={iconButtonClass}>
            <Menu className="size-6" />
            <span className="sr-only">Menu</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild className="gap-3 px-4 py-3 text-base">
            <Link to="/history">
              <History className="size-5" />
              History
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="gap-3 px-4 py-3 text-base">
            <Link to="/about">
              <HelpCircle className="size-5" />
              About
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>

    {/* Desktop: Both icons visible */}
    <div className="hidden items-center gap-2 min-[520px]:flex">
      <Link to="/history" className={iconButtonClass} data-testid={SharedTestIds.headerHistoryLink}>
        <History className="size-6" />
        <span className="sr-only">History</span>
      </Link>
      <Link to="/about" className={iconButtonClass} data-testid={SharedTestIds.headerAboutLink}>
        <HelpCircle className="size-6" />
        <span className="sr-only">About Wortle</span>
      </Link>
    </div>
  </>
)
