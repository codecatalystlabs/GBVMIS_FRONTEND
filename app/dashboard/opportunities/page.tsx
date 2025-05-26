import type { Metadata } from "next"
import { OpportunitiesTable } from "@/components/dashboard/opportunities-table"

export const metadata: Metadata = {
  title: "Opportunities",
  description: "Manage your opportunities",
}

export default function OpportunitiesPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Opportunities</h1>
      <OpportunitiesTable />
    </div>
  )
}

