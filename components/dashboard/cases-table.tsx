'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { fetcher, apiClient } from '@/lib/api';
import { Case, PoliceOfficer, PolicePost, Victim } from '@/types';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'react-toastify';
import { SearchableMultiSelect } from '@/components/ui/searchable-multiselect';

export function CasesTable() {
  // Data fetching
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Fetch all related data for dropdowns
  const { data: officersData } = useSWR('/police-officers', fetcher);
  const { data: postsData } = useSWR('/police-posts', fetcher);
  const { data: suspectsData, mutate: mutateSuspects } = useSWR(
    '/suspects',
    fetcher
  );
  const { data: victimsData, mutate: mutateVictims } = useSWR(
    '/victims',
    fetcher
  );

  // Fetch cases with pagination and search
  const { data, error, isLoading, mutate } = useSWR(
    `/cases?search=${encodeURIComponent(search)}&page=${page}&limit=${limit}`,
    fetcher
  );
  const cases = data?.data || [];
  const pagination = data?.pagination || {
    page: 1,
    limit: 10,
    total_items: 0,
    total_pages: 1,
  };

  // Data for selects - filter out items without valid IDs
  const officers = officersData?.data || [];
  const posts = postsData?.data || [];
  const suspects = (suspectsData?.data || []).filter((s: any) => s?.id != null);
  const victims = (victimsData?.data || []).filter((v: any) => v?.id != null);

  // Table selection
  const toggleSelectAll = () => {
    if (selectedCases.length === cases.length) {
      setSelectedCases([]);
    } else {
      setSelectedCases(cases.map((c: Case) => c.id?.toString()));
    }
  };
  const toggleSelectCase = (id: string) => {
    setSelectedCases((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  // Add/Edit dialog state
  const [addForm, setAddForm] = useState<any>({
    case_number: '',
    title: '',
    status: '',
    date_opened: '',
    officer_id: '',
    police_post_id: '',
    suspect_ids: [],
    victim_ids: [],
    description: '',
    charges: '',
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

  // Add Case
  const handleAddCase = async (e: any) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        ...addForm,
        officer_id: Number(addForm.officer_id),
        police_post_id: Number(addForm.police_post_id),
        suspect_ids: addForm.suspect_ids,
        victim_ids: addForm.victim_ids,
        charges: JSON.parse(addForm.charges || '[]'),
      };
      await apiClient.post('/case', payload);
      toast.success('Case added successfully!');
      setIsAddDialogOpen(false);
      setAddForm({
        case_number: '',
        title: '',
        status: '',
        date_opened: '',
        officer_id: '',
        police_post_id: '',
        suspect_ids: [],
        victim_ids: [],
        description: '',
        charges: '',
      });
      mutate();
    } catch (err: any) {
      toast.error(err?.info?.message || err?.message || 'Failed to add case');
    } finally {
      setFormLoading(false);
    }
  };
  // Edit Case
  const handleEditCase = async (e: any) => {
    e.preventDefault();
    if (!editForm || !selectedCase) return;
    setFormLoading(true);
    try {
      const payload = {
        ...editForm,
        officer_id: Number(editForm.officer_id),
        police_post_id: Number(editForm.police_post_id),
        suspect_ids: editForm.suspect_ids,
        victim_ids: editForm.victim_ids,
        charges: JSON.parse(editForm.charges || '[]'),
      };
      await apiClient.put(`/case/${selectedCase.id}`, payload);
      toast.success('Case updated successfully!');
      setIsEditDialogOpen(false);
      setEditForm(null);
      setSelectedCase(null);
      mutate();
    } catch (err: any) {
      toast.error(
        err?.info?.message || err?.message || 'Failed to update case'
      );
    } finally {
      setFormLoading(false);
    }
  };

  // View/Edit dialog openers
  const handleViewClick = (c: Case) => {
    setSelectedCase(c);
    setIsViewDialogOpen(true);
  };
  const handleEditClick = (c: Case) => {
    setSelectedCase(c);
    setEditForm({
      ...c,
      charges: JSON.stringify(c.charges || []),
      suspect_ids: Array.isArray(c.suspect_ids)
        ? c.suspect_ids.filter(
            (id) => typeof id === 'string' || typeof id === 'number'
          )
        : [],
      victim_ids: Array.isArray(c.victim_ids)
        ? c.victim_ids.filter(
            (id) => typeof id === 'string' || typeof id === 'number'
          )
        : [],
      officer_id: c.officer_id?.toString() || '',
      police_post_id: c.police_post_id?.toString() || '',
    });
    setIsEditDialogOpen(true);
  };
  const handleAddClick = () => {
    // Revalidate suspects and victims data when opening add dialog
    mutateSuspects();
    mutateVictims();
    setIsAddDialogOpen(true);
  };

  // Delete
  const openDeleteDialog = useCallback((c: Case) => {
    setSelectedCase(c);
    setIsDeleteDialogOpen(true);
  }, []);
  const handleDelete = async () => {
    if (!selectedCase) return;
    try {
      await apiClient.delete(`/case/${selectedCase.id}`);
      await mutate();
      setIsDeleteDialogOpen(false);
      setSelectedCase(null);
    } catch (e) {}
  };

  // Table rendering
  if (isLoading) return <div>Loading cases...</div>;
  if (error) return <div>Error loading cases</div>;

  // Helper functions
  const getOfficerName = (id: number) => {
    const o = officers.find((x: any) => x.id === id);
    return o ? `${o.first_name} ${o.last_name}` : '-';
  };
  const getPostName = (id: number) => {
    const p = posts.find((x: any) => x.id === id);
    return p ? p.name : '-';
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
              placeholder="Search cases..."
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
              <DropdownMenuItem>Status</DropdownMenuItem>
              <DropdownMenuItem>Officer</DropdownMenuItem>
              <DropdownMenuItem>Police Post</DropdownMenuItem>
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
            <Plus className="mr-2 h-4 w-4" /> Add Case
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
                    selectedCases.length === cases.length && cases.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Case Number</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Officer</TableHead>
              <TableHead>Police Post</TableHead>
              <TableHead>Suspects</TableHead>
              <TableHead>Victims</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Opened</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.map((c: Case) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedCases.includes(c.id?.toString())}
                    onCheckedChange={() => toggleSelectCase(c.id?.toString())}
                  />
                </TableCell>
                <TableCell>{c.case_number}</TableCell>
                <TableCell>{c.title}</TableCell>
                <TableCell>{getOfficerName(c.officer_id)}</TableCell>
                <TableCell>{getPostName(c.police_post_id)}</TableCell>
                <TableCell>
                  {Array.isArray(c.suspect_ids) && c.suspect_ids.length > 0
                    ? c.suspect_ids
                        .map((sid) => {
                          const s = suspects.find((sus: any) => sus.id === sid);
                          return s ? `${s.first_name} ${s.last_name}` : sid;
                        })
                        .join(', ')
                    : '-'}
                </TableCell>
                <TableCell>
                  {Array.isArray(c.victim_ids) ? c.victim_ids.length : 0}
                </TableCell>
                <TableCell>{c.status}</TableCell>
                <TableCell>{c.date_opened}</TableCell>
                <TableCell>
                  {c.description?.slice(0, 40)}
                  {c.description?.length > 40 ? '...' : ''}
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
            <DialogTitle>Add Case</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCase} className="space-y-4">
            <Input
              name="case_number"
              placeholder="Case Number"
              value={addForm.case_number}
              onChange={handleAddChange}
              required
            />
            <Input
              name="title"
              placeholder="Title"
              value={addForm.title}
              onChange={handleAddChange}
              required
            />
            <Input
              name="status"
              placeholder="Status"
              value={addForm.status}
              onChange={handleAddChange}
              required
            />
            <Input
              name="date_opened"
              type="date"
              value={addForm.date_opened}
              onChange={handleAddChange}
              required
            />
            <Select
              name="officer_id"
              value={addForm.officer_id}
              onValueChange={(v) =>
                setAddForm((f: any) => ({ ...f, officer_id: v }))
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Officer" />
              </SelectTrigger>
              <SelectContent>
                {officers.map((o: any) => (
                  <SelectItem key={o.id} value={o.id.toString()}>
                    {o.first_name} {o.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              name="police_post_id"
              value={addForm.police_post_id}
              onValueChange={(v) =>
                setAddForm((f: any) => ({ ...f, police_post_id: v }))
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Police Post" />
              </SelectTrigger>
              <SelectContent>
                {posts.map((p: any) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Suspects Multi-Select */}
            <SearchableMultiSelect
              label="Suspects"
              options={suspects.map((s: any) => ({
                value: s.id.toString(),
                label: `${s.first_name || s.firstName} ${
                  s.last_name || s.lastName
                }`,
              }))}
              selectedValues={
                Array.isArray(addForm.suspect_ids)
                  ? addForm.suspect_ids
                      .filter(
                        (id: any) =>
                          typeof id === 'string' || typeof id === 'number'
                      )
                      .map((id: any) => id.toString())
                  : []
              }
              onChange={(values: string[]) =>
                setAddForm((f: any) => ({
                  ...f,
                  suspect_ids: values.map((v: string) => {
                    const found = suspects.find(
                      (s: any) => s.id.toString() === v
                    );
                    return found ? found.id : v;
                  }),
                }))
              }
              placeholder={
                suspects.length === 0
                  ? 'Loading suspects...'
                  : 'Select suspects...'
              }
              disabled={suspects.length === 0}
            />
            {/* Victims Multi-Select */}
            <SearchableMultiSelect
              label="Victims"
              options={victims.map((v: any) => ({
                value: v.id.toString(),
                label: `${v.first_name || v.firstName} ${
                  v.last_name || v.lastName
                }`,
              }))}
              selectedValues={
                Array.isArray(addForm.victim_ids)
                  ? addForm.victim_ids
                      .filter(
                        (id: any) =>
                          typeof id === 'string' || typeof id === 'number'
                      )
                      .map((id: any) => id.toString())
                  : []
              }
              onChange={(values: string[]) =>
                setAddForm((f: any) => ({
                  ...f,
                  victim_ids: values.map((v: string) => {
                    const found = victims.find(
                      (vic: any) => vic.id.toString() === v
                    );
                    return found ? found.id : v;
                  }),
                }))
              }
              placeholder={
                victims.length === 0
                  ? 'Loading victims...'
                  : 'Select victims...'
              }
              disabled={victims.length === 0}
            />
            <Input
              name="description"
              placeholder="Description"
              value={addForm.description}
              onChange={handleAddChange}
              required
            />
            <Input
              name="charges"
              placeholder='Charges (JSON: [{"charge_title":"...","description":"...","severity":"..."}])'
              value={addForm.charges}
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
            <DialogTitle>Edit Case</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditCase} className="space-y-4">
            <Input
              name="case_number"
              placeholder="Case Number"
              value={editForm?.case_number || ''}
              onChange={handleEditChange}
              required
            />
            <Input
              name="title"
              placeholder="Title"
              value={editForm?.title || ''}
              onChange={handleEditChange}
              required
            />
            <Input
              name="status"
              placeholder="Status"
              value={editForm?.status || ''}
              onChange={handleEditChange}
              required
            />
            <Input
              name="date_opened"
              type="date"
              value={editForm?.date_opened || ''}
              onChange={handleEditChange}
              required
            />
            <Select
              name="officer_id"
              value={editForm?.officer_id || ''}
              onValueChange={(v) =>
                setEditForm((f: any) => ({ ...f, officer_id: v }))
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Officer" />
              </SelectTrigger>
              <SelectContent>
                {officers.map((o: any) => (
                  <SelectItem key={o.id} value={o.id.toString()}>
                    {o.first_name} {o.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              name="police_post_id"
              value={editForm?.police_post_id || ''}
              onValueChange={(v) =>
                setEditForm((f: any) => ({ ...f, police_post_id: v }))
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Police Post" />
              </SelectTrigger>
              <SelectContent>
                {posts.map((p: any) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Suspects Multi-Select */}
            <SearchableMultiSelect
              label="Suspects"
              options={suspects.map((s: any) => ({
                value: s.id.toString(),
                label: `${s.first_name || s.firstName} ${
                  s.last_name || s.lastName
                }`,
              }))}
              selectedValues={
                Array.isArray(editForm?.suspect_ids)
                  ? editForm.suspect_ids
                      .filter(
                        (id) => typeof id === 'string' || typeof id === 'number'
                      )
                      .map((id) => id.toString())
                  : []
              }
              onChange={(values: string[]) =>
                setEditForm((f: any) => ({
                  ...f,
                  suspect_ids: values.map((v: string) => {
                    const found = suspects.find(
                      (s: any) => s.id.toString() === v
                    );
                    return found ? found.id : v;
                  }),
                }))
              }
              placeholder="Select suspects..."
            />
            {/* Victims Multi-Select */}
            <SearchableMultiSelect
              label="Victims"
              options={victims.map((v: any) => ({
                value: v.id.toString(),
                label: `${v.first_name || v.firstName} ${
                  v.last_name || v.lastName
                }`,
              }))}
              selectedValues={
                Array.isArray(editForm?.victim_ids)
                  ? editForm.victim_ids
                      .filter(
                        (id) => typeof id === 'string' || typeof id === 'number'
                      )
                      .map((id) => id.toString())
                  : []
              }
              onChange={(values: string[]) =>
                setEditForm((f: any) => ({
                  ...f,
                  victim_ids: values.map((v: string) => {
                    const found = victims.find(
                      (vic: any) => vic.id.toString() === v
                    );
                    return found ? found.id : v;
                  }),
                }))
              }
              placeholder="Select victims..."
            />
            <Input
              name="description"
              placeholder="Description"
              value={editForm?.description || ''}
              onChange={handleEditChange}
              required
            />
            <Input
              name="charges"
              placeholder='Charges (JSON: [{"charge_title":"...","description":"...","severity":"..."}])'
              value={editForm?.charges || ''}
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
            <DialogTitle>Case Details</DialogTitle>
          </DialogHeader>
          {selectedCase ? (
            <div className="space-y-2">
              <div>
                <b>Case Number:</b> {selectedCase.case_number}
              </div>
              <div>
                <b>Title:</b> {selectedCase.title}
              </div>
              <div>
                <b>Status:</b> {selectedCase.status}
              </div>
              <div>
                <b>Date Opened:</b> {selectedCase.date_opened}
              </div>
              <div>
                <b>Officer:</b> {getOfficerName(selectedCase.officer_id)}
              </div>
              <div>
                <b>Police Post:</b> {getPostName(selectedCase.police_post_id)}
              </div>
              <div>
                <b>Suspects:</b>{' '}
                {Array.isArray(selectedCase.suspect_ids) &&
                selectedCase.suspect_ids.length > 0
                  ? selectedCase.suspect_ids
                      .map((sid) => {
                        const s = suspects.find((sus: any) => sus.id === sid);
                        return s ? `${s.first_name} ${s.last_name}` : sid;
                      })
                      .join(', ')
                  : '-'}
              </div>
              <div>
                <b>Victims:</b>{' '}
                {Array.isArray(selectedCase.victim_ids)
                  ? selectedCase.victim_ids.length
                  : 0}
              </div>
              <div>
                <b>Description:</b> {selectedCase.description}
              </div>
              <div>
                <b>Charges:</b>
                <ul className="list-disc ml-6">
                  {selectedCase.charges?.map((charge, idx) => (
                    <li key={idx}>
                      <b>{charge.charge_title}</b>: {charge.description}{' '}
                      (Severity: {charge.severity})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div>No case selected.</div>
          )}
        </DialogContent>
      </Dialog>
      {/* Delete dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h3 className="mb-4 text-lg font-semibold">Delete Case</h3>
            <p>
              Are you sure you want to delete case "{selectedCase?.case_number}
              "?
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
