"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@wortle/ui"

import { trpc } from "@/trpc/client"

export default function SpeciesPage() {
  const router = useRouter()
  const { data: species, isLoading, error } = trpc.species.list.useQuery()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Species</h2>
        <Button asChild>
          <Link href="/species/new">Add Species</Link>
        </Button>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b text-left">
            <th className="p-2">ID</th>
            <th className="p-2">Common Name</th>
            <th className="p-2">Scientific Name</th>
            <th className="p-2">Family</th>
          </tr>
        </thead>
        <tbody>
          {species?.map((s) => (
            <tr
              key={s.id}
              className="cursor-pointer border-b hover:bg-gray-50"
              onClick={() => router.push(`/species/${s.id}/edit`)}
            >
              <td className="p-2 font-mono text-sm">{s.id}</td>
              <td className="p-2">{s.commonName}</td>
              <td className="p-2 italic">{s.scientificName}</td>
              <td className="p-2">{s.family}</td>
            </tr>
          ))}
          {species?.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">
                No species found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
