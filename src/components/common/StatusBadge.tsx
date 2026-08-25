import React from 'react';
import { MatchStatus, TournamentStatus } from '../../types/tournament';

interface StatusBadgeProps {
  status: MatchStatus | TournamentStatus | 'QUALIFIED' | 'ELIMINATED';
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-semibold',
  };

  switch (status) {
    case 'LIVE':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses[size]}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
          </span>
          Trực Tiếp
        </span>
      );

    case 'FINISHED':
    case 'COMPLETED':
      return (
        <span
          className={`inline-flex items-center rounded-full font-medium bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses[size]}`}
        >
          Đã Kết Thúc
        </span>
      );

    case 'UPCOMING':
      return (
        <span
          className={`inline-flex items-center rounded-full font-medium bg-blue-50 text-blue-700 border border-blue-200/80 ${sizeClasses[size]}`}
        >
          Sắp Diễn Ra
        </span>
      );

    case 'IN_PROGRESS':
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses[size]}`}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Đang Diễn Ra
        </span>
      );

    case 'QUALIFIED':
      return (
        <span
          className={`inline-flex items-center gap-1 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses[size]}`}
        >
          <span className="text-emerald-600 font-bold">✓</span>
          Vào Bán Kết
        </span>
      );

    case 'ELIMINATED':
      return (
        <span
          className={`inline-flex items-center rounded-full font-normal bg-slate-100 text-slate-500 ${sizeClasses[size]}`}
        >
          Dừng bước
        </span>
      );

    default:
      return null;
  }
};
