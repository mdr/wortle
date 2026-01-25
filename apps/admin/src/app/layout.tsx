import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Wortle Admin",
  description: "Admin dashboard for Wortle",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
