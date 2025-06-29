import { VictimsTable } from "@/components/dashboard/victims-table"

export default function VictimsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Victims</h1>
      <VictimsTable />
    </div>
  )
}