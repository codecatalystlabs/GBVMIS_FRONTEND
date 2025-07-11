// components/dashboard/VictimsTable.tsx
"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import useSWRImmutable from "swr/immutable";
import {
  MoreHorizontal,
  ChevronDown,
  Search,
  ArrowUpDown,
  Plus,
} from "lucide-react";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { fetcher, apiClient } from "@/lib/api";

export function VictimsTable() {
  const [selectedVictims, setSelectedVictims] = useState<string[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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
    address: "",
    case_ids: [],
    created_by: "",
    dob: "",
    first_name: "",
    gender: "",
    last_name: "",
    nationality: "",
    nin: "",
    phone_number: "",
    updated_by: "",
  });

  const { data, error, isLoading, mutate } = useSWR(
    `/victims?page=${page}&pageSize=${pageSize}`,
    fetcher,
    {
      onError: (err) => setErrorMessage("Failed to load victims. Please try again."),
    }
  );
  const victims = data?.data || [];
  const totalVictims = data?.total || victims.length;

  const [viewVictim, setViewVictim] = useState<any | null>(null);
  const [editVictim, setEditVictim] = useState<any | null>(null);
  const [deleteVictim, setDeleteVictim] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [examinationVictim, setExaminationVictim] = useState<any | null>(null);
  const [examinationDialogOpen, setExaminationDialogOpen] = useState(false);
  const [examinationForm, setExaminationForm] = useState<any | null>(null);
  const [examinationEditId, setExaminationEditId] = useState<number | null>(null);
  const [examinationLoading, setExaminationLoading] = useState(false);

  const { data: examinationsData, mutate: mutateExaminations } = useSWRImmutable(
    examinationVictim ? `/examinations/search?victim_id=${examinationVictim.ID}` : null,
    fetcher
  );
  const examinations = examinationsData?.data || [];

  const { data: facilitiesData } = useSWR("/health-facilities", fetcher);
  const facilities = facilitiesData?.data || [];

  const { data: practitionersData } = useSWR("/health-practitioners", fetcher);
  const practitioners = practitionersData?.data || [];

  const { data: casesData } = useSWR("/cases", fetcher);
  const cases = casesData?.data || [];

  const toggleSelectAll = () => {
    if (selectedVictims.length === victims.length) {
      setSelectedVictims([]);
    } else {
      setSelectedVictims(victims.map((victim: { ID: number }) => victim.ID.toString()));
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
    setErrorMessage(null);
    try {
      await apiClient.post("/victim", victimForm);
      setAddDialogOpen(false);
      setVictimForm({
        address: "",
        case_ids: [],
        created_by: "",
        dob: "",
        first_name: "",
        gender: "",
        last_name: "",
        nationality: "",
        nin: "",
        phone_number: "",
        updated_by: "",
      });
      mutate();
    } catch (err: any) {
      setErrorMessage("Failed to add victim. Please check your input.");
    }
    setFormLoading(false);
  };

  const handleVictimFormChange = (e: any) => {
    const { name, value } = e.target;
    setVictimForm((prev) => ({ ...prev, [name]: value }));
  };

  const openEditDialog = (victim: any) => {
    setEditVictim(victim);
    setEditForm({
      ...victim,
      case_ids: Array.isArray(victim.case_ids)
        ? victim.case_ids
        : victim.case_ids
        ? victim.case_ids.split(",").map((v: any) => Number(v.trim()))
        : [],
    });
  };

  const handleEditFormChange = (e: any) => {
    const { name, value } = e.target;
    setEditForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleEditVictim = async (e: any) => {
    e.preventDefault();
    setEditLoading(true);
    setErrorMessage(null);
    try {
      await apiClient.put(`/victim/${editVictim.ID}`, {
        ...editForm,
        case_ids:
          typeof editForm.case_ids === "string"
            ? editForm.case_ids
                .split(",")
                .map((v: any) => Number(v.trim()))
                .filter(Boolean)
            : editForm.case_ids,
      });
      setEditVictim(null);
      setEditForm(null);
      mutate();
    } catch (err) {
      setErrorMessage("Failed to update victim. Please try again.");
    }
    setEditLoading(false);
  };

  const handleDeleteVictim = async () => {
    if (!deleteVictim) return;
    setDeleteLoading(true);
    setErrorMessage(null);
    try {
      await apiClient.delete(`/victim/${deleteVictim.ID}`);
      setDeleteVictim(null);
      mutate();
    } catch (err) {
      setErrorMessage("Failed to delete victim. Please try again.");
    }
    setDeleteLoading(false);
  };

  const openExaminationDialog = (victim: any) => {
    setExaminationVictim(victim);
    setExaminationDialogOpen(true);
    setExaminationForm(null);
    setExaminationEditId(null);
  };

  const handleExaminationFormChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setExaminationForm((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleExaminationSubmit = async (e: any) => {
    e.preventDefault();
    setExaminationLoading(true);
    setErrorMessage(null);
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
        await apiClient.post("/examination", payload);
      }
      setExaminationForm(null);
      setExaminationEditId(null);
      mutateExaminations();
    } catch (err) {
      setErrorMessage("Failed to save examination. Please try again.");
    }
    setExaminationLoading(false);
  };

  const handleDeleteExamination = async (id: number) => {
    setExaminationLoading(true);
    setErrorMessage(null);
    try {
      await apiClient.delete(`/examination/${id}`);
      mutateExaminations();
    } catch (err) {
      setErrorMessage("Failed to delete examination. Please try again.");
    }
    setExaminationLoading(false);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedVictims = useMemo(() => {
    if (!sortField) return victims;
    return [...victims].sort((a, b) => {
      const aValue = a[sortField] || "";
      const bValue = b[sortField] || "";
      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [victims, sortField, sortOrder]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8 bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-800"></div>
      </div>
    );
  }
  if (error) {
    return <div className="text-red-500 text-center py-8 bg-gray-100">Failed to load victims.</div>;
  }

  return (
    <div className="space-y-6 p-6 bg-gray-100 min-h-screen">
      {errorMessage && (
        <div className="text-red-500 bg-red-100/50 p-3 rounded-lg text-center">
          {errorMessage}
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-900" />
            <Input
              type="search"
              placeholder="Search victims..."
              className="w-full pl-10 sm:w-[300px] bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 transition-all duration-300"
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
              setPageSize(Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 w-[70px] bg-white border-blue-200 text-blue-900 focus:ring-2 focus:ring-blue-600">
              <SelectValue placeholder="10" />
            </SelectTrigger>
            <SelectContent className="bg-white border-blue-200 text-blue-900">
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
            <Plus className="mr-2 h-4 w-4" /> Add Victim
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-blue-200 bg-white shadow-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-blue-200 hover:bg-gray-200">
              <TableHead className="w-[40px] text-blue-900">
                <Checkbox
                  checked={selectedVictims.length === victims.length && victims.length > 0}
                  onCheckedChange={toggleSelectAll}
                  className="border-blue-200 text-blue-600"
                />
              </TableHead>
              <TableHead className="text-blue-900">
                <button onClick={() => handleSort("ID")} className="flex items-center gap-1">
                  ID
                  {sortField === "ID" && <ArrowUpDown className="h-4 w-4 text-blue-900" />}
                </button>
              </TableHead>
              <TableHead className="text-blue-900">
                <button onClick={() => handleSort("first_name")} className="flex items-center gap-1">
                  First Name
                  {sortField === "first_name" && <ArrowUpDown className="h-4 w-4 text-blue-900" />}
                </button>
              </TableHead>
              <TableHead className="text-blue-900">
                <button onClick={() => handleSort("last_name")} className="flex items-center gap-1">
                  Last Name
                  {sortField === "last_name" && <ArrowUpDown className="h-4 w-4 text-blue-900" />}
                </button>
              </TableHead>
              <TableHead className="text-blue-900">
                <button onClick={() => handleSort("gender")} className="flex items-center gap-1">
                  Gender
                  {sortField === "gender" && <ArrowUpDown className="h-4 w-4 text-blue-900" />}
                </button>
              </TableHead>
              <TableHead className="text-blue-900">
                <button onClick={() => handleSort("dob")} className="flex items-center gap-1">
                  Date of Birth
                  {sortField === "dob" && <ArrowUpDown className="h-4 w-4 text-blue-900" />}
                </button>
              </TableHead>
              <TableHead className="text-blue-900">
                <button onClick={() => handleSort("status")} className="flex items-center gap-1">
                  Status
                  {sortField === "status" && <ArrowUpDown className="h-4 w-4 text-blue-900" />}
                </button>
              </TableHead>
              <TableHead className="text-blue-900">
                <button onClick={() => handleSort("created_by")} className="flex items-center gap-1">
                  Officer
                  {sortField === "created_by" && <ArrowUpDown className="h-4 w-4 text-blue-900" />}
                </button>
              </TableHead>
              <TableHead className="w-[40px] text-blue-900"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedVictims.map((victim: any) => (
              <TableRow
                key={victim.ID} // Ensure ID is used and unique
                className="border-t border-blue-200 hover:bg-gray-200 transition-all duration-200"
              >
                <TableCell>
                  <Checkbox
                    checked={selectedVictims.includes(victim.ID.toString())}
                    onCheckedChange={() => toggleSelectVictim(victim.ID.toString())}
                    className="border-blue-200 text-blue-600"
                  />
                </TableCell>
                <TableCell className="font-medium text-blue-900">{victim.ID}</TableCell>
                <TableCell className="text-blue-900">{victim.first_name}</TableCell>
                <TableCell className="text-blue-900">{victim.last_name}</TableCell>
                <TableCell className="text-blue-900">{victim.gender}</TableCell>
                <TableCell className="text-blue-900">
                  {victim.dob ? new Date(victim.dob).toLocaleDateString() : ""}
                </TableCell>
                <TableCell className="text-blue-900">{victim.status || ""}</TableCell>
                <TableCell className="text-blue-900">{victim.created_by}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-blue-900 hover:bg-gray-200">
                        <MoreHorizontal className="h-4 w-4 text-blue-900" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border-blue-200 text-blue-900">
                      <DropdownMenuItem
                        onClick={() => setViewVictim(victim)}
                        className="hover:bg-gray-200 text-blue-900"
                      >
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openEditDialog(victim)}
                        className="hover:bg-gray-200 text-blue-900"
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openExaminationDialog(victim)}
                        className="hover:bg-gray-200 text-blue-900"
                      >
                        Examination
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-blue-200" />
                      <DropdownMenuItem
                        className="text-red-500 hover:bg-red-100"
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

      <div className="flex items-center justify-between text-blue-900">
        <div className="text-sm">
          Showing <strong>{(page - 1) * pageSize + 1}</strong> to{" "}
          <strong>{Math.min(page * pageSize, totalVictims)}</strong> of{" "}
          <strong>{totalVictims}</strong> results
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="bg-white border-blue-200 text-blue-900 hover:bg-gray-200"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page * pageSize >= totalVictims}
            onClick={() => setPage(page + 1)}
            className="bg-white border-blue-200 text-blue-900 hover:bg-gray-200"
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={!!viewVictim} onOpenChange={() => setViewVictim(null)}>
        <DialogContent className="bg-white border-blue-200 text-blue-900">
          <DialogHeader>
            <DialogTitle className="text-blue-900">Victim Details</DialogTitle>
          </DialogHeader>
          {viewVictim && (
            <div className="space-y-2">
              <div>
                <strong className="text-blue-900">ID:</strong> {viewVictim.ID}
              </div>
              <div>
                <strong className="text-blue-900">First Name:</strong> {viewVictim.first_name}
              </div>
              <div>
                <strong className="text-blue-900">Last Name:</strong> {viewVictim.last_name}
              </div>
              <div>
                <strong className="text-blue-900">Gender:</strong> {viewVictim.gender}
              </div>
              <div>
                <strong className="text-blue-900">Date of Birth:</strong>{" "}
                {viewVictim.dob ? new Date(viewVictim.dob).toLocaleDateString() : ""}
              </div>
              <div>
                <strong className="text-blue-900">Phone Number:</strong> {viewVictim.phone_number}
              </div>
              <div>
                <strong className="text-blue-900">NIN:</strong> {viewVictim.nin}
              </div>
              <div>
                <strong className="text-blue-900">Nationality:</strong> {viewVictim.nationality}
              </div>
              <div>
                <strong className="text-blue-900">Address:</strong> {viewVictim.address}
              </div>
              <div>
                <strong className="text-blue-900">Created By:</strong> {viewVictim.created_by}
              </div>
              <div>
                <strong className="text-blue-900">Updated By:</strong> {viewVictim.updated_by}
              </div>
              <div>
                <strong className="text-blue-900">Case IDs:</strong>{" "}
                {Array.isArray(viewVictim.case_ids)
                  ? viewVictim.case_ids.join(", ")
                  : viewVictim.case_ids}
              </div>
              <div>
                <strong className="text-blue-900">Status:</strong> {viewVictim.status || ""}
              </div>
              <div className="mt-4">
                <strong className="text-blue-900">Examinations:</strong>
                <ul className="list-disc ml-4">
                  <ExaminationsList victimId={viewVictim.ID} />
                </ul>
              </div>
            </div>
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

      <Dialog
        open={addDialogOpen}
        onOpenChange={() => {
          setAddDialogOpen(false);
          setVictimForm({
            address: "",
            case_ids: [],
            created_by: "",
            dob: "",
            first_name: "",
            gender: "",
            last_name: "",
            nationality: "",
            nin: "",
            phone_number: "",
            updated_by: "",
          });
        }}
      >
        <DialogContent className="bg-white border-blue-200 text-blue-900">
          <DialogHeader>
            <DialogTitle className="text-blue-900">Add Victim</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddVictim} className="space-y-4">
            <Input
              name="first_name"
              placeholder="First Name"
              value={victimForm.first_name}
              onChange={handleVictimFormChange}
              required
              className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
            />
            <Input
              name="last_name"
              placeholder="Last Name"
              value={victimForm.last_name}
              onChange={handleVictimFormChange}
              required
              className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
            />
            <Input
              name="gender"
              placeholder="Gender"
              value={victimForm.gender}
              onChange={handleVictimFormChange}
              required
              className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
            />
            <Input
              name="dob"
              type="date"
              placeholder="Date of Birth"
              value={victimForm.dob}
              onChange={handleVictimFormChange}
              required
              className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
            />
            <Input
              name="phone_number"
              placeholder="Phone Number"
              value={victimForm.phone_number}
              onChange={handleVictimFormChange}
              required
              className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
            />
            <Input
              name="nin"
              placeholder="NIN"
              value={victimForm.nin}
              onChange={handleVictimFormChange}
              required
              className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
            />
            <Input
              name="nationality"
              placeholder="Nationality"
              value={victimForm.nationality}
              onChange={handleVictimFormChange}
              required
              className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
            />
            <Input
              name="address"
              placeholder="Address"
              value={victimForm.address}
              onChange={handleVictimFormChange}
              required
              className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
            />
            <Input
              name="created_by"
              placeholder="Created By"
              value={victimForm.created_by}
              onChange={handleVictimFormChange}
              required
              className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
            />
            <Input
              name="updated_by"
              placeholder="Updated By"
              value={victimForm.updated_by}
              onChange={handleVictimFormChange}
              required
              className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
            />
            <Input
              name="case_ids"
              placeholder="Case IDs (comma separated)"
              value={
                Array.isArray(victimForm.case_ids)
                  ? victimForm.case_ids.join(",")
                  : victimForm.case_ids
              }
              onChange={(e) =>
                setVictimForm((f: any) => ({ ...f, case_ids: e.target.value }))
              }
              className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
            />
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
                {formLoading ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editVictim}
        onOpenChange={() => {
          setEditVictim(null);
          setEditForm(null);
        }}
      >
        <DialogContent className="bg-white border-blue-200 text-blue-900">
          <DialogHeader>
            <DialogTitle className="text-blue-900">Edit Victim</DialogTitle>
          </DialogHeader>
          {editForm && (
            <form onSubmit={handleEditVictim} className="space-y-4">
              <Input
                name="first_name"
                placeholder="First Name"
                value={editForm.first_name}
                onChange={handleEditFormChange}
                required
                className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
              />
              <Input
                name="last_name"
                placeholder="Last Name"
                value={editForm.last_name}
                onChange={handleEditFormChange}
                required
                className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
              />
              <Input
                name="gender"
                placeholder="Gender"
                value={editForm.gender}
                onChange={handleEditFormChange}
                required
                className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
              />
              <Input
                name="dob"
                type="date"
                placeholder="Date of Birth"
                value={editForm.dob}
                onChange={handleEditFormChange}
                required
                className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
              />
              <Input
                name="phone_number"
                placeholder="Phone Number"
                value={editForm.phone_number}
                onChange={handleEditFormChange}
                required
                className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
              />
              <Input
                name="nin"
                placeholder="NIN"
                value={editForm.nin}
                onChange={handleEditFormChange}
                required
                className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
              />
              <Input
                name="nationality"
                placeholder="Nationality"
                value={editForm.nationality}
                onChange={handleEditFormChange}
                required
                className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
              />
              <Input
                name="address"
                placeholder="Address"
                value={editForm.address}
                onChange={handleEditFormChange}
                required
                className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
              />
              <Input
                name="created_by"
                placeholder="Created By"
                value={editForm.created_by}
                onChange={handleEditFormChange}
                required
                className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
              />
              <Input
                name="updated_by"
                placeholder="Updated By"
                value={editForm.updated_by}
                onChange={handleEditFormChange}
                required
                className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
              />
              <Input
                name="case_ids"
                placeholder="Case IDs (comma separated)"
                value={
                  Array.isArray(editForm.case_ids)
                    ? editForm.case_ids.join(",")
                    : editForm.case_ids
                }
                onChange={(e) =>
                  setEditForm((f: any) => ({ ...f, case_ids: e.target.value }))
                }
                className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
              />
              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditVictim(null);
                      setEditForm(null);
                    }}
                    disabled={editLoading}
                    className="bg-white border-blue-200 text-blue-900 hover:bg-gray-200"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={editLoading}
                  className="bg-blue-800 hover:bg-blue-900 text-white"
                >
                  {editLoading ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteVictim} onOpenChange={() => setDeleteVictim(null)}>
        <DialogContent className="bg-white border-blue-200 text-blue-900">
          <DialogHeader>
            <DialogTitle className="text-blue-900">Delete Victim</DialogTitle>
          </DialogHeader>
          <div className="text-blue-900">
            Are you sure you want to delete this victim?
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={deleteLoading}
                className="bg-white border-blue-200 text-blue-900 hover:bg-gray-200"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteVictim}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={examinationDialogOpen}
        onOpenChange={setExaminationDialogOpen}
      >
        <DialogContent className="max-w-2xl bg-white border-blue-200 text-blue-900">
          <DialogHeader>
            <DialogTitle className="text-blue-900">
              Examinations for {examinationVictim?.first_name}{" "}
              {examinationVictim?.last_name}
            </DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            {examinations.length === 0 && (
              <div className="text-blue-400">No examinations found.</div>
            )}
            {examinations.length > 0 && (
              <table className="w-full text-sm border border-blue-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2 text-left text-blue-900">Date</th>
                    <th className="p-2 text-left text-blue-900">Findings</th>
                    <th className="p-2 text-left text-blue-900">Practitioner</th>
                    <th className="p-2 text-left text-blue-900"></th>
                  </tr>
                </thead>
                <tbody>
                  {examinations.map((exam: any) => (
                    <tr
                      key={exam.ID} // Ensure unique key
                      className="border-t border-blue-200 hover:bg-gray-200"
                    >
                      <td className="p-2 text-blue-900">
                        {exam.exam_date
                          ? new Date(exam.exam_date).toLocaleDateString()
                          : ""}
                      </td>
                      <td className="p-2 text-blue-900">{exam.findings}</td>
                      <td className="p-2 text-blue-900">{exam.practitioner_id}</td>
                      <td className="p-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setExaminationForm(exam);
                            setExaminationEditId(exam.ID);
                          }}
                          className="bg-white border-blue-200 text-blue-900 hover:bg-gray-200"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="ml-2 bg-red-600 hover:bg-red-700 text-white"
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
          <div className="border-t border-blue-200 pt-4 mt-4">
            <Button
              size="sm"
              onClick={() => {
                setExaminationForm({
                  case_id: "",
                  consent_given: false,
                  exam_date: "",
                  facility_id: "",
                  findings: "",
                  practitioner_id: "",
                  referral: "",
                  treatment: "",
                });
                setExaminationEditId(null);
              }}
              className="bg-blue-800 hover:bg-blue-900 text-white"
            >
              Add Examination
            </Button>
            {examinationForm && (
              <form onSubmit={handleExaminationSubmit} className="space-y-4 mt-4">
                <div>
                  <Label
                    htmlFor="case_id"
                    className="block text-sm font-medium text-blue-900"
                  >
                    Case
                  </Label>
                  <select
                    id="case_id"
                    name="case_id"
                    value={examinationForm.case_id}
                    onChange={handleExaminationFormChange}
                    required
                    className="w-full border border-blue-200 rounded-lg px-2 py-1 bg-white text-blue-900 focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="" className="text-blue-400">
                      Select case
                    </option>
                    {cases.map((c: any) => (
                      <option
                        key={c.id ?? c.ID} // Ensure unique key
                        value={c.id ?? c.ID}
                        className="text-blue-900"
                      >
                        {c.case_number
                          ? `${c.case_number} - ${c.title}`
                          : c.id ?? c.ID}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2">
                  <Checkbox
                    name="consent_given"
                    checked={!!examinationForm.consent_given}
                    onCheckedChange={(checked) =>
                      setExaminationForm((prev: any) => ({
                        ...prev,
                        consent_given: checked,
                      }))
                    }
                    className="border-blue-200 text-blue-600"
                  />
                  <span className="text-blue-900">Consent Given</span>
                </label>
                <Input
                  name="exam_date"
                  type="date"
                  placeholder="Exam Date"
                  value={examinationForm.exam_date}
                  onChange={handleExaminationFormChange}
                  required
                  className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
                <div>
                  <Label
                    htmlFor="facility_id"
                    className="block text-sm font-medium text-blue-900"
                  >
                    Facility
                  </Label>
                  <select
                    id="facility_id"
                    name="facility_id"
                    value={examinationForm.facility_id}
                    onChange={handleExaminationFormChange}
                    required
                    className="w-full border border-blue-200 rounded-lg px-2 py-1 bg-white text-blue-900 focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="" className="text-blue-400">
                      Select facility
                    </option>
                    {facilities.map((f: any) => (
                      <option
                        key={f.id ?? f.ID} // Ensure unique key
                        value={f.id ?? f.ID}
                        className="text-blue-900"
                      >
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label
                    htmlFor="practitioner_id"
                    className="block text-sm font-medium text-blue-900"
                  >
                    Practitioner
                  </Label>
                  <select
                    id="practitioner_id"
                    name="practitioner_id"
                    value={examinationForm.practitioner_id}
                    onChange={handleExaminationFormChange}
                    required
                    className="w-full border border-blue-200 rounded-lg px-2 py-1 bg-white text-blue-900 focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="" className="text-blue-400">
                      Select practitioner
                    </option>
                    {practitioners.map((p: any) => (
                      <option
                        key={p.id ?? p.ID} // Ensure unique key
                        value={p.id ?? p.ID}
                        className="text-blue-900"
                      >
                        {p.first_name} {p.last_name}
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
                  className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
                <Input
                  name="referral"
                  placeholder="Referral"
                  value={examinationForm.referral}
                  onChange={handleExaminationFormChange}
                  className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
                <Input
                  name="treatment"
                  placeholder="Treatment"
                  value={examinationForm.treatment}
                  onChange={handleExaminationFormChange}
                  className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600"
                />
                <DialogFooter>
                  <Button
                    type="submit"
                    disabled={examinationLoading}
                    className="bg-blue-800 hover:bg-blue-900 text-white"
                  >
                    {examinationEditId ? "Update" : "Create"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setExaminationForm(null);
                      setExaminationEditId(null);
                    }}
                    disabled={examinationLoading}
                    className="bg-white border-blue-200 text-blue-900 hover:bg-gray-200"
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

function ExaminationsList({ victimId }: { victimId: number }) {
  const { data } = useSWRImmutable(
    `/examinations/search?victim_id=${victimId}`,
    fetcher
  );
  const examinations = data?.data || [];
  if (!examinations.length)
    return <li className="text-blue-400">No examinations found.</li>;
  return (
    <>
      {examinations.map((exam: any, idx: number) => (
        <li key={exam.ID ?? idx} className="text-blue-900">
          {exam.exam_date
            ? new Date(exam.exam_date).toLocaleDateString()
            : ""}{" "}
          - {exam.findings}
        </li>
      ))}
    </>
  );
}