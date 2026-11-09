import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"

export async function createContext() {
  const { getUser, isAuthenticated, getClaim } = getKindeServerSession()
  const authenticated = await isAuthenticated()
  const user = authenticated ? await getUser() : null
  const roles = await getClaim("roles")
  const rolesList = Array.isArray(roles?.value) ? (roles.value as Array<{ key: string }>) : []
  const isSuperUser = rolesList.some((r) => r.key === "super-user")

  return { user, isSuperUser }
}

export type Context = Awaited<ReturnType<typeof createContext>>
