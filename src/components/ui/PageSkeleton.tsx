"use client";

import React from "react";
import { cn } from "@/lib/utils";

// Generic pulse skeleton block
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-white/5 dark:bg-white/5",
        className,
      )}
    />
  );
}

// Full dashboard-style loading skeleton
export default function PageSkeleton({
  cards = 4,
  rows = 5,
  title = true,
}: {
  cards?: number;
  rows?: number;
  title?: boolean;
}) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      {title && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-56 rounded-xl" />
            <Skeleton className="h-4 w-40 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
      )}

      {/* Summary cards */}
      <div
        className={`grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(cards, 4)}`}
      >
        {Array.from({ length: cards }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-background-elevated p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded-lg" />
              <Skeleton className="h-7 w-7 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-32 rounded-xl" />
            <Skeleton className="h-3 w-20 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Main content rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1].map((col) => (
          <div
            key={col}
            className="rounded-2xl border border-border bg-background-elevated p-5 space-y-3"
          >
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-36 rounded-lg" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-3/4 rounded-lg" />
                  <Skeleton className="h-3 w-1/2 rounded-lg" />
                </div>
                <Skeleton className="h-4 w-16 rounded-lg shrink-0" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Spinner centered for quick inline loads
export function CenteredSpinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-border" />
        <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
      {label && (
        <p className="text-sm text-foreground-muted animate-pulse">{label}</p>
      )}
    </div>
  );
}
