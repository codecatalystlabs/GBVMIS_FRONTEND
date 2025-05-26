import type { Metadata } from "next"
import { ContactsTable } from "@/components/dashboard/contacts-table"

export const metadata: Metadata = {
  title: "Contacts",
  description: "Manage your contacts",
}

export default function ContactsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Contacts</h1>
      <ContactsTable />
    </div>
  )
}

