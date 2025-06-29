'use client';

import { useState } from 'react';
import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable';

import {
  MoreHorizontal,
  ChevronDown,
  Search,
  ArrowUpDown,
  Plus,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { fetcher, apiClient } from '@/lib/api';

export function VictimsTable() {
  const [selectedVictims, setSelectedVictims] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [victimForm, setVictimForm] = useState<{
    address: string;
    case_ids: number[];
    created_by: string;
    dob: string;
    first_name: string;
    gender: string;
    last_name: string;
    nationality: string;
    nin: string;
    phone_number: string;
    updated_by: string;
  }>({
    address: '',
    case_ids: [],
    created_by: '',
    dob: '',
    first_name: '',
    gender: '',
    last_name: '',
    nationality: '',
    nin: '',
    phone_number: '',
    updated_by: '',
  });

  const { data, error, isLoading, mutate } = useSWR('/victims', fetcher);
  const victims = data?.data || [];

  const [viewVictim, setViewVictim] = useState<any | null>(null);
  const [editVictim, setEditVictim] = useState<any | null>(null);
  const [deleteVictim, setDeleteVictim] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [examinationVictim, setExaminationVictim] = useState<any | null>(null);
  const [examinationDialogOpen, setExaminationDialogOpen] = useState(false);
  const [examinationForm, setExaminationForm] = useState<any | null>(null);
  const [examinationEditId, setExaminationEditId] = useState<number | null>(
    null
  );
  const [examinationLoading, setExaminationLoading] = useState(false);

  // Fetch examinations for a victim (only when dialog is open)
  const { data: examinationsData, mutate: mutateExaminations } =
    useSWRImmutable(
      examinationVictim
        ? `/examinations/search?victim_id=${examinationVictim.ID}`
        : null,
      fetcher
    );
  const examinations = examinationsData?.data || [];

  // Fetch all facilities for dropdowns
  const { data: facilitiesData } = useSWR('/health-facilities', fetcher);
  const facilities = facilitiesData?.data || [];

  const toggleSelectAll = () => {
    if (selectedVictims.length === victims.length) {
      setSelectedVictims([]);
    } else {
      setSelectedVictims(
        victims.map((victim: { ID: number }) => victim.ID.toString())
      );
    }
  };

  const toggleSelectVictim = (id: string) => {
    if (selectedVictims.includes(id)) {
      setSelectedVictims(selectedVictims.filter((victimId) => victimId !== id));
    } else {
      setSelectedVictims([...selectedVictims, id]);
    }
  };

  const handleAddVictim = async (e: any) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await apiClient.post('/victim', victimForm);
      setAddDialogOpen(false);
      setVictimForm({
        address: '',
        case_ids: [],
        created_by: '',
        dob: '',
        first_name: '',
        gender: '',
        last_name: '',
        nationality: '',
        nin: '',
        phone_number: '',
        updated_by: '',
      });
      mutate();
    } catch (err: any) {
      // Optionally show error
    }
    setFormLoading(false);
  };

  const handleVictimFormChange = (e: any) => {
    const { name, value } = e.target;
    setVictimForm((prev) => ({ ...prev, [name]: value }));
  };

  // Helper to open edit dialog with victim data
  const openEditDialog = (victim: any) => {
    setEditVictim(victim);
    setEditForm({
      ...victim,
      case_ids: Array.isArray(victim.case_ids)
        ? victim.case_ids
        : victim.case_ids
        ? victim.case_ids.split(',').map((v: any) => Number(v.trim()))
        : [],
    });
  };

  // Edit form change handler
  const handleEditFormChange = (e: any) => {
    const { name, value } = e.target;
    setEditForm((prev: any) => ({ ...prev, [name]: value }));
  };

  // Edit form submit handler
  const handleEditVictim = async (e: any) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await apiClient.put(`/victim/${editVictim.ID}`, {
        ...editForm,
        case_ids:
          typeof editForm.case_ids === 'string'
            ? editForm.case_ids
                .split(',')
                .map((v: any) => Number(v.trim()))
                .filter(Boolean)
            : editForm.case_ids,
      });
      setEditVictim(null);
      setEditForm(null);
      mutate();
    } catch (err) {
      // Optionally show error
    }
    setEditLoading(false);
  };

  // Delete handler
  const handleDeleteVictim = async () => {
    if (!deleteVictim) return;
    setDeleteLoading(true);
    try {
      await apiClient.delete(`/victim/${deleteVictim.ID}`);
      setDeleteVictim(null);
      mutate();
    } catch (err) {
      // Optionally show error
    }
    setDeleteLoading(false);
  };

  // Open examination dialog for a victim
  const openExaminationDialog = (victim: any) => {
    setExaminationVictim(victim);
    setExaminationDialogOpen(true);
    setExaminationForm(null);
    setExaminationEditId(null);
  };

  // Handle examination form change
  const handleExaminationFormChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setExaminationForm((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle create/edit examination
  const handleExaminationSubmit = async (e: any) => {
    e.preventDefault();
    setExaminationLoading(true);
    try {
      const payload = {
        ...examinationForm,
        victim_id: examinationVictim.ID,
        case_id: Number(examinationForm.case_id),
        facility_id: Number(examinationForm.facility_id),
        practitioner_id: Number(examinationForm.practitioner_id),
      };
      if (examinationEditId) {
        await apiClient.put(`/examination/${examinationEditId}`, payload);
      } else {
        await apiClient.post('/examination', payload);
      }
      setExaminationForm(null);
      setExaminationEditId(null);
      mutateExaminations();
    } catch (err) {}
    setExaminationLoading(false);
  };

  // Handle delete examination
  const handleDeleteExamination = async (id: number) => {
    setExaminationLoading(true);
    try {
      await apiClient.delete(`/examination/${id}`);
      mutateExaminations();
    } catch (err) {}
    setExaminationLoading(false);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Failed to load victims.</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search victims..."
              className="w-full pl-8 sm:w-[300px]"
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
              <DropdownMenuItem>Gender</DropdownMenuItem>
              <DropdownMenuItem>Status</DropdownMenuItem>
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
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Victim
          </Button>
        </div>
      </div>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Victim</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddVictim} className="space-y-2">
            <Input
              name="first_name"
              placeholder="First Name"
              value={victimForm.first_name}
              onChange={handleVictimFormChange}
              required
            />
            <Input
              name="last_name"
              placeholder="Last Name"
              value={victimForm.last_name}
              onChange={handleVictimFormChange}
              required
            />
            <Input
              name="gender"
              placeholder="Gender"
              value={victimForm.gender}
              onChange={handleVictimFormChange}
              required
            />
            <Input
              name="dob"
              type="date"
              placeholder="Date of Birth"
              value={victimForm.dob}
              onChange={handleVictimFormChange}
              required
            />
            <Input
              name="phone_number"
              placeholder="Phone Number"
              value={victimForm.phone_number}
              onChange={handleVictimFormChange}
              required
            />
            <Input
              name="nin"
              placeholder="NIN"
              value={victimForm.nin}
              onChange={handleVictimFormChange}
              required
            />
            <Input
              name="nationality"
              placeholder="Nationality"
              value={victimForm.nationality}
              onChange={handleVictimFormChange}
              required
            />
            <Input
              name="address"
              placeholder="Address"
              value={victimForm.address}
              onChange={handleVictimFormChange}
              required
            />
            <Input
              name="created_by"
              placeholder="Created By"
              value={victimForm.created_by}
              onChange={handleVictimFormChange}
              required
            />
            <Input
              name="updated_by"
              placeholder="Updated By"
              value={victimForm.updated_by}
              onChange={handleVictimFormChange}
              required
            />
            <Input
              name="case_ids"
              placeholder="Case IDs (comma separated)"
              value={victimForm.case_ids.join(',')}
              onChange={(e) =>
                setVictimForm((f) => ({
                  ...f,
                  case_ids: e.target.value
                    .split(',')
                    .map((v) => Number(v.trim()))
                    .filter(Boolean),
                }))
              }
            />
            <DialogFooter className="mt-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAddDialogOpen(false)}
                  disabled={formLoading}
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={
                    selectedVictims.length === victims.length &&
                    victims.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>ID</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Officer</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {victims.map((victim: any) => (
              <TableRow key={victim.ID}>
                <TableCell>
                  <Checkbox
                    checked={selectedVictims.includes(victim.ID.toString())}
                    onCheckedChange={() =>
                      toggleSelectVictim(victim.ID.toString())
                    }
                  />
                </TableCell>
                <TableCell className="font-medium">{victim.ID}</TableCell>
                <TableCell>{victim.first_name}</TableCell>
                <TableCell>{victim.last_name}</TableCell>
                <TableCell>{victim.gender}</TableCell>
                <TableCell>
                  {victim.dob ? new Date(victim.dob).toLocaleDateString() : ''}
                </TableCell>
                <TableCell>{victim.status || ''}</TableCell>
                <TableCell>{victim.created_by}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setViewVictim(victim)}>
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(victim)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openExaminationDialog(victim)}
                      >
                        Examination
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteVictim(victim)}
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
          Showing <strong>1</strong> to <strong>{victims.length}</strong> of{' '}
          <strong>{victims.length}</strong> results
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

      {/* View Victim Dialog */}
      <Dialog open={!!viewVictim} onOpenChange={() => setViewVictim(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Victim Details</DialogTitle>
          </DialogHeader>
          {viewVictim && (
            <div className="space-y-2">
              <div>
                <strong>ID:</strong> {viewVictim.ID}
              </div>
              <div>
                <strong>First Name:</strong> {viewVictim.first_name}
              </div>
              <div>
                <strong>Last Name:</strong> {viewVictim.last_name}
              </div>
              <div>
                <strong>Gender:</strong> {viewVictim.gender}
              </div>
              <div>
                <strong>Date of Birth:</strong>{' '}
                {viewVictim.dob
                  ? new Date(viewVictim.dob).toLocaleDateString()
                  : ''}
              </div>
              <div>
                <strong>Phone Number:</strong> {viewVictim.phone_number}
              </div>
              <div>
                <strong>NIN:</strong> {viewVictim.nin}
              </div>
              <div>
                <strong>Nationality:</strong> {viewVictim.nationality}
              </div>
              <div>
                <strong>Address:</strong> {viewVictim.address}
              </div>
              <div>
                <strong>Created By:</strong> {viewVictim.created_by}
              </div>
              <div>
                <strong>Updated By:</strong> {viewVictim.updated_by}
              </div>
              <div>
                <strong>Case IDs:</strong>{' '}
                {Array.isArray(viewVictim.case_ids)
                  ? viewVictim.case_ids.join(', ')
                  : viewVictim.case_ids}
              </div>
              <div>
                <strong>Status:</strong> {viewVictim.status || ''}
              </div>
              {/* Examinations for this victim */}
              <div className="mt-4">
                <strong>Examinations:</strong>
                <ul className="list-disc ml-4">
                  <ExaminationsList victimId={viewVictim.ID} />
                </ul>
              </div>
            </div>
          )}
          <DialogFooter className="mt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Victim Dialog */}
      <Dialog
        open={!!editVictim}
        onOpenChange={() => {
          setEditVictim(null);
          setEditForm(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Victim</DialogTitle>
          </DialogHeader>
          {editForm && (
            <form onSubmit={handleEditVictim} className="space-y-2">
              <Input
                name="first_name"
                placeholder="First Name"
                value={editForm.first_name}
                onChange={handleEditFormChange}
                required
              />
              <Input
                name="last_name"
                placeholder="Last Name"
                value={editForm.last_name}
                onChange={handleEditFormChange}
                required
              />
              <Input
                name="gender"
                placeholder="Gender"
                value={editForm.gender}
                onChange={handleEditFormChange}
                required
              />
              <Input
                name="dob"
                type="date"
                placeholder="Date of Birth"
                value={editForm.dob}
                onChange={handleEditFormChange}
                required
              />
              <Input
                name="phone_number"
                placeholder="Phone Number"
                value={editForm.phone_number}
                onChange={handleEditFormChange}
                required
              />
              <Input
                name="nin"
                placeholder="NIN"
                value={editForm.nin}
                onChange={handleEditFormChange}
                required
              />
              <Input
                name="nationality"
                placeholder="Nationality"
                value={editForm.nationality}
                onChange={handleEditFormChange}
                required
              />
              <Input
                name="address"
                placeholder="Address"
                value={editForm.address}
                onChange={handleEditFormChange}
                required
              />
              <Input
                name="created_by"
                placeholder="Created By"
                value={editForm.created_by}
                onChange={handleEditFormChange}
                required
              />
              <Input
                name="updated_by"
                placeholder="Updated By"
                value={editForm.updated_by}
                onChange={handleEditFormChange}
                required
              />
              <Input
                name="case_ids"
                placeholder="Case IDs (comma separated)"
                value={
                  Array.isArray(editForm.case_ids)
                    ? editForm.case_ids.join(',')
                    : editForm.case_ids
                }
                onChange={(e) =>
                  setEditForm((f: any) => ({ ...f, case_ids: e.target.value }))
                }
              />
              <DialogFooter className="mt-2">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditVictim(null);
                      setEditForm(null);
                    }}
                    disabled={editLoading}
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={editLoading}>
                  {editLoading ? 'Saving...' : 'Save'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteVictim} onOpenChange={() => setDeleteVictim(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Victim</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this victim?</div>
          <DialogFooter className="mt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={deleteLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteVictim}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Examination Dialog */}
      <Dialog
        open={examinationDialogOpen}
        onOpenChange={setExaminationDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Examinations for {examinationVictim?.first_name}{' '}
              {examinationVictim?.last_name}
            </DialogTitle>
          </DialogHeader>
          {/* List of examinations */}
          <div className="mb-2">
            {examinations.length === 0 && (
              <div className="text-muted-foreground">
                No examinations found.
              </div>
            )}
            {examinations.length > 0 && (
              <table className="w-full text-sm border">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Findings</th>
                    <th>Practitioner</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {examinations.map((exam: any) => (
                    <tr key={exam.ID} className="border-t">
                      <td>
                        {exam.exam_date
                          ? new Date(exam.exam_date).toLocaleDateString()
                          : ''}
                      </td>
                      <td>{exam.findings}</td>
                      <td>{exam.practitioner_id}</td>
                      <td>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setExaminationForm(exam);
                            setExaminationEditId(exam.ID);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="ml-2"
                          onClick={() => handleDeleteExamination(exam.ID)}
                          disabled={examinationLoading}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {/* Add/Edit Examination Form */}
          <div className="border-t pt-2 mt-2">
            <Button
              size="sm"
              onClick={() => {
                setExaminationForm({
                  case_id: '',
                  consent_given: false,
                  exam_date: '',
                  facility_id: '',
                  findings: '',
                  practitioner_id: '',
                  referral: '',
                  treatment: '',
                });
                setExaminationEditId(null);
              }}
            >
              Add Examination
            </Button>
            {examinationForm && (
              <form
                onSubmit={handleExaminationSubmit}
                className="space-y-2 mt-2"
              >
                <Input
                  name="case_id"
                  placeholder="Case ID"
                  value={examinationForm.case_id}
                  onChange={handleExaminationFormChange}
                  required
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="consent_given"
                    checked={!!examinationForm.consent_given}
                    onChange={handleExaminationFormChange}
                  />{' '}
                  Consent Given
                </label>
                <Input
                  name="exam_date"
                  type="date"
                  placeholder="Exam Date"
                  value={examinationForm.exam_date}
                  onChange={handleExaminationFormChange}
                  required
                />
                {/* Facility dropdown */}
                <div>
                  <label
                    htmlFor="facility_id"
                    className="block text-sm font-medium"
                  >
                    Facility
                  </label>
                  <select
                    id="facility_id"
                    name="facility_id"
                    value={examinationForm.facility_id}
                    onChange={handleExaminationFormChange}
                    required
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value="">Select facility</option>
                    {facilities.map((f: any) => (
                      <option key={f.id ?? f.ID} value={f.id ?? f.ID}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  name="findings"
                  placeholder="Findings"
                  value={examinationForm.findings}
                  onChange={handleExaminationFormChange}
                  required
                />
                <Input
                  name="practitioner_id"
                  placeholder="Practitioner ID"
                  value={examinationForm.practitioner_id}
                  onChange={handleExaminationFormChange}
                  required
                />
                <Input
                  name="referral"
                  placeholder="Referral"
                  value={examinationForm.referral}
                  onChange={handleExaminationFormChange}
                />
                <Input
                  name="treatment"
                  placeholder="Treatment"
                  value={examinationForm.treatment}
                  onChange={handleExaminationFormChange}
                />
                <DialogFooter>
                  <Button type="submit" disabled={examinationLoading}>
                    {examinationEditId ? 'Update' : 'Create'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setExaminationForm(null);
                      setExaminationEditId(null);
                    }}
                    disabled={examinationLoading}
                  >
                    Cancel
                  </Button>
                </DialogFooter>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper component to show examinations in victim details
function ExaminationsList({ victimId }: { victimId: number }) {
  const { data } = useSWRImmutable(
    `/examinations/search?victim_id=${victimId}`,
    fetcher
  );
  const examinations = data?.data || [];
  if (!examinations.length)
    return <li className="text-muted-foreground">No examinations found.</li>;
  return (
    <>
      {examinations.map((exam: any) => (
        <li key={exam.ID}>
          {exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : ''}{' '}
          - {exam.findings}
        </li>
      ))}
    </>
  );
}
