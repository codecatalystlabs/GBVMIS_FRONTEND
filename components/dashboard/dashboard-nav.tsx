"use client";

import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Briefcase,
  Phone,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSidebar } from "@/components/dashboard/sidebar-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMediaQuery } from "@/hooks/use-media-query";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "Police Officer", href: "/dashboard/police-officer", icon: Users },
  { title: "Police Posts", href: "/dashboard/policePosts", icon: Briefcase },
  { title: "Victims", href: "/dashboard/victims", icon: Users },
  { title: "Cases", href: "/dashboard/cases", icon: BarChart3 },
  { title: "Charges", href: "/dashboard/charges", icon: BarChart3 },
  { title: "Suspects", href: "/dashboard/suspects", icon: Briefcase },
  { title: "Facilities", href: "/dashboard/facilities", icon: Briefcase },
  {
    title: "Health Practitioners",
    href: "/dashboard/health-practitioners",
    icon: Phone,
  },
  { title: "Reports", href: "/dashboard/reports", icon: BarChart3 },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
  { title: "Help", href: "/dashboard/help", icon: HelpCircle },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { isOpen, isCollapsed, close } = useSidebar();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Update the close function to check if we're in the settings page
  const isSettingsPage = pathname.includes("/dashboard/settings");

  // Handle navigation click - only close sidebar on mobile
  const handleNavClick = () => {
    if (isMobile) {
      close();
    }
  };

  return (
    <>
      {/* Overlay for mobile - don't close automatically in settings page */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-gray-100/80 backdrop-blur-sm md:hidden"
          onClick={(e) => {
            // Prevent closing if we're in settings page and clicking on a form element
            if (
              isSettingsPage &&
              (e.target as HTMLElement).closest(
                "form, button, [role='tablist']"
              )
            ) {
              e.stopPropagation();
              return;
            }
            close();
          }}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 flex flex-col border-r bg-gray-100 transition-all duration-300 ease-in-out md:sticky",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-[70px]" : "w-64"
        )}
      >
        <ScrollArea className="flex-1 py-2">
          <nav className={cn("grid gap-1 px-2", isCollapsed && "px-1")}>
            <TooltipProvider delayDuration={0}>
              {navItems.map((item) => {
                const NavItem = (
                  <Button
                    key={item.href}
                    variant={pathname === item.href ? "secondary" : "ghost"}
                    className={cn(
                      "flex h-10 w-full items-center justify-start gap-2 px-4 text-sm font-medium transition-all duration-200",
                      pathname === item.href
                        ? "bg-blue-200 text-blue-900"
                        : "text-blue-900 hover:bg-blue-50",
                      isCollapsed && "justify-center px-0"
                    )}
                    asChild
                  >
                    <Link href={item.href} onClick={handleNavClick}>
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && (
                        <>
                          <span>{item.title}</span>
                          {pathname === item.href && (
                            <ChevronRight className="ml-auto h-4 w-4 text-blue-900" />
                          )}
                        </>
                      )}
                    </Link>
                  </Button>
                );

                return isCollapsed ? (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{NavItem}</TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="bg-white border border-blue-200 text-blue-900"
                    >
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  NavItem
                );
              })}
            </TooltipProvider>
          </nav>
        </ScrollArea>
        <div
          className={cn(
            "border-t border-blue-200 p-4",
            isCollapsed && "flex justify-center p-2"
          )}
        >
          {isCollapsed ? (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-900" />
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="bg-white border border-blue-200 text-blue-900"
                >
                  John Doe (Admin)
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <div className="flex items-center gap-2 text-blue-900">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
              <div className="grid gap-0.5 text-sm">
                <div className="font-medium">John Doe</div>
                <div className="text-xs">Admin</div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}