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
import useSWR from "swr"
import { fetcher } from "@/lib/api"
import { PoliceOfficer } from "@/types"



export function PoliceOfficerTable() {
  const [selectedOfficer, setSelectedOfficer] = useState<string[]>([])
  const { data, error, isLoading } = useSWR('/police-officers', fetcher);

  if (isLoading) return <div>Loading...</div>

  if (error) return <div>Error loading data</div>
  if (!data || !data.data || data.data.length === 0) {
    return <div className="text-center text-muted-foreground">No police officers found.</div>
  }
  const toggleSelectAll = () => {
    if (selectedOfficer.length === data?.data.length) {
      setSelectedOfficer([])
    } else {
      setSelectedOfficer(data?.data.map((officer:PoliceOfficer) => officer.ID.toString()) || [])
    }
  }

  const toggleSelectedOfficer = (id: string) => {
    if (selectedOfficer.includes(id)) {
      setSelectedOfficer(selectedOfficer.filter((leadId) => leadId !== id))
    } else {
      setSelectedOfficer([...selectedOfficer, id])
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
            <Input type="search" placeholder="Search police officers..." className="w-full pl-8 sm:w-[300px]" />
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
                  checked={selectedOfficer.length === data?.data.length && data?.data.length > 0}
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
                    checked={selectedOfficer.includes(officer.ID.toString())}
                    onCheckedChange={() => toggleSelectedOfficer(officer.ID.toString())}
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
          Showing <strong>1</strong> to <strong>{data?.data.length}</strong> of <strong>{data?.data.length}</strong> results
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

