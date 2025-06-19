"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { LeadSourceChart } from "@/components/dashboard/lead-source-chart"

export function ReportsDashboard() {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Sales Performance</CardTitle>
                <CardDescription>Monthly sales performance</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <SalesChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Lead Sources</CardTitle>
                <CardDescription>Distribution of lead sources</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <LeadSourceChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Account Growth</CardTitle>
                <CardDescription>Year-over-year account increase</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Placeholder for account growth chart or metrics.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="sales">
          <p className="text-muted-foreground">Detailed sales content goes here.</p>
        </TabsContent>
        <TabsContent value="leads">
          <p className="text-muted-foreground">Lead tracking and breakdown here.</p>
        </TabsContent>
        <TabsContent value="accounts">
          <p className="text-muted-foreground">Account management metrics here.</p>
        </TabsContent>
      </Tabs>
    </div>
  )
}
