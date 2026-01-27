import Link from "next/link"
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
          <ul className="space-y-2">
            <li>
              <Link href="/species" className="text-blue-600 hover:underline">
                Species
              </Link>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
