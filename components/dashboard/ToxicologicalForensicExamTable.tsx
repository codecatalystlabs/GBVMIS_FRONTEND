"use client";

import { useState, useCallback, SetStateAction } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { toast } from "react-toastify";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";

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
import { Search, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import { fetcher, apiClient } from "@/lib/api";
import type { Examination, PaginatedResponse } from "@/types/index"; // Adjust path to your interfaces

// Updated form validation schema
const examinationSchema = z.object({
  case_id: z.number().min(0, { message: "Case ID is required" }),
  consent_given: z.boolean(),
  exam_date: z.string()
    .min(1, { message: "Exam date is required" })
    .refine((val) => !isNaN(Date.parse(val)), { message: "Please enter a valid date" }),
  facility_id: z.number().min(0, { message: "Facility ID is required" }),
  findings: z.string().min(1, { message: "Findings are required" }),
  practitioner_id: z.number().min(0, { message: "Practitioner ID is required" }),
  referral: z.string().min(1, { message: "Referral is required" }),
  treatment: z.string().min(1, { message: "Treatment is required" }),
  victim_id: z.number().min(0, { message: "Victim ID is required" }),
});

type ExaminationFormValues = z.infer<typeof examinationSchema>;

export default function ToxicologicalForensicExamTable() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Updated SWR key for API pagination/search
  const swrKey = searchTerm || currentPage > 1 
    ? `/examinations?page=${currentPage}&limit=${itemsPerPage}${searchTerm ? `&q=${searchTerm}` : ''}` 
    : "/examinations";

  const { data: examsResponse, error: examsError, isLoading: examsLoading, mutate: mutateExams } = useSWR<PaginatedResponse<Examination>>(
    swrKey,
    fetcher
  );

  const examsData = examsResponse?.data || [];
  const pagination = examsResponse?.pagination || { page: 1, limit: itemsPerPage, total_items: 0, total_pages: 1 };
  const totalPages = pagination.total_pages;

  const form = useForm<ExaminationFormValues>({
    resolver: zodResolver(examinationSchema),
    defaultValues: {
      case_id: 0,
      consent_given: true,
      exam_date: "",
      facility_id: 0,
      findings: "",
      practitioner_id: 0,
      referral: "",
      treatment: "",
      victim_id: 0,
    },
  });

  const onSubmit = async (values: ExaminationFormValues) => {
    setIsSubmitting(true);
    try {
      // Ensure exam_date is in a format acceptable to the backend (e.g., YYYY-MM-DD)
      const submissionData = {
        ...values,
        exam_date: values.exam_date || undefined, // Convert empty string to undefined if allowed by backend
      };
      await apiClient.post("/examination", submissionData);
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
    doc.text(`Case ID: ${examData.case_id}`, 10, 20);
    doc.text(`Consent Given: ${examData.consent_given ? "Yes" : "No"}`, 10, 30);
    doc.text(`Exam Date: ${examData.exam_date}`, 10, 40);
    doc.text(`Facility ID: ${examData.facility_id}`, 10, 50);
    doc.text(`Findings: ${examData.findings}`, 10, 60);
    doc.text(`Practitioner ID: ${examData.practitioner_id}`, 10, 70);
    doc.text(`Referral: ${examData.referral}`, 10, 80);
    doc.text(`Treatment: ${examData.treatment}`, 10, 90);
    doc.text(`Victim ID: ${examData.victim_id}`, 10, 100);
    doc.text(`Generated: ${new Date().toLocaleString("en-US", { timeZone: "EAT" })}`, 10, 110); // 03:34 PM EAT, September 17, 2025
    doc.save(`toxicological_report_case_${examData.case_id}.pdf`);
  };

  // Sanitize pagination values to prevent NaN
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

  return (
    <div className="space-y-6 p-6 bg-gray-100 rounded-xl shadow-lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-900" />
          <Input
            type="search"
            placeholder="Search by Case ID, Victim ID, or Findings..."
            value={searchTerm}
            onChange={(e: { target: { value: SetStateAction<string>; }; }) => {
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
                    name="case_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-900">Case ID</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                    name="consent_given"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormLabel className="text-blue-900">Consent Given</FormLabel>
                        <FormMessage className="text-red-500" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="exam_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-900">Exam Date</FormLabel>
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
                    name="facility_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-900">Facility ID</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                    name="findings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-900">Findings</FormLabel>
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
                    name="practitioner_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-900">Practitioner ID</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                    name="referral"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-900">Referral</FormLabel>
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
                    name="treatment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-900">Treatment</FormLabel>
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
                    name="victim_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-900">Victim ID</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            disabled={isSubmitting}
                            className="bg-white border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 rounded-md transition-all duration-300"
                          />
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
              <TableHead className="p-3 text-blue-900 font-semibold">Case ID</TableHead>
              <TableHead className="p-3 text-blue-900 font-semibold">Consent Given</TableHead>
              <TableHead className="p-3 text-blue-900 font-semibold">Exam Date</TableHead>
              <TableHead className="p-3 text-blue-900 font-semibold">Facility ID</TableHead>
              <TableHead className="p-3 text-blue-900 font-semibold">Findings</TableHead>
              <TableHead className="p-3 text-blue-900 font-semibold">Practitioner ID</TableHead>
              <TableHead className="p-3 text-blue-900 font-semibold">Referral</TableHead>
              <TableHead className="p-3 text-blue-900 font-semibold">Treatment</TableHead>
              <TableHead className="p-3 text-blue-900 font-semibold">Victim ID</TableHead>
              <TableHead className="w-[40px] p-3 text-blue-900"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentExams.map((exam: Examination) => (
              <TableRow key={exam.case_id} className="border-t border-blue-200 hover:bg-gray-200 transition-all duration-200">
                <TableCell className="p-3 font-medium text-blue-900">{exam.case_id}</TableCell>
                <TableCell className="p-3 text-blue-900">{exam.consent_given ? "Yes" : "No"}</TableCell>
                <TableCell className="p-3 text-blue-900">{new Date(exam.exam_date).toLocaleDateString()}</TableCell>
                <TableCell className="p-3 text-blue-900">{exam.facility_id}</TableCell>
                <TableCell className="p-3 text-blue-900">{exam.findings}</TableCell>
                <TableCell className="p-3 text-blue-900">{exam.practitioner_id}</TableCell>
                <TableCell className="p-3 text-blue-900">{exam.referral}</TableCell>
                <TableCell className="p-3 text-blue-900">{exam.treatment}</TableCell>
                <TableCell className="p-3 text-blue-900">{exam.victim_id}</TableCell>
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
          Showing <strong className="text-blue-900">{String(indexOfFirstItem)}</strong> to <strong className="text-blue-900">{String(indexOfLastItem)}</strong> of{' '}
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