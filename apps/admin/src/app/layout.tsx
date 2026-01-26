import type { Metadata } from "next"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { LoginLink, LogoutLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components"

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
      <body suppressHydrationWarning>
        <header style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", padding: "1rem" }}>
          {isLoggedIn ? (
            <>
              <span>{user?.email}</span>
              <LogoutLink>Sign out</LogoutLink>
            </>
          ) : (
            <>
              <LoginLink>Sign in</LoginLink>
              <RegisterLink>Sign up</RegisterLink>
            </>
          )}
        </header>
        {children}
      </body>
    </html>
  )
}
