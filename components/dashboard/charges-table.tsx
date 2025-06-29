'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { fetcher, apiClient } from '@/lib/api';
import { Charge, Case } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Plus,
  ChevronDown,
  Search,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'react-toastify';

export function ChargesTable() {
  const [search, setSearch] = useState('');
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
  const { data: casesData } = useSWR('/cases', fetcher);
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
    case_id: '',
    charge_title: '',
    description: '',
    severity: '',
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
      await apiClient.post('/charge', payload);
      toast.success('Charge added successfully!');
      setIsAddDialogOpen(false);
      setAddForm({
        case_id: '',
        charge_title: '',
        description: '',
        severity: '',
      });
      mutate();
    } catch (err: any) {
      toast.error(err?.info?.message || err?.message || 'Failed to add charge');
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
      toast.success('Charge updated successfully!');
      setIsEditDialogOpen(false);
      setEditForm(null);
      setSelectedCharge(null);
      mutate();
    } catch (err: any) {
      toast.error(
        err?.info?.message || err?.message || 'Failed to update charge'
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
    setEditForm({ ...c, case_id: c.case_id?.toString() || '' });
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

  if (isLoading) return <div>Loading charges...</div>;
  if (error) return <div>Error loading charges</div>;

  // Helper
  const getCaseNumber = (id: number) => {
    const c = cases.find((x: any) => x.id === id);
    return c ? c.case_number : '-';
  };

  return (
    <div className="space-y-4">
      {/* Search, filter, pagination controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search charges..."
              className="w-full pl-8 sm:w-[300px]"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
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
              <DropdownMenuItem>Severity</DropdownMenuItem>
              <DropdownMenuItem>Case</DropdownMenuItem>
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
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" /> Add Charge
          </Button>
        </div>
      </div>
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={
                    selectedCharges.length === charges.length &&
                    charges.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Case</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {charges.map((c: Charge) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedCharges.includes(c.id?.toString())}
                    onCheckedChange={() => toggleSelectCharge(c.id?.toString())}
                  />
                </TableCell>
                <TableCell>{getCaseNumber(c.case_id)}</TableCell>
                <TableCell>{c.charge_title}</TableCell>
                <TableCell>
                  {c.description?.slice(0, 40)}
                  {c.description?.length > 40 ? '...' : ''}
                </TableCell>
                <TableCell>{c.severity}</TableCell>
                <TableCell>
                  {c.createdAt
                    ? new Date(c.createdAt).toLocaleDateString()
                    : '-'}
                </TableCell>
                <TableCell>
                  {c.updatedAt
                    ? new Date(c.updatedAt).toLocaleDateString()
                    : '-'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewClick(c)}>
                        <Eye className="mr-2 h-4 w-4" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditClick(c)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
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
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing <strong>{(page - 1) * limit + 1}</strong> to{' '}
          <strong>{Math.min(page * limit, pagination.total_items)}</strong> of{' '}
          <strong>{pagination.total_items}</strong> results
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page === pagination.total_pages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Charge</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCharge} className="space-y-4">
            <Select
              name="case_id"
              value={addForm.case_id}
              onValueChange={(v) =>
                setAddForm((f: any) => ({ ...f, case_id: v }))
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Case" />
              </SelectTrigger>
              <SelectContent>
                {cases.map((c: any) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
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
            />
            <Input
              name="description"
              placeholder="Description"
              value={addForm.description}
              onChange={handleAddChange}
              required
            />
            <Input
              name="severity"
              placeholder="Severity"
              value={addForm.severity}
              onChange={handleAddChange}
              required
            />
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={formLoading}
                  onClick={() => setIsAddDialogOpen(false)}
                >
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
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Charge</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditCharge} className="space-y-4">
            <Select
              name="case_id"
              value={editForm?.case_id || ''}
              onValueChange={(v) =>
                setEditForm((f: any) => ({ ...f, case_id: v }))
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Case" />
              </SelectTrigger>
              <SelectContent>
                {cases.map((c: any) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.case_number}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              name="charge_title"
              placeholder="Charge Title"
              value={editForm?.charge_title || ''}
              onChange={handleEditChange}
              required
            />
            <Input
              name="description"
              placeholder="Description"
              value={editForm?.description || ''}
              onChange={handleEditChange}
              required
            />
            <Input
              name="severity"
              placeholder="Severity"
              value={editForm?.severity || ''}
              onChange={handleEditChange}
              required
            />
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={formLoading}
                  onClick={() => setIsEditDialogOpen(false)}
                >
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
      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Charge Details</DialogTitle>
          </DialogHeader>
          {selectedCharge ? (
            <div className="space-y-2">
              <div>
                <b>Case:</b> {getCaseNumber(selectedCharge.case_id)}
              </div>
              <div>
                <b>Title:</b> {selectedCharge.charge_title}
              </div>
              <div>
                <b>Description:</b> {selectedCharge.description}
              </div>
              <div>
                <b>Severity:</b> {selectedCharge.severity}
              </div>
              <div>
                <b>Created:</b>{' '}
                {selectedCharge.createdAt
                  ? new Date(selectedCharge.createdAt).toLocaleDateString()
                  : '-'}
              </div>
              <div>
                <b>Updated:</b>{' '}
                {selectedCharge.updatedAt
                  ? new Date(selectedCharge.updatedAt).toLocaleDateString()
                  : '-'}
              </div>
            </div>
          ) : (
            <div>No charge selected.</div>
          )}
        </DialogContent>
      </Dialog>
      {/* Delete dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h3 className="mb-4 text-lg font-semibold">Delete Charge</h3>
            <p>
              Are you sure you want to delete charge "
              {selectedCharge?.charge_title}"?
            </p>
            <div className="mt-4 flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
