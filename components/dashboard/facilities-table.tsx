'use client'

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
import { MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function FacilitiesTable() {
  const { data, error, isLoading, mutate } = useSWR('/health-facilities', fetcher)
  const facilities = data?.data || []
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingFacility, setEditingFacility] = useState<any | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingFacility, setDeletingFacility] = useState<any | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  const handleSaveFacility = async (e: any) => {
    e.preventDefault()
    setFormLoading(true)
    const formData = new FormData(e.currentTarget)
    const payload = {
      name: formData.get('name') as string,
      location: formData.get('location') as string,
      contact: formData.get('contact') as string,
    }
    try {
      await apiClient.post('/health-facility', payload)
      toast.success('Health facility added successfully!')
      setAddDialogOpen(false)
      mutate()
    } catch (err: any) {
      toast.error(err?.info?.message || err?.message || 'Failed to add facility')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEditClick = (facility: any) => {
    setEditingFacility(facility)
    setEditDialogOpen(true)
  }

  const handleEditFacility = async (e: any) => {
    e.preventDefault()
    setFormLoading(true)
    const formData = new FormData(e.currentTarget)
    const payload = {
      name: formData.get('name') as string,
      location: formData.get('location') as string,
      contact: formData.get('contact') as string,
    }
    try {
      await apiClient.put(`/health-facility/${editingFacility.id ?? editingFacility.ID}`, payload)
      toast.success('Health facility updated successfully!')
      setEditDialogOpen(false)
      setEditingFacility(null)
      mutate()
    } catch (err: any) {
      toast.error(err?.info?.message || err?.message || 'Failed to update facility')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteClick = (facility: any) => {
    setDeletingFacility(facility)
    setDeleteDialogOpen(true)
  }

  const handleDeleteFacility = async () => {
    if (!deletingFacility) return
    setFormLoading(true)
    try {
      await apiClient.delete(`/health-facility/${deletingFacility.id ?? deletingFacility.ID}`)
      toast.success('Health facility deleted successfully!')
      setDeleteDialogOpen(false)
      setDeletingFacility(null)
      mutate()
    } catch (err: any) {
      toast.error(err?.info?.message || err?.message || 'Failed to delete facility')
    } finally {
      setFormLoading(false)
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Failed to load health facilities.</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button onClick={() => setAddDialogOpen(true)}>Add Facility</Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="w-[40px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {facilities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">No facilities found.</TableCell>
              </TableRow>
            ) : (
              facilities.map((facility: any, idx: number) => (
                <TableRow key={facility.id ?? facility.ID ?? `row-${idx}`}> 
                  <TableCell>{facility.id ?? facility.ID}</TableCell>
                  <TableCell>{facility.name}</TableCell>
                  <TableCell>{facility.location}</TableCell>
                  <TableCell>{facility.contact}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditClick(facility)}>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(facility)}>Delete</DropdownMenuItem>
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
            <DialogTitle>Add Health Facility</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveFacility} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required disabled={formLoading} placeholder="e.g., Mulago Hospital" />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" required disabled={formLoading} placeholder="e.g., Kampala" />
            </div>
            <div>
              <Label htmlFor="contact">Contact</Label>
              <Input id="contact" name="contact" required disabled={formLoading} placeholder="e.g., 0700 000000" />
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
            <DialogTitle>Edit Health Facility</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditFacility} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" name="name" required disabled={formLoading} defaultValue={editingFacility?.name} placeholder="e.g., Mulago Hospital" />
            </div>
            <div>
              <Label htmlFor="edit-location">Location</Label>
              <Input id="edit-location" name="location" required disabled={formLoading} defaultValue={editingFacility?.location} placeholder="e.g., Kampala" />
            </div>
            <div>
              <Label htmlFor="edit-contact">Contact</Label>
              <Input id="edit-contact" name="contact" required disabled={formLoading} defaultValue={editingFacility?.contact} placeholder="e.g., 0700 000000" />
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
            <AlertDialogTitle>Delete Health Facility</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this health facility? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteDialogOpen(false)
                setDeletingFacility(null)
              }}
              disabled={formLoading}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFacility} disabled={formLoading}>
              {formLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}