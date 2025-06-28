import type { Metadata } from "next";
import { ChargesTable } from "@/components/dashboard/charges-table";

export const metadata: Metadata = {
	title: "Charges",
	description: "Manage charges and case classifications",
};

export default function ChargesPage() {
	return (
		<div className="flex flex-col gap-4">
			<h1 className="text-2xl font-bold">Charges</h1>
			<ChargesTable />
		</div>
	);
}
