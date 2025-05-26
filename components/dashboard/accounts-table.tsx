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

const accounts = [
  {
    id: "ACC-1234",
    name: "Acme Inc.",
    industry: "Technology",
    type: "Customer",
    revenue: "$5.2M",
    employees: "250",
    owner: "John Smith",
  },
  {
    id: "ACC-1235",
    name: "TechCorp",
    industry: "Software",
    type: "Customer",
    revenue: "$12M",
    employees: "500",
    owner: "Sarah Johnson",
  },
  {
    id: "ACC-1236",
    name: "Global Industries",
    industry: "Manufacturing",
    type: "Prospect",
    revenue: "$45M",
    employees: "1,200",
    owner: "Michael Brown",
  },
  {
    id: "ACC-1237",
    name: "Innovative Startups",
    industry: "Technology",
    type: "Customer",
    revenue: "$2.5M",
    employees: "75",
    owner: "Emily Davis",
  },
  {
    id: "ACC-1238",
    name: "Strategic Solutions",
    industry: "Consulting",
    type: "Partner",
    revenue: "$8.7M",
    employees: "120",
    owner: "Robert Wilson",
  },
]

export function AccountsTable() {
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])

  const toggleSelectAll = () => {
    if (selectedAccounts.length === accounts.length) {
      setSelectedAccounts([])
    } else {
      setSelectedAccounts(accounts.map((account) => account.id))
    }
  }

  const toggleSelectAccount = (id: string) => {
    if (selectedAccounts.includes(id)) {
      setSelectedAccounts(selectedAccounts.filter((accountId) => accountId !== id))
    } else {
      setSelectedAccounts([...selectedAccounts, id])
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Customer":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Prospect":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "Partner":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
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
            <Input type="search" placeholder="Search accounts..." className="w-full pl-8 sm:w-[300px]" />
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
              <DropdownMenuItem>Industry</DropdownMenuItem>
              <DropdownMenuItem>Type</DropdownMenuItem>
              <DropdownMenuItem>Revenue</DropdownMenuItem>
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
          <Button>Add Account</Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedAccounts.length === accounts.length && accounts.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Industry</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="hidden md:table-cell">
                <div className="flex items-center">
                  Revenue
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell">Employees</TableHead>
              <TableHead className="hidden md:table-cell">Owner</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedAccounts.includes(account.id)}
                    onCheckedChange={() => toggleSelectAccount(account.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">{account.id}</TableCell>
                <TableCell>{account.name}</TableCell>
                <TableCell className="hidden md:table-cell">{account.industry}</TableCell>
                <TableCell>
                  <Badge className={getTypeColor(account.type)}>{account.type}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{account.revenue}</TableCell>
                <TableCell className="hidden md:table-cell">{account.employees}</TableCell>
                <TableCell className="hidden md:table-cell">{account.owner}</TableCell>
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
          Showing <strong>1</strong> to <strong>{accounts.length}</strong> of <strong>{accounts.length}</strong> results
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

