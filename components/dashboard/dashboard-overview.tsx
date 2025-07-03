"use client";

import {
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  Phone,
  Shield,
  Hospital,
  FileText,
  UserCheck,
  MapPin,
  Gavel,
} from "lucide-react";
import useSWR from "swr";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecentActivities } from "@/components/dashboard/recent-activities";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { fetcher } from "@/lib/api";

export function DashboardOverview() {
  // Fetch counts for each entity
  const { data: victimsData } = useSWR("/victims", fetcher);
  const { data: casesData } = useSWR("/cases", fetcher);
  const { data: suspectsData } = useSWR("/suspects", fetcher);
  const { data: officersData } = useSWR("/police-officers", fetcher);
  const { data: facilitiesData } = useSWR("/health-facilities", fetcher);
  const { data: examinationsData } = useSWR("/examinations", fetcher);
  const { data: postsData } = useSWR("/police-posts", fetcher);
  const { data: chargesData } = useSWR("/charges", fetcher);

  const victimsCount = victimsData?.data?.length || 0;
  const casesCount = casesData?.data?.length || 0;
  const suspectsCount = suspectsData?.data?.length || 0;
  const officersCount = officersData?.data?.length || 0;
  const facilitiesCount = facilitiesData?.data?.length || 0;
  const examinationsCount = examinationsData?.data?.length || 0;
  const postsCount = postsData?.data?.length || 0;
  const chargesCount = chargesData?.data?.length || 0;

  // Prepare cases per police post for a simple bar chart
  let casesPerPost: Record<string, number> = {};
  if (casesData?.data && postsData?.data) {
    postsData.data.forEach((post: any) => {
      casesPerPost[post.name] = 0;
    });
    casesData.data.forEach((c: any) => {
      const post = postsData.data.find(
        (p: any) => p.id === c.police_post_id || p.ID === c.police_post_id
      );
      if (post) {
        casesPerPost[post.name] = (casesPerPost[post.name] || 0) + 1;
      }
    });
  }

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-100 rounded-xl shadow-lg">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white">
            <CardTitle className="text-sm font-medium text-blue-900">
              Police Posts
            </CardTitle>
            <MapPin className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent className="bg-white">
            <div className="text-2xl font-bold text-blue-900">{postsCount}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white">
            <CardTitle className="text-sm font-medium text-blue-900">
              Police Officers
            </CardTitle>
            <Shield className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent className="bg-white">
            <div className="text-2xl font-bold text-blue-900">{officersCount}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white">
            <CardTitle className="text-sm font-medium text-blue-900">Cases</CardTitle>
            <FileText className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent className="bg-white">
            <div className="text-2xl font-bold text-blue-900">{casesCount}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white">
            <CardTitle className="text-sm font-medium text-blue-900">Victims</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent className="bg-white">
            <div className="text-2xl font-bold text-blue-900">{victimsCount}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white">
            <CardTitle className="text-sm font-medium text-blue-900">Suspects</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent className="bg-white">
            <div className="text-2xl font-bold text-blue-900">{suspectsCount}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white">
            <CardTitle className="text-sm font-medium text-blue-900">Charges</CardTitle>
            <Gavel className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent className="bg-white">
            <div className="text-2xl font-bold text-blue-900">{chargesCount}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white">
            <CardTitle className="text-sm font-medium text-blue-900">
              Health Facilities
            </CardTitle>
            <Hospital className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent className="bg-white">
            <div className="text-2xl font-bold text-blue-900">{facilitiesCount}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-white">
            <CardTitle className="text-sm font-medium text-blue-900">Examinations</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent className="bg-white">
            <div className="text-2xl font-bold text-blue-900">{examinationsCount}</div>
          </CardContent>
        </Card>
      </div>
      {/* Simple bar chart for cases per police post */}
      {Object.keys(casesPerPost).length > 0 && (
        <div className="mt-8">
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Cases per Police Post</CardTitle>
            </CardHeader>
            <CardContent className="bg-white">
              <div className="space-y-2">
                {Object.entries(casesPerPost).map(([post, count]) => (
                  <div key={post} className="flex items-center gap-2">
                    <div className="w-40 truncate text-sm text-blue-900">{post}</div>
                    <div className="flex-1 bg-gray-200 h-3 rounded">
                      <div
                        className="bg-blue-800 h-3 rounded"
                        style={{
                          width: `${Math.max(
                            5,
                            (count / Math.max(...Object.values(casesPerPost))) * 100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="w-8 text-right text-sm text-blue-900">{count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}