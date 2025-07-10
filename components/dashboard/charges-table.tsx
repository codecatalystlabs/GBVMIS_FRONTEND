"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import { fetcher, apiClient } from "@/lib/api";
import { Charge, Case } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Plus,
  ChevronDown,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-toastify";

export function ChargesTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedCharges, setSelectedCharges] = useState<string[]>([]);
  const [selectedCharge, setSelectedCharge] = useState<Charge | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Fetch cases for dropdown
  const { data: casesData } = useSWR("/cases", fetcher);
  const cases = casesData?.data || [];

  // Fetch charges with pagination and search
  const { data, error, isLoading, mutate } = useSWR(
    `/charges?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`,
    fetcher
  );
  const charges = data?.data || [];
  const pagination = data?.pagination || {
    page: 1,
    limit: 10,
    total_items: 0,
    total_pages: 1,
  };

  // Table selection
  const toggleSelectAll = () => {
    if (selectedCharges.length === charges.length) {
      setSelectedCharges([]);
    } else {
      setSelectedCharges(charges.map((c: Charge) => c.id?.toString()));
    }
  };
  const toggleSelectCharge = (id: string) => {
    setSelectedCharges((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  // Add/Edit dialog state
  const [addForm, setAddForm] = useState<any>({
    case_id: "",
    charge_title: "",
    description: "",
    severity: "",
  });
  const [editForm, setEditForm] = useState<any>(null);

  // Add/Edit handlers
  const handleAddChange = (e: any) => {
    const { name, value } = e.target;
    setAddForm((prev: any) => ({ ...prev, [name]: value }));
  };
  const handleEditChange = (e: any) => {
    const { name, value } = e.target;
    setEditForm((prev: any) => ({ ...prev, [name]: value }));
  };

  // Add Charge
  const handleAddCharge = async (e: any) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        ...addForm,
        case_id: Number(addForm.case_id),
      };
      await apiClient.post("/charge", payload);
      toast.success("Charge added successfully!");
      setIsAddDialogOpen(false);
      setAddForm({
        case_id: "",
        charge_title: "",
        description: "",
        severity: "",
      });
      mutate();
    } catch (err: any) {
      toast.error(
        err?.info?.message || err?.message || "Failed to add charge"
      );
    } finally {
      setFormLoading(false);
    }
  };
  // Edit Charge
  const handleEditCharge = async (e: any) => {
    e.preventDefault();
    if (!editForm || !selectedCharge) return;
    setFormLoading(true);
    try {
      const payload = {
        ...editForm,
        case_id: Number(editForm.case_id),
      };
      await apiClient.put(`/charge/${selectedCharge.id}`, payload);
      toast.success("Charge updated successfully!");
      setIsEditDialogOpen(false);
      setEditForm(null);
      setSelectedCharge(null);
      mutate();
    } catch (err: any) {
      toast.error(
        err?.info?.message || err?.message || "Failed to update charge"
      );
    } finally {
      setFormLoading(false);
    }
  };

  // View/Edit dialog openers
  const handleViewClick = (c: Charge) => {
    setSelectedCharge(c);
    setIsViewDialogOpen(true);
  };
  const handleEditClick = (c: Charge) => {
    setSelectedCharge(c);
    setEditForm({ ...c, case_id: c.case_id?.toString() || "" });
    setIsEditDialogOpen(true);
  };
  const handleAddClick = () => {
    setIsAddDialogOpen(true);
  };

  // Delete
  const openDeleteDialog = useCallback((c: Charge) => {
    setSelectedCharge(c);
    setIsDeleteDialogOpen(true);
  }, []);
  const handleDelete = async () => {
    if (!selectedCharge) return;
    try {
      await apiClient.delete(`/charge/${selectedCharge.id}`);
      await mutate();
      setIsDeleteDialogOpen(false);
      setSelectedCharge(null);
    } catch (e) {}
  };

  if (isLoading) return <div className="text-blue-900">Loading charges...</div>;
  if (error) return <div className="text-red-500">Error loading charges</div>;

  // Helper
  const getCaseNumber = (id: number) => {
    const c = cases.find((x: any) => x.id === id);
    return c ? c.case_number : "-";
  };

  return (
    <div className="space-y-6 p-6 bg-gray-100 rounded-xl shadow-lg">
      {/* Search, filter, pagination controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
            <Input
              type="search"
              placeholder="Search charges..."
              className="w-full pl-10 sm:w-[300px] bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 transition-all duration-300"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="h-9 bg-white border-blue-200 text-blue-900 hover:bg-gray-200"
              >
                <ChevronDown className="h-4 w-4 text-blue-900" />
                <span className="sr-only">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white border-blue-200 text-blue-900"
            >
              <DropdownMenuLabel className="text-blue-900">Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-blue-200" />
              <DropdownMenuItem className="hover:bg-gray-200 text-blue-900">
                Severity
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-200 text-blue-900">
                Case
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={limit.toString()}
            onValueChange={(v) => {
              setLimit(Number(v));
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-[70px] bg-white border-blue-200 text-blue-900 focus:ring-2 focus:ring-blue-600">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent className="bg-white border-blue-200 text-blue-900">
              <SelectItem value="10" className="hover:bg-gray-200 text-blue-900">
                10
              </SelectItem>
              <SelectItem value="20" className="hover:bg-gray-200 text-blue-900">
                20
              </SelectItem>
              <SelectItem value="50" className="hover:bg-gray-200 text-blue-900">
                50
              </SelectItem>
              <SelectItem value="100" className="hover:bg-gray-200 text-blue-900">
                100
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleAddClick}
            className="bg-blue-800 text-white hover:bg-blue-900 rounded-md transition-all duration-300"
          >
            <Plus className="mr-2 h-5 w-5" /> Add Charge
          </Button>
        </div>
      </div>
      {/* Table */}
      <div className="rounded-xl border border-blue-200 bg-white shadow-lg">
        <Table>
          <TableHeader className="bg-gray-100">
            <TableRow className="border-b border-blue-200 hover:bg-gray-200">
              <TableHead className="w-[40px] p-3 text-blue-900">
                <Checkbox
                  checked={
                    selectedCharges.length === charges.length &&
                    charges.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                  className="border-blue-200 text-blue-600 focus:ring-blue-600"
                />
              </TableHead>
              <TableHead className="p-3 text-blue-900 font-semibold">Case</TableHead>
              <TableHead className="p-3 text-blue-900 font-semibold">Title</TableHead>
              <TableHead className="p-3 text-blue-900 font-semibold">
                Description
              </TableHead>
              <TableHead className="p-3 text-blue-900 font-semibold">
                Severity
              </TableHead>
              <TableHead className="p-3 text-blue-900 font-semibold">
                Created
              </TableHead>
              <TableHead className="p-3 text-blue-900 font-semibold">
                Updated
              </TableHead>
              <TableHead className="w-[40px] p-3 text-blue-900"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {charges.map((c: Charge) => (
              <TableRow
                key={c.id} 
                className="border-t border-blue-200 hover:bg-gray-200 transition-all duration-200"
              >
                <TableCell className="p-3">
                  <Checkbox
                    checked={selectedCharges.includes(c.id?.toString())}
                    onCheckedChange={() => toggleSelectCharge(c.id?.toString())}
                    className="border-blue-200 text-blue-600 focus:ring-blue-600"
                  />
                </TableCell>
                <TableCell className="p-3 text-blue-900">
                  {getCaseNumber(c.case_id)}
                </TableCell>
                <TableCell className="p-3 text-blue-900">
                  {c.charge_title}
                </TableCell>
                <TableCell className="p-3 text-blue-900">
                  {c.description?.slice(0, 40)}
                  {c.description?.length > 40 ? "..." : ""}
                </TableCell>
                <TableCell className="p-3 text-blue-900">
                  {c.severity}
                </TableCell>
                <TableCell className="p-3 text-blue-900">
                  {c.createdAt
                    ? new Date(c.createdAt).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell className="p-3 text-blue-900">
                  {c.updatedAt
                    ? new Date(c.updatedAt).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell className="p-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-blue-900 hover:bg-gray-200 rounded-full"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-white border-blue-200 text-blue-900"
                    >
                      <DropdownMenuItem
                        className="hover:bg-gray-200 text-blue-900"
                        onClick={() => handleViewClick(c)}
                      >
                        <Eye className="mr-2 h-4 w-4" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="hover:bg-gray-200 text-blue-900"
                        onClick={() => handleEditClick(c)}
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-blue-200" />
                      <DropdownMenuItem
                        className="hover:bg-gray-200 text-red-500"
                        onClick={() => openDeleteDialog(c)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* Pagination */}
      <div className="flex items-center justify-between py-3 px-4 bg-white border border-blue-200 rounded-xl shadow-md">
        <div className="text-sm text-blue-900">
          Showing{" "}
          <strong className="text-blue-900">
            {(page - 1) * limit + 1}
          </strong>{" "}
          to{" "}
          <strong className="text-blue-900">
            {Math.min(page * limit, pagination.total_items)}
          </strong>{" "}
          of{" "}
          <strong className="text-blue-900">{pagination.total_items}</strong>{" "}
          results
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            className="bg-white border-blue-200 text-blue-900 hover:bg-gray-200 rounded-md"
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page === pagination.total_pages}
            className="bg-white border-blue-200 text-blue-900 hover:bg-gray-200 rounded-md"
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-white border-blue-200 rounded-xl shadow-lg max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-900">Add Charge</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCharge} className="space-y-4 p-4">
            <Select
              name="case_id"
              value={addForm.case_id}
              onValueChange={(v) =>
                setAddForm((f: any) => ({ ...f, case_id: v }))
              }
              required
            >
              <SelectTrigger className="bg-white border-blue-200 text-blue-900 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300">
                <SelectValue placeholder="Select Case" />
              </SelectTrigger>
              <SelectContent className="bg-white border-blue-200 text-blue-900">
                {cases.map((c: any) => (
                  <SelectItem
                    key={c.id}
                    value={c.id.toString()}
                    className="hover:bg-gray-200 text-blue-900"
                  >
                    {c.case_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              name="charge_title"
              placeholder="Charge Title"
              value={addForm.charge_title}
              onChange={handleAddChange}
              required
              className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
            />
            <Input
              name="description"
              placeholder="Description"
              value={addForm.description}
              onChange={handleAddChange}
              required
              className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
            />
            <Input
              name="severity"
              placeholder="Severity"
              value={addForm.severity}
              onChange={handleAddChange}
              required
              className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={formLoading}
                  className="bg-white border-blue-200 text-blue-900 hover:bg-gray-200 rounded-md transition-all duration-300"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={formLoading}
                className="bg-blue-800 text-white hover:bg-blue-900 rounded-md transition-all duration-300"
              >
                {formLoading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white border-blue-200 rounded-xl shadow-lg max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-900">Edit Charge</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditCharge} className="space-y-4 p-4">
            <Select
              name="case_id"
              value={editForm?.case_id || ""}
              onValueChange={(v) =>
                setEditForm((f: any) => ({ ...f, case_id: v }))
              }
              required
            >
              <SelectTrigger className="bg-white border-blue-200 text-blue-900 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300">
                <SelectValue placeholder="Select Case" />
              </SelectTrigger>
              <SelectContent className="bg-white border-blue-200 text-blue-900">
                {cases.map((c: any) => (
                  <SelectItem
                    key={c.id}
                    value={c.id.toString()}
                    className="hover:bg-gray-200 text-blue-900"
                  >
                    {c.case_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              name="charge_title"
              placeholder="Charge Title"
              value={editForm?.charge_title || ""}
              onChange={handleEditChange}
              required
              className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
            />
            <Input
              name="description"
              placeholder="Description"
              value={editForm?.description || ""}
              onChange={handleEditChange}
              required
              className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
            />
            <Input
              name="severity"
              placeholder="Severity"
              value={editForm?.severity || ""}
              onChange={handleEditChange}
              required
              className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={formLoading}
                  className="bg-white border-blue-200 text-blue-900 hover:bg-gray-200 rounded-md transition-all duration-300"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={formLoading}
                className="bg-blue-800 text-white hover:bg-blue-900 rounded-md transition-all duration-300"
              >
                {formLoading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-white border-blue-200 rounded-xl shadow-lg max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-blue-900">Charge Details</DialogTitle>
          </DialogHeader>
          {selectedCharge ? (
            <div className="space-y-4 p-4">
              <div>
                <span className="text-blue-400 font-medium">Case:</span>{" "}
                <span className="text-blue-900">
                  {getCaseNumber(selectedCharge.case_id)}
                </span>
              </div>
              <div>
                <span className="text-blue-400 font-medium">Title:</span>{" "}
                <span className="text-blue-900">
                  {selectedCharge.charge_title}
                </span>
              </div>
              <div>
                <span className="text-blue-400 font-medium">Description:</span>{" "}
                <span className="text-blue-900">
                  {selectedCharge.description}
                </span>
              </div>
              <div>
                <span className="text-blue-400 font-medium">Severity:</span>{" "}
                <span className="text-blue-900">{selectedCharge.severity}</span>
              </div>
              <div>
                <span className="text-blue-400 font-medium">Created:</span>{" "}
                <span className="text-blue-900">
                  {selectedCharge.createdAt
                    ? new Date(selectedCharge.createdAt).toLocaleDateString()
                    : "-"}
                </span>
              </div>
              <div>
                <span className="text-blue-400 font-medium">Updated:</span>{" "}
                <span className="text-blue-900">
                  {selectedCharge.updatedAt
                    ? new Date(selectedCharge.updatedAt).toLocaleDateString()
                    : "-"}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-blue-900">No charge selected.</div>
          )}
        </DialogContent>
      </Dialog>
      {/* Delete dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-200">
            <h3 className="mb-4 text-lg font-semibold text-blue-900">
              Delete Charge
            </h3>
            <p className="text-blue-900">
              Are you sure you want to delete charge "{selectedCharge?.charge_title}
              "?
            </p>
            <div className="mt-4 flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className="bg-white border-blue-200 text-blue-900 hover:bg-gray-200 rounded-md transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="bg-red-600 text-white hover:bg-red-700 rounded-md transition-all duration-300"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}