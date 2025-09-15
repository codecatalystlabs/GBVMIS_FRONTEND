"use client";

import { useState, useCallback, SetStateAction } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { toast } from "react-toastify";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

// Form validation schema
const toxicologicalExamSchema = z.object({
  sampleId: z.string().min(1, { message: "Sample ID is required" }),
  patientName: z.string().min(2, { message: "Patient name must be at least 2 characters" }),
  dateCollected: z.string().min(1, { message: "Date is required" }),
  labResult: z.string().min(1, { message: "Lab result is required" }),
  analystName: z.string().min(2, { message: "Analyst name must be at least 2 characters" }),
});

type ToxicologicalExamFormValues = z.infer<typeof toxicologicalExamSchema>;

export default function ToxicologicalForensicExamTable() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { data: examsData, error: examsError, isLoading: examsLoading, mutate: mutateExams } = useSWR("/toxicological-exams", fetcher);

  const form = useForm<ToxicologicalExamFormValues>({
    resolver: zodResolver(toxicologicalExamSchema),
    defaultValues: {
      sampleId: "",
      patientName: "",
      dateCollected: "",
      labResult: "",
      analystName: "",
    },
  });

  const onSubmit = async (values: ToxicologicalExamFormValues) => {
    setIsSubmitting(true);
    try {
      await apiClient.post("/toxicological-exams", values);
      await mutateExams();
      toast.success("Exam data saved successfully!");
      setIsAddDialogOpen(false);
      form.reset();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save exam data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePDF = (examData: ToxicologicalExamFormValues) => {
    const doc = new jsPDF();
    doc.text("Official Toxicological Report", 10, 10);
    doc.text(`Sample ID: ${examData.sampleId}`, 10, 20);
    doc.text(`Patient Name: ${examData.patientName}`, 10, 30);
    doc.text(`Date Collected: ${examData.dateCollected}`, 10, 40);
    doc.text(`Lab Result: ${examData.labResult}`, 10, 50);
    doc.text(`Analyst Name: ${examData.analystName}`, 10, 60);
    doc.text(`Generated: ${new Date().toLocaleString("en-US", { timeZone: "EAT" })}`, 10, 70); // 09:28 AM EAT, September 15, 2025
    doc.save(`toxicological_report_${examData.sampleId}.pdf`);
  };

  // Filter and paginate data
  const filteredExams = examsData?.data.filter((exam: any) =>
    exam.sampleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.labResult.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.analystName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExams = filteredExams.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);

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
        Error loading exam data
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
            onChange={(e: { target: { value: SetStateAction<string>; }; }) => setSearchTerm(e.target.value)}
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
                    render={({ field }) => (
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
                    render={({ field }) => (
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
                    render={({ field }) => (
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
                    render={({ field }) => (
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
                    render={({ field }) => (
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
            {currentExams.map((exam: any) => (
              <TableRow key={exam.id} className="border-t border-blue-200 hover:bg-gray-200 transition-all duration-200">
                <TableCell className="p-3 font-medium text-blue-900">{exam.sampleId}</TableCell>
                <TableCell className="p-3 text-blue-900">{exam.patientName}</TableCell>
                <TableCell className="p-3 text-blue-900">{new Date(exam.dateCollected).toLocaleDateString()}</TableCell>
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
          Showing <strong className="text-blue-900">{indexOfFirstItem + 1}</strong> to <strong className="text-blue-900">{Math.min(indexOfLastItem, filteredExams.length)}</strong> of{' '}
          <strong className="text-blue-900">{filteredExams.length}</strong> results
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