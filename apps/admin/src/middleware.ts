import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware"
import { NextRequest, NextResponse } from "next/server"

type KindeToken = {
  roles?: Array<{ key: string }>
}

type KindeRequest = NextRequest & { kindeAuth?: { token?: KindeToken } }

export default withAuth(function middleware(req: KindeRequest) {
  const roles = req.kindeAuth?.token?.roles ?? []
  const hasAccess = roles.some((r) => r.key === "super-user")

  if (!hasAccess) {
    return NextResponse.redirect(new URL("/unauthorized", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!api/auth|api/cron|unauthorized|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
}
