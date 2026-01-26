import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@wortle/ui"

export default function Home() {
  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>Manage Wortle puzzles and content</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Admin features coming soon.</p>
        </CardContent>
      </Card>
    </div>
  )
}
