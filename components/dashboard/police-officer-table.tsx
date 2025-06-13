"use client"

import { useState } from "react"
import { MoreHorizontal, ChevronDown, Search, ArrowUpDown } from "lucide-react"

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
import { Badge } from "@/components/ui/badge"
import useSWR from "swr"
import { fetcher } from "@/lib/api"
import { PoliceOfficer } from "@/types"

const leads = [
  {
    id: "LEAD-1234",
    name: "John Smith",
    email: "john.smith@example.com",
    company: "Acme Inc.",
    status: "New",
    source: "Website",
    date: "2023-04-23",
  },
  {
    id: "LEAD-1235",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    company: "TechCorp",
    status: "Contacted",
    source: "Referral",
    date: "2023-04-22",
  },
  {
    id: "LEAD-1236",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    company: "Global Industries",
    status: "Qualified",
    source: "Event",
    date: "2023-04-21",
  },
  {
    id: "LEAD-1237",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    company: "Innovative Startups",
    status: "New",
    source: "LinkedIn",
    date: "2023-04-20",
  },
  {
    id: "LEAD-1238",
    name: "Robert Wilson",
    email: "robert.wilson@example.com",
    company: "Strategic Solutions",
    status: "Contacted",
    source: "Website",
    date: "2023-04-19",
  },
]

export function PoliceOfficerTable() {
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const { data, error, isLoading } = useSWR('/police-officers', fetcher);

  console.log("Data fetched:", data);

  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(leads.map((lead) => lead.id))
    }
  }

  const toggleSelectLead = (id: string) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter((leadId) => leadId !== id))
    } else {
      setSelectedLeads([...selectedLeads, id])
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Contacted":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Qualified":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search leads..." className="w-full pl-8 sm:w-[300px]" />
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
              <DropdownMenuItem>Status</DropdownMenuItem>
              <DropdownMenuItem>Source</DropdownMenuItem>
              <DropdownMenuItem>Date</DropdownMenuItem>
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
          <Button>Add Officer</Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedLeads.length === leads.length && leads.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="">Badge Number</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Rank</TableHead>                       
              <TableHead className="hidden md:table-cell">Source</TableHead>
  
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((officer: PoliceOfficer) => (
              <TableRow key={officer.ID}>
                <TableCell>
                  <Checkbox
                    checked={selectedLeads.includes(officer.ID.toString())}
                    onCheckedChange={() => toggleSelectLead(officer.ID.toString())}
                  />
                </TableCell>
                <TableCell className="font-medium">{officer.badge_no}</TableCell>
                <TableCell>{officer.first_name}</TableCell>
                <TableCell>{officer.last_name}</TableCell>
                <TableCell className="hidden md:table-cell">{officer.email}</TableCell>
                <TableCell className="hidden md:table-cell">{officer.rank}</TableCell>
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
          Showing <strong>1</strong> to <strong>{leads.length}</strong> of <strong>{leads.length}</strong> results
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

