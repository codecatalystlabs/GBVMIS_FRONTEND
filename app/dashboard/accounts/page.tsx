import type { Metadata } from "next"
import { AccountsTable } from "@/components/dashboard/accounts-table"

export const metadata: Metadata = {
  title: "Accounts",
  description: "Manage your accounts",
}

export default function AccountsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Accounts</h1>
      <AccountsTable />
    </div>
  )
}

