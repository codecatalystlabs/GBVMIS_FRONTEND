import type { Metadata } from "next"
import { CasesTable } from "@/components/dashboard/casesTable"
export const metadata: Metadata = {
  title: "Cases",
  description: "Manage your Cases",
}

export default function CasesPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Cases</h1>
      <CasesTable />
    </div>
  )
}