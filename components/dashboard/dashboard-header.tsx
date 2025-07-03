"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  Search,
  User,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/components/dashboard/sidebar-provider";
import { useAuth } from "@/context/AuthContext";

export function DashboardHeader() {
  const { toggle, toggleCollapse, isCollapsed } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();

  const { logout } = useAuth(); // Provides login and authentication state

  // Get the current page title from the pathname
  const getPageTitle = () => {
    const path = pathname.split("/").pop();
    if (!path || path === "dashboard") return "Dashboard";
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-blue-200 bg-gray-100 px-4 md:px-6 shadow-md">
      <div className="flex items-center gap-2 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="text-blue-900 hover:bg-gray-200"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-blue-900">
          <span className="hidden md:inline-block">GBVMIS</span>
        </Link>
        <span className="text-lg font-semibold text-blue-900 md:hidden">
          {getPageTitle()}
        </span>
        <div className="hidden md:block">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="text-blue-900 hover:bg-gray-200"
          >
            {isCollapsed ? (
              <PanelLeft className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2 md:gap-4">
        <form className="hidden md:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-blue-900" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-[200px] pl-8 md:w-[200px] lg:w-[300px] bg-white border border-blue-200 text-blue-900 placeholder-blue-400 focus:ring-2 focus:ring-blue-600 transition-all duration-300"
            />
          </div>
        </form>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-blue-900 hover:bg-gray-200"
          onClick={() => router.push("/dashboard/notifications")}
        >
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
          <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-red-500"></span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-blue-900 hover:bg-gray-200"
            >
              <User className="h-5 w-5" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-white border border-blue-200 text-blue-900"
          >
            <DropdownMenuLabel className="text-blue-900">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-blue-200" />
            <DropdownMenuItem className="hover:bg-gray-200 text-blue-900">
              <Link href="/dashboard/settings" className="flex w-full">
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-gray-200 text-blue-900">
              <Link href="/dashboard/settings" className="flex w-full">
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-blue-200" />
            <DropdownMenuItem
              onClick={() => {
                logout();
                router.push("/auth/login");
              }}
              className="hover:bg-gray-200 text-blue-900"
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}