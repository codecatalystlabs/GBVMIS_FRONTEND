"use client"

import { useState } from "react"
import { MoreHorizontal, ChevronDown, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const contacts = [
  {
    id: "CON-1234",
    name: "John Smith",
    title: "CEO",
    account: "Acme Inc.",
    email: "john.smith@acme.com",
    phone: "(555) 123-4567",
    owner: "Sarah Johnson",
  },
  {
    id: "CON-1235",
    name: "Emily Davis",
    title: "CTO",
    account: "TechCorp",
    email: "emily.davis@techcorp.com",
    phone: "(555) 234-5678",
    owner: "Michael Brown",
  },
  {
    id: "CON-1236",
    name: "Robert Wilson",
    title: "VP of Sales",
    account: "Global Industries",
    email: "robert.wilson@globalind.com",
    phone: "(555) 345-6789",
    owner: "John Smith",
  },
  {
    id: "CON-1237",
    name: "Sarah Johnson",
    title: "Marketing Director",
    account: "Innovative Startups",
    email: "sarah.johnson@innovative.com",
    phone: "(555) 456-7890",
    owner: "Emily Davis",
  },
  {
    id: "CON-1238",
    name: "Michael Brown",
    title: "CFO",
    account: "Strategic Solutions",
    email: "michael.brown@strategic.com",
    phone: "(555) 567-8901",
    owner: "Robert Wilson",
  },
]

export function ContactsTable() {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])

  const toggleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([])
    } else {
      setSelectedContacts(contacts.map((contact) => contact.id))
    }
  }

  const toggleSelectContact = (id: string) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter((contactId) => contactId !== id))
    } else {
      setSelectedContacts([...selectedContacts, id])
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search contacts..." className="w-full pl-8 sm:w-[300px]" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto h-9">
                <ChevronDown className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Account</DropdownMenuItem>
              <DropdownMenuItem>Title</DropdownMenuItem>
              <DropdownMenuItem>Owner</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="10">
            <SelectTrigger className="h-9 w-[70px]">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <Button>Add Contact</Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedContacts.length === contacts.length && contacts.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Title</TableHead>
              <TableHead className="hidden md:table-cell">Account</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead className="hidden md:table-cell">Owner</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedContacts.includes(contact.id)}
                    onCheckedChange={() => toggleSelectContact(contact.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{contact.id}</TableCell>
                <TableCell>{contact.name}</TableCell>
                <TableCell className="hidden md:table-cell">{contact.title}</TableCell>
                <TableCell className="hidden md:table-cell">{contact.account}</TableCell>
                <TableCell className="hidden md:table-cell">{contact.email}</TableCell>
                <TableCell className="hidden md:table-cell">{contact.phone}</TableCell>
                <TableCell className="hidden md:table-cell">{contact.owner}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing <strong>1</strong> to <strong>{contacts.length}</strong> of <strong>{contacts.length}</strong> results
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

