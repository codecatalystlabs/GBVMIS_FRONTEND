"use client"

import React, { useState } from 'react'
import useSWR from 'swr'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { apiClient, fetcher } from '@/lib/api'
import { toast } from 'react-toastify'
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
import { MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'

export default function HealthPractitionersTable() {
  const { data, error, isLoading, mutate } = useSWR('/health-practitioners', fetcher)
  const practitioners = data?.data || []
  const { data: facilitiesData } = useSWR('/health-facilities', fetcher)
  const facilities = facilitiesData?.data || []
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingPractitioner, setEditingPractitioner] = useState<any | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingPractitioner, setDeletingPractitioner] = useState<any | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [addGender, setAddGender] = useState("");
  const [editGender, setEditGender] = useState("");
  const [addFacilityId, setAddFacilityId] = useState("");
  const [editFacilityId, setEditFacilityId] = useState("");

  const handleSavePractitioner = async (e: any) => {
    e.preventDefault()
    setFormLoading(true)
    const formData = new FormData(e.currentTarget)
    const payload = {
      facility_id: Number(addFacilityId),
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      gender: addGender,
      phone: formData.get('phone') as string,
      profession: formData.get('profession') as string,
    }
    try {
      await apiClient.post('/health-practitioner', payload)
      toast.success('Health practitioner added successfully!')
      setAddDialogOpen(false)
      mutate()
    } catch (err: any) {
      toast.error(err?.info?.message || err?.message || 'Failed to add practitioner')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditClick = (practitioner: any) => {
    setEditingPractitioner(practitioner)
    setEditGender(practitioner.gender || "")
    setEditFacilityId(practitioner.facility_id ? String(practitioner.facility_id) : "")
    setEditDialogOpen(true)
  }

  const handleEditPractitioner = async (e: any) => {
    e.preventDefault()
    setFormLoading(true)
    const formData = new FormData(e.currentTarget)
    const payload = {
      facility_id: Number(editFacilityId),
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      gender: editGender,
      phone: formData.get('phone') as string,
      profession: formData.get('profession') as string,
    }
    try {
      await apiClient.put(`/health-practitioner/${editingPractitioner.id ?? editingPractitioner.ID}`, payload)
      toast.success('Health practitioner updated successfully!')
      setEditDialogOpen(false)
      setEditingPractitioner(null)
      mutate()
    } catch (err: any) {
      toast.error(err?.info?.message || err?.message || 'Failed to update practitioner')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteClick = (practitioner: any) => {
    setDeletingPractitioner(practitioner)
    setDeleteDialogOpen(true)
  }

  const handleDeletePractitioner = async () => {
    if (!deletingPractitioner) return
    setFormLoading(true)
    try {
      await apiClient.delete(`/health-practitioner/${deletingPractitioner.id ?? deletingPractitioner.ID}`)
      toast.success('Health practitioner deleted successfully!')
      setDeleteDialogOpen(false)
      setDeletingPractitioner(null)
      mutate()
    } catch (err: any) {
      toast.error(err?.info?.message || err?.message || 'Failed to delete practitioner')
    } finally {
      setFormLoading(false)
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Failed to load health practitioners.</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Health Practitioners</h2>
        <Button onClick={() => setAddDialogOpen(true)}>Add Practitioner</Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Facility</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Profession</TableHead>
              <TableHead className="w-[40px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {practitioners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">No practitioners found.</TableCell>
              </TableRow>
            ) : (
              practitioners.map((practitioner: any, idx: number) => (
                <TableRow key={practitioner.id ?? practitioner.ID ?? `row-${idx}`}> 
                  <TableCell>{practitioner.id ?? practitioner.ID}</TableCell>
                  <TableCell>{facilities.find((f: any) => f.id === practitioner.facility_id)?.name || practitioner.facility_id}</TableCell>
                  <TableCell>{practitioner.first_name}</TableCell>
                  <TableCell>{practitioner.last_name}</TableCell>
                  <TableCell>{practitioner.gender}</TableCell>
                  <TableCell>{practitioner.phone}</TableCell>
                  <TableCell>{practitioner.profession}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClick(practitioner)}>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(practitioner)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Health Practitioner</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSavePractitioner} className="space-y-4">
            <div>
              <Label htmlFor="facility_id">Facility</Label>
              <Select value={addFacilityId} onValueChange={setAddFacilityId} disabled={formLoading} required name="facility_id">
                <SelectTrigger id="facility_id">
                  <SelectValue placeholder="Select facility" />
                </SelectTrigger>
                <SelectContent>
                  {facilities.map((f: any) => (
                    <SelectItem key={f.id ?? f.ID} value={String(f.id ?? f.ID)}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input id="first_name" name="first_name" required disabled={formLoading} placeholder="e.g., John" />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input id="last_name" name="last_name" required disabled={formLoading} placeholder="e.g., Doe" />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select value={addGender} onValueChange={setAddGender} disabled={formLoading} required name="gender">
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" required disabled={formLoading} placeholder="e.g., 0700 000000" />
            </div>
            <div>
              <Label htmlFor="profession">Profession</Label>
              <Input id="profession" name="profession" required disabled={formLoading} placeholder="e.g., Nurse" />
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
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Health Practitioner</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditPractitioner} className="space-y-4">
            <div>
              <Label htmlFor="edit-facility_id">Facility</Label>
              <Select value={editFacilityId} onValueChange={setEditFacilityId} disabled={formLoading} required name="facility_id">
                <SelectTrigger id="edit-facility_id">
                  <SelectValue placeholder="Select facility" />
                </SelectTrigger>
                <SelectContent>
                  {facilities.map((f: any) => (
                    <SelectItem key={f.id ?? f.ID} value={String(f.id ?? f.ID)}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-first_name">First Name</Label>
              <Input id="edit-first_name" name="first_name" required disabled={formLoading} defaultValue={editingPractitioner?.first_name} placeholder="e.g., John" />
            </div>
            <div>
              <Label htmlFor="edit-last_name">Last Name</Label>
              <Input id="edit-last_name" name="last_name" required disabled={formLoading} defaultValue={editingPractitioner?.last_name} placeholder="e.g., Doe" />
            </div>
            <div>
              <Label htmlFor="edit-gender">Gender</Label>
              <Select value={editGender} onValueChange={setEditGender} disabled={formLoading} required name="gender">
                <SelectTrigger id="edit-gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone</Label>
              <Input id="edit-phone" name="phone" required disabled={formLoading} defaultValue={editingPractitioner?.phone} placeholder="e.g., 0700 000000" />
            </div>
            <div>
              <Label htmlFor="edit-profession">Profession</Label>
              <Input id="edit-profession" name="profession" required disabled={formLoading} defaultValue={editingPractitioner?.profession} placeholder="e.g., Nurse" />
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
            <AlertDialogTitle>Delete Health Practitioner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this health practitioner? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false)
                setDeletingPractitioner(null)
              }}
              disabled={formLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePractitioner} disabled={formLoading}>
              {formLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 