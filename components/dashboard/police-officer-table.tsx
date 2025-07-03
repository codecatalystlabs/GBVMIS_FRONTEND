"use client";

import { useState, useCallback } from "react";
import {
  MoreHorizontal,
  ChevronDown,
  Search,
  Plus,
  X,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import useSWR from "swr";
import { toast } from "react-toastify";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { fetcher, apiClient } from "@/lib/api";
import { PoliceOfficer, PolicePost, Role } from "@/types";

// Form validation schema for adding officers
const policeOfficerSchema = z.object({
  first_name: z
    .string()
    .min(2, { message: "First name must be at least 2 characters" }),
  last_name: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 characters" }),
  badge_no: z.string().min(1, { message: "Badge number is required" }),
  rank: z.string().min(1, { message: "Rank is required" }),
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" }),
  post_id: z.string().min(1, { message: "Please select a police post" }),
  role_ids: z
    .array(z.number())
    .min(1, { message: "Please select at least one role" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

// Edit schema (password is optional for updates)
const editPoliceOfficerSchema = policeOfficerSchema.extend({
  password: z.string().optional(),
});

type PoliceOfficerFormValues = z.infer<typeof policeOfficerSchema>;
type EditPoliceOfficerFormValues = z.infer<typeof editPoliceOfficerSchema>;

// Constants
const RANKS = [
  "Constable",
  "Senior Constable",
  "Corporal",
  "Sergeant",
  "Staff Sergeant",
  "Inspector",
  "Chief Inspector",
  "Superintendent",
  "Senior Superintendent",
  "Assistant Commissioner",
  "Deputy Commissioner",
  "Commissioner",
] as const;

export function PoliceOfficerTable() {
  const [selectedOfficers, setSelectedOfficers] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<PoliceOfficer | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // SWR hooks for data fetching
  const {
    data: officersData,
    error: officersError,
    isLoading: officersLoading,
    mutate: mutateOfficers,
  } = useSWR("/police-officers", fetcher);
  const {
    data: postsData,
    error: postsError,
    isLoading: postsLoading,
  } = useSWR("/police-posts", fetcher);

  const roles = [
    { id: 1, name: "Police Officer" },
    { id: 2, name: "Police Inspector" },
    { id: 3, name: "Police Superintendent" },
  ];

  // Form setup for adding officers
  const addForm = useForm<PoliceOfficerFormValues>({
    resolver: zodResolver(policeOfficerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      badge_no: "",
      rank: "",
      username: "",
      post_id: "",
      role_ids: [],
      password: "",
    },
  });

  // Form setup for editing officers
  const editForm = useForm<EditPoliceOfficerFormValues>({
    resolver: zodResolver(editPoliceOfficerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      badge_no: "",
      rank: "",
      username: "",
      post_id: "",
      role_ids: [],
      password: "",
    },
  });

  // Event handlers
  const toggleSelectAll = useCallback(() => {
    const officers = officersData?.data || [];
    if (selectedOfficers.length === officers.length) {
      setSelectedOfficers([]);
    } else {
      setSelectedOfficers(
        officers.map((officer: PoliceOfficer) => officer.id.toString())
      );
    }
  }, [selectedOfficers.length, officersData?.data]);

  const toggleSelectOfficer = useCallback((id: string) => {
    setSelectedOfficers((prev) =>
      prev.includes(id)
        ? prev.filter((officerId) => officerId !== id)
        : [...prev, id]
    );
  }, []);

  const handleAddDialogClose = useCallback(() => {
    setIsAddDialogOpen(false);
    addForm.reset();
  }, [addForm]);

  const handleEditDialogClose = useCallback(() => {
    setIsEditDialogOpen(false);
    setSelectedOfficer(null);
    editForm.reset();
  }, [editForm]);

  const handleViewDialogClose = useCallback(() => {
    setIsViewDialogOpen(false);
    setSelectedOfficer(null);
  }, []);

  const handleDeleteDialogClose = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setSelectedOfficer(null);
  }, []);

  const openEditDialog = useCallback(
    (officer: PoliceOfficer) => {
      setSelectedOfficer(officer);
      editForm.reset({
        first_name: officer.first_name,
        last_name: officer.last_name,
        email: officer.email,
        phone: officer.phone,
        badge_no: officer.badge_no,
        rank: officer.rank,
        username: officer.username,
        post_id: officer.post_id.toString(),
        role_ids: Array.isArray(officer.roles)
          ? officer.roles.map((role: any) => role.id)
          : [],
        password: "",
      });
      setIsEditDialogOpen(true);
    },
    [editForm]
  );

  const openViewDialog = useCallback((officer: PoliceOfficer) => {
    setSelectedOfficer(officer);
    setIsViewDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((officer: PoliceOfficer) => {
    setSelectedOfficer(officer);
    setIsDeleteDialogOpen(true);
  }, []);

  const onAddSubmit = async (values: PoliceOfficerFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        post_id: parseInt(values.post_id, 10),
        role_ids: values.role_ids,
      };
      await apiClient.post("/police-officer", payload);
      await mutateOfficers();
      toast.success("Police officer added successfully!");
      handleAddDialogClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to add police officer"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onEditSubmit = async (values: EditPoliceOfficerFormValues) => {
    if (!selectedOfficer) return;
    setIsSubmitting(true);
    try {
      const payload: any = {
        ...values,
        post_id: parseInt(values.post_id, 10),
        role_ids: values.role_ids,
      };
      if (!values.password || values.password.trim() === "") {
        delete payload.password;
      }
      await apiClient.put(`/police-officer/${selectedOfficer.id}`, payload);
      await mutateOfficers();
      toast.success("Police officer updated successfully!");
      handleEditDialogClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update police officer"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDeleteConfirm = async () => {
    if (!selectedOfficer) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/police-officer/${selectedOfficer.id}`);
      await mutateOfficers();
      toast.success("Police officer deleted successfully!");
      handleDeleteDialogClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to delete police officer"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (officersLoading) {
    return (
      <div className="flex justify-center items-center py-8 bg-gray-100 rounded-xl">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  if (officersError) {
    return (
      <div className="text-red-500 text-center py-8 bg-gray-100 rounded-xl">
        Error loading officers data
      </div>
    );
  }

  const officers = officersData?.data || [];
  const posts = postsData?.data || [];

  if (officers.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-100 rounded-xl">
        <p className="text-blue-900 mb-4">No police officers found.</p>
        <AddOfficerDialog
          form={addForm}
          posts={posts}
          roles={roles}
          postsLoading={postsLoading}
          rolesLoading={postsLoading}
          onSubmit={onAddSubmit}
          isSubmitting={isSubmitting}
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-100 rounded-xl shadow-lg">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-900" />
            <Input
              type="search"
              placeholder="Search police officers..."
              className="w-full pl-10 sm:w-[300px] bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 transition-all duration-300"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 bg-white border-blue-200 text-blue-900 hover:bg-gray-200">
                <ChevronDown className="h-4 w-4 text-blue-900" />
                <span className="sr-only">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-blue-200 text-blue-900">
              <DropdownMenuLabel className="text-blue-900">Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-blue-200" />
              <DropdownMenuItem className="hover:bg-gray-200 text-blue-900">Rank</DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-200 text-blue-900">Post</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          <Select defaultValue="10">
            <SelectTrigger className="h-9 w-[70px] bg-white border-blue-200 text-blue-900 focus:ring-2 focus:ring-blue-600">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent className="bg-white border-blue-200 text-blue-900">
              <SelectItem value="10" className="hover:bg-gray-200 text-blue-900">10</SelectItem>
              <SelectItem value="20" className="hover:bg-gray-200 text-blue-900">20</SelectItem>
              <SelectItem value="50" className="hover:bg-gray-200 text-blue-900">50</SelectItem>
              <SelectItem value="100" className="hover:bg-gray-200 text-blue-900">100</SelectItem>
            </SelectContent>
          </Select>
          <AddOfficerDialog
            form={addForm}
            posts={posts}
            roles={roles}
            postsLoading={postsLoading}
            rolesLoading={postsLoading}
            onSubmit={onAddSubmit}
            isSubmitting={isSubmitting}
            isOpen={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
          />
        </div>
      </div>

      {/* Table section */}
      <div className="rounded-xl border border-blue-200 bg-white shadow-lg">
        <Table>
          <TableHeader className="bg-gray-100">
            <TableRow className="border-b border-blue-200 hover:bg-gray-200">
              <TableHead className="w-[40px] p-3 text-blue-900">
                <Checkbox
                  checked={
                    selectedOfficers.length === officers.length &&
                    officers.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                  className="border-blue-200 text-blue-600 focus:ring-blue-600"
                />
              </TableHead>
              <TableHead className="p-3 text-blue-900 font-semibold">Badge Number</TableHead>
              <TableHead className="p-3 text-blue-900 font-semibold">First Name</TableHead>
              <TableHead className="p-3 text-blue-900 font-semibold">Last Name</TableHead>
              <TableHead className="hidden md:table-cell p-3 text-blue-900 font-semibold">Email</TableHead>
              <TableHead className="hidden md:table-cell p-3 text-blue-900 font-semibold">Rank</TableHead>
              <TableHead className="hidden md:table-cell p-3 text-blue-900 font-semibold">Phone</TableHead>
              <TableHead className="w-[40px] p-3 text-blue-900"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {officers.map((officer: PoliceOfficer) => (
              <TableRow key={officer?.id} className="border-t border-blue-200 hover:bg-gray-200 transition-all duration-200">
                <TableCell className="p-3">
                  <Checkbox
                    checked={selectedOfficers.includes(officer?.id?.toString())}
                    onCheckedChange={() =>
                      toggleSelectOfficer(officer?.id?.toString())
                    }
                    className="border-blue-200 text-blue-600 focus:ring-blue-600"
                  />
                </TableCell>
                <TableCell className="p-3 font-medium text-blue-900">{officer.badge_no}</TableCell>
                <TableCell className="p-3 text-blue-900">{officer.first_name}</TableCell>
                <TableCell className="p-3 text-blue-900">{officer.last_name}</TableCell>
                <TableCell className="hidden md:table-cell p-3 text-blue-900">{officer.email}</TableCell>
                <TableCell className="hidden md:table-cell p-3 text-blue-900">{officer.rank}</TableCell>
                <TableCell className="hidden md:table-cell p-3 text-blue-900">{officer.phone}</TableCell>
                <TableCell className="p-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-blue-900 hover:bg-gray-200 rounded-full">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border-blue-200 text-blue-900">
                      <DropdownMenuItem className="hover:bg-gray-200 text-blue-900" onClick={() => openViewDialog(officer)}>
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-gray-200 text-blue-900" onClick={() => openEditDialog(officer)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-blue-200" />
                      <DropdownMenuItem className="hover:bg-gray-200 text-red-500" onClick={() => openDeleteDialog(officer)}>
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

      {/* Pagination section */}
      <div className="flex items-center justify-between py-3 px-4 bg-white border border-blue-200 rounded-xl shadow-md">
        <div className="text-sm text-blue-900">
          Showing <strong className="text-blue-900">{1}</strong> to <strong className="text-blue-900">{officers.length}</strong> of{' '}
          <strong className="text-blue-900">{officers.length}</strong> results
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled className="bg-white border-blue-200 text-blue-900 hover:bg-gray-200 rounded-md">
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled className="bg-white border-blue-200 text-blue-900 hover:bg-gray-200 rounded-md">
            Next
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <EditOfficerDialog
        form={editForm}
        posts={posts}
        roles={roles}
        postsLoading={postsLoading}
        rolesLoading={postsLoading}
        onSubmit={onEditSubmit}
        isSubmitting={isSubmitting}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        officer={selectedOfficer}
      />

      {/* View Dialog */}
      <ViewOfficerDialog
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        officer={selectedOfficer}
        posts={posts}
        roles={roles}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white border-blue-200 rounded-xl shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-blue-900">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-blue-900">
              This action cannot be undone. This will permanently delete the
              police officer
              {selectedOfficer &&
                ` "${selectedOfficer.first_name} ${selectedOfficer.last_name}"`}
              and remove their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteDialogClose} className="bg-white border-blue-200 text-blue-900 hover:bg-gray-200 rounded-md">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={onDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700 rounded-md transition-colors duration-200"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Multi-select component for roles
interface MultiSelectRolesProps {
  roles: Role[];
  selectedRoles: number[];
  onRolesChange: (roles: number[]) => void;
  disabled?: boolean;
  loading?: boolean;
}

function MultiSelectRoles({
  roles,
  selectedRoles,
  onRolesChange,
  disabled,
  loading,
}: MultiSelectRolesProps) {
  const [open, setOpen] = useState(false);

  const handleRoleToggle = (roleId: number) => {
    if (selectedRoles.includes(roleId)) {
      onRolesChange(selectedRoles.filter((id) => id !== roleId));
    } else {
      onRolesChange([...selectedRoles, roleId]);
    }
  };

  const removeRole = (roleId: number) => {
    onRolesChange(selectedRoles.filter((id) => id !== roleId));
  };

  const getSelectedRoleNames = () => {
    return roles
      .filter((role) => selectedRoles.includes(role.id))
      .map((role) => role.name);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-9 bg-white border-blue-200 text-blue-900 hover:bg-gray-200 rounded-md transition-all duration-300"
            disabled={disabled || loading}
          >
            {loading
              ? "Loading roles..."
              : selectedRoles.length === 0
              ? "Select roles..."
              : `${selectedRoles.length} role(s) selected`}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-white border-blue-200 rounded-md shadow-lg">
          <div className="max-h-60 overflow-auto">
            {roles.map((role) => (
              <div
                key={role.id}
                className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-200 cursor-pointer text-blue-900"
                onClick={() => handleRoleToggle(role.id)}
              >
                <Checkbox
                  checked={selectedRoles.includes(role.id)}
                  onChange={() => handleRoleToggle(role.id)}
                  className="border-blue-200 text-blue-600 focus:ring-blue-600"
                />
                <div className="flex-1">
                  <div className="font-medium">{role.name}</div>
                  {role.description && (
                    <div className="text-sm text-blue-400">
                      {role.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {roles.length === 0 && (
            <div className="px-4 py-2 text-sm text-blue-400">
              No roles available
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Selected roles as badges */}
      {selectedRoles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {getSelectedRoleNames().map((roleName, index) => {
            const roleId = roles.find((r) => r.name === roleName)?.id;
            return (
              <Badge
                key={roleId}
                variant="secondary"
                className="flex items-center gap-1 bg-gray-200 text-blue-900 border-blue-200 rounded-md"
              >
                {roleName}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-blue-900 hover:text-blue-600"
                  onClick={() => roleId && removeRole(roleId)}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </Button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Add Officer Dialog component
interface AddOfficerDialogProps {
  form: ReturnType<typeof useForm<PoliceOfficerFormValues>>;
  posts: PolicePost[];
  roles: Role[];
  postsLoading: boolean;
  rolesLoading: boolean;
  onSubmit: (values: PoliceOfficerFormValues) => Promise<void>;
  isSubmitting: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function AddOfficerDialog({
  form,
  posts,
  roles,
  postsLoading,
  rolesLoading,
  onSubmit,
  isSubmitting,
  isOpen,
  onOpenChange,
}: AddOfficerDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-blue-800 text-white hover:bg-blue-900 rounded-md transition-all duration-300">
          <Plus className="mr-2 h-5 w-5" />
          Add Officer
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white border-blue-200 rounded-xl shadow-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-blue-900">Add Police Officer</DialogTitle>
          <DialogDescription className="text-blue-900">
            Fill in the details to add a new police officer to the system.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-900">First Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John"
                        {...field}
                        disabled={isSubmitting}
                        className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-900">Last Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Doe"
                        {...field}
                        disabled={isSubmitting}
                        className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-900">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john.doe@police.gov"
                      {...field}
                      disabled={isSubmitting}
                      className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-900">Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+256 700 000000"
                      {...field}
                      disabled={isSubmitting}
                      className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="badge_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-900">Badge Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="P001234"
                        {...field}
                        disabled={isSubmitting}
                        className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-900">Rank</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white border-blue-200 text-blue-900 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300">
                          <SelectValue placeholder="Select rank" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border-blue-200 text-blue-900">
                        {RANKS.map((rank) => (
                          <SelectItem key={rank} value={rank} className="hover:bg-gray-200 text-blue-900">
                            {rank}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-900">Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="johndoe"
                      {...field}
                      disabled={isSubmitting}
                      className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-900">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      disabled={isSubmitting}
                      className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="post_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-900">Police Post</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting || postsLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white border-blue-200 text-blue-900 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300">
                        <SelectValue
                          placeholder={
                            postsLoading
                              ? "Loading posts..."
                              : "Select a police post"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border-blue-200 text-blue-900">
                      {posts?.map((post: PolicePost) => (
                        <SelectItem key={post.id} value={post.id.toString()} className="hover:bg-gray-200 text-blue-900">
                          {post.name} - {post.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role_ids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-900">Roles</FormLabel>
                  <FormControl>
                    <MultiSelectRoles
                      roles={roles}
                      selectedRoles={field.value}
                      onRolesChange={field.onChange}
                      disabled={isSubmitting}
                      loading={rolesLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="bg-white border-blue-200 text-blue-900 hover:bg-gray-200 rounded-md transition-all duration-300"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-800 text-white hover:bg-blue-900 rounded-md transition-all duration-300">
                {isSubmitting ? "Adding..." : "Add Officer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Edit Officer Dialog component
interface EditOfficerDialogProps {
  form: ReturnType<typeof useForm<EditPoliceOfficerFormValues>>;
  posts: PolicePost[];
  roles: Role[];
  postsLoading: boolean;
  rolesLoading: boolean;
  onSubmit: (values: EditPoliceOfficerFormValues) => Promise<void>;
  isSubmitting: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  officer: PoliceOfficer | null;
}

function EditOfficerDialog({
  form,
  posts,
  roles,
  postsLoading,
  rolesLoading,
  onSubmit,
  isSubmitting,
  isOpen,
  onOpenChange,
  officer,
}: EditOfficerDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-blue-200 rounded-xl shadow-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-blue-900">Edit Police Officer</DialogTitle>
          <DialogDescription className="text-blue-900">
            Update the details of {officer?.first_name} {officer?.last_name}.
            Leave password empty to keep the current password.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-900">First Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John"
                        {...field}
                        disabled={isSubmitting}
                        className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-900">Last Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Doe"
                        {...field}
                        disabled={isSubmitting}
                        className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-900">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john.doe@police.gov"
                      {...field}
                      disabled={isSubmitting}
                      className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-900">Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+256 700 000000"
                      {...field}
                      disabled={isSubmitting}
                      className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="badge_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-900">Badge Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="P001234"
                        {...field}
                        disabled={isSubmitting}
                        className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-900">Rank</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-white border-blue-200 text-blue-900 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300">
                          <SelectValue placeholder="Select rank" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border-blue-200 text-blue-900">
                        {RANKS.map((rank) => (
                          <SelectItem key={rank} value={rank} className="hover:bg-gray-200 text-blue-900">
                            {rank}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-900">Username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="johndoe"
                      {...field}
                      disabled={isSubmitting}
                      className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-900">Password (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Leave empty to keep current password"
                      {...field}
                      disabled={isSubmitting}
                      className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="post_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-900">Police Post</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting || postsLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white border-blue-200 text-blue-900 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300">
                        <SelectValue
                          placeholder={
                            postsLoading
                              ? "Loading posts..."
                              : "Select a police post"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border-blue-200 text-blue-900">
                      {posts?.map((post: PolicePost) => (
                        <SelectItem key={post.id} value={post.id.toString()} className="hover:bg-gray-200 text-blue-900">
                          {post.name} - {post.location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role_ids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-900">Roles</FormLabel>
                  <FormControl>
                    <MultiSelectRoles
                      roles={roles}
                      selectedRoles={field.value}
                      onRolesChange={field.onChange}
                      disabled={isSubmitting}
                      loading={rolesLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="bg-white border-blue-200 text-blue-900 hover:bg-gray-200 rounded-md transition-all duration-300"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-800 text-white hover:bg-blue-900 rounded-md transition-all duration-300">
                {isSubmitting ? "Updating..." : "Update Officer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// View Officer Dialog component
interface ViewOfficerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  officer: PoliceOfficer | null;
  posts: PolicePost[];
  roles: Role[];
}

function ViewOfficerDialog({
  isOpen,
  onOpenChange,
  officer,
  posts,
  roles,
}: ViewOfficerDialogProps) {
  if (!officer) return null;

  const getPostName = (postId: number) => {
    const post = posts.find((p) => p.id === postId);
    return post ? `${post.name} - ${post.location}` : "Unknown Post";
  };

  const getRoleNames = (officerRoles: any) => {
    if (!officerRoles || !Array.isArray(officerRoles)) return [];
    return officerRoles.map((role) => role.name || "Unknown Role");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-blue-200 rounded-xl shadow-lg max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-blue-900">Police Officer Details</DialogTitle>
          <DialogDescription className="text-blue-900">
            Viewing details for {officer.first_name} {officer.last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-blue-400">First Name</label>
              <p className="mt-1 text-blue-900">{officer.first_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-blue-400">Last Name</label>
              <p className="mt-1 text-blue-900">{officer.last_name}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-blue-400">Email</label>
            <p className="mt-1 text-blue-900">{officer.email}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-blue-400">Phone Number</label>
            <p className="mt-1 text-blue-900">{officer.phone}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-blue-400">Badge Number</label>
              <p className="mt-1 text-blue-900">{officer.badge_no}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-blue-400">Rank</label>
              <p className="mt-1 text-blue-900">{officer.rank}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-blue-400">Username</label>
            <p className="mt-1 text-blue-900">{officer.username}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-blue-400">Police Post</label>
            <p className="mt-1 text-blue-900">{getPostName(officer.post_id)}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-blue-400">Roles</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {getRoleNames(officer.roles).length > 0 ? (
                getRoleNames(officer.roles).map((roleName, index) => (
                  <Badge key={index} variant="secondary" className="bg-gray-200 text-blue-900 border-blue-200 rounded-md">
                    {roleName}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-blue-400">
                  No roles assigned
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-blue-400">Created At</label>
              <p className="mt-1 text-blue-900">
                {new Date(officer.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-blue-400">Updated At</label>
              <p className="mt-1 text-blue-900">
                {new Date(officer.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-white border-blue-200 text-blue-900 hover:bg-gray-200 rounded-md transition-all duration-300">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}