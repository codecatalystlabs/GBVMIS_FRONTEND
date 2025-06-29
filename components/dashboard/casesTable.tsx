"use client";

import useSWR from "swr";
import { useState, useEffect } from "react";
import {
  MoreHorizontal,
  ChevronDown,
  Search,
  ArrowUpDown,
  Plus,
  Edit,
  Trash,
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
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface Case {
  id: number;
  case_number: string;
  title: string;
  description: string;
  status: string;
  date_opened: string;
  officer_id: number;
  police_post_id: number;
  suspect_id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: {
    time: string;
    valid: boolean;
  };
  officer: {
    id: number;
    badge_no: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    rank: string;
    username: string;
    post_id: number;
    roles: {
      id: number;
      name: string;
      createdAt: string;
      updatedAt: string;
      deletedAt: {
        time: string;
        valid: boolean;
      };
    }[];
    cases: string[];
    createdAt: string;
    updatedAt: string;
    deletedAt: {
      time: string;
      valid: boolean;
    };
  };
  policePost: {
    id: number;
    name: string;
    location: string;
    contact: string;
    officers: {
      id: number;
      badge_no: string;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      rank: string;
      username: string;
      post_id: number;
      roles: {
        id: number;
        name: string;
        createdAt: string;
        updatedAt: string;
        deletedAt: {
          time: string;
          valid: boolean;
        };
      }[];
      cases: string[];
      createdAt: string;
      updatedAt: string;
      deletedAt: {
        time: string;
        valid: boolean;
      };
    }[];
    createdAt: string;
    updatedAt: string;
    deletedAt: {
      time: string;
      valid: boolean;
    };
  };
  charges: {
    id: number;
    case_id: number;
    charge_title: string;
    description: string;
    severity: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: {
      time: string;
      valid: boolean;
    };
  }[];
  victims: {
    id: number;
    first_name: string;
    last_name: string;
    gender: string;
    dob: string;
    nationality: string;
    nin: string;
    phone_number: string;
    address: string;
    cases: string[];
    createdAt: string;
    updatedAt: string;
    created_by: string;
    updated_by: string;
    deletedAt: {
      time: string;
      valid: boolean;
    };
  }[];
}

interface CasesResponse {
  data: Case[];
  pagination?: {
    total_items?: number;
    total_pages?: number;
    current_page?: number;
  };
}

export function CasesTable() {
  const [selectedCases, setSelectedCases] = useState<number[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [newCase, setNewCase] = useState<Partial<Case>>({});
  const [editCase, setEditCase] = useState<Case | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Use getCases for fetching paginated list
  const { data, error, isLoading, mutate } = useSWR<CasesResponse>(
    () => ({
      page: currentPage,
      pageSize,
    }),
    () => apiClient.getCases<CasesResponse>({ page: currentPage, pageSize })
  );

  const cases = data?.data || [];
  const totalItems = data?.pagination?.total_items || 0;
  const totalPages = data?.pagination?.total_pages || 1;

  useEffect(() => {
    mutate();
  }, [currentPage, pageSize, mutate]);

  // Trigger search when searchTerm changes
  useEffect(() => {
    mutate();
  }, [searchTerm, mutate]);

  const toggleSelectAll = () => {
    if (selectedCases.length === cases.length) {
      setSelectedCases([]);
    } else {
      setSelectedCases(cases.map((c: Case) => c.id));
    }
  };

  const toggleSelectCase = (id: number) => {
    setSelectedCases((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await apiClient.deleteCase(deleteId);
      setDeleteId(null);
      setIsDialogOpen(false);
      mutate();
    } catch (err) {
      console.error("Failed to delete case:", err);
      alert("Failed to delete case. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleAddCase = async () => {
    setIsAdding(true);
    const requiredCase = {
      case_number: newCase.case_number || `CASE${Date.now()}`,
      title: newCase.title || "Default Title",
      description: newCase.description || "Default Description",
      status: newCase.status || "Open",
      date_opened: newCase.date_opened || new Date().toISOString().split("T")[0],
      officer_id: newCase.officer_id || 1,
      police_post_id: newCase.police_post_id || 1,
      suspect_id: newCase.suspect_id || 1,
    };
    try {
      await apiClient.createCase(requiredCase);
      setNewCase({});
      setIsAddDialogOpen(false);
      mutate();
    } catch (err) {
      console.error("Failed to add case:", err);
      alert("Failed to add case. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditCase = async () => {
    if (!editCase) return;
    setIsEditing(true);
    try {
      await apiClient.updateCase(editCase.id, editCase);
      setEditCase(null);
      setIsEditDialogOpen(false);
      mutate();
    } catch (err) {
      console.error("Failed to update case:", err);
      alert("Failed to update case. Please try again.");
    } finally {
      setIsEditing(false);
    }
  };

  const fetchSingleCase = async (id: number) => {
    try {
      const response = await apiClient.getCaseById<Case>(id);
      setEditCase(response);
      setIsEditDialogOpen(true);
    } catch (err) {
      console.error("Failed to fetch case:", err);
      alert("Failed to fetch case. Please try again.");
    }
  };

  if (isLoading) return <div className="p-4">Loading cases...</div>;
  if (error) return <div className="p-4 text-red-500">Failed to load cases. Please try again later.</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full sm:w-auto items-center gap-2">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 sm:w-[300px]"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 hidden sm:flex">
                <ChevronDown className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Status</DropdownMenuItem>
              <DropdownMenuItem>Reported Date</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
            <SelectTrigger className="h-9 w-[70px]">
              <SelectValue placeholder={pageSize.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setIsAddDialogOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" /> Add Case
          </Button>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedCases.length === cases.length && cases.length > 0}
                  onCheckedChange={toggleSelectAll}
                  className="h-4 w-4"
                />
              </TableHead>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Case Number</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Officer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date Opened</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.map((c: Case) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedCases.includes(c.id)}
                    onCheckedChange={() => toggleSelectCase(c.id)}
                    className="h-4 w-4"
                  />
                </TableCell>
                <TableCell className="font-medium">{c.id}</TableCell>
                <TableCell>{c.case_number}</TableCell>
                <TableCell>{c.title}</TableCell>
                <TableCell>{c.officer ? `${c.officer.first_name} ${c.officer.last_name}` : "N/A"}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      c.status === "Open"
                        ? "default"
                        : c.status === "In Progress"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {c.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(c.date_opened).toLocaleDateString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => fetchSingleCase(c.id)}>
                        <Edit className="h-4 w-4 mr-2" /> View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => fetchSingleCase(c.id)}>
                        <Edit className="h-4 w-4 mr-2" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => {
                          setDeleteId(c.id);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Trash className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-muted-foreground">
          Showing{" "}
          <strong>{(currentPage - 1) * pageSize + 1}</strong> to{" "}
          <strong>{Math.min(currentPage * pageSize, totalItems)}</strong> of{" "}
          <strong>{totalItems}</strong> results
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Case</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this case? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDialogOpen(false);
                setDeleteId(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Add Case Dialog */}
      <AlertDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add New Case</AlertDialogTitle>
            <AlertDialogDescription>
              <span>
                <Input
                  placeholder="Case Number"
                  value={newCase.case_number || ""}
                  onChange={(e) => setNewCase({ ...newCase, case_number: e.target.value })}
                  className="mb-4"
                />
                <Input
                  placeholder="Title"
                  value={newCase.title || ""}
                  onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                  className="mb-4"
                />
                <Input
                  placeholder="Description"
                  value={newCase.description || ""}
                  onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                  className="mb-4"
                />
                <Input
                  placeholder="Status"
                  value={newCase.status || ""}
                  onChange={(e) => setNewCase({ ...newCase, status: e.target.value })}
                  className="mb-4"
                />
                <Input
                  type="date"
                  placeholder="Date Opened"
                  value={newCase.date_opened || ""}
                  onChange={(e) => setNewCase({ ...newCase, date_opened: e.target.value })}
                  className="mb-4"
                />
                <Input
                  placeholder="Officer ID"
                  value={newCase.officer_id?.toString() || ""}
                  onChange={(e) => setNewCase({ ...newCase, officer_id: parseInt(e.target.value) || 0 })}
                  className="mb-4"
                />
                <Input
                  placeholder="Police Post ID"
                  value={newCase.police_post_id?.toString() || ""}
                  onChange={(e) => setNewCase({ ...newCase, police_post_id: parseInt(e.target.value) || 0 })}
                  className="mb-4"
                />
                <Input
                  placeholder="Suspect ID"
                  value={newCase.suspect_id?.toString() || ""}
                  onChange={(e) => setNewCase({ ...newCase, suspect_id: parseInt(e.target.value) || 0 })}
                  className="mb-4"
                />
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isAdding}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAddCase} disabled={isAdding}>
              {isAdding ? "Adding..." : "Add"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Edit Case Dialog */}
      <AlertDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Case</AlertDialogTitle>
            <AlertDialogDescription>
              <span>
                <Input
                  placeholder="Case Number"
                  value={editCase?.case_number || ""}
                  onChange={(e) => setEditCase({ ...editCase, case_number: e.target.value } as Case)}
                  className="mb-4"
                />
                <Input
                  placeholder="Title"
                  value={editCase?.title || ""}
                  onChange={(e) => setEditCase({ ...editCase, title: e.target.value } as Case)}
                  className="mb-4"
                />
                <Input
                  placeholder="Description"
                  value={editCase?.description || ""}
                  onChange={(e) => setEditCase({ ...editCase, description: e.target.value } as Case)}
                  className="mb-4"
                />
                <Input
                  placeholder="Status"
                  value={editCase?.status || ""}
                  onChange={(e) => setEditCase({ ...editCase, status: e.target.value } as Case)}
                  className="mb-4"
                />
                <Input
                  type="date"
                  placeholder="Date Opened"
                  value={editCase?.date_opened || ""}
                  onChange={(e) => setEditCase({ ...editCase, date_opened: e.target.value } as Case)}
                  className="mb-4"
                />
                <Input
                  placeholder="Officer ID"
                  value={editCase?.officer_id?.toString() || ""}
                  onChange={(e) => setEditCase({ ...editCase, officer_id: parseInt(e.target.value) || 0 } as Case)}
                  className="mb-4"
                />
                <Input
                  placeholder="Police Post ID"
                  value={editCase?.police_post_id?.toString() || ""}
                  onChange={(e) => setEditCase({ ...editCase, police_post_id: parseInt(e.target.value) || 0 } as Case)}
                  className="mb-4"
                />
                <Input
                  placeholder="Suspect ID"
                  value={editCase?.suspect_id?.toString() || ""}
                  onChange={(e) => setEditCase({ ...editCase, suspect_id: parseInt(e.target.value) || 0 } as Case)}
                  className="mb-4"
                />
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isEditing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleEditCase} disabled={isEditing}>
              {isEditing ? "Saving..." : "Save"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}