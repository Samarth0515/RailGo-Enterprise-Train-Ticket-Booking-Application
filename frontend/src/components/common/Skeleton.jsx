import React from 'react';

export const Skeleton = ({ className = '', rounded = 'rounded-lg' }) => {
  return (
    <div
      className={`bg-slate-200/70 animate-pulse ${rounded} ${className}`}
    />
  );
};

export const TrainCardSkeleton = () => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-subtle space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      <div className="grid grid-cols-3 items-center py-2">
        <div className="space-y-1">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-0.5 w-full" />
          <Skeleton className="h-3 w-12" />
        </div>
        <div className="space-y-1 text-right flex flex-col items-end">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>

      <div className="flex gap-2 pt-2 border-t border-slate-100">
        <Skeleton className="h-14 w-24 rounded-xl" />
        <Skeleton className="h-14 w-24 rounded-xl" />
        <Skeleton className="h-14 w-24 rounded-xl" />
      </div>
    </div>
  );
};
