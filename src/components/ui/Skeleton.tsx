'use client';

import React from 'react';
import { useSettings } from '@/lib/settings-context';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = '', style }: SkeletonProps) {
  const { reduceMotion } = useSettings();

  return (
    <div
      style={style}
      className={`relative overflow-hidden bg-[#18214a]/70 border-2 border-[#070b16] rounded-2xl ${className}`}
    >
      {!reduceMotion && (
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      )}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Banner Skeleton */}
      <div className="brawl-card p-6 border-3 border-[#070b16] bg-[#161c40] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Skeleton className="w-24 h-24 rounded-3xl shrink-0" />
          <div className="flex-1 w-full space-y-3">
            <Skeleton className="h-7 w-48 rounded-xl" />
            <Skeleton className="h-4 w-72 max-w-full rounded-lg" />
            <div className="flex gap-3 pt-1">
              <Skeleton className="h-10 w-32 rounded-xl" />
              <Skeleton className="h-10 w-28 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="brawl-card p-5 border-3 border-[#070b16] bg-[#141b3d] space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="w-10 h-10 rounded-2xl" />
              <Skeleton className="w-12 h-5 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-24 rounded-xl" />
            <Skeleton className="h-3 w-32 rounded-md" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="brawl-card p-6 border-3 border-[#070b16] bg-[#141b3d] space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-44 rounded-xl" />
            <Skeleton className="h-3.5 w-60 rounded-md" />
          </div>
          <div className="flex gap-1.5">
            <Skeleton className="h-8 w-14 rounded-lg" />
            <Skeleton className="h-8 w-14 rounded-lg" />
            <Skeleton className="h-8 w-14 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}
