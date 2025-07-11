"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { apiClient, fetcher } from "@/lib/api";
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
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

export default function FacilitiesTable() {
  const { data, error, isLoading, mutate } = useSWR("/health-facilities", fetcher);
  const facilities = data?.data || [];
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingFacility, setEditingFacility] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingFacility, setDeletingFacility] = useState<any | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const handleSaveFacility = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name") as string,
      location: formData.get("location") as string,
      contact: formData.get("contact") as string,
    };
    try {
      await apiClient.post("/health-facility", payload);
      toast.success("Health facility added successfully!");
      setAddDialogOpen(false);
      mutate();
    } catch (err: any) {
      toast.error(
        err?.info?.message || err?.message || "Failed to add facility"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClick = (facility: any) => {
    setEditingFacility(facility);
    setEditDialogOpen(true);
  };

  const handleEditFacility = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name") as string,
      location: formData.get("location") as string,
      contact: formData.get("contact") as string,
    };
    try {
      await apiClient.put(
        `/health-facility/${editingFacility.id ?? editingFacility.ID}`,
        payload
      );
      toast.success("Health facility updated successfully!");
      setEditDialogOpen(false);
      setEditingFacility(null);
      mutate();
    } catch (err: any) {
      toast.error(
        err?.info?.message || err?.message || "Failed to update facility"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = (facility: any) => {
    setDeletingFacility(facility);
    setDeleteDialogOpen(true);
  };

  const handleDeleteFacility = async () => {
    if (!deletingFacility) return;
    setFormLoading(true);
    try {
      await apiClient.delete(
        `/health-facility/${deletingFacility.id ?? deletingFacility.ID}`
      );
      toast.success("Health facility deleted successfully!");
      setDeleteDialogOpen(false);
      setDeletingFacility(null);
      mutate();
    } catch (err: any) {
      toast.error(
        err?.info?.message || err?.message || "Failed to delete facility"
      );
    } finally {
      setFormLoading(false);
    }
  };

  if (isLoading) return <div className="text-blue-900 text-center py-4">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-4">Failed to load health facilities.</div>;

  return (
    <>
      <style>{hideScrollbarStyles}</style>
      <div className="space-y-4 p-6 bg-gray-100 min-h-screen">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-blue-900">Health Facilities</h2>
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="bg-blue-800 hover:bg-blue-900 text-white transition-all duration-300"
          >
            Add Facility
          </Button>
        </div>
        <div className="rounded-xl border border-blue-200 bg-white shadow-lg hide-scrollbar overflow-auto max-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-blue-200 hover:bg-gray-200">
                <TableHead className="w-[80px] text-blue-900">ID</TableHead>
                <TableHead className="text-blue-900">Name</TableHead>
                <TableHead className="text-blue-900">Location</TableHead>
                <TableHead className="text-blue-900">Contact</TableHead>
                <TableHead className="w-[40px] text-blue-900">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {facilities.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-blue-900 py-4"
                  >
                    No facilities found.
                  </TableCell>
                </TableRow>
              ) : (
                facilities.map((facility: any, idx: number) => (
                  <TableRow
                    key={facility.id ?? facility.ID ?? `row-${idx}`}
                    className="border-t border-blue-200 hover:bg-gray-200 transition-all duration-200"
                  >
                    <TableCell className="text-blue-900">
                      {facility.id ?? facility.ID}
                    </TableCell>
                    <TableCell className="text-blue-900">
                      {facility.name}
                    </TableCell>
                    <TableCell className="text-blue-900">
                      {facility.location}
                    </TableCell>
                    <TableCell className="text-blue-900">
                      {facility.contact}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-blue-900 hover:bg-gray-200"
                          >
                            <MoreHorizontal className="h-4 w-4 text-blue-900" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-white border border-blue-200 text-blue-900"
                        >
                          <DropdownMenuItem
                            onClick={() => handleEditClick(facility)}
                            className="hover:bg-gray-200 text-blue-900"
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-blue-200" />
                          <DropdownMenuItem
                            className="text-red-500 hover:bg-red-100"
                            onClick={() => handleDeleteClick(facility)}
                          >
                            Delete
                          </DropdownMenuItem>
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
          <DialogContent className="bg-white border border-blue-200 text-blue-900 hide-scrollbar max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-blue-900">Add Health Facility</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveFacility} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-blue-900">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  required
                  disabled={formLoading}
                  placeholder="e.g., Mulago Hospital"
                  className="w-full bg-white border border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <Label htmlFor="location" className="text-blue-900">
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  required
                  disabled={formLoading}
                  placeholder="e.g., Kampala"
                  className="w-full bg-white border border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <Label htmlFor="contact" className="text-blue-900">
                  Contact
                </Label>
                <Input
                  id="contact"
                  name="contact"
                  required
                  disabled={formLoading}
                  placeholder="e.g., 0700 000000"
                  className="w-full bg-white border border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={formLoading}
                    className="bg-white border border-blue-200 text-blue-900 hover:bg-gray-200"
                    onClick={() => setAddDialogOpen(false)}
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
        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="bg-white border border-blue-200 text-blue-900 hide-scrollbar max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-blue-900">Edit Health Facility</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditFacility} className="space-y-4">
              <div>
                <Label htmlFor="edit-name" className="text-blue-900">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  required
                  disabled={formLoading}
                  defaultValue={editingFacility?.name}
                  placeholder="e.g., Mulago Hospital"
                  className="w-full bg-white border border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <Label htmlFor="edit-location" className="text-blue-900">
                  Location
                </Label>
                <Input
                  id="edit-location"
                  name="location"
                  required
                  disabled={formLoading}
                  defaultValue={editingFacility?.location}
                  placeholder="e.g., Kampala"
                  className="w-full bg-white border border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <Label htmlFor="edit-contact" className="text-blue-900">
                  Contact
                </Label>
                <Input
                  id="edit-contact"
                  name="contact"
                  required
                  disabled={formLoading}
                  defaultValue={editingFacility?.contact}
                  placeholder="e.g., 0700 000000"
                  className="w-full bg-white border border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={formLoading}
                    className="bg-white border border-blue-200 text-blue-900 hover:bg-gray-200"
                    onClick={() => setEditDialogOpen(false)}
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
        {/* Delete Confirm Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-white border border-blue-200 text-blue-900">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-blue-900">
                Delete Health Facility
              </AlertDialogTitle>
              <AlertDialogDescription className="text-blue-900">
                Are you sure you want to delete this health facility? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setDeletingFacility(null);
                }}
                disabled={formLoading}
                className="bg-white border border-blue-200 text-blue-900 hover:bg-gray-200"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteFacility}
                disabled={formLoading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {formLoading ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}