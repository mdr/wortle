import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components"

export default function UnauthorizedPage() {
  return (
    <main style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Access Denied</h1>
      <p>You do not have permission to access this application.</p>
      <LogoutLink>Sign out</LogoutLink>
    </main>
  )
}
