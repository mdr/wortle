import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components"
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@wortle/ui"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md text-center">
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>You do not have permission to access this application.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            If you believe this is an error, please contact an administrator.
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <Button variant="outline" asChild>
            <LogoutLink>Sign out</LogoutLink>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
