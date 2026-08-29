import React, { useState, useEffect } from 'react';
import { Clock, Flame, Zap, Timer as TimerIcon } from 'lucide-react';

interface CountdownTimerProps {
  scheduledDate?: string; // e.g. "12/09/2026", "2026-09-12", "12 Tháng 09, 2026"
  scheduledTime?: string; // e.g. "08:00"
  targetDate?: Date;
  title?: string;
  variant?: 'banner' | 'card' | 'badge' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
  isStartingSoon: boolean; // < 30 mins
  isUrgent: boolean; // < 10 mins
}

/**
 * Robust date parser supporting DD/MM/YYYY, YYYY-MM-DD, Vietnamese "12 Tháng 09, 2026", ISO strings, etc.
 */
export function parseMatchDateTime(dateStr?: string, timeStr?: string): Date {
  // Default target: 12 Sep 2026 at 08:00
  const defaultTarget = new Date(2026, 8, 12, 8, 0, 0);

  if (!dateStr || typeof dateStr !== 'string') {
    return defaultTarget;
  }

  try {
    const timeParts = (timeStr || '08:00').split(':');
    const hours = parseInt(timeParts[0] || '8', 10);
    const minutes = parseInt(timeParts[1] || '0', 10);

    const trimmed = dateStr.trim();

    // 1. Vietnamese text: e.g. "12 Tháng 09, 2026" or "12 Tháng 9 2026"
    const vnMatch = trimmed.match(/(\d{1,2})\s*Tháng\s*(\d{1,2}),?\s*(\d{4})/i);
    if (vnMatch) {
      const day = parseInt(vnMatch[1], 10);
      const month = parseInt(vnMatch[2], 10) - 1;
      const year = parseInt(vnMatch[3], 10);
      return new Date(year, month, day, hours, minutes, 0);
    }

    // 2. ISO or YYYY-MM-DD format
    if (trimmed.includes('-')) {
      if (trimmed.includes('T')) {
        const d = new Date(trimmed);
        if (!isNaN(d.getTime())) return d;
      }
      const parts = trimmed.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        return new Date(year, month, day, hours, minutes, 0);
      }
    }

    // 3. DD/MM/YYYY format
    const slashParts = trimmed.split('/');
    if (slashParts.length === 3) {
      const day = parseInt(slashParts[0], 10);
      const month = parseInt(slashParts[1], 10) - 1;
      const year = parseInt(slashParts[2], 10);
      return new Date(year, month, day, hours, minutes, 0);
    }

    // 4. Standard Date parsing fallback
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      parsed.setHours(hours, minutes, 0, 0);
      return parsed;
    }
  } catch {
    // Return default on error
  }

  return defaultTarget;
}

