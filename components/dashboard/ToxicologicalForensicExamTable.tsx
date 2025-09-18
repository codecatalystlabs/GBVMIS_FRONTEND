"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm, ControllerRenderProps } from "react-hook-form";
import useSWR from "swr";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search } from "lucide-react";
import jsPDF from "jspdf";
import { fetcher, apiClient } from "@/lib/api";
import type { Examination, PaginatedResponse, Case } from "@/types/index";

// Form validation schema
const examinationSchema = z.object({
  sampleId: z.string().min(1, { message: "Sample ID is required" }),
  patientName: z.string().min(2, { message: "Patient name must be at least 2 characters" }),
  dateCollected: z.string().min(1, { message: "Date is required" }),
  labResult: z.string().min(1, { message: "Lab result is required" }),
  analystName: z.string().min(2, { message: "Analyst name must be at least 2 characters" }),
  case_id: z.number().optional(),
});

type ExaminationFormValues = z.infer<typeof examinationSchema>;

export default function ToxicologicalForensicExamTable() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // SWR for examinations
  const swrKey = searchTerm || currentPage > 1
    ? `/examinations?page=${currentPage}&limit=${itemsPerPage}${searchTerm ? `&q=${searchTerm}` : ""}`
    : "/examinations";

  const { data: examsResponse, error: examsError, isLoading: examsLoading, mutate: mutateExams } =
    useSWR<PaginatedResponse<Examination>>(swrKey, fetcher);

  // SWR for cases
  const { data: casesResponse, error: casesError } = useSWR<PaginatedResponse<Case>>(
    "/cases",
    fetcher
  );
  const cases = casesResponse?.data || [];

  const examsData = examsResponse?.data || [];
  const pagination = examsResponse?.pagination || {
    page: 1,
    limit: itemsPerPage,
    total_items: 0,
    total_pages: 1,
  };
  const totalPages = pagination.total_pages;

  const form = useForm<ExaminationFormValues>({
    resolver: zodResolver(examinationSchema),
    defaultValues: {
      sampleId: "",
      patientName: "",
      dateCollected: "",
      labResult: "",
      analystName: "",
      case_id: undefined,
    },
  });

  const onSubmit = async (values: ExaminationFormValues) => {
    setIsSubmitting(true);
    try {
      await apiClient.post("/examination", values);
      await mutateExams();
      toast.success("Exam data saved successfully!");
      setIsAddDialogOpen(false);
      form.reset();
      setCurrentPage(1);
    } catch (error: any) {
      toast.error(error.message || "Failed to save exam data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePDF = (examData: Examination) => {
    const doc = new jsPDF();
    doc.text("Official Toxicological Report", 10, 10);
    doc.text(`Sample ID: ${examData.sampleId}`, 10, 20);
    doc.text(`Patient Name: ${examData.patientName}`, 10, 30);
    doc.text(`Date Collected: ${examData.dateCollected}`, 10, 40);
    doc.text(`Lab Result: ${examData.labResult}`, 10, 50);
    doc.text(`Analyst Name: ${examData.analystName}`, 10, 60);
    doc.text(`Generated: ${new Date().toLocaleString("en-US", { timeZone: "EAT" })}`, 10, 70);
    doc.save(`toxicological_report_${examData.sampleId}.pdf`);
  };

  // Sanitize pagination values
  const safePage = Math.max(1, Number(pagination.page) || 1);
  const safeLimit = Math.max(1, Number(pagination.limit) || itemsPerPage);
  const safeTotalItems = Math.max(0, Number(pagination.total_items) || 0);

  const indexOfFirstItem = (safePage - 1) * safeLimit + 1;
  const indexOfLastItem = Math.min(indexOfFirstItem + safeLimit - 1, safeTotalItems);

  const currentExams: Examination[] = examsData;

  if (examsLoading) {
    return (
      <div className="flex justify-center items-center py-8 bg-gray-100 rounded-xl">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-800"></div>
      </div>
    );
  }

  if (examsError) {
    return (
      <div className="text-red-500 text-center py-8 bg-gray-100 rounded-xl">
        Error loading exam data: {(examsError as Error).message}
      </div>
    );
  }

  if (casesError) {
    return (
      <div className="text-red-500 text-center py-8 bg-gray-100 rounded-xl">
        Error loading cases: {(casesError as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-100 rounded-xl shadow-lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-900" />
          <Input
            type="search"
            placeholder="Search by Sample ID, Patient Name, Result, or Analyst..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 sm:w-[300px] bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 transition-all duration-300"
          />
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-800 text-white hover:bg-blue-900 rounded-md transition-all duration-300">
                Add Exam
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-blue-200 rounded-xl shadow-lg max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-blue-900">Add Toxicological Exam</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="sampleId"
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<ExaminationFormValues, "sampleId">;
                    }) => (
                      <FormItem>
                        <FormLabel className="text-blue-900">Sample ID</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isSubmitting}
                            className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="patientName"
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<ExaminationFormValues, "patientName">;
                    }) => (
                      <FormItem>
                        <FormLabel className="text-blue-900">Patient Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isSubmitting}
                            className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dateCollected"
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<ExaminationFormValues, "dateCollected">;
                    }) => (
                      <FormItem>
                        <FormLabel className="text-blue-900">Date Collected</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            disabled={isSubmitting}
                            className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="labResult"
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<ExaminationFormValues, "labResult">;
                    }) => (
                      <FormItem>
                        <FormLabel className="text-blue-900">Lab Result</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isSubmitting}
                            className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="analystName"
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<ExaminationFormValues, "analystName">;
                    }) => (
                      <FormItem>
                        <FormLabel className="text-blue-900">Analyst Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isSubmitting}
                            className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
                          />
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="case_id"
                    render={({
                      field,
                    }: {
                      field: ControllerRenderProps<ExaminationFormValues, "case_id">;
                    }) => (
                      <FormItem>
                        <FormLabel className="text-blue-900">Case</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(e.target.value ? Number(e.target.value) : undefined)
                            }
                            disabled={isSubmitting}
                            className="bg-white border-blue-200 text-blue-900 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300 w-full p-2"
                          >
                            <option value="">Select a case</option>
                            {cases.map((caseItem) => (
                              <option key={caseItem.id} value={caseItem.id}>
                                {caseItem.case_number} - {caseItem.title}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                      disabled={isSubmitting}
                      className="bg-white border-blue-200 text-blue-900 hover:bg-gray-200 rounded-md transition-all duration-300"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-800 text-white hover:bg-blue-900 rounded-md transition-all duration-300"
                    >
                      {isSubmitting ? "Saving..." : "Save"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-xl border border-blue-200 bg-white shadow-lg">
        <Table>
          <TableHeader className="bg-gray-100">
            <TableRow className="border-b border-blue-200 hover:bg-gray-200">
              <TableHead className="p-3 text-blue-900 font-semibold">Sample ID</TableHead>
              <TableHead className="p-3 text-blue-900 font-semibold">Patient Name</TableHead>
              <TableHead className="p-3 text-blue-900 font-semibold">Date Collected</TableHead>
              <TableHead className="p-3 text-blue-900 font-semibold">Lab Result</TableHead>
              <TableHead className="p-3 text-blue-900 font-semibold">Analyst Name</TableHead>
              <TableHead className="w-[40px] p-3 text-blue-900"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentExams.map((exam: Examination) => (
              <TableRow
                key={exam.id}
                className="border-t border-blue-200 hover:bg-gray-200 transition-all duration-200"
              >
                <TableCell className="p-3 font-medium text-blue-900">{exam.sampleId}</TableCell>
                <TableCell className="p-3 text-blue-900">{exam.patientName}</TableCell>
                <TableCell className="p-3 text-blue-900">
                  {new Date(exam.dateCollected).toLocaleDateString()}
                </TableCell>
                <TableCell className="p-3 text-blue-900">{exam.labResult}</TableCell>
                <TableCell className="p-3 text-blue-900">{exam.analystName}</TableCell>
                <TableCell className="p-3">
                  <Button
                    variant="outline"
                    onClick={() => generatePDF(exam)}
                    className="bg-blue-800 text-white hover:bg-blue-900 rounded-md transition-all duration-300"
                  >
                    Generate PDF
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-3 px-4 bg-white border border-blue-200 rounded-xl shadow-md">
        <div className="text-sm text-blue-900">
          Showing <strong className="text-blue-900">{String(indexOfFirstItem)}</strong> to{" "}
          <strong className="text-blue-900">{String(indexOfLastItem)}</strong> of{" "}
          <strong className="text-blue-900">{String(pagination.total_items)}</strong> results
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="bg-white border-blue-200 text-blue-900 hover:bg-gray-200 rounded-md"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))}
            disabled={currentPage === totalPages}
            className="bg-white border-blue-200 text-blue-900 hover:bg-gray-200 rounded-md"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}