import type { Metadata } from "next"
import { SuspectsTable } from "@/components/dashboard/suspects-table"

export const metadata: Metadata = {
  title: "Suspects",
  description: "Manage your suspects",
}

export default function AccountsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Suspects</h1>
      <SuspectsTable />
    </div>
  )
}