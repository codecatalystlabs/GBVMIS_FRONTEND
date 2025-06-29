'use client';

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
} from 'lucide-react';
import useSWR from 'swr';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecentActivities } from '@/components/dashboard/recent-activities';
import { SalesChart } from '@/components/dashboard/sales-chart';
import { fetcher } from '@/lib/api';

export function DashboardOverview() {
  // Fetch counts for each entity
  const { data: victimsData } = useSWR('/victims', fetcher);
  const { data: casesData } = useSWR('/cases', fetcher);
  const { data: suspectsData } = useSWR('/suspects', fetcher);
  const { data: officersData } = useSWR('/police-officers', fetcher);
  const { data: facilitiesData } = useSWR('/health-facilities', fetcher);
  const { data: examinationsData } = useSWR('/examinations', fetcher);
  const { data: postsData } = useSWR('/police-posts', fetcher);
  const { data: chargesData } = useSWR('/charges', fetcher);

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
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Police Posts</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{postsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Police Officers
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{officersCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{casesCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Victims</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{victimsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspects</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suspectsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Charges</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chargesCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Health Facilities
            </CardTitle>
            <Hospital className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{facilitiesCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Examinations</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{examinationsCount}</div>
          </CardContent>
        </Card>
      </div>
      {/* Simple bar chart for cases per police post */}
      {Object.keys(casesPerPost).length > 0 && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Cases per Police Post</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(casesPerPost).map(([post, count]) => (
                  <div key={post} className="flex items-center gap-2">
                    <div className="w-40 truncate text-sm">{post}</div>
                    <div className="flex-1 bg-muted h-3 rounded">
                      <div
                        className="bg-primary h-3 rounded"
                        style={{
                          width: `${Math.max(
                            5,
                            (count / Math.max(...Object.values(casesPerPost))) *
                              100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="w-8 text-right text-sm">{count}</div>
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
