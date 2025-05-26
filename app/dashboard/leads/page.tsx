import type { Metadata } from "next"
import { LeadsTable } from "@/components/dashboard/leads-table"

export const metadata: Metadata = {
  title: "Leads",
  description: "Manage your leads",
}

export default function LeadsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Leads</h1>
      <LeadsTable />
    </div>
  )
}

