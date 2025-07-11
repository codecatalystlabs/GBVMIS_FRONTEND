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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

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

export default function HealthPractitionersTable() {
  const { data, error, isLoading, mutate } = useSWR("/health-practitioners", fetcher);
  const practitioners = data?.data || [];
  const { data: facilitiesData } = useSWR("/health-facilities", fetcher);
  const facilities = facilitiesData?.data || [];
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPractitioner, setEditingPractitioner] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingPractitioner, setDeletingPractitioner] = useState<any | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [addGender, setAddGender] = useState("");
  const [editGender, setEditGender] = useState("");
  const [addFacilityId, setAddFacilityId] = useState("");
  const [editFacilityId, setEditFacilityId] = useState("");

  const handleSavePractitioner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      facility_id: Number(addFacilityId),
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      gender: addGender,
      phone: formData.get("phone") as string,
      profession: formData.get("profession") as string,
    };
    try {
      await apiClient.post("/health-practitioner", payload);
      toast.success("Health practitioner added successfully!");
      setAddDialogOpen(false);
      mutate();
    } catch (err: any) {
      toast.error(
        err?.info?.message || err?.message || "Failed to add practitioner"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClick = (practitioner: any) => {
    setEditingPractitioner(practitioner);
    setEditGender(practitioner.gender || "");
    setEditFacilityId(practitioner.facility_id ? String(practitioner.facility_id) : "");
    setEditDialogOpen(true);
  };

  const handleEditPractitioner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      facility_id: Number(editFacilityId),
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      gender: editGender,
      phone: formData.get("phone") as string,
      profession: formData.get("profession") as string,
    };
    try {
      await apiClient.put(
        `/health-practitioner/${editingPractitioner.id ?? editingPractitioner.ID}`,
        payload
      );
      toast.success("Health practitioner updated successfully!");
      setEditDialogOpen(false);
      setEditingPractitioner(null);
      mutate();
    } catch (err: any) {
      toast.error(
        err?.info?.message || err?.message || "Failed to update practitioner"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = (practitioner: any) => {
    setDeletingPractitioner(practitioner);
    setDeleteDialogOpen(true);
  };

  const handleDeletePractitioner = async () => {
    if (!deletingPractitioner) return;
    setFormLoading(true);
    try {
      await apiClient.delete(
        `/health-practitioner/${deletingPractitioner.id ?? deletingPractitioner.ID}`
      );
      toast.success("Health practitioner deleted successfully!");
      setDeleteDialogOpen(false);
      setDeletingPractitioner(null);
      mutate();
    } catch (err: any) {
      toast.error(
        err?.info?.message || err?.message || "Failed to delete practitioner"
      );
    } finally {
      setFormLoading(false);
    }
  };

  if (isLoading) return <div className="text-blue-900 text-center py-4">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-4">Failed to load health practitioners.</div>;

  return (
    <>
      <style>{hideScrollbarStyles}</style>
      <div className="space-y-4 p-6 bg-gray-100 min-h-screen">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-blue-900">Health Practitioners</h2>
          <Button
            onClick={() => setAddDialogOpen(true)}
            className="bg-blue-800 hover:bg-blue-900 text-white transition-all duration-300"
          >
            Add Practitioner
          </Button>
        </div>
        <div className="rounded-xl border border-blue-200 bg-white shadow-lg hide-scrollbar overflow-auto max-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-blue-200 hover:bg-gray-200">
                <TableHead className="w-[80px] text-blue-900">ID</TableHead>
                <TableHead className="text-blue-900">Facility</TableHead>
                <TableHead className="text-blue-900">First Name</TableHead>
                <TableHead className="text-blue-900">Last Name</TableHead>
                <TableHead className="text-blue-900">Gender</TableHead>
                <TableHead className="text-blue-900">Phone</TableHead>
                <TableHead className="text-blue-900">Profession</TableHead>
                <TableHead className="w-[40px] text-blue-900">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {practitioners.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-blue-900 py-4"
                  >
                    No practitioners found.
                  </TableCell>
                </TableRow>
              ) : (
                practitioners.map((practitioner: any, idx: number) => (
                  <TableRow
                    key={practitioner.id ?? practitioner.ID ?? `row-${idx}`}
                    className="border-t border-blue-200 hover:bg-gray-200 transition-all duration-200"
                  >
                    <TableCell className="text-blue-900">
                      {practitioner.id ?? practitioner.ID}
                    </TableCell>
                    <TableCell className="text-blue-900">
                      {facilities.find((f: any) => f.id === practitioner.facility_id)?.name ||
                        practitioner.facility_id}
                    </TableCell>
                    <TableCell className="text-blue-900">
                      {practitioner.first_name}
                    </TableCell>
                    <TableCell className="text-blue-900">
                      {practitioner.last_name}
                    </TableCell>
                    <TableCell className="text-blue-900">
                      {practitioner.gender}
                    </TableCell>
                    <TableCell className="text-blue-900">
                      {practitioner.phone}
                    </TableCell>
                    <TableCell className="text-blue-900">
                      {practitioner.profession}
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
                            onClick={() => handleEditClick(practitioner)}
                            className="hover:bg-gray-200 text-blue-900"
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-blue-200" />
                          <DropdownMenuItem
                            className="text-red-500 hover:bg-red-100"
                            onClick={() => handleDeleteClick(practitioner)}
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
              <DialogTitle className="text-blue-900">Add Health Practitioner</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSavePractitioner} className="space-y-4">
              <div>
                <Label htmlFor="facility_id" className="text-blue-900">
                  Facility
                </Label>
                <Select
                  value={addFacilityId}
                  onValueChange={setAddFacilityId}
                  disabled={formLoading}
                  required
                  name="facility_id"
                >
                  <SelectTrigger
                    id="facility_id"
                    className="w-full bg-white border border-blue-200 text-blue-900 focus:ring-2 focus:ring-blue-600"
                  >
                    <SelectValue placeholder="Select facility" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-blue-200 text-blue-900 hide-scrollbar">
                    {facilities.map((f: any) => (
                      <SelectItem
                        key={f.id ?? f.ID}
                        value={String(f.id ?? f.ID)}
                        className="text-blue-900"
                      >
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="first_name" className="text-blue-900">
                  First Name
                </Label>
                <Input
                  id="first_name"
                  name="first_name"
                  required
                  disabled={formLoading}
                  placeholder="e.g., John"
                  className="w-full bg-white border border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <Label htmlFor="last_name" className="text-blue-900">
                  Last Name
                </Label>
                <Input
                  id="last_name"
                  name="last_name"
                  required
                  disabled={formLoading}
                  placeholder="e.g., Doe"
                  className="w-full bg-white border border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <Label htmlFor="gender" className="text-blue-900">
                  Gender
                </Label>
                <Select
                  value={addGender}
                  onValueChange={setAddGender}
                  disabled={formLoading}
                  required
                  name="gender"
                >
                  <SelectTrigger
                    id="gender"
                    className="w-full bg-white border border-blue-200 text-blue-900 focus:ring-2 focus:ring-blue-600"
                  >
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-blue-200 text-blue-900 hide-scrollbar">
                    <SelectItem value="Male" className="text-blue-900">
                      Male
                    </SelectItem>
                    <SelectItem value="Female" className="text-blue-900">
                      Female
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="phone" className="text-blue-900">
                  Phone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  required
                  disabled={formLoading}
                  placeholder="e.g., 0700 000000"
                  className="w-full bg-white border border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <Label htmlFor="profession" className="text-blue-900">
                  Profession
                </Label>
                <Input
                  id="profession"
                  name="profession"
                  required
                  disabled={formLoading}
                  placeholder="e.g., Nurse"
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
              <DialogTitle className="text-blue-900">Edit Health Practitioner</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditPractitioner} className="space-y-4">
              <div>
                <Label htmlFor="edit-facility_id" className="text-blue-900">
                  Facility
                </Label>
                <Select
                  value={editFacilityId}
                  onValueChange={setEditFacilityId}
                  disabled={formLoading}
                  required
                  name="facility_id"
                >
                  <SelectTrigger
                    id="edit-facility_id"
                    className="w-full bg-white border border-blue-200 text-blue-900 focus:ring-2 focus:ring-blue-600"
                  >
                    <SelectValue placeholder="Select facility" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-blue-200 text-blue-900 hide-scrollbar">
                    {facilities.map((f: any) => (
                      <SelectItem
                        key={f.id ?? f.ID}
                        value={String(f.id ?? f.ID)}
                        className="text-blue-900"
                      >
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-first_name" className="text-blue-900">
                  First Name
                </Label>
                <Input
                  id="edit-first_name"
                  name="first_name"
                  required
                  disabled={formLoading}
                  defaultValue={editingPractitioner?.first_name}
                  placeholder="e.g., John"
                  className="w-full bg-white border border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <Label htmlFor="edit-last_name" className="text-blue-900">
                  Last Name
                </Label>
                <Input
                  id="edit-last_name"
                  name="last_name"
                  required
                  disabled={formLoading}
                  defaultValue={editingPractitioner?.last_name}
                  placeholder="e.g., Doe"
                  className="w-full bg-white border border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <Label htmlFor="edit-gender" className="text-blue-900">
                  Gender
                </Label>
                <Select
                  value={editGender}
                  onValueChange={setEditGender}
                  disabled={formLoading}
                  required
                  name="gender"
                >
                  <SelectTrigger
                    id="edit-gender"
                    className="w-full bg-white border border-blue-200 text-blue-900 focus:ring-2 focus:ring-blue-600"
                  >
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-blue-200 text-blue-900 hide-scrollbar">
                    <SelectItem value="Male" className="text-blue-900">
                      Male
                    </SelectItem>
                    <SelectItem value="Female" className="text-blue-900">
                      Female
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-phone" className="text-blue-900">
                  Phone
                </Label>
                <Input
                  id="edit-phone"
                  name="phone"
                  required
                  disabled={formLoading}
                  defaultValue={editingPractitioner?.phone}
                  placeholder="e.g., 0700 000000"
                  className="w-full bg-white border border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <Label htmlFor="edit-profession" className="text-blue-900">
                  Profession
                </Label>
                <Input
                  id="edit-profession"
                  name="profession"
                  required
                  disabled={formLoading}
                  defaultValue={editingPractitioner?.profession}
                  placeholder="e.g., Nurse"
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
                Delete Health Practitioner
              </AlertDialogTitle>
              <AlertDialogDescription className="text-blue-900">
                Are you sure you want to delete this health practitioner? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setDeletingPractitioner(null);
                }}
                disabled={formLoading}
                className="bg-white border border-blue-200 text-blue-900 hover:bg-gray-200"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePractitioner}
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