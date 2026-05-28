'use client';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className = '', variant = 'text', width, height }: SkeletonProps) {
  const baseClass = 'animate-pulse bg-slate-200';
  
  const variantClass = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }[variant];

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div className={`${baseClass} ${variantClass} ${className}`} style={style} />
  );
}

// Profile Card Skeleton
export function ProfileCardSkeleton() {
  return (
    <div className="bg-white border border-[var(--border)] rounded-[20px] p-6">
      <div className="flex items-start gap-4">
        <Skeleton variant="circular" width={56} height={56} />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height={20} />
          <Skeleton width="40%" height={14} />
          <div className="flex gap-2 mt-2">
            <Skeleton width={80} height={24} className="rounded-full" />
            <Skeleton width={100} height={24} className="rounded-full" />
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Skeleton height={60} className="rounded-xl" />
        <Skeleton height={60} className="rounded-xl" />
      </div>
    </div>
  );
}

// Profile Detail Skeleton
export function ProfileDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[var(--border)] rounded-[20px] p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton variant="circular" width={120} height={120} />
          <Skeleton width="50%" height={28} />
          <Skeleton width="30%" height={20} className="rounded-full" />
        </div>
      </div>
      {/* Content */}
      <div className="bg-white border border-[var(--border)] rounded-[20px] p-6 space-y-4">
        <Skeleton width="30%" height={16} />
        <Skeleton height={80} className="rounded-xl" />
      </div>
    </div>
  );
}

// Directory Skeleton
export function DirectorySkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProfileCardSkeleton key={i} />
      ))}
    </div>
  );
}
