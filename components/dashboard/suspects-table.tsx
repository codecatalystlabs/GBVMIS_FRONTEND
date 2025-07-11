'use client';

import { useState } from 'react';
import { MoreHorizontal, ChevronDown, Search, ArrowUpDown } from 'lucide-react';
import useSWR from 'swr';

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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { apiClient, fetcher } from '@/lib/api';
import { toast } from 'react-toastify';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

// Default avatar SVG with updated colors
const DefaultAvatar = () => (
  <svg viewBox="0 0 128 128" className="w-32 h-32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="64" cy="64" r="64" fill="#E5E7EB" />
    <ellipse cx="64" cy="54" rx="28" ry="28" fill="#E5E7EB" />
    <ellipse cx="64" cy="104" rx="44" ry="24" fill="#E5E7EB" />
  </svg>
);

// Inline CSS to ensure scrollbar hiding (move to global CSS in production)
const customStyles = `
  .hide-scrollbar {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
    overflow: auto; /* Ensure scrollability */
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none; /* Chrome, Safari, and WebKit-based browsers */
  }
`;

export function SuspectsTable() {
  const { data, error, isLoading, mutate } = useSWR('/suspects', fetcher);
  const suspects = data?.data || [];
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSuspect, setEditingSuspect] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSuspect, setDeletingSuspect] = useState<any | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingSuspect, setViewingSuspect] = useState<any | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const toggleSelectAll = () => {
    if (selectedAccounts.length === suspects.length) {
      setSelectedAccounts([]);
    } else {
      setSelectedAccounts(suspects.map((suspect: any) => suspect.ID.toString()));
    }
  };

  const toggleSelectAccount = (id: string) => {
    if (selectedAccounts.includes(id)) {
      setSelectedAccounts(selectedAccounts.filter((accountId) => accountId !== id));
    } else {
      setSelectedAccounts([...selectedAccounts, id]);
    }
  };

  const getTypeColor = (type: string) => {
    return 'bg-blue-600 text-white';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8 bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-800"></div>
      </div>
    );
  }
  if (error) {
    return <div className="text-red-500 text-center py-8 bg-gray-100">Failed to load suspects.</div>;
  }

  const handleSaveSuspect = async (e: any) => {
    e.preventDefault();
    setFormLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await apiClient.postFormData('/suspect', formData);
      toast.success('Suspect added successfully!');
      setAddDialogOpen(false);
      mutate();
    } catch (err: any) {
      toast.error(err?.info?.message || err?.message || 'Failed to add suspect');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClick = (suspect: any) => {
    setEditingSuspect(suspect);
    setEditDialogOpen(true);
  };

  const handleEditSuspect = async (e: any) => {
    e.preventDefault();
    setFormLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await apiClient.putFormData(`/suspect/${editingSuspect.ID}`, formData);
      toast.success('Suspect updated successfully!');
      setEditDialogOpen(false);
      setEditingSuspect(null);
      mutate();
    } catch (err: any) {
      toast.error(err?.info?.message || err?.message || 'Failed to update suspect');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = (suspect: any) => {
    setDeletingSuspect(suspect);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuspect = async () => {
    if (!deletingSuspect) return;
    setFormLoading(true);
    try {
      await apiClient.delete(`/suspect/${deletingSuspect.ID}`);
      toast.success('Suspect deleted successfully!');
      setDeleteDialogOpen(false);
      setDeletingSuspect(null);
      mutate();
    } catch (err: any) {
      toast.error(err?.info?.message || err?.message || 'Failed to delete suspect');
    } finally {
      setFormLoading(false);
    }
  };

  const handleViewClick = async (suspect: any) => {
    setViewingSuspect(null);
    setViewDialogOpen(true);
    setViewLoading(true);
    try {
      const res = await fetcher(`/suspect/${suspect.ID}`);
      setViewingSuspect(res.data || res);
    } catch (err) {
      setViewingSuspect(suspect); // Fallback to passed data
    } finally {
      setViewLoading(false);
    }
  };

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
                placeholder="Search suspects..."
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
                <DropdownMenuItem className="hover:bg-gray-200 text-blue-900">Gender</DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-200 text-blue-900">Status</DropdownMenuItem>
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
              onClick={() => setAddDialogOpen(true)}
              className="bg-blue-800 hover:bg-blue-900 text-white transition-all duration-300"
            >
              Add Suspect
            </Button>
          </div>
        </div>
        <div className="rounded-xl border border-blue-200 bg-white shadow-lg hide-scrollbar overflow-auto max-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-blue-200 hover:bg-gray-200">
                <TableHead className="w-[40px] text-blue-900">
                  <Checkbox
                    checked={selectedAccounts.length === suspects.length && suspects.length > 0}
                    onCheckedChange={toggleSelectAll}
                    className="border-blue-200 text-blue-600"
                  />
                </TableHead>
                <TableHead className="w-[100px] text-blue-900">ID</TableHead>
                <TableHead className="text-blue-900">First Name</TableHead>
                <TableHead className="text-blue-900">Middle Name</TableHead>
                <TableHead className="text-blue-900">Last Name</TableHead>
                <TableHead className="text-blue-900">Gender</TableHead>
                <TableHead className="text-blue-900">Date of Birth</TableHead>
                <TableHead className="text-blue-900">Phone Number</TableHead>
                <TableHead className="text-blue-900">NIN</TableHead>
                <TableHead className="text-blue-900">Nationality</TableHead>
                <TableHead className="text-blue-900">Address</TableHead>
                <TableHead className="text-blue-900">Occupation</TableHead>
                <TableHead className="text-blue-900">Status</TableHead>
                <TableHead className="text-blue-900">Created By</TableHead>
                <TableHead className="w-[40px] text-blue-900"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suspects.map((suspect: any) => (
                <TableRow key={suspect.ID} className="border-t border-blue-200 hover:bg-gray-200 transition-all duration-200">
                  <TableCell>
                    <Checkbox
                      checked={selectedAccounts.includes(suspect.ID.toString())}
                      onCheckedChange={() => toggleSelectAccount(suspect.ID.toString())}
                      className="border-blue-200 text-blue-600"
                    />
                  </TableCell>
                  <TableCell className="font-medium text-blue-900">{suspect.ID}</TableCell>
                  <TableCell className="text-blue-900">{suspect.first_name}</TableCell>
                  <TableCell className="text-blue-900">{suspect.middle_name}</TableCell>
                  <TableCell className="text-blue-900">{suspect.last_name}</TableCell>
                  <TableCell className="text-blue-900">{suspect.gender}</TableCell>
                  <TableCell className="text-blue-900">{suspect.dob}</TableCell>
                  <TableCell className="text-blue-900">{suspect.phone_number}</TableCell>
                  <TableCell className="text-blue-900">{suspect.nin}</TableCell>
                  <TableCell className="text-blue-900">{suspect.nationality}</TableCell>
                  <TableCell className="text-blue-900">{suspect.address}</TableCell>
                  <TableCell className="text-blue-900">{suspect.occupation}</TableCell>
                  <TableCell className="text-blue-900">
                    <Badge className={getTypeColor(suspect.status)}>{suspect.status}</Badge>
                  </TableCell>
                  <TableCell className="text-blue-900">{suspect.created_by}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-blue-900 hover:bg-gray-200">
                          <MoreHorizontal className="h-4 w-4 text-blue-900" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white border-blue-200 text-blue-900">
                        <DropdownMenuItem onClick={() => handleViewClick(suspect)} className="hover:bg-gray-200 text-blue-900">
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClick(suspect)} className="hover:bg-gray-200 text-blue-900">
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-blue-200" />
                        <DropdownMenuItem className="text-red-500 hover:bg-red-100" onClick={() => handleDeleteClick(suspect)}>
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
            Showing <strong>1</strong> to <strong>{suspects.length}</strong> of <strong>{suspects.length}</strong> results
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
              <DialogTitle className="text-blue-900">Add Police Suspect</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveSuspect} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  name="first_name"
                  placeholder="First Name"
                  required
                  className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
                <Input
                  name="middle_name"
                  placeholder="Middle Name"
                  required
                  className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
                <Input
                  name="last_name"
                  placeholder="Last Name"
                  required
                  className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
                <Input
                  name="dob"
                  type="date"
                  required
                  className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
                <select
                  name="gender"
                  required
                  className="w-full border border-blue-200 rounded-lg px-3 py-2 bg-white text-blue-900 focus:ring-2 focus:ring-blue-600"
                >
                  <option value="" className="text-blue-400">Select Gender</option>
                  <option value="male" className="text-blue-900">Male</option>
                  <option value="female" className="text-blue-900">Female</option>
                </select>
                <Input
                  name="phone_number"
                  placeholder="Phone Number"
                  required
                  className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
                <Input
                  name="nin"
                  placeholder="NIN"
                  required
                  className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
                <Input
                  name="nationality"
                  placeholder="Nationality"
                  required
                  className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
                <Input
                  name="address"
                  placeholder="Address"
                  required
                  className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
                <Input
                  name="occupation"
                  placeholder="Occupation"
                  required
                  className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
                <Input
                  name="status"
                  placeholder="Status"
                  required
                  className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
                <Input
                  name="created_by"
                  placeholder="Created By"
                  required
                  className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <Label className="text-blue-900">Photo</Label>
                <Input
                  name="photo"
                  type="file"
                  accept="image/*"
                  required
                  className="bg-white border-blue-200 text-blue-900"
                />
              </div>
              <div>
                <Label className="text-blue-900">Fingerprints (PDF)</Label>
                <Input
                  name="fingerprints"
                  type="file"
                  accept="application/pdf"
                  required
                  className="bg-white border-blue-200 text-blue-900"
                />
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
                  {formLoading ? 'Saving...' : 'Save'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="bg-white border-blue-200 text-blue-900 hide-scrollbar max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-blue-900">Edit Police Suspect</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSuspect} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  name="first_name"
                  placeholder="First Name"
                  defaultValue={editingSuspect?.first_name}
                  required
                  className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
                <Input
                  name="middle_name"
                  placeholder="Middle Name"
                  defaultValue={editingSuspect?.middle_name}
                  required
                  className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
                <Input
                  name="last_name"
                  placeholder="Last Name"
                  defaultValue={editingSuspect?.last_name}
                  required
                  className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
                <Input
                  name="dob"
                  type="date"
                  defaultValue={editingSuspect?.dob}
                  required
                  className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
                <select
                  name="gender"
                  required
                  defaultValue={editingSuspect?.gender}
                  className="w-full border border-blue-200 rounded-lg px-3 py-2 bg-white text-blue-900 focus:ring-2 focus:ring-blue-600"
                >
                  <option value="" className="text-blue-400">Select Gender</option>
                  <option value="male" className="text-blue-900">Male</option>
                  <option value="female" className="text-blue-900">Female</option>
                </select>
                <Input
                  name="phone_number"
                  placeholder="Phone Number"
                  defaultValue={editingSuspect?.phone_number}
                  required
                  className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
                <Input
                  name="nin"
                  placeholder="NIN"
                  defaultValue={editingSuspect?.nin}
                  required
                  className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
                <Input
                  name="nationality"
                  placeholder="Nationality"
                  defaultValue={editingSuspect?.nationality}
                  required
                  className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
                <Input
                  name="address"
                  placeholder="Address"
                  defaultValue={editingSuspect?.address}
                  required
                  className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
                <Input
                  name="occupation"
                  placeholder="Occupation"
                  defaultValue={editingSuspect?.occupation}
                  required
                  className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
                <Input
                  name="status"
                  placeholder="Status"
                  defaultValue={editingSuspect?.status}
                  required
                  className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
                <Input
                  name="updated_by"
                  placeholder="Updated By"
                  defaultValue={editingSuspect?.created_by}
                  required
                  className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <Label className="text-blue-900">Photo</Label>
                <Input
                  name="photo"
                  type="file"
                  accept="image/*"
                  className="bg-white border-blue-200 text-blue-900"
                />
              </div>
              <div>
                <Label className="text-blue-900">Fingerprints (PDF)</Label>
                <Input
                  name="fingerprints"
                  type="file"
                  accept="application/pdf"
                  className="bg-white border-blue-200 text-blue-900"
                />
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
                  {formLoading ? 'Saving...' : 'Save'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-white border-blue-200 text-blue-900 hide-scrollbar max-h-[80vh] overflow-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-blue-900">Delete Suspect</AlertDialogTitle>
              <AlertDialogDescription className="text-blue-900">
                Are you sure you want to delete this suspect? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setDeletingSuspect(null);
                }}
                disabled={formLoading}
                className="bg-white border-blue-200 text-blue-900 hover:bg-gray-200"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteSuspect}
                disabled={formLoading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {formLoading ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-lg bg-white border-blue-200 text-blue-900 hide-scrollbar max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-blue-900">Suspect Profile</DialogTitle>
            </DialogHeader>
            {viewLoading ? (
              <div className="py-8 text-center text-blue-900">Loading...</div>
            ) : viewingSuspect ? (
              <div className="flex flex-col items-center gap-4 py-4">
                {viewingSuspect.photo ? (
                  <img
                    src={typeof viewingSuspect.photo === 'string' ? viewingSuspect.photo : ''}
                    alt="Suspect Photo"
                    className="w-32 h-32 rounded-full object-cover border border-blue-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                    <DefaultAvatar />
                  </div>
                )}
                <div className="text-xl font-bold text-blue-900">
                  {viewingSuspect.first_name} {viewingSuspect.middle_name} {viewingSuspect.last_name}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 w-full mt-2">
                  <div><span className="font-semibold text-blue-900">Gender:</span> {viewingSuspect.gender}</div>
                  <div><span className="font-semibold text-blue-900">DOB:</span> {viewingSuspect.dob}</div>
                  <div><span className="font-semibold text-blue-900">Phone:</span> {viewingSuspect.phone_number}</div>
                  <div><span className="font-semibold text-blue-900">NIN:</span> {viewingSuspect.nin}</div>
                  <div><span className="font-semibold text-blue-900">Nationality:</span> {viewingSuspect.nationality}</div>
                  <div><span className="font-semibold text-blue-900">Address:</span> {viewingSuspect.address}</div>
                  <div><span className="font-semibold text-blue-900">Occupation:</span> {viewingSuspect.occupation}</div>
                  <div><span className="font-semibold text-blue-900">Status:</span> {viewingSuspect.status}</div>
                  <div><span className="font-semibold text-blue-900">Created By:</span> {viewingSuspect.created_by}</div>
                  <div><span className="font-semibold text-blue-900">Updated By:</span> {viewingSuspect.updated_by}</div>
                </div>
                {viewingSuspect.fingerprints && (
                  <div className="mt-4">
                    <a
                      href={typeof viewingSuspect.fingerprints === 'string' ? viewingSuspect.fingerprints : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Fingerprints (PDF)
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-red-500">Failed to load suspect details.</div>
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