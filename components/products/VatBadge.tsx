import React from 'react';

export interface VatBadgeProps {
  vatStatus?: string | null;
  className?: string;
}

export function VatBadge({ vatStatus, className = '' }: VatBadgeProps) {
  const status = vatStatus || 'INCLUDED';

  if (status === 'INCLUDED') {
    return (
      <span className={`inline-flex items-center text-[10px] sm:text-xs font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 ${className}`}>
        Đã gồm VAT
      </span>
    );
  }

  if (status === 'EXCLUDED') {
    return (
      <span className={`inline-flex items-center text-[10px] sm:text-xs font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200/60 ${className}`}>
        Chưa gồm VAT
      </span>
    );
  }

  if (status === 'NONE') {
    return (
      <span className={`inline-flex items-center text-[10px] sm:text-xs font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60 ${className}`}>
        Giá không VAT
      </span>
    );
  }

  return null;
}
