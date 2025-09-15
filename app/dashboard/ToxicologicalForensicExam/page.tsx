import type { Metadata } from "next";
import ToxicologicalForensicExamTable from "@/components/dashboard/ToxicologicalForensicExamTable";

export const metadata: Metadata = {
  title: "Toxicological & Forensic Exam",
  description: "Manage Toxicological & Forensic Exams",
};

export default function ToxicologicalForensicExamPage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <h1 className="text-2xl font-bold">Toxicological & Forensic Exam</h1>
      <ToxicologicalForensicExamTable />
    </div>
  );
}