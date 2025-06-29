'use client';

import { useState } from 'react';
import useSWR from 'swr';

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
                      <DropdownMenuItem>View</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
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
    </div>
  );
}
