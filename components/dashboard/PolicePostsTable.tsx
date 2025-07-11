"use client";

import useSWR from "swr";
import { useState } from "react";
import { MoreHorizontal, ChevronDown, Search } from "lucide-react";
import React from "react";

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
import { fetcher, apiClient } from "@/lib/api";
import { toast } from "react-toastify";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Default avatar SVG with updated colors
const DefaultAvatar = () => (
  <svg viewBox="0 0 128 128" className="w-32 h-32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="64" fill="#E5E7EB" />
    <ellipse cx="64" cy="54" rx="28" ry="28" fill="#E5E7EB" />
    <ellipse cx="64" cy="104" rx="44" ry="24" fill="#E5E7EB" />
  </svg>
);

// Inline CSS for scrollbar hiding
const customStyles = `
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
    overflow: auto;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
`;

const policePostSchema = z.object({
  name: z.string().min(2, { message: "Name is required" }),
  location: z.string().min(2, { message: "Location is required" }),
  contact: z.string().min(2, { message: "Contact is required" }),
});
type PolicePostFormValues = z.infer<typeof policePostSchema>;

export function PolicePostsTable() {
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingPost, setDeletingPost] = useState<any | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingPost, setViewingPost] = useState<any | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const { data, error, isLoading, mutate } = useSWR("/police-posts", fetcher);
  const posts = data?.data || [];

  const toggleSelectAll = () => {
    if (selectedPosts.length === posts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(posts.map((post: any) => post.ID));
    }
  };

  const toggleSelectPost = (id: number) => {
    if (selectedPosts.includes(id)) {
      setSelectedPosts(selectedPosts.filter((pid) => pid !== id));
    } else {
      setSelectedPosts([...selectedPosts, id]);
    }
  };

  const handleDeleteClick = (post: any) => {
    setDeletingPost(post);
    setDeleteDialogOpen(true);
  };

  const handleDeletePost = async () => {
    if (!deletingPost) return;
    setFormLoading(true);
    try {
      await apiClient.delete(`/police-post/${deletingPost.ID}`);
      toast.success("Police post deleted successfully!");
      setDeleteDialogOpen(false);
      setDeletingPost(null);
      mutate();
    } catch (err: any) {
      toast.error(err?.info?.message || err?.message || "Failed to delete police post");
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddClick = () => setAddDialogOpen(true);

  const handleEditClick = (post: any) => {
    setEditingPost(post);
    setEditDialogOpen(true);
  };

  const handleViewClick = async (post: any) => {
    setViewingPost(null);
    setViewDialogOpen(true);
    setViewLoading(true);
    try {
      const res = await fetcher(`/police-post/${post.ID}`);
      setViewingPost(res.data || res);
    } catch (err) {
      setViewingPost(post); // Fallback to passed data
    } finally {
      setViewLoading(false);
    }
  };

  const form = useForm<PolicePostFormValues>({
    resolver: zodResolver(policePostSchema),
    defaultValues: { name: "", location: "", contact: "" },
  });

  React.useEffect(() => {
    if (addDialogOpen || editDialogOpen) {
      if (editDialogOpen && editingPost) {
        form.reset({
          name: editingPost.name || "",
          location: editingPost.location || "",
          contact: editingPost.contact || "",
        });
      } else {
        form.reset({ name: "", location: "", contact: "" });
      }
    }
  }, [addDialogOpen, editDialogOpen, editingPost, form]);

  const onSubmit = async (values: PolicePostFormValues) => {
    setFormLoading(true);
    try {
      if (editDialogOpen) {
        await apiClient.put(`/police-post/${editingPost.ID}`, values);
        toast.success("Police post updated successfully!");
      } else {
        await apiClient.post("/police-post", values);
        toast.success("Police post added successfully!");
      }
      (editDialogOpen ? setEditDialogOpen : setAddDialogOpen)(false);
      setEditingPost(null);
      mutate();
    } catch (err: any) {
      toast.error(err?.info?.message || err?.message || "Failed to save police post");
    } finally {
      setFormLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8 bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-800"></div>
      </div>
    );
  }
  if (error) {
    return <div className="text-red-500 text-center py-8 bg-gray-100">Failed to load police posts.</div>;
  }

  return (
    <>
      <style>{customStyles}</style>
      <div className="space-y-4 p-6 bg-gray-100 min-h-screen">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-900" />
              <Input
                type="search"
                placeholder="Search police posts..."
                className="w-full pl-8 sm:w-[300px] bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 transition-all duration-300"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="ml-auto h-9 bg-white border-blue-200 text-blue-900 hover:bg-gray-200">
                  <ChevronDown className="h-4 w-4 text-blue-900" />
                  <span className="sr-only">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white border-blue-200 text-blue-900">
                <DropdownMenuLabel className="text-blue-900">Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-blue-200" />
                <DropdownMenuItem className="hover:bg-gray-200 text-blue-900">Location</DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-200 text-blue-900">Contact</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2">
            <Select
              defaultValue="10"
              onValueChange={(value) => {
                // Placeholder for pagination logic
              }}
            >
              <SelectTrigger className="h-9 w-[70px] bg-white border-blue-200 text-blue-900 focus:ring-2 focus:ring-blue-600">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent className="bg-white border-blue-200 text-blue-900 hide-scrollbar">
                <SelectItem value="10" className="text-blue-900">10</SelectItem>
                <SelectItem value="20" className="text-blue-900">20</SelectItem>
                <SelectItem value="50" className="text-blue-900">50</SelectItem>
                <SelectItem value="100" className="text-blue-900">100</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleAddClick}
              className="bg-blue-800 hover:bg-blue-900 text-white transition-all duration-300"
            >
              Add Police Post
            </Button>
          </div>
        </div>
        <div className="rounded-xl border border-blue-200 bg-white shadow-lg hide-scrollbar overflow-auto max-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-blue-200 hover:bg-gray-200">
                <TableHead className="w-[40px] text-blue-900">
                  <Checkbox
                    checked={selectedPosts.length === posts.length && posts.length > 0}
                    onCheckedChange={toggleSelectAll}
                    className="border-blue-200 text-blue-600"
                  />
                </TableHead>
                <TableHead className="w-[100px] text-blue-900">ID</TableHead>
                <TableHead className="text-blue-900">Name</TableHead>
                <TableHead className="text-blue-900">Location</TableHead>
                <TableHead className="text-blue-900">Contact</TableHead>
                <TableHead className="w-[40px] text-blue-900"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post: any, index: number) => (
                <TableRow key={post.ID || `post-${index}`} className="border-t border-blue-200 hover:bg-gray-200 transition-all duration-200">
                  <TableCell>
                    <Checkbox
                      checked={selectedPosts.includes(post.ID)}
                      onCheckedChange={() => toggleSelectPost(post.ID)}
                      className="border-blue-200 text-blue-600"
                    />
                  </TableCell>
                  <TableCell className="font-medium text-blue-900">{post.ID}</TableCell>
                  <TableCell className="text-blue-900">{post.name}</TableCell>
                  <TableCell className="text-blue-900">{post.location}</TableCell>
                  <TableCell className="text-blue-900">{post.contact}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-blue-900 hover:bg-gray-200">
                          <MoreHorizontal className="h-4 w-4 text-blue-900" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-blue-200 text-blue-900">
                        <DropdownMenuItem onClick={() => handleViewClick(post)} className="hover:bg-gray-200 text-blue-900">
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClick(post)} className="hover:bg-gray-200 text-blue-900">
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-blue-200" />
                        <DropdownMenuItem className="text-red-500 hover:bg-red-100" onClick={() => handleDeleteClick(post)}>
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
        <div className="flex items-center justify-between text-blue-900">
          <div className="text-sm">
            Showing <strong>1</strong> to <strong>{posts.length}</strong> of <strong>{posts.length}</strong> results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled
              className="bg-white border-blue-200 text-blue-900 hover:bg-gray-200"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled
              className="bg-white border-blue-200 text-blue-900 hover:bg-gray-200"
            >
              Next
            </Button>
          </div>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="bg-white border-blue-200 text-blue-900 hide-scrollbar max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-blue-900">Add Police Post</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-blue-900">Name</Label>
                  <Input
                    {...form.register("name")}
                    placeholder="e.g., Central Police Post"
                    className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                  />
                  <span className="text-xs text-red-500">{form.formState.errors.name?.message}</span>
                </div>
                <div>
                  <Label className="text-blue-900">Location</Label>
                  <Input
                    {...form.register("location")}
                    placeholder="e.g., Kampala"
                    className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                  />
                  <span className="text-xs text-red-500">{form.formState.errors.location?.message}</span>
                </div>
                <div>
                  <Label className="text-blue-900">Contact</Label>
                  <Input
                    {...form.register("contact")}
                    placeholder="e.g., 0700 000000"
                    className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                  />
                  <span className="text-xs text-red-500">{form.formState.errors.contact?.message}</span>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={formLoading}
                    className="bg-white border-blue-200 text-blue-900 hover:bg-gray-200"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="bg-blue-800 hover:bg-blue-900 text-white"
                >
                  {formLoading ? "Saving..." : "Add"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="bg-white border-blue-200 text-blue-900 hide-scrollbar max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-blue-900">Edit Police Post</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-blue-900">Name</Label>
                  <Input
                    {...form.register("name")}
                    placeholder="e.g., Central Police Post"
                    className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                  />
                  <span className="text-xs text-red-500">{form.formState.errors.name?.message}</span>
                </div>
                <div>
                  <Label className="text-blue-900">Location</Label>
                  <Input
                    {...form.register("location")}
                    placeholder="e.g., Kampala"
                    className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                  />
                  <span className="text-xs text-red-500">{form.formState.errors.location?.message}</span>
                </div>
                <div>
                  <Label className="text-blue-900">Contact</Label>
                  <Input
                    {...form.register("contact")}
                    placeholder="e.g., 0700 000000"
                    className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                  />
                  <span className="text-xs text-red-500">{form.formState.errors.contact?.message}</span>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={formLoading}
                    className="bg-white border-blue-200 text-blue-900 hover:bg-gray-200"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="bg-blue-800 hover:bg-blue-900 text-white"
                >
                  {formLoading ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-white border-blue-200 text-blue-900 hide-scrollbar max-h-[80vh] overflow-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-blue-900">Delete Police Post</AlertDialogTitle>
              <AlertDialogDescription className="text-blue-900">
                Are you sure you want to delete this police post? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setDeletingPost(null);
                }}
                disabled={formLoading}
                className="bg-white border-blue-200 text-blue-900 hover:bg-gray-200"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePost}
                disabled={formLoading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {formLoading ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-lg bg-white border-blue-200 text-blue-900 hide-scrollbar max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-blue-900">Police Post Details</DialogTitle>
            </DialogHeader>
            {viewLoading ? (
              <div className="py-8 text-center text-blue-900">Loading...</div>
            ) : viewingPost ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="text-xl font-bold text-blue-900">{viewingPost.name}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 w-full mt-2">
                  <div><span className="font-semibold text-blue-900">Location:</span> {viewingPost.location}</div>
                  <div><span className="font-semibold text-blue-900">Contact:</span> {viewingPost.contact}</div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-red-500">Failed to load police post details.</div>
            )}
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="bg-white border-blue-200 text-blue-900 hover:bg-gray-200"
                >
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}