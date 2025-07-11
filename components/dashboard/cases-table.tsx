"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import { fetcher, apiClient } from "@/lib/api";
import { Case, PoliceOfficer, PolicePost, Victim } from "@/types";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-toastify";
import { SearchableMultiSelect } from "@/components/ui/searchable-multiselect";

export function CasesTable() {
  // Data fetching
  const [search, setSearch] = useState("");
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
  const { data: officersData } = useSWR("/police-officers", fetcher);
  const { data: postsData } = useSWR("/police-posts", fetcher);
  const { data: suspectsData, mutate: mutateSuspects } = useSWR(
    "/suspects",
    fetcher
  );
  const { data: victimsData, mutate: mutateVictims } = useSWR(
    "/victims",
    fetcher
  );
  const { data: chargesData } = useSWR("/charges", fetcher);
  const allCharges = chargesData?.data || [];

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
  const suspects = (suspectsData?.data || []).filter((s: any) => s?.ID != null);
  const victims = (victimsData?.data || []).filter((v: any) => v?.ID != null);

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
    case_number: "",
    title: "",
    status: "",
    date_opened: "",
    officer_id: "",
    police_post_id: "",
    suspect_ids: [],
    victim_ids: [],
    description: "",
    charges: [],
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
      const formatDateToISO = (dateStr: string) => {
        if (dateStr.includes("T")) return dateStr;
        return `${dateStr}T00:00:00Z`;
      };
      const payload = {
        ...addForm,
        officer_id: Number(addForm.officer_id),
        police_post_id: Number(addForm.police_post_id),
        suspect_ids: addForm.suspect_ids,
        victim_ids: addForm.victim_ids,
        charges: Array.isArray(addForm.charges)
          ? allCharges
              .filter((c: any) =>
                (addForm.charges as (string | undefined | null)[])
                  .filter((id): id is string => typeof id === "string")
                  .includes(String(c.ID ?? ""))
              )
              .map((c: any) => ({
                charge_title: c.charge_title,
                description: c.description,
                severity: c.severity,
              }))
          : [],
        date_opened: formatDateToISO(addForm.date_opened),
      };
      await apiClient.post("/case", payload);
      toast.success("Case added successfully!");
      setIsAddDialogOpen(false);
      setAddForm({
        case_number: "",
        title: "",
        status: "",
        date_opened: "",
        officer_id: "",
        police_post_id: "",
        suspect_ids: [],
        victim_ids: [],
        description: "",
        charges: [],
      });
      mutate();
    } catch (err: any) {
      toast.error(
        err?.info?.message || err?.message || "Failed to add case"
      );
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
      const formatDateToISO = (dateStr: string) => {
        if (dateStr.includes("T")) return dateStr;
        return `${dateStr}T00:00:00Z`;
      };
      const payload = {
        ...editForm,
        officer_id: Number(editForm.officer_id),
        police_post_id: Number(editForm.police_post_id),
        suspect_ids: editForm.suspect_ids,
        victim_ids: editForm.victim_ids,
        charges: Array.isArray(editForm.charges)
          ? allCharges
              .filter((c: any) =>
                (editForm.charges as (string | undefined | null)[])
                  .filter((id): id is string => typeof id === "string")
                  .includes(String(c.ID ?? ""))
              )
              .map((c: any) => ({
                charge_title: c.charge_title,
                description: c.description,
                severity: c.severity,
              }))
          : [],
        date_opened: formatDateToISO(editForm.date_opened),
      };
      await apiClient.put(`/case/${selectedCase.id}`, payload);
      toast.success("Case updated successfully!");
      setIsEditDialogOpen(false);
      setEditForm(null);
      setSelectedCase(null);
      mutate();
    } catch (err: any) {
      toast.error(
        err?.info?.message || err?.message || "Failed to update case"
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
      charges: Array.isArray(c.charges)
        ? c.charges
            .filter((charge: any) => charge?.ID != null)
            .map((charge: any) => charge.ID.toString())
        : [],
      suspect_ids: Array.isArray(c.suspect_ids)
        ? c.suspect_ids.filter(
            (id) => typeof id === "string" || typeof id === "number"
          )
        : [],
      victim_ids: Array.isArray(c.victim_ids)
        ? c.victim_ids.filter(
            (id) => typeof id === "string" || typeof id === "number"
          )
        : [],
      officer_id: c.officer_id?.toString() || "",
      police_post_id: c.police_post_id?.toString() || "",
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
  if (isLoading) return <div className="text-blue-900">Loading cases...</div>;
  if (error) return <div className="text-red-500">Error loading cases</div>;

  // Helper functions
  const getOfficerName = (id: number | string | undefined) => {
    if (typeof id !== "number") return "-";
    const o = officers.find((x: any) => x.id === id);
    return o ? `${o.first_name} ${o.last_name}` : "-";
  };
  const getPostName = (id: number | string | undefined) => {
    if (typeof id !== "number") return "-";
    const p = posts.find((x: any) => x.id === id);
    return p ? p.name : "-";
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
              placeholder="Search cases..."
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
                Status
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-200 text-blue-900">
                Officer
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-200 text-blue-900">
                Police Post
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
            <Plus className="mr-2 h-5 w-5" /> Add Case
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
                    selectedCases.length === cases.length && cases.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                  className="border-blue-200 text-blue-600 focus:ring-blue-600"
                />
              </TableHead>
              <TableHead className="p-3 text-blue-900 font-semibold">
                Case Number
              </TableHead>
              <TableHead className="p-3 text-blue-900 font-semibold">Title</TableHead>
              <TableHead className="p-3 text-blue-900 font-semibold">
                Officer
              </TableHead>
              <TableHead className="p-3 text-blue-900 font-semibold">
                Police Post
              </TableHead>
              <TableHead className="p-3 text-blue-900 font-semibold">
                Suspects
              </TableHead>
              <TableHead className="p-3 text-blue-900 font-semibold">
                Victims
              </TableHead>
              <TableHead className="p-3 text-blue-900 font-semibold">Status</TableHead>
              <TableHead className="p-3 text-blue-900 font-semibold">
                Date Opened
              </TableHead>
              <TableHead className="p-3 text-blue-900 font-semibold">
                Description
              </TableHead>
              <TableHead className="w-[40px] p-3 text-blue-900"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.map((c: Case) => (
              <TableRow
                key={c.id}
                className="border-t border-blue-200 hover:bg-gray-200 transition-all duration-200"
              >
                <TableCell className="p-3">
                  <Checkbox
                    checked={selectedCases.includes(c.id?.toString())}
                    onCheckedChange={() =>
                      toggleSelectCase(c.id?.toString())
                    }
                    className="border-blue-200 text-blue-600 focus:ring-blue-600"
                  />
                </TableCell>
                <TableCell className="p-3 text-blue-900">
                  {c.case_number}
                </TableCell>
                <TableCell className="p-3 text-blue-900">{c.title}</TableCell>
                <TableCell className="p-3 text-blue-900">
                  {getOfficerName(c.officer_id)}
                </TableCell>
                <TableCell className="p-3 text-blue-900">
                  {getPostName(c.police_post_id)}
                </TableCell>
                <TableCell className="p-3 text-blue-900">
                  {Array.isArray(c.suspects)
                    ? c.suspects.length
                    : Array.isArray(c.suspect_ids)
                    ? c.suspect_ids.length
                    : 0}
                </TableCell>
                <TableCell className="p-3 text-blue-900">
                  {Array.isArray(c.victims)
                    ? c.victims.length
                    : Array.isArray(c.victim_ids)
                    ? c.victim_ids.length
                    : 0}
                </TableCell>
                <TableCell className="p-3 text-blue-900">{c.status}</TableCell>
                <TableCell className="p-3 text-blue-900">{c.date_opened}</TableCell>
                <TableCell className="p-3 text-blue-900">
                  {c.description ? c.description.slice(0, 40) : ""}
                  {c.description && c.description.length > 40 ? "..." : ""}
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
        <DialogContent className="bg-white border-blue-200 rounded-xl shadow-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-900">Add Case</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleAddCase}
            className="space-y-4 p-4"
          >
            <Input
              name="case_number"
              placeholder="Case Number"
              value={addForm.case_number}
              onChange={handleAddChange}
              required
              className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
            />
            <Input
              name="title"
              placeholder="Title"
              value={addForm.title}
              onChange={handleAddChange}
              required
              className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
            />
            <Input
              name="status"
              placeholder="Status"
              value={addForm.status}
              onChange={handleAddChange}
              required
              className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
            />
            <Input
              name="date_opened"
              type="date"
              value={addForm.date_opened}
              onChange={handleAddChange}
              required
              className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
            />
            <Select
              name="officer_id"
              value={addForm.officer_id}
              onValueChange={(v) =>
                setAddForm((f: any) => ({ ...f, officer_id: v }))
              }
              required
            >
              <SelectTrigger className="bg-white border-blue-200 text-blue-900 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300">
                <SelectValue placeholder="Select Officer" />
              </SelectTrigger>
              <SelectContent className="bg-white border-blue-200 text-blue-900">
                {officers.map((o: any) => (
                  <SelectItem
                    key={o.id}
                    value={o.id.toString()}
                    className="hover:bg-gray-200 text-blue-900"
                  >
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
              <SelectTrigger className="bg-white border-blue-200 text-blue-900 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300">
                <SelectValue placeholder="Select Police Post" />
              </SelectTrigger>
              <SelectContent className="bg-white border-blue-200 text-blue-900">
                {posts.map((p: any) => (
                  <SelectItem
                    key={p.id}
                    value={p.id.toString()}
                    className="hover:bg-gray-200 text-blue-900"
                  >
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Suspects Multi-Select */}
            <SearchableMultiSelect
              label="Suspects"
              options={suspects.map((s: any) => ({
                value: s.ID.toString(),
                label: `${s.first_name} ${s.last_name}`,
              }))}
              selectedValues={
                Array.isArray(addForm.suspect_ids)
                  ? addForm.suspect_ids
                      .filter(
                        (id: any) =>
                          typeof id === "string" || typeof id === "number"
                      )
                      .map((id: any) => id.toString())
                  : []
              }
              onChange={(values) =>
                setAddForm((f: any) => ({
                  ...f,
                  suspect_ids: (values as string[]).map((v) => {
                    const found = suspects.find(
                      (s: any) => s.ID.toString() === v
                    );
                    return found ? found.ID : v;
                  }),
                }))
              }
              placeholder={
                !suspectsData
                  ? "Loading suspects..."
                  : "Select suspects..."
              }
              disabled={!suspectsData}
              className="bg-white border-blue-200 text-blue-900"
            />
            {/* Victims Multi-Select */}
            <SearchableMultiSelect
              label="Victims"
              options={victims.map((v: any) => ({
                value: v.ID.toString(),
                label: `${v.first_name} ${v.last_name}`,
              }))}
              selectedValues={
                Array.isArray(addForm.victim_ids)
                  ? addForm.victim_ids
                      .filter(
                        (id: any) =>
                          typeof id === "string" || typeof id === "number"
                      )
                      .map((id: any) => id.toString())
                  : []
              }
              onChange={(values) =>
                setAddForm((f: any) => ({
                  ...f,
                  victim_ids: (values as string[]).map((v) => {
                    const found = victims.find(
                      (vic: any) => vic.ID.toString() === v
                    );
                    return found ? found.ID : v;
                  }),
                }))
              }
              placeholder={
                !victimsData ? "Loading victims..." : "Select victims..."
              }
              disabled={!victimsData}
              className="bg-white border-blue-200 text-blue-900"
            />
            <Input
              name="description"
              placeholder="Description"
              value={addForm.description}
              onChange={handleAddChange}
              required
              className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
            />
            <SearchableMultiSelect
              label="Charges"
              options={allCharges
                .filter((charge: any) => charge?.ID != null)
                .map((charge: any) => ({
                  value: charge.ID.toString(),
                  label: `${charge.charge_title} (${charge.severity})`,
                }))}
              selectedValues={
                Array.isArray(addForm.charges)
                  ? addForm.charges
                      .filter((id: any) => id != null && id !== "")
                      .map((id: any) => String(id))
                  : []
              }
              onChange={(values) =>
                setAddForm((f: any) => ({
                  ...f,
                  charges: values.filter(
                    (v: string) => v && v.trim() !== ""
                  ),
                }))
              }
              placeholder={
                !chargesData ? "Loading charges..." : "Select charges..."
              }
              disabled={!chargesData}
              className="bg-white border-blue-200 text-blue-900"
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
        <DialogContent className="bg-white border-blue-200 rounded-xl shadow-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-blue-900">Edit Case</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleEditCase}
            className="space-y-4 p-4"
          >
            <Input
              name="case_number"
              placeholder="Case Number"
              value={editForm?.case_number || ""}
              onChange={handleEditChange}
              required
              className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
            />
            <Input
              name="title"
              placeholder="Title"
              value={editForm?.title || ""}
              onChange={handleEditChange}
              required
              className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
            />
            <Input
              name="status"
              placeholder="Status"
              value={editForm?.status || ""}
              onChange={handleEditChange}
              required
              className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
            />
            <Input
              name="date_opened"
              type="date"
              value={editForm?.date_opened || ""}
              onChange={handleEditChange}
              required
              className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
            />
            <Select
              name="officer_id"
              value={editForm?.officer_id || ""}
              onValueChange={(v) =>
                setEditForm((f: any) => ({ ...f, officer_id: v }))
              }
              required
            >
              <SelectTrigger className="bg-white border-blue-200 text-blue-900 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300">
                <SelectValue placeholder="Select Officer" />
              </SelectTrigger>
              <SelectContent className="bg-white border-blue-200 text-blue-900">
                {officers.map((o: any) => (
                  <SelectItem
                    key={o.id}
                    value={o.id.toString()}
                    className="hover:bg-gray-200 text-blue-900"
                  >
                    {o.first_name} {o.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              name="police_post_id"
              value={editForm?.police_post_id || ""}
              onValueChange={(v) =>
                setEditForm((f: any) => ({ ...f, police_post_id: v }))
              }
              required
            >
              <SelectTrigger className="bg-white border-blue-200 text-blue-900 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300">
                <SelectValue placeholder="Select Police Post" />
              </SelectTrigger>
              <SelectContent className="bg-white border-blue-200 text-blue-900">
                {posts.map((p: any) => (
                  <SelectItem
                    key={p.id}
                    value={p.id.toString()}
                    className="hover:bg-gray-200 text-blue-900"
                  >
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Suspects Multi-Select */}
            <SearchableMultiSelect
              label="Suspects"
              options={suspects.map((s: any) => ({
                value: s.ID.toString(),
                label: `${s.first_name} ${s.last_name}`,
              }))}
              selectedValues={
                Array.isArray(editForm?.charges)
                  ? editForm.charges
                      .filter((id: any) => id != null)
                      .map((id: any) => id.toString())
                  : []
              }
              onChange={(values) =>
                setEditForm((f: any) => ({
                  ...f,
                  suspect_ids: (values as string[]).map((v) => {
                    const found = suspects.find(
                      (s: any) => s.ID.toString() === v
                    );
                    return found ? found.ID : v;
                  }),
                }))
              }
              placeholder={
                !suspectsData ? "Loading suspects..." : "Select suspects..."
              }
              disabled={!suspectsData}
              className="bg-white border-blue-200 text-blue-900"
            />
            {/* Victims Multi-Select */}
            <SearchableMultiSelect
              label="Victims"
              options={victims.map((v: any) => ({
                value: v.ID.toString(),
                label: `${v.first_name} ${v.last_name}`,
              }))}
              selectedValues={
                Array.isArray(editForm?.victim_ids)
                  ? editForm.victim_ids
                      .filter(
                        (id: any) =>
                          typeof id === "string" || typeof id === "number"
                      )
                      .map((id: any) => id.toString())
                  : []
              }
              onChange={(values) =>
                setEditForm((f: any) => ({
                  ...f,
                  victim_ids: (values as string[]).map((v) => {
                    const found = victims.find(
                      (vic: any) => vic.ID.toString() === v
                    );
                    return found ? found.ID : v;
                  }),
                }))
              }
              placeholder={
                !victimsData ? "Loading victims..." : "Select victims..."
              }
              disabled={!victimsData}
              className="bg-white border-blue-200 text-blue-900"
            />
            <Input
              name="description"
              placeholder="Description"
              value={editForm?.description || ""}
              onChange={handleEditChange}
              required
              className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
            />
            <SearchableMultiSelect
              label="Charges"
              options={allCharges
                .filter((charge: any) => charge?.ID != null)
                .map((charge: any) => ({
                  value: charge.ID?.toString(),
                  label: `${charge.charge_title} (${charge.severity})`,
                }))}
              selectedValues={
                Array.isArray(editForm?.charges)
                  ? editForm.charges
                      .filter((id: any) => id != null && id != "")
                      .map((id: any) => String(id))
                  : []
              }
              onChange={(values) =>
                setEditForm((f: any) => ({
                  ...f,
                  charges: values.filter((v: string) => v && v.trim() !== ""),
                }))
              }
              placeholder={
                !chargesData ? "Loading charges..." : "Select charges..."
              }
              disabled={!chargesData}
              className="bg-white border-blue-200 text-blue-900"
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
            <DialogTitle className="text-blue-900">Case Details</DialogTitle>
          </DialogHeader>
          {selectedCase ? (
            <div className="space-y-4 p-4">
              <div>
                <span className="text-blue-400 font-medium">Case Number:</span>{" "}
                <span className="text-blue-900">{selectedCase.case_number}</span>
              </div>
              <div>
                <span className="text-blue-400 font-medium">Title:</span>{" "}
                <span className="text-blue-900">{selectedCase.title}</span>
              </div>
              <div>
                <span className="text-blue-400 font-medium">Status:</span>{" "}
                <span className="text-blue-900">{selectedCase.status}</span>
              </div>
              <div>
                <span className="text-blue-400 font-medium">Date Opened:</span>{" "}
                <span className="text-blue-900">{selectedCase.date_opened}</span>
              </div>
              <div>
                <span className="text-blue-400 font-medium">Officer:</span>{" "}
                <span className="text-blue-900">
                  {getOfficerName(selectedCase.officer_id)}
                </span>
              </div>
              <div>
                <span className="text-blue-400 font-medium">Police Post:</span>{" "}
                <span className="text-blue-900">
                  {getPostName(selectedCase.police_post_id)}
                </span>
              </div>
              <div>
                <span className="text-blue-400 font-medium">Suspects:</span>
                {Array.isArray(selectedCase.suspects) &&
                selectedCase.suspects.length > 0 ? (
                  <ul className="list-disc ml-6 text-blue-900">
                    {selectedCase.suspects.map((suspect: any, idx: number) => (
                      <li key={idx}>
                        <b>
                          {suspect.first_name} {suspect.last_name}
                        </b>
                        {suspect.gender && `, Gender: ${suspect.gender}`}
                        {suspect.nin && `, NIN: ${suspect.nin}`}
                        {suspect.address && `, Address: ${suspect.address}`}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-blue-900">-</span>
                )}
              </div>
              <div>
                <span className="text-blue-400 font-medium">Victims:</span>
                {Array.isArray(selectedCase.victims) &&
                selectedCase.victims.length > 0 ? (
                  <ul className="list-disc ml-6 text-blue-900">
                    {selectedCase.victims.map((victim: any, idx: number) => (
                      <li key={idx}>
                        <b>
                          {victim.first_name} {victim.last_name}
                        </b>
                        {victim.gender && `, Gender: ${victim.gender}`}
                        {victim.phone_number &&
                          `, Phone: ${victim.phone_number}`}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-blue-900">-</span>
                )}
              </div>
              <div>
                <span className="text-blue-400 font-medium">Description:</span>{" "}
                <span className="text-blue-900">{selectedCase.description}</span>
              </div>
              <div>
                <span className="text-blue-400 font-medium">Charges:</span>
                {Array.isArray(selectedCase.charges) &&
                selectedCase.charges.length > 0 ? (
                  <ul className="list-disc ml-6 text-blue-900">
                    {selectedCase.charges.map((charge: any, idx: number) => (
                      <li key={idx}>
                        <b>{charge.charge_title}</b>: {charge.description} (
                        Severity: {charge.severity})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-blue-900">-</span>
                )}
              </div>
            </div>
          ) : (
            <div className="text-blue-900">No case selected.</div>
          )}
        </DialogContent>
      </Dialog>
      {/* Delete dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-200">
            <h3 className="mb-4 text-lg font-semibold text-blue-900">
              Delete Case
            </h3>
            <p className="text-blue-900">
              Are you sure you want to delete case "{selectedCase?.case_number}
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