function calculateTimeLeft(targetDate: Date): TimeLeft {
  const now = new Date();
  const diffMs = targetDate.getTime() - now.getTime();
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));

  if (totalSeconds <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      isExpired: true,
      isStartingSoon: false,
      isUrgent: false,
    };
  }

  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    isExpired: false,
    isStartingSoon: totalSeconds < 1800, // < 30 mins
    isUrgent: totalSeconds < 600, // < 10 mins
  };
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  scheduledDate,
  scheduledTime,
  targetDate: propTargetDate,
  title,
  variant = 'card',
  size = 'md',
  showLabels = true,
  className = '',
}) => {
  const targetDate = React.useMemo(() => {
    if (propTargetDate instanceof Date && !isNaN(propTargetDate.getTime())) {
      return propTargetDate;
    }
    return parseMatchDateTime(scheduledDate, scheduledTime);
  }, [scheduledDate, scheduledTime, propTargetDate]);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(targetDate));

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  // BADGE VARIANT (Very compact, for cards / table rows)
  if (variant === 'badge') {
    if (timeLeft.isExpired) {
      return (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse ${className}`}
        >
          <Zap className="w-2.5 h-2.5 text-rose-600" />
          <span>Đang thi đấu / Sắp ra sân</span>
        </span>
      );
    }
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold tabular-nums ${
          timeLeft.isUrgent
            ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
            : timeLeft.isStartingSoon
            ? 'bg-amber-100 text-amber-800 border border-amber-300'
            : 'bg-blue-50 text-blue-800 border border-blue-200/80'
        } ${className}`}
      >
        <TimerIcon
          className={`w-3 h-3 ${
            timeLeft.isUrgent
              ? 'text-rose-600 animate-spin'
              : timeLeft.isStartingSoon
              ? 'text-amber-600'
              : 'text-blue-600'
          }`}
        />
        <span>
          {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
          {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
        </span>
      </div>
    );
  }

  // MINIMAL VARIANT
  if (variant === 'minimal') {
    if (timeLeft.isExpired) {
      return (
        <div className={`flex items-center gap-1 text-xs font-bold text-rose-600 animate-pulse ${className}`}>
          <Flame className="w-3.5 h-3.5" />
          <span>Đang diễn ra</span>
        </div>
      );
    }
    return (
      <div className={`flex items-center gap-1 text-xs tabular-nums font-mono ${className}`}>
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        {timeLeft.days > 0 && <span className="font-semibold text-slate-700">{timeLeft.days}d</span>}
        <span className="font-bold text-slate-900">
          {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
        </span>
      </div>
    );
  }

  // CARD VARIANT (Used inside MatchCard)
  if (variant === 'card') {
    if (timeLeft.isExpired) {
      return (
        <div
          className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border bg-rose-50 border-rose-200 text-rose-900 ${className}`}
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
            <Flame className="w-3.5 h-3.5 animate-bounce" />
            <span>Trận đấu chuẩn bị bắt đầu!</span>
          </div>
          <span className="text-[11px] font-bold text-rose-600 bg-white px-2 py-0.5 rounded border border-rose-200">
            Sắp ra sân
          </span>
        </div>
      );
    }

    return (
      <div
        className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border transition-all ${
          timeLeft.isUrgent
            ? 'bg-rose-50/90 border-rose-200 text-rose-900 shadow-2xs'
            : timeLeft.isStartingSoon
            ? 'bg-amber-50/80 border-amber-200 text-amber-950'
            : 'bg-slate-50 border-slate-200/90 text-slate-800'
        } ${className}`}
      >
        <div className="flex items-center gap-1.5">
          {timeLeft.isUrgent ? (
            <Flame className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
          ) : timeLeft.isStartingSoon ? (
            <Zap className="w-3.5 h-3.5 text-amber-600" />
          ) : (
            <Clock className="w-3.5 h-3.5 text-blue-600" />
          )}
          <span className="text-[11px] font-semibold">
            {timeLeft.isUrgent
              ? 'Sắp thi đấu:'
              : timeLeft.isStartingSoon
              ? 'Chuẩn bị ra sân:'
              : 'Đếm ngược khởi tranh:'}
          </span>
        </div>

        <div className="flex items-center gap-1 font-mono text-xs font-black tabular-nums">
          {timeLeft.days > 0 && (
            <>
              <span className="bg-white px-1.5 py-0.5 rounded shadow-2xs border border-slate-200/80 text-slate-900">
                {timeLeft.days}
                <span className="text-[9px] font-sans font-normal text-slate-400 ml-0.5">d</span>
              </span>
              <span className="text-slate-400">:</span>
            </>
          )}
          <span className="bg-white px-1.5 py-0.5 rounded shadow-2xs border border-slate-200/80 text-slate-900">
            {pad(timeLeft.hours)}
          </span>
          <span className="text-slate-400 animate-pulse">:</span>
          <span className="bg-white px-1.5 py-0.5 rounded shadow-2xs border border-slate-200/80 text-slate-900">
            {pad(timeLeft.minutes)}
          </span>
          <span className="text-slate-400 animate-pulse">:</span>
          <span
            className={`px-1.5 py-0.5 rounded shadow-2xs border ${
              timeLeft.isUrgent
                ? 'bg-rose-600 text-white border-rose-700'
                : 'bg-slate-900 text-white border-slate-900'
            }`}
          >
            {pad(timeLeft.seconds)}
          </span>
        </div>
      </div>
    );
  }

  // BANNER / HERO VARIANT (Full width scoreboard countdown with 4 prominent blocks)
  const isExpired = timeLeft.isExpired;

  return (
    <div className={`w-full space-y-2.5 ${className}`}>
      {/* Top Header Label */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-300">
            {title || 'ĐẾM NGƯỢC THỜI GIAN KHỞI TRANH GIẢI ĐẤU'}
          </span>
        </div>

        {isExpired && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
            <Flame className="w-3 h-3 text-rose-400" />
            ĐANG DIỄN RA
          </span>
        )}
      </div>

      {/* 4 Digital Blocks Board */}
      <div className="w-full grid grid-cols-4 gap-1.5 sm:gap-2 font-mono">
        {/* Days Block */}
        <div className="flex flex-col items-center justify-center p-1.5 sm:p-2.5 rounded-lg bg-slate-950/80 border border-slate-700/90 shadow-inner group hover:border-blue-500/50 transition-colors">
          <div className="text-xl sm:text-2xl md:text-3xl font-black text-white tabular-nums tracking-tight">
            {pad(timeLeft.days)}
          </div>
          {showLabels && (
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase mt-0.5 sm:mt-1 font-sans tracking-wider">
              NGÀY
            </span>
          )}
        </div>

        {/* Hours Block */}
        <div className="flex flex-col items-center justify-center p-1.5 sm:p-2.5 rounded-lg bg-slate-950/80 border border-slate-700/90 shadow-inner group hover:border-blue-500/50 transition-colors">
          <div className="text-xl sm:text-2xl md:text-3xl font-black text-white tabular-nums tracking-tight">
            {pad(timeLeft.hours)}
          </div>
          {showLabels && (
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase mt-0.5 sm:mt-1 font-sans tracking-wider">
              GIỜ
            </span>
          )}
        </div>

        {/* Minutes Block */}
        <div className="flex flex-col items-center justify-center p-1.5 sm:p-2.5 rounded-lg bg-slate-950/80 border border-slate-700/90 shadow-inner group hover:border-blue-500/50 transition-colors">
          <div className="text-xl sm:text-2xl md:text-3xl font-black text-white tabular-nums tracking-tight">
            {pad(timeLeft.minutes)}
          </div>
          {showLabels && (
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase mt-0.5 sm:mt-1 font-sans tracking-wider">
              PHÚT
            </span>
          )}
        </div>

        {/* Seconds Block */}
        <div
          className={`flex flex-col items-center justify-center p-1.5 sm:p-2.5 rounded-lg border shadow-inner transition-all ${
            timeLeft.isUrgent || isExpired
              ? 'bg-rose-600/90 border-rose-500 text-white shadow-rose-950/50'
              : 'bg-blue-600/90 border-blue-500 text-white shadow-blue-950/50'
          }`}
        >
          <div className="text-xl sm:text-2xl md:text-3xl font-black text-white tabular-nums tracking-tight">
            {pad(timeLeft.seconds)}
          </div>
          {showLabels && (
            <span
              className={`text-[9px] sm:text-[10px] font-bold uppercase mt-0.5 sm:mt-1 font-sans tracking-wider ${
                timeLeft.isUrgent || isExpired ? 'text-rose-200' : 'text-blue-100'
              }`}
            >
              GIÂY
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

