"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function CategorySkeleton() {
  return (
    <div className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-9 w-9" /> {/* Edit button */}
        <Skeleton className="h-9 w-9" /> {/* Delete button */}
        <Skeleton className="h-9 w-24" /> {/* View Details button */}
      </div>
    </div>
  );
}
