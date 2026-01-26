import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { NextRequest, NextResponse } from "next/server"

export default withAuth(async function middleware(req: NextRequest) {
  const { isAuthenticated, getClaim } = getKindeServerSession()

  if (!(await isAuthenticated())) {
    return NextResponse.redirect(new URL("/api/auth/login", req.url))
  }

  const roles = await getClaim("roles")
  const rolesList = Array.isArray(roles?.value) ? (roles.value as Array<{ key: string }>) : []
  const hasAccess = rolesList.some((r) => r.key === "super-user")

  if (!hasAccess) {
    return NextResponse.redirect(new URL("/unauthorized", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!api/auth|unauthorized|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
}
