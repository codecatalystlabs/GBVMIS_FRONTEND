"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { LeadSourceChart } from "@/components/dashboard/lead-source-chart";

export function ReportsDashboard() {
  return (
    <div className="space-y-4 bg-gray-100 p-4 rounded-lg">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-white border border-blue-200 rounded-md">
          <TabsTrigger
            value="overview"
            className="text-blue-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="sales"
            className="text-blue-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Sales
          </TabsTrigger>
          <TabsTrigger
            value="leads"
            className="text-blue-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Leads
          </TabsTrigger>
          <TabsTrigger
            value="accounts"
            className="text-blue-900 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            Accounts
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Sales Performance</CardTitle>
                <CardDescription className="text-gray-600">
                  Monthly sales performance
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <SalesChart />
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Lead Sources</CardTitle>
                <CardDescription className="text-gray-600">
                  Distribution of lead sources
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <LeadSourceChart />
              </CardContent>
            </Card>
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Account Growth</CardTitle>
                <CardDescription className="text-gray-600">
                  Year-over-year account increase
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Placeholder for account growth chart or metrics.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="sales">
          <p className="text-gray-600">Detailed sales content goes here.</p>
        </TabsContent>
        <TabsContent value="leads">
          <p className="text-gray-600">Lead tracking and breakdown here.</p>
        </TabsContent>
        <TabsContent value="accounts">
          <p className="text-gray-600">Account management metrics here.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}