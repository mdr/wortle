import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { initTRPC, TRPCError } from "@trpc/server"

export async function createContext() {
  const { getUser, isAuthenticated, getClaim } = getKindeServerSession()
  const authenticated = await isAuthenticated()
  const user = authenticated ? await getUser() : null
  const roles = await getClaim("roles")
  const rolesList = Array.isArray(roles?.value) ? (roles.value as Array<{ key: string }>) : []
  const isSuperUser = rolesList.some((r) => r.key === "super-user")

  return { user, isSuperUser }
}

type Context = Awaited<ReturnType<typeof createContext>>

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user || !ctx.isSuperUser) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }
  return next({ ctx: { ...ctx, user: ctx.user } })
})
