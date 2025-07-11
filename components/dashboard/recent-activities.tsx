"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const activities = [
  {
    id: 1,
    user: {
      name: "John Smith",
      image: "/placeholder.svg?height=32&width=32",
      initials: "JS",
    },
    action: "created a new opportunity",
    target: "Acme Inc. Enterprise Deal",
    time: "2 hours ago",
  },
  {
    id: 2,
    user: {
      name: "Sarah Johnson",
      image: "/placeholder.svg?height=32&width=32",
      initials: "SJ",
    },
    action: "closed a deal with",
    target: "TechCorp Solutions",
    time: "5 hours ago",
  },
  {
    id: 3,
    user: {
      name: "Michael Brown",
      image: "/placeholder.svg?height=32&width=32",
      initials: "MB",
    },
    action: "added a new contact at",
    target: "Global Industries",
    time: "Yesterday",
  },
  {
    id: 4,
    user: {
      name: "Emily Davis",
      image: "/placeholder.svg?height=32&width=32",
      initials: "ED",
    },
    action: "scheduled a meeting with",
    target: "Innovative Startups",
    time: "Yesterday",
  },
  {
    id: 5,
    user: {
      name: "Robert Wilson",
      image: "/placeholder.svg?height=32&width=32",
      initials: "RW",
    },
    action: "updated the status of",
    target: "Strategic Partnership Deal",
    time: "2 days ago",
  },
];

export function RecentActivities() {
  return (
    <div className="space-y-4 bg-gray-100 p-4 rounded-lg border border-blue-200">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-start gap-4 p-2 hover:bg-gray-200 rounded-md transition-colors"
        >
          <Avatar className="h-8 w-8 border border-blue-200">
            <AvatarImage src={activity.user.image} alt={activity.user.name} />
            <AvatarFallback className="bg-blue-600 text-white">
              {activity.user.initials}
            </AvatarFallback>
          </Avatar>
          <div className="grid gap-1">
            <p className="text-sm">
              <span className="font-medium text-blue-900">{activity.user.name}</span>{" "}
              <span className="text-gray-600">{activity.action}</span>{" "}
              <span className="font-medium text-blue-900">{activity.target}</span>
            </p>
            <p className="text-xs text-gray-600">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}