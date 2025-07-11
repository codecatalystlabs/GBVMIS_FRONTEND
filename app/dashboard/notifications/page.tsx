"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { apiClient, fetcher } from "@/lib/api";
import { toast } from "react-toastify";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardHeader } from "@/components/dashboard/dashboard-header"; 

// Global CSS for hide-scrollbar (move to styles/global.css in production)
const hideScrollbarStyles = `
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
    overflow: auto;
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
`;

// Type definition for apiClient
interface ApiClient {
  get<T>(url: string, config?: any): Promise<T>;
  post<T>(url: string, data?: any, config?: any): Promise<T>;
  put<T>(url: string, data?: any, config?: any): Promise<T>;
  delete<T>(url: string, config?: any): Promise<T>;
}

export default function NotificationsPage() {
  const { data, error, isLoading, mutate } = useSWR("/notifications", fetcher);
  const notifications = data?.data || [];
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingNotification, setDeletingNotification] = useState<any | null>(
    null
  );
  const [formLoading, setFormLoading] = useState(false);

  const handleMarkAsRead = async (notificationId: string | number) => {
    setFormLoading(true);
    try {
      await (apiClient as unknown as ApiClient).put(`/notification/${notificationId}/read`, {});
      toast.success("Notification marked as read!");
      mutate();
    } catch (err: any) {
      toast.error(
        err?.info?.message || err?.message || "Failed to mark as read"
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = (notification: any) => {
    setDeletingNotification(notification);
    setDeleteDialogOpen(true);
  };

  const handleDeleteNotification = async () => {
    if (!deletingNotification) return;
    setFormLoading(true);
    try {
      await (apiClient as unknown as ApiClient).delete(
        `/notification/${deletingNotification.id ?? deletingNotification.ID}`
      );
      toast.success("Notification deleted successfully!");
      setDeleteDialogOpen(false);
      setDeletingNotification(null);
      mutate();
    } catch (err: any) {
      toast.error(
        err?.info?.message || err?.message || "Failed to delete notification"
      );
    } finally {
      setFormLoading(false);
    }
  };

  if (isLoading)
    return <div className="text-blue-900 text-center py-4">Loading...</div>;
  if (error)
    return (
      <div className="text-red-500 text-center py-4">
        Failed to load notifications.
      </div>
    );

  return (
    <>
      <style>{hideScrollbarStyles}</style>
      <div className="min-h-screen bg-gray-100">
        <DashboardHeader />
        <main className="p-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">
            Notifications
          </h2>
          <div className="rounded-xl border border-blue-200 bg-white shadow-lg hide-scrollbar overflow-auto max-h-[calc(100vh-200px)]">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-blue-200 hover:bg-gray-200">
                  <TableHead className="w-[80px] text-blue-900">ID</TableHead>
                  <TableHead className="text-blue-900">Message</TableHead>
                  <TableHead className="text-blue-900">Date</TableHead>
                  <TableHead className="text-blue-900">Status</TableHead>
                  <TableHead className="w-[40px] text-blue-900">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-blue-900 py-4"
                    >
                      No notifications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  notifications.map((notification: any, idx: number) => (
                    <TableRow
                      key={notification.id ?? notification.ID ?? `row-${idx}`}
                      className="border-t border-blue-200 hover:bg-gray-200 transition-all duration-200"
                    >
                      <TableCell className="text-blue-900">
                        {notification.id ?? notification.ID}
                      </TableCell>
                      <TableCell className="text-blue-900">
                        {notification.message || "No message"}
                      </TableCell>
                      <TableCell className="text-blue-900">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-blue-900">
                        {notification.read ? "Read" : "Unread"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-blue-900 hover:bg-gray-200"
                            >
                              <MoreHorizontal className="h-4 w-4 text-blue-900" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-white border border-blue-200 text-blue-900"
                          >
                            <DropdownMenuItem
                              onClick={() =>
                                handleMarkAsRead(
                                  notification.id ?? notification.ID
                                )
                              }
                              className="hover:bg-gray-200 text-blue-900"
                              disabled={formLoading || notification.read}
                            >
                              Mark as Read
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-blue-200" />
                            <DropdownMenuItem
                              className="text-red-500 hover:bg-red-100"
                              onClick={() => handleDeleteClick(notification)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </main>
        {/* Delete Confirm Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-white border border-blue-200 text-blue-900">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-blue-900">
                Delete Notification
              </AlertDialogTitle>
              <AlertDialogDescription className="text-blue-900">
                Are you sure you want to delete this notification? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setDeletingNotification(null);
                }}
                disabled={formLoading}
                className="bg-white border border-blue-200 text-blue-900 hover:bg-gray-200"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteNotification}
                disabled={formLoading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {formLoading ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}