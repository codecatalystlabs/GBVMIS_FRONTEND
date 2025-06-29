"use client"

import { useState } from "react"
import { MoreHorizontal, ChevronDown, Search, ArrowUpDown } from "lucide-react"
import useSWR from 'swr'

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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { apiClient, fetcher } from '@/lib/api'
import { toast } from "react-toastify"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'

// Default avatar SVG as a React component
const DefaultAvatar = () => (
  <svg viewBox="0 0 128 128" className="w-32 h-32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="64" fill="#E5E7EB" />
    <ellipse cx="64" cy="54" rx="28" ry="28" fill="#A3A3A3" />
    <ellipse cx="64" cy="104" rx="44" ry="24" fill="#A3A3A3" />
  </svg>
)

export function SuspectsTable() {
  const { data, error, isLoading, mutate } = useSWR('/suspects', fetcher)
  const suspects = data?.data || []
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([])
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [formLoading, setFormLoading] = useState(false)

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingSuspect, setEditingSuspect] = useState<any | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingSuspect, setDeletingSuspect] = useState<any | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewingSuspect, setViewingSuspect] = useState<any | null>(null)
  const [viewLoading, setViewLoading] = useState(false)

  const toggleSelectAll = () => {
    if (selectedAccounts.length === suspects.length) {
      setSelectedAccounts([])
    } else {
      setSelectedAccounts(suspects.map((suspect: any) => suspect.id?.toString()))
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

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Failed to load suspects.</div>

  const handleSaveSuspect =  async (e:any) => {
    e.preventDefault();
    setFormLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await apiClient.postFormData('/suspect', formData);
      toast.success('Suspect added successfully!');
      setAddDialogOpen(false);
      // Optionally refresh table here
      mutate()
    } catch (err: any) {
      alert(err?.info?.message || err?.message || 'Failed to add suspect');
    } finally {
      setFormLoading(false);
    }
  }

  const handleEditClick = (suspect: any) => {
    setEditingSuspect(suspect)
    setEditDialogOpen(true)
  }

  const handleEditSuspect = async (e: any) => {
    e.preventDefault();
    setFormLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await apiClient.putFormData(`/suspect/${editingSuspect.ID}`, formData);
      toast.success('Suspect updated successfully!');
      setEditDialogOpen(false);
      setEditingSuspect(null);
      mutate();
    } catch (err: any) {
      alert(err?.info?.message || err?.message || 'Failed to update suspect');
    } finally {
      setFormLoading(false);
    }
  }

  const handleDeleteClick = (suspect: any) => {
    setDeletingSuspect(suspect)
    setDeleteDialogOpen(true)
  }

  const handleDeleteSuspect = async () => {
    if (!deletingSuspect) return;
    setFormLoading(true);
    try {
      await apiClient.delete(`/suspect/${deletingSuspect.ID}`);
      toast.success('Suspect deleted successfully!');
      setDeleteDialogOpen(false);
      setDeletingSuspect(null);
      mutate();
    } catch (err: any) {
      alert(err?.info?.message || err?.message || 'Failed to delete suspect');
    } finally {
      setFormLoading(false);
    }
  }

  const handleViewClick = async (suspect: any) => {
    setViewingSuspect(null)
    setViewDialogOpen(true)
    setViewLoading(true)
    try {
      // Optionally fetch latest data for the suspect
      const res = await fetcher(`/suspect/${suspect.id ?? suspect.ID}`)
      setViewingSuspect(res.data || res)
    } catch (err) {
      setViewingSuspect(suspect) // fallback to passed data
    } finally {
      setViewLoading(false)
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
          <Button onClick={() => setAddDialogOpen(true)}>Add Suspect</Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedAccounts.length === suspects.length && suspects.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Middle Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>NIN</TableHead>
              <TableHead>Nationality</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Occupation</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suspects.map((suspect: any) => (
              <TableRow key={suspect.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedAccounts.includes(suspect.id?.toString())}
                    onCheckedChange={() => toggleSelectAccount(suspect.id?.toString())}
                  />
                </TableCell>
                <TableCell className="font-medium">{suspect.id}</TableCell>
                <TableCell>{suspect.first_name}</TableCell>
                <TableCell>{suspect.middle_name}</TableCell>
                <TableCell>{suspect.last_name}</TableCell>
                <TableCell>{suspect.gender}</TableCell>
                <TableCell>{suspect.dob}</TableCell>
                <TableCell>{suspect.phone_number}</TableCell>
                <TableCell>{suspect.nin}</TableCell>
                <TableCell>{suspect.nationality}</TableCell>
                <TableCell>{suspect.address}</TableCell>
                <TableCell>{suspect.occupation}</TableCell>
                <TableCell>{suspect.status}</TableCell>
                <TableCell>{suspect.created_by}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewClick(suspect)}>View</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditClick(suspect)}>Edit</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(suspect)}>Delete</DropdownMenuItem>
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
          Showing <strong>1</strong> to <strong>{suspects.length}</strong> of <strong>{suspects.length}</strong> results
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
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Police Suspect</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSaveSuspect}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="first_name" placeholder="First Name" required />
              <Input name="middle_name" placeholder="Middle Name" required />
              <Input name="last_name" placeholder="Last Name" required />
              <Input name="dob" type="date" required />
              <select name="gender" required className="w-full border rounded px-3 py-2">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <Input name="phone_number" placeholder="Phone Number" required />
              <Input name="nin" placeholder="NIN" required />
              <Input name="nationality" placeholder="Nationality" required />
              <Input name="address" placeholder="Address" required />
              <Input name="occupation" placeholder="Occupation" required />
              <Input name="status" placeholder="Status" required />
              <Input name="created_by" placeholder="Created By" required />
            </div>
            <div>
              <Label>Photo</Label>
              <Input name="photo" type="file" accept="image/*" required />
            </div>
            <div>
              <Label>Fingerprints (PDF)</Label>
              <Input name="fingerprints" type="file" accept="application/pdf" required />
            </div>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={formLoading} onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Suspect Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Police Suspect</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleEditSuspect}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input name="first_name" placeholder="First Name" defaultValue={editingSuspect?.first_name} required />
              <Input name="middle_name" placeholder="Middle Name" defaultValue={editingSuspect?.middle_name} required />
              <Input name="last_name" placeholder="Last Name" defaultValue={editingSuspect?.last_name} required />
              <Input name="dob" type="date" defaultValue={editingSuspect?.dob} required />
              <select name="gender" required className="w-full border rounded px-3 py-2" defaultValue={editingSuspect?.gender}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <Input name="phone_number" placeholder="Phone Number" defaultValue={editingSuspect?.phone_number} required />
              <Input name="nin" placeholder="NIN" defaultValue={editingSuspect?.nin} required />
              <Input name="nationality" placeholder="Nationality" defaultValue={editingSuspect?.nationality} required />
              <Input name="address" placeholder="Address" defaultValue={editingSuspect?.address} required />
              <Input name="occupation" placeholder="Occupation" defaultValue={editingSuspect?.occupation} required />
              <Input name="status" placeholder="Status" defaultValue={editingSuspect?.status} required />
              <Input name="updated_by" placeholder="Updated By" defaultValue={editingSuspect?.created_by} required />
            </div>
            <div>
              <Label>Photo</Label>
              <Input name="photo" type="file" accept="image/*" />
            </div>
            <div>
              <Label>Fingerprints (PDF)</Label>
              <Input name="fingerprints" type="file" accept="application/pdf" />
            </div>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={formLoading} onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Suspect</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this suspect? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false)
                setDeletingSuspect(null)
              }}
              disabled={formLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSuspect} disabled={formLoading}>
              {formLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Suspect Profile Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Suspect Profile</DialogTitle>
          </DialogHeader>
          {viewLoading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : viewingSuspect ? (
            <div className="flex flex-col items-center gap-4 py-4">
              {viewingSuspect.photo ? (
                <img
                  src={typeof viewingSuspect.photo === 'string' ? viewingSuspect.photo : ''}
                  alt="Suspect Photo"
                  className="w-32 h-32 rounded-full object-cover border"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                  <DefaultAvatar />
                </div>
              )}
              <div className="text-xl font-bold">{viewingSuspect.first_name} {viewingSuspect.middle_name} {viewingSuspect.last_name}</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 w-full mt-2">
                <div><span className="font-semibold">Gender:</span> {viewingSuspect.gender}</div>
                <div><span className="font-semibold">DOB:</span> {viewingSuspect.dob}</div>
                <div><span className="font-semibold">Phone:</span> {viewingSuspect.phone_number}</div>
                <div><span className="font-semibold">NIN:</span> {viewingSuspect.nin}</div>
                <div><span className="font-semibold">Nationality:</span> {viewingSuspect.nationality}</div>
                <div><span className="font-semibold">Address:</span> {viewingSuspect.address}</div>
                <div><span className="font-semibold">Occupation:</span> {viewingSuspect.occupation}</div>
                <div><span className="font-semibold">Status:</span> {viewingSuspect.status}</div>
                <div><span className="font-semibold">Created By:</span> {viewingSuspect.created_by}</div>
                <div><span className="font-semibold">Updated By:</span> {viewingSuspect.updated_by}</div>
              </div>
              {viewingSuspect.fingerprints && (
                <div className="mt-4">
                  <a
                    href={typeof viewingSuspect.fingerprints === 'string' ? viewingSuspect.fingerprints : '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View Fingerprints (PDF)
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-red-500">Failed to load suspect details.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}