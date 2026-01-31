import type { Metadata } from "next"
import Link from "next/link"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { LoginLink, LogoutLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components"
import { Button } from "@wortle/ui"

import { TRPCProvider } from "@/trpc/provider"

import "./globals.css"

export const metadata: Metadata = {
  title: "Wortle Admin",
  description: "Admin dashboard for Wortle",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, getUser } = getKindeServerSession()
  const isLoggedIn = await isAuthenticated()
  const user = await getUser()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen" suppressHydrationWarning>
        <header className="border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className="text-lg font-semibold">
              <Link href="/">Wortle Admin</Link>
            </h1>
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  <span className="text-muted-foreground text-sm">{user?.email}</span>
                  <Button variant="ghost" size="sm" asChild>
                    <LogoutLink>Sign out</LogoutLink>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <LoginLink>Sign in</LoginLink>
                  </Button>
                  <Button size="sm" asChild>
                    <RegisterLink>Sign up</RegisterLink>
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>
        <TRPCProvider>
          <main className="px-6 py-8">{children}</main>
        </TRPCProvider>
      </body>
    </html>
  )
}
