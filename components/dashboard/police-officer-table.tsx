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
	const [selectedOfficer, setSelectedOfficer] =
		useState<PoliceOfficer | null>(null);
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
		{
			id: 1,
			name: "Police Officer",
		},
		{
			id: 2,
			name: "Police Inspector",
		},
		{
			id: 3,
			name: "Police Superintendent",
		},
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
				officers.map((officer: PoliceOfficer) =>
					officer.id.toString()
				)
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
			// Pre-fill the edit form with existing data
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
			// Convert post_id to number and ensure role_ids are numbers
			const payload = {
				...values,
				post_id: parseInt(values.post_id, 10),
				role_ids: values.role_ids, // Already numbers from the form
			};

			await apiClient.post("/police-officer", payload);

			// Update the cache optimistically
			await mutateOfficers();

			toast.success("Police officer added successfully!");
			handleAddDialogClose();
		} catch (error: any) {
			const errorMessage =
				error?.response?.data?.message ||
				error?.message ||
				"Failed to add police officer";
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	const onEditSubmit = async (values: EditPoliceOfficerFormValues) => {
		if (!selectedOfficer) return;

		setIsSubmitting(true);

		try {
			// Prepare payload, omit password if empty
			const payload: any = {
				...values,
				post_id: parseInt(values.post_id, 10),
				role_ids: values.role_ids,
			};

			// Only include password if it's provided
			if (!values.password || values.password.trim() === "") {
				delete payload.password;
			}

			await apiClient.put(
				`/police-officer/${selectedOfficer.id}`,
				payload
			);

			// Update the cache optimistically
			await mutateOfficers();

			toast.success("Police officer updated successfully!");
			handleEditDialogClose();
		} catch (error: any) {
			const errorMessage =
				error?.response?.data?.message ||
				error?.message ||
				"Failed to update police officer";
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	const onDeleteConfirm = async () => {
		if (!selectedOfficer) return;

		setIsDeleting(true);

		try {
			await apiClient.delete(`/police-officer/${selectedOfficer.id}`);

			// Update the cache optimistically
			await mutateOfficers();

			toast.success("Police officer deleted successfully!");
			handleDeleteDialogClose();
		} catch (error: any) {
			const errorMessage =
				error?.response?.data?.message ||
				error?.message ||
				"Failed to delete police officer";
			toast.error(errorMessage);
		} finally {
			setIsDeleting(false);
		}
	};

	// Loading and error states
	if (officersLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				Loading officers...
			</div>
		);
	}

	if (officersError) {
		return (
			<div className="text-center text-destructive p-8">
				Error loading officers data
			</div>
		);
	}

	const officers = officersData?.data || [];
	const posts = postsData?.data || [];

	if (officers?.length === 0) {
		return (
			<div className="text-center p-8">
				<p className="text-muted-foreground mb-4">
					No police officers found.
				</p>
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
		<div className="space-y-4">
			{/* Header section */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex items-center gap-2">
					<div className="relative">
						<Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							placeholder="Search police officers..."
							className="w-full pl-8 sm:w-[300px]"
						/>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="outline"
								className="ml-auto h-9"
							>
								<ChevronDown className="h-4 w-4" />
								<span className="sr-only">Filter</span>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuLabel>
								Filter by
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem>Rank</DropdownMenuItem>
							<DropdownMenuItem>Post</DropdownMenuItem>
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
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-[40px]">
								<Checkbox
									checked={
										selectedOfficers.length ===
											officers.length &&
										officers.length > 0
									}
									onCheckedChange={toggleSelectAll}
								/>
							</TableHead>
							<TableHead>Badge Number</TableHead>
							<TableHead>First Name</TableHead>
							<TableHead>Last Name</TableHead>
							<TableHead className="hidden md:table-cell">
								Email
							</TableHead>
							<TableHead className="hidden md:table-cell">
								Rank
							</TableHead>
							<TableHead className="hidden md:table-cell">
								Phone
							</TableHead>
							<TableHead className="w-[40px]"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{officers.map((officer: PoliceOfficer) => (
							<TableRow key={officer?.id}>
								<TableCell>
									<Checkbox
										checked={selectedOfficers.includes(
											officer?.id?.toString()
										)}
										onCheckedChange={() =>
											toggleSelectOfficer(
												officer?.id?.toString()
											)
										}
									/>
								</TableCell>
								<TableCell className="font-medium">
									{officer.badge_no}
								</TableCell>
								<TableCell>
									{officer.first_name}
								</TableCell>
								<TableCell>
									{officer.last_name}
								</TableCell>
								<TableCell className="hidden md:table-cell">
									{officer.email}
								</TableCell>
								<TableCell className="hidden md:table-cell">
									{officer.rank}
								</TableCell>
								<TableCell className="hidden md:table-cell">
									{officer.phone}
								</TableCell>
								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
											>
												<MoreHorizontal className="h-4 w-4" />
												<span className="sr-only">
													Actions
												</span>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem
												onClick={() =>
													openViewDialog(
														officer
													)
												}
											>
												<Eye className="mr-2 h-4 w-4" />
												View
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() =>
													openEditDialog(
														officer
													)
												}
											>
												<Edit className="mr-2 h-4 w-4" />
												Edit
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												className="text-destructive"
												onClick={() =>
													openDeleteDialog(
														officer
													)
												}
											>
												<Trash2 className="mr-2 h-4 w-4" />
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
			<div className="flex items-center justify-between">
				<div className="text-sm text-muted-foreground">
					Showing <strong>1</strong> to{" "}
					<strong>{officers.length}</strong> of{" "}
					<strong>{officers.length}</strong> results
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						disabled
					>
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
			<AlertDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will
							permanently delete the police officer
							{selectedOfficer &&
								` "${selectedOfficer.first_name} ${selectedOfficer.last_name}"`}
							and remove their data from the system.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							onClick={handleDeleteDialogClose}
						>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							onClick={onDeleteConfirm}
							disabled={isDeleting}
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
			<Popover
				open={open}
				onOpenChange={setOpen}
			>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className="w-full justify-between"
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
				<PopoverContent className="w-full p-0">
					<div className="max-h-60 overflow-auto">
						{roles.map((role) => (
							<div
								key={role.id}
								className="flex items-center space-x-2 px-4 py-2 hover:bg-accent cursor-pointer"
								onClick={() =>
									handleRoleToggle(role.id)
								}
							>
								<Checkbox
									checked={selectedRoles.includes(
										role.id
									)}
									onChange={() =>
										handleRoleToggle(role.id)
									}
								/>
								<div className="flex-1">
									<div className="font-medium">
										{role.name}
									</div>
									{role.description && (
										<div className="text-sm text-muted-foreground">
											{role.description}
										</div>
									)}
								</div>
							</div>
						))}
					</div>
					{roles.length === 0 && (
						<div className="px-4 py-2 text-sm text-muted-foreground">
							No roles available
						</div>
					)}
				</PopoverContent>
			</Popover>

			{/* Selected roles as badges */}
			{selectedRoles.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{getSelectedRoleNames().map((roleName, index) => {
						const roleId = roles.find(
							(r) => r.name === roleName
						)?.id;
						return (
							<Badge
								key={roleId}
								variant="secondary"
								className="flex items-center gap-1"
							>
								{roleName}
								<Button
									variant="ghost"
									size="sm"
									className="h-auto p-0 text-muted-foreground hover:text-foreground"
									onClick={() =>
										roleId && removeRole(roleId)
									}
									type="button"
								>
									<X className="h-3 w-3" />
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
		<Dialog
			open={isOpen}
			onOpenChange={onOpenChange}
		>
			<DialogTrigger asChild>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Add Officer
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Add Police Officer</DialogTitle>
					<DialogDescription>
						Fill in the details to add a new police officer to
						the system.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						{/* Personal Information */}
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="first_name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											First Name
										</FormLabel>
										<FormControl>
											<Input
												placeholder="John"
												{...field}
												disabled={
													isSubmitting
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="last_name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Last Name
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Doe"
												{...field}
												disabled={
													isSubmitting
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Contact Information */}
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="john.doe@police.gov"
											{...field}
											disabled={isSubmitting}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="phone"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Phone Number</FormLabel>
									<FormControl>
										<Input
											placeholder="+256 700 000000"
											{...field}
											disabled={isSubmitting}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Police Information */}
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="badge_no"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Badge Number
										</FormLabel>
										<FormControl>
											<Input
												placeholder="P001234"
												{...field}
												disabled={
													isSubmitting
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="rank"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Rank</FormLabel>
										<Select
											onValueChange={
												field.onChange
											}
											defaultValue={
												field.value
											}
											disabled={isSubmitting}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select rank" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{RANKS.map(
													(rank) => (
														<SelectItem
															key={
																rank
															}
															value={
																rank
															}
														>
															{
																rank
															}
														</SelectItem>
													)
												)}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="username"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Username</FormLabel>
									<FormControl>
										<Input
											placeholder="johndoe"
											{...field}
											disabled={isSubmitting}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<Input
											type="password"
											placeholder="••••••••"
											{...field}
											disabled={isSubmitting}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="post_id"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Police Post</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
										disabled={
											isSubmitting ||
											postsLoading
										}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue
													placeholder={
														postsLoading
															? "Loading posts..."
															: "Select a police post"
													}
												/>
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{posts?.map(
												(
													post: PolicePost
												) => (
													<SelectItem
														key={
															post.id
														}
														value={post.id.toString()}
													>
														{
															post.name
														}{" "}
														-{" "}
														{
															post.location
														}
													</SelectItem>
												)
											)}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Roles Multi-Select */}
						<FormField
							control={form.control}
							name="role_ids"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Roles</FormLabel>
									<FormControl>
										<MultiSelectRoles
											roles={roles}
											selectedRoles={
												field.value
											}
											onRolesChange={
												field.onChange
											}
											disabled={isSubmitting}
											loading={rolesLoading}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter className="pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isSubmitting}
							>
								{isSubmitting
									? "Adding..."
									: "Add Officer"}
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
		<Dialog
			open={isOpen}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Edit Police Officer</DialogTitle>
					<DialogDescription>
						Update the details of {officer?.first_name}{" "}
						{officer?.last_name}. Leave password empty to keep
						the current password.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						{/* Personal Information */}
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="first_name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											First Name
										</FormLabel>
										<FormControl>
											<Input
												placeholder="John"
												{...field}
												disabled={
													isSubmitting
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="last_name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Last Name
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Doe"
												{...field}
												disabled={
													isSubmitting
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						{/* Contact Information */}
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="john.doe@police.gov"
											{...field}
											disabled={isSubmitting}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="phone"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Phone Number</FormLabel>
									<FormControl>
										<Input
											placeholder="+256 700 000000"
											{...field}
											disabled={isSubmitting}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Police Information */}
						<div className="grid grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="badge_no"
								render={({ field }) => (
									<FormItem>
										<FormLabel>
											Badge Number
										</FormLabel>
										<FormControl>
											<Input
												placeholder="P001234"
												{...field}
												disabled={
													isSubmitting
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="rank"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Rank</FormLabel>
										<Select
											onValueChange={
												field.onChange
											}
											value={field.value}
											disabled={isSubmitting}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select rank" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												{RANKS.map(
													(rank) => (
														<SelectItem
															key={
																rank
															}
															value={
																rank
															}
														>
															{
																rank
															}
														</SelectItem>
													)
												)}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="username"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Username</FormLabel>
									<FormControl>
										<Input
											placeholder="johndoe"
											{...field}
											disabled={isSubmitting}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Password (optional)
									</FormLabel>
									<FormControl>
										<Input
											type="password"
											placeholder="Leave empty to keep current password"
											{...field}
											disabled={isSubmitting}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="post_id"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Police Post</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={field.value}
										disabled={
											isSubmitting ||
											postsLoading
										}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue
													placeholder={
														postsLoading
															? "Loading posts..."
															: "Select a police post"
													}
												/>
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{posts?.map(
												(
													post: PolicePost
												) => (
													<SelectItem
														key={
															post.id
														}
														value={post.id.toString()}
													>
														{
															post.name
														}{" "}
														-{" "}
														{
															post.location
														}
													</SelectItem>
												)
											)}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Roles Multi-Select */}
						<FormField
							control={form.control}
							name="role_ids"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Roles</FormLabel>
									<FormControl>
										<MultiSelectRoles
											roles={roles}
											selectedRoles={
												field.value
											}
											onRolesChange={
												field.onChange
											}
											disabled={isSubmitting}
											loading={rolesLoading}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter className="pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isSubmitting}
							>
								{isSubmitting
									? "Updating..."
									: "Update Officer"}
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
		<Dialog
			open={isOpen}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Police Officer Details</DialogTitle>
					<DialogDescription>
						Viewing details for {officer.first_name}{" "}
						{officer.last_name}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="text-sm font-medium text-gray-500">
								First Name
							</label>
							<p className="mt-1 text-sm">
								{officer.first_name}
							</p>
						</div>
						<div>
							<label className="text-sm font-medium text-gray-500">
								Last Name
							</label>
							<p className="mt-1 text-sm">
								{officer.last_name}
							</p>
						</div>
					</div>

					<div>
						<label className="text-sm font-medium text-gray-500">
							Email
						</label>
						<p className="mt-1 text-sm">{officer.email}</p>
					</div>

					<div>
						<label className="text-sm font-medium text-gray-500">
							Phone Number
						</label>
						<p className="mt-1 text-sm">{officer.phone}</p>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="text-sm font-medium text-gray-500">
								Badge Number
							</label>
							<p className="mt-1 text-sm">
								{officer.badge_no}
							</p>
						</div>
						<div>
							<label className="text-sm font-medium text-gray-500">
								Rank
							</label>
							<p className="mt-1 text-sm">
								{officer.rank}
							</p>
						</div>
					</div>

					<div>
						<label className="text-sm font-medium text-gray-500">
							Username
						</label>
						<p className="mt-1 text-sm">{officer.username}</p>
					</div>

					<div>
						<label className="text-sm font-medium text-gray-500">
							Police Post
						</label>
						<p className="mt-1 text-sm">
							{getPostName(officer.post_id)}
						</p>
					</div>

					<div>
						<label className="text-sm font-medium text-gray-500">
							Roles
						</label>
						<div className="mt-1 flex flex-wrap gap-2">
							{getRoleNames(officer.roles).length > 0 ? (
								getRoleNames(officer.roles).map(
									(roleName, index) => (
										<Badge
											key={index}
											variant="secondary"
										>
											{roleName}
										</Badge>
									)
								)
							) : (
								<span className="text-sm text-muted-foreground">
									No roles assigned
								</span>
							)}
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="text-sm font-medium text-gray-500">
								Created At
							</label>
							<p className="mt-1 text-sm">
								{new Date(
									officer.CreatedAt
								).toLocaleDateString()}
							</p>
						</div>
						<div>
							<label className="text-sm font-medium text-gray-500">
								Updated At
							</label>
							<p className="mt-1 text-sm">
								{new Date(
									officer.UpdatedAt
								).toLocaleDateString()}
							</p>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
