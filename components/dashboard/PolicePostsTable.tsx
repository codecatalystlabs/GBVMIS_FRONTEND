"use client"

import useSWR from "swr"
import { useState } from "react"
import { MoreHorizontal, ChevronDown, Search, ArrowUpDown } from "lucide-react"
import React from "react"

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { fetcher, apiClient } from "@/lib/api"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useToast } from "@/hooks/use-toast"
import { toast } from "react-toastify"
import { Dialog as ViewDialog, DialogContent as ViewDialogContent, DialogHeader as ViewDialogHeader, DialogTitle as ViewDialogTitle, DialogDescription as ViewDialogDescription } from "@/components/ui/dialog"

const policePostSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  location: z.string().min(2, { message: "Location is required" }),
  contact: z.string().min(2, { message: "Contact is required" }),
})
type PolicePostFormValues = z.infer<typeof policePostSchema>

export function PolicePostsTable() {
  const [selectedPosts, setSelectedPosts] = useState<number[]>([])
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [editingPost, setEditingPost] = useState<any | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewLoading, setViewLoading] = useState(false)
  const [viewDetails, setViewDetails] = useState<any | null>(null)

  const { data, error, isLoading, mutate } = useSWR("/police-posts", fetcher)

  const posts = data?.data || []

  const toggleSelectAll = () => {
    if (selectedPosts.length === posts.length) {
      setSelectedPosts([])
    } else {
      setSelectedPosts(posts.map((post: any) => post.ID))
    }
  }

  const toggleSelectPost = (id: number) => {
    if (selectedPosts.includes(id)) {
      setSelectedPosts(selectedPosts.filter((pid) => pid !== id))
    } else {
      setSelectedPosts([...selectedPosts, id])
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    try {
      await apiClient.delete(`/police-post/${deleteId}`)
      setDeleteId(null)
      setIsDialogOpen(false)
      mutate()
    } catch (err) {
      // Optionally show error toast
      alert("Failed to delete post.")
    } finally {
      setIsDeleting(false)
    }
  }

  const form = useForm<PolicePostFormValues>({
    resolver: zodResolver(policePostSchema),
    defaultValues: { name: '', location: '', contact: '' },
  })

  // Reset form when dialog opens/closes or editingPost changes
  React.useEffect(() => {
    if (dialogOpen) {
      if (dialogMode === 'edit' && editingPost) {
        form.reset({
          name: editingPost.name || '',
          location: editingPost.location || '',
          contact: editingPost.contact || '',
        })
      } else {
        form.reset({ name: '', location: '', contact: '' })
      }
    }
  }, [dialogOpen, dialogMode, editingPost, form])

  const handleAddClick = () => {
    setDialogMode('add')
    setEditingPost(null)
    setDialogOpen(true)
  }

  const handleEditClick = (post: any) => {
    setDialogMode('edit')
    setEditingPost(post)
    setDialogOpen(true)
  }

  const handleViewClick = async (id: number) => {
    setViewDialogOpen(true)
    setViewLoading(true)
    setViewDetails(null)
    try {
      const res = await fetcher(`/police-post/${id}`)
      setViewDetails(res.data || res)
    } catch (err: any) {
      toast.error(err?.info?.message || err?.message || 'Failed to fetch details')
      setViewDialogOpen(false)
    } finally {
      setViewLoading(false)
    }
  }

  const onSubmit = async (values: PolicePostFormValues) => {
    setFormLoading(true)
    try {
      if (dialogMode === 'add') {
        await apiClient.post('/police-post', values)
        toast.success('The police post was added successfully.')
      } else if (dialogMode === 'edit') {
          await apiClient.put(`/police-post/${editingPost.id}`, values)
          toast.success('The police post was updated successfully.')

      }
      setDialogOpen(false)
      mutate()
    } catch (err: any) {
      toast.error(err?.info?.message || err?.message)
    } finally {
      setFormLoading(false)
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Failed to load police posts.</div>

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search police posts..." className="w-full pl-8 sm:w-[300px]" />
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
              <DropdownMenuItem>Location</DropdownMenuItem>
              <DropdownMenuItem>Contact</DropdownMenuItem>
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
          <Button onClick={handleAddClick}>Add Police Post</Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedPosts.length === posts.length && posts.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.map((post: any, idx: number) => (
              <TableRow key={post.ID ?? `row-${idx}`}>
                <TableCell>
                  <Checkbox
                    checked={selectedPosts.includes(post.ID)}
                    onCheckedChange={() => toggleSelectPost(post.ID)}
                  />
                </TableCell>
                <TableCell className="font-medium">{post.ID}</TableCell>
                <TableCell>{post.name}</TableCell>
                <TableCell>{post.location}</TableCell>
                <TableCell>{post.contact}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* <DropdownMenuItem onClick={() => handleViewClick(post.ID)}>View</DropdownMenuItem> */}
                      <DropdownMenuItem onClick={() => handleEditClick(post)}>Edit</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setDeleteId(post.ID)
                          setIsDialogOpen(true)
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
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
          Showing <strong>1</strong> to <strong>{posts.length}</strong> of{" "}
          <strong>{data?.pagination?.total_items || 0}</strong> results
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
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Police Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this police post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDialogOpen(false)
                setDeleteId(null)
              }}
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogMode === 'add' ? 'Add Police Post' : 'Edit Police Post'}</DialogTitle>
            <DialogDescription>
              {dialogMode === 'add' ? 'Fill in the details to add a new police post.' : 'Update the details of the police post.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" disabled={formLoading} {...form.register('name')} placeholder="e.g., Central Police Post" />
              <span className="text-xs text-destructive">{form.formState.errors.name?.message as string}</span>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" disabled={formLoading} {...form.register('location')} placeholder="e.g., Kampala" />
              <span className="text-xs text-destructive">{form.formState.errors.location?.message as string}</span>
            </div>
            <div>
              <Label htmlFor="contact">Contact</Label>
              <Input id="contact" disabled={formLoading} {...form.register('contact')} placeholder="e.g., 0700 000000" />
              <span className="text-xs text-destructive">{form.formState.errors.contact?.message as string}</span>
            </div>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={formLoading} onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? (dialogMode === 'add' ? 'Adding...' : 'Saving...') : (dialogMode === 'add' ? 'Add' : 'Save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ViewDialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <ViewDialogContent>
          <ViewDialogHeader>
            <ViewDialogTitle>Police Post Details</ViewDialogTitle>
            <ViewDialogDescription>
              View all details for this police post.
            </ViewDialogDescription>
          </ViewDialogHeader>
          {viewLoading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : viewDetails ? (
            <div className="space-y-4">
              <div>
                <Label>ID</Label>
                <div className="border rounded px-3 py-2 bg-muted">{viewDetails.ID ?? viewDetails.id}</div>
              </div>
              <div>
                <Label>Name</Label>
                <div className="border rounded px-3 py-2 bg-muted">{viewDetails.name}</div>
              </div>
              <div>
                <Label>Location</Label>
                <div className="border rounded px-3 py-2 bg-muted">{viewDetails.location}</div>
              </div>
              <div>
                <Label>Contact</Label>
                <div className="border rounded px-3 py-2 bg-muted">{viewDetails.contact}</div>
              </div>
              {/* Add more fields here if needed */}
            </div>
          ) : (
            <div className="py-8 text-center text-destructive">No details found.</div>
          )}
        </ViewDialogContent>
      </ViewDialog>
    </div>
  )
}
