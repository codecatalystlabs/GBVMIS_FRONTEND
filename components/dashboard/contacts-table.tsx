"use client";

import { useState } from "react";
import { MoreHorizontal, ChevronDown, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Sample data
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
];

// Global CSS for hide-scrollbar (move to styles/global.css in production)
const hideScrollbarStyles = `
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
    overflow: auto;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
`;

export function ContactsTable() {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const toggleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map((contact) => contact.id));
    }
  };

  const toggleSelectContact = (id: string) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter((contactId) => contactId !== id));
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };

  return (
    <>
      <style>{hideScrollbarStyles}</style>
      <div className="space-y-4 p-6 bg-gray-100 min-h-screen">
        {/* Search, filter, pagination controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-blue-900" />
              <Input
                type="search"
                placeholder="Search contacts..."
                className="w-full pl-8 sm:w-[300px] bg-white border border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 transition-all duration-300"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-9 bg-white border border-blue-200 text-blue-900 hover:bg-gray-200">
                  <ChevronDown className="h-4 w-4 text-blue-900" />
                  <span className="sr-only">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border border-blue-200 text-blue-900">
                <DropdownMenuLabel className="text-blue-900">Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-blue-200" />
                <DropdownMenuItem className="hover:bg-gray-200 text-blue-900">Account</DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-200 text-blue-900">Title</DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-200 text-blue-900">Owner</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="10">
              <SelectTrigger className="h-9 w-[70px] bg-white border border-blue-200 text-blue-900 focus:ring-2 focus:ring-blue-600">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-blue-200 text-blue-900 hide-scrollbar">
                <SelectItem value="10" className="text-blue-900">10</SelectItem>
                <SelectItem value="20" className="text-blue-900">20</SelectItem>
                <SelectItem value="50" className="text-blue-900">50</SelectItem>
                <SelectItem value="100" className="text-blue-900">100</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-blue-800 hover:bg-blue-900 text-white transition-all duration-300">
              Add Contact
            </Button>
          </div>
        </div>
        {/* Table */}
        <div className="rounded-xl border border-blue-200 bg-white shadow-lg hide-scrollbar overflow-auto max-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-blue-200 hover:bg-gray-200">
                <TableHead className="w-[40px] text-blue-900">
                  <Checkbox
                    checked={selectedContacts.length === contacts.length && contacts.length > 0}
                    onCheckedChange={toggleSelectAll}
                    className="border-blue-200 text-blue-600"
                  />
                </TableHead>
                <TableHead className="w-[100px] text-blue-900">ID</TableHead>
                <TableHead className="text-blue-900">Name</TableHead>
                <TableHead className="hidden md:table-cell text-blue-900">Title</TableHead>
                <TableHead className="hidden md:table-cell text-blue-900">Account</TableHead>
                <TableHead className="hidden md:table-cell text-blue-900">Email</TableHead>
                <TableHead className="hidden md:table-cell text-blue-900">Phone</TableHead>
                <TableHead className="hidden md:table-cell text-blue-900">Owner</TableHead>
                <TableHead className="w-[40px] text-blue-900"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id} className="border-t border-blue-200 hover:bg-gray-200 transition-all duration-200">
                  <TableCell>
                    <Checkbox
                      checked={selectedContacts.includes(contact.id)}
                      onCheckedChange={() => toggleSelectContact(contact.id)}
                      className="border-blue-200 text-blue-600"
                    />
                  </TableCell>
                  <TableCell className="font-medium text-blue-900">{contact.id}</TableCell>
                  <TableCell className="text-blue-900">{contact.name}</TableCell>
                  <TableCell className="hidden md:table-cell text-blue-900">{contact.title}</TableCell>
                  <TableCell className="hidden md:table-cell text-blue-900">{contact.account}</TableCell>
                  <TableCell className="hidden md:table-cell text-blue-900">{contact.email}</TableCell>
                  <TableCell className="hidden md:table-cell text-blue-900">{contact.phone}</TableCell>
                  <TableCell className="hidden md:table-cell text-blue-900">{contact.owner}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-blue-900 hover:bg-gray-200">
                          <MoreHorizontal className="h-4 w-4 text-blue-900" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border border-blue-200 text-blue-900">
                        <DropdownMenuItem className="hover:bg-gray-200 text-blue-900">View</DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-gray-200 text-blue-900">Edit</DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-blue-200" />
                        <DropdownMenuItem className="text-red-500 hover:bg-red-100">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between text-blue-900">
          <div className="text-sm">
            Showing <strong>1</strong> to <strong>{contacts.length}</strong> of{' '}
            <strong>{contacts.length}</strong> results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled
              className="bg-white border border-blue-200 text-blue-900 hover:bg-gray-200"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="bg-white border border-blue-200 text-blue-900 hover:bg-gray-200"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}