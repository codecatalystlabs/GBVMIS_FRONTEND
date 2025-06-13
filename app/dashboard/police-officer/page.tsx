import type { Metadata } from "next"
import { PoliceOfficerTable } from "@/components/dashboard/police-officer-table"

export const metadata: Metadata = {
  title: "Police Officer",
  description: "Manage your Police Officer",
}

export default function PoliceOfficerPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Police Officer</h1>
      <PoliceOfficerTable />
    </div>
  )
}

