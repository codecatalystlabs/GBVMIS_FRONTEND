import type { Metadata } from "next"
import { PolicePostsTable } from "@/components/dashboard/PolicePostsTable"

export const metadata: Metadata = {
  title: "Police Posts",
  description: "Manage your Police Posts",
}

export default function OpportunitiesPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Police Posts</h1>
      <PolicePostsTable />
    </div>
  )
}

