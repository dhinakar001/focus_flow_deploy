/**
 * Skeleton Loader Component
 * 
 * Provides loading placeholders for async content
 * 
 * @module components/ui/Skeleton
 */

import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Skeleton Component
 */
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-neutral-200', className)}
      {...props}
    />
  );
}

/**
 * Skeleton Text Component
 */
export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton Card Component
 */
export function SkeletonCard({ className }) {
  return (
    <div className={cn('rounded-lg border border-neutral-200 p-6', className)}>
      <Skeleton className="h-6 w-1/3 mb-4" />
      <SkeletonText lines={3} />
    </div>
  );
}

