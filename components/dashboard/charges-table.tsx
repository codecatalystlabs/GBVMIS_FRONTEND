"use client";

import { useState, useCallback } from "react";
import {
	MoreHorizontal,
	ChevronDown,
	Search,
	Plus,
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { fetcher, apiClient } from "@/lib/api";
import { Charge, Case } from "@/types";

// Form validation schema for adding charges
const chargeSchema = z.object({
	case_id: z.string().min(1, { message: "Please select a case" }),
	charge_title: z
		.string()
		.min(2, { message: "Charge title must be at least 2 characters" }),
	description: z
		.string()
		.min(10, { message: "Description must be at least 10 characters" }),
	severity: z.string().min(1, { message: "Please select a severity level" }),
});

// Edit schema (same as add for charges)
const editChargeSchema = chargeSchema;

type ChargeFormValues = z.infer<typeof chargeSchema>;
type EditChargeFormValues = z.infer<typeof editChargeSchema>;

// Constants
const SEVERITY_LEVELS = [
	"Minor",
	"Moderate",
	"Serious",
	"Severe",
	"Critical",
	"Felony",
	"Misdemeanor",
] as const;

const SEVERITY_COLORS = {
	Minor: "bg-green-100 text-green-800",
	Moderate: "bg-yellow-100 text-yellow-800",
	Serious: "bg-orange-100 text-orange-800",
	Severe: "bg-red-100 text-red-800",
	Critical: "bg-red-200 text-red-900",
	Felony: "bg-purple-100 text-purple-800",
	Misdemeanor: "bg-blue-100 text-blue-800",
} as const;

export function ChargesTable() {
	const [selectedCharges, setSelectedCharges] = useState<string[]>([]);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedCharge, setSelectedCharge] = useState<Charge | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	// SWR hooks for data fetching
	const {
		data: chargesData,
		error: chargesError,
		isLoading: chargesLoading,
		mutate: mutateCharges,
	} = useSWR("/charges", fetcher);

	const {
		data: casesData,
		error: casesError,
		isLoading: casesLoading,
	} = useSWR("/cases", fetcher);

	// Form setup for adding charges
	const addForm = useForm<ChargeFormValues>({
		resolver: zodResolver(chargeSchema),
		defaultValues: {
			case_id: "",
			charge_title: "",
			description: "",
			severity: "",
		},
	});

	// Form setup for editing charges
	const editForm = useForm<EditChargeFormValues>({
		resolver: zodResolver(editChargeSchema),
		defaultValues: {
			case_id: "",
			charge_title: "",
			description: "",
			severity: "",
		},
	});

	// Event handlers
	const toggleSelectAll = useCallback(() => {
		const charges = chargesData?.data || [];
		if (selectedCharges.length === charges.length) {
			setSelectedCharges([]);
		} else {
			setSelectedCharges(
				charges.map((charge: Charge) => charge.id.toString())
			);
		}
	}, [selectedCharges.length, chargesData?.data]);

	const toggleSelectCharge = useCallback((id: string) => {
		setSelectedCharges((prev) =>
			prev.includes(id)
				? prev.filter((chargeId) => chargeId !== id)
				: [...prev, id]
		);
	}, []);

	const handleAddDialogClose = useCallback(() => {
		setIsAddDialogOpen(false);
		addForm.reset();
	}, [addForm]);

	const handleEditDialogClose = useCallback(() => {
		setIsEditDialogOpen(false);
		setSelectedCharge(null);
		editForm.reset();
	}, [editForm]);

	const handleViewDialogClose = useCallback(() => {
		setIsViewDialogOpen(false);
		setSelectedCharge(null);
	}, []);

	const handleDeleteDialogClose = useCallback(() => {
		setIsDeleteDialogOpen(false);
		setSelectedCharge(null);
	}, []);

	const openEditDialog = useCallback(
		(charge: Charge) => {
			setSelectedCharge(charge);
			// Pre-fill the edit form with existing data
			editForm.reset({
				case_id: charge.case_id.toString(),
				charge_title: charge.charge_title,
				description: charge.description,
				severity: charge.severity,
			});
			setIsEditDialogOpen(true);
		},
		[editForm]
	);

	const openViewDialog = useCallback((charge: Charge) => {
		setSelectedCharge(charge);
		setIsViewDialogOpen(true);
	}, []);

	const openDeleteDialog = useCallback((charge: Charge) => {
		setSelectedCharge(charge);
		setIsDeleteDialogOpen(true);
	}, []);

	const onAddSubmit = async (values: ChargeFormValues) => {
		setIsSubmitting(true);

		try {
			// Convert case_id to number
			const payload = {
				...values,
				case_id: parseInt(values.case_id, 10),
			};

			await apiClient.post("/charge", payload);

			// Update the cache optimistically
			await mutateCharges();

			toast.success("Charge added successfully!");
			handleAddDialogClose();
		} catch (error: any) {
			const errorMessage =
				error?.response?.data?.message ||
				error?.message ||
				"Failed to add charge";
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	const onEditSubmit = async (values: EditChargeFormValues) => {
		if (!selectedCharge) return;

		setIsSubmitting(true);

		try {
			// Convert case_id to number
			const payload = {
				...values,
				case_id: parseInt(values.case_id, 10),
			};

			await apiClient.put(`/charge/${selectedCharge.id}`, payload);

			// Update the cache optimistically
			await mutateCharges();

			toast.success("Charge updated successfully!");
			handleEditDialogClose();
		} catch (error: any) {
			const errorMessage =
				error?.response?.data?.message ||
				error?.message ||
				"Failed to update charge";
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	const onDeleteConfirm = async () => {
		if (!selectedCharge) return;

		setIsDeleting(true);

		try {
			await apiClient.delete(`/charge/${selectedCharge.id}`);

			// Update the cache optimistically
			await mutateCharges();

			toast.success("Charge deleted successfully!");
			handleDeleteDialogClose();
		} catch (error: any) {
			const errorMessage =
				error?.response?.data?.message ||
				error?.message ||
				"Failed to delete charge";
			toast.error(errorMessage);
		} finally {
			setIsDeleting(false);
		}
	};

	// Loading and error states
	if (chargesLoading || casesLoading) {
		return (
			<div className="flex items-center justify-center p-8">
				Loading charges and cases...
			</div>
		);
	}

	if (chargesError) {
		return (
			<div className="text-center text-destructive p-8">
				Error loading charges data
			</div>
		);
	}

	if (casesError) {
		return (
			<div className="text-center text-destructive p-8">
				Error loading cases data
			</div>
		);
	}

	const charges = chargesData?.data || [];

	if (charges?.length === 0) {
		return (
			<div className="text-center p-8">
				<p className="text-muted-foreground mb-4">
					No charges found.
				</p>
				<AddChargeDialog
					form={addForm}
					onSubmit={onAddSubmit}
					isSubmitting={isSubmitting}
					isOpen={isAddDialogOpen}
					onOpenChange={setIsAddDialogOpen}
					casesData={casesData}
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
							placeholder="Search charges..."
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
							<DropdownMenuItem>Severity</DropdownMenuItem>
							<DropdownMenuItem>Case ID</DropdownMenuItem>
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
					<AddChargeDialog
						form={addForm}
						onSubmit={onAddSubmit}
						isSubmitting={isSubmitting}
						isOpen={isAddDialogOpen}
						onOpenChange={setIsAddDialogOpen}
						casesData={casesData}
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
										selectedCharges.length ===
											charges.length &&
										charges.length > 0
									}
									onCheckedChange={toggleSelectAll}
								/>
							</TableHead>
							<TableHead>Case ID</TableHead>
							<TableHead>Charge Title</TableHead>
							<TableHead className="hidden md:table-cell">
								Description
							</TableHead>
							<TableHead>Severity</TableHead>
							<TableHead className="hidden md:table-cell">
								Created
							</TableHead>
							<TableHead className="w-[40px]"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{charges.map((charge: Charge) => (
							<TableRow key={charge?.id}>
								<TableCell>
									<Checkbox
										checked={selectedCharges.includes(
											charge?.id?.toString()
										)}
										onCheckedChange={() =>
											toggleSelectCharge(
												charge?.id?.toString()
											)
										}
									/>
								</TableCell>
								<TableCell className="font-medium">
									#{charge.case_id}
								</TableCell>
								<TableCell>
									{charge.charge_title}
								</TableCell>
								<TableCell className="hidden md:table-cell max-w-xs">
									<div className="truncate">
										{charge.description}
									</div>
								</TableCell>
								<TableCell>
									<Badge
										className={`${
											SEVERITY_COLORS[
												charge.severity as keyof typeof SEVERITY_COLORS
											] ||
											"bg-gray-100 text-gray-800"
										}`}
									>
										{charge.severity}
									</Badge>
								</TableCell>
								<TableCell className="hidden md:table-cell">
									{new Date(
										charge.createdAt
									).toLocaleDateString()}
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
														charge
													)
												}
											>
												<Eye className="mr-2 h-4 w-4" />
												View
											</DropdownMenuItem>
											<DropdownMenuItem
												onClick={() =>
													openEditDialog(
														charge
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
														charge
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
					<strong>{charges.length}</strong> of{" "}
					<strong>{charges.length}</strong> results
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
			<EditChargeDialog
				form={editForm}
				onSubmit={onEditSubmit}
				isSubmitting={isSubmitting}
				isOpen={isEditDialogOpen}
				onOpenChange={setIsEditDialogOpen}
				charge={selectedCharge}
				casesData={casesData}
			/>

			{/* View Dialog */}
			<ViewChargeDialog
				isOpen={isViewDialogOpen}
				onOpenChange={setIsViewDialogOpen}
				charge={selectedCharge}
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
							permanently delete the charge
							{selectedCharge &&
								` "${selectedCharge.charge_title}"`}
							and remove it from the system.
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

// Add Charge Dialog component
interface AddChargeDialogProps {
	form: ReturnType<typeof useForm<ChargeFormValues>>;
	onSubmit: (values: ChargeFormValues) => Promise<void>;
	isSubmitting: boolean;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	casesData: any;
}

function AddChargeDialog({
	form,
	onSubmit,
	isSubmitting,
	isOpen,
	onOpenChange,
	casesData,
}: AddChargeDialogProps) {
	return (
		<Dialog
			open={isOpen}
			onOpenChange={onOpenChange}
		>
			<DialogTrigger asChild>
				<Button>
					<Plus className="mr-2 h-4 w-4" />
					Add Charge
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Add New Charge</DialogTitle>
					<DialogDescription>
						Create a new charge record for a case.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="case_id"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Case</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={field.value}
										disabled={isSubmitting}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a case" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{casesData?.data?.map(
												(
													caseItem: Case
												) => (
													<SelectItem
														key={
															caseItem.id
														}
														value={caseItem.id.toString()}
													>
														#
														{
															caseItem.case_number
														}{" "}
														-{" "}
														{
															caseItem.title
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

						<FormField
							control={form.control}
							name="charge_title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Charge Title</FormLabel>
									<FormControl>
										<Input
											placeholder="e.g., Assault, Theft, etc."
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
							name="severity"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Severity Level
									</FormLabel>
									<Select
										onValueChange={field.onChange}
										defaultValue={field.value}
										disabled={isSubmitting}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select severity level" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{SEVERITY_LEVELS.map(
												(severity) => (
													<SelectItem
														key={
															severity
														}
														value={
															severity
														}
													>
														{severity}
													</SelectItem>
												)
											)}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Detailed description of the charge..."
											className="min-h-[100px]"
											{...field}
											disabled={isSubmitting}
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
									: "Add Charge"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

// Edit Charge Dialog component
interface EditChargeDialogProps {
	form: ReturnType<typeof useForm<EditChargeFormValues>>;
	onSubmit: (values: EditChargeFormValues) => Promise<void>;
	isSubmitting: boolean;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	charge: Charge | null;
	casesData: any;
}

function EditChargeDialog({
	form,
	onSubmit,
	isSubmitting,
	isOpen,
	onOpenChange,
	charge,
	casesData,
}: EditChargeDialogProps) {
	return (
		<Dialog
			open={isOpen}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Edit Charge</DialogTitle>
					<DialogDescription>
						Update the charge details for case #
						{charge?.case_id}.
					</DialogDescription>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-4"
					>
						<FormField
							control={form.control}
							name="case_id"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Case</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={field.value}
										disabled={isSubmitting}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a case" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{casesData?.data?.map(
												(
													caseItem: Case
												) => (
													<SelectItem
														key={
															caseItem.id
														}
														value={caseItem.id.toString()}
													>
														#
														{
															caseItem.case_number
														}{" "}
														-{" "}
														{
															caseItem.title
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

						<FormField
							control={form.control}
							name="charge_title"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Charge Title</FormLabel>
									<FormControl>
										<Input
											placeholder="e.g., Assault, Theft, etc."
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
							name="severity"
							render={({ field }) => (
								<FormItem>
									<FormLabel>
										Severity Level
									</FormLabel>
									<Select
										onValueChange={field.onChange}
										value={field.value}
										disabled={isSubmitting}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select severity level" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{SEVERITY_LEVELS.map(
												(severity) => (
													<SelectItem
														key={
															severity
														}
														value={
															severity
														}
													>
														{severity}
													</SelectItem>
												)
											)}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Detailed description of the charge..."
											className="min-h-[100px]"
											{...field}
											disabled={isSubmitting}
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
									: "Update Charge"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

// View Charge Dialog component
interface ViewChargeDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	charge: Charge | null;
}

function ViewChargeDialog({
	isOpen,
	onOpenChange,
	charge,
}: ViewChargeDialogProps) {
	if (!charge) return null;

	return (
		<Dialog
			open={isOpen}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Charge Details</DialogTitle>
					<DialogDescription>
						Viewing details for charge in case #
						{charge.case_id}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="text-sm font-medium text-gray-500">
								Case ID
							</label>
							<p className="mt-1 text-sm">
								#{charge.case_id}
							</p>
						</div>
						<div>
							<label className="text-sm font-medium text-gray-500">
								Severity
							</label>
							<div className="mt-1">
								<Badge
									className={`${
										SEVERITY_COLORS[
											charge.severity as keyof typeof SEVERITY_COLORS
										] ||
										"bg-gray-100 text-gray-800"
									}`}
								>
									{charge.severity}
								</Badge>
							</div>
						</div>
					</div>

					<div>
						<label className="text-sm font-medium text-gray-500">
							Charge Title
						</label>
						<p className="mt-1 text-sm font-medium">
							{charge.charge_title}
						</p>
					</div>

					<div>
						<label className="text-sm font-medium text-gray-500">
							Description
						</label>
						<p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
							{charge.description}
						</p>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="text-sm font-medium text-gray-500">
								Created At
							</label>
							<p className="mt-1 text-sm">
								{new Date(
									charge.createdAt
								).toLocaleDateString()}
							</p>
						</div>
						<div>
							<label className="text-sm font-medium text-gray-500">
								Updated At
							</label>
							<p className="mt-1 text-sm">
								{new Date(
									charge.updatedAt
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
