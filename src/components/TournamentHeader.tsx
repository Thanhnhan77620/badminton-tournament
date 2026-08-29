import React from 'react';
import { Trophy, ShieldCheck, Lock, Sparkles, LayoutDashboard, Cloud, Wifi, RefreshCw } from 'lucide-react';
import { TournamentInfo } from '../types/tournament';
import { useTournament } from '../data/TournamentContext';

export type NavTab = 'overview' | 'schedule' | 'groups' | 'knockout' | 'rules';

interface TournamentHeaderProps {
  tournament: TournamentInfo;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenLogin: () => void;
}

export const TournamentHeader: React.FC<TournamentHeaderProps> = ({
  tournament,
  activeTab,
  onSelectTab,
  onOpenLogin,
}) => {
  const { isAdminAuthenticated, setViewMode, cloudSyncStatus, isRealtimeConnected, forceCloudSync } = useTournament();

  const navItems: { id: NavTab; label: string; badge?: string }[] = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'schedule', label: 'Lịch thi đấu & Kết quả' },
    { id: 'groups', label: 'Bảng đấu' },
    { id: 'knockout', label: 'Vòng Chung Kết' },
    { id: 'rules', label: 'Thể thức' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white transition-all">
      {/* Main Navigation Bar */}
      <div className="max-w-6xl mx-auto px-4 xl:px-6">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo & Name */}
          <button
            onClick={() => onSelectTab('overview')}
            className="flex items-center gap-2 lg:gap-3 group text-left focus:outline-none cursor-pointer min-w-0 shrink-0"
          >
            <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-900/30 border border-blue-400/30 group-hover:scale-105 transition-transform shrink-0">
              <Trophy className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.24em] text-blue-400 font-display leading-tight">
                BADMINTON
              </span>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-tight text-blue-400 font-display leading-tight">
                TOURNAMENT 2026
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-0.5 xl:space-x-1 min-w-0">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`relative px-2 py-1.5 xl:px-3.5 xl:py-2 rounded-lg text-[13px] xl:text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                  }`}
                >
                  {item.label}
                  {item.badge && (
                    <span className="px-1.5 py-0.2 text-[10px] font-extrabold rounded-full bg-rose-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action: Cloud Live Indicator + Admin BTC Button */}
          <div className="flex items-center gap-1.5 lg:gap-2 shrink-0">
            {/* Real-time Cloud Status Dot Indicator */}
            <div
              className={`flex items-center justify-center p-2 rounded-lg border transition-colors ${
                isRealtimeConnected
                  ? 'bg-emerald-950/40 border-emerald-800/50'
                  : cloudSyncStatus === 'syncing'
                  ? 'bg-blue-950/40 border-blue-800/50'
                  : 'bg-amber-950/40 border-amber-800/50'
              }`}
              title={
                isRealtimeConnected
                  ? 'Live: Đang kết nối Trực tiếp Firebase Firestore'
                  : cloudSyncStatus === 'syncing'
                  ? 'Sync: Đang đồng bộ dữ liệu đám mây'
                  : 'Local: Chế độ dữ liệu nội bộ (Local Storage)'
              }
            >
              <span className="relative flex h-2.5 w-2.5">
                {isRealtimeConnected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                {cloudSyncStatus === 'syncing' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                )}
                {!isRealtimeConnected && cloudSyncStatus !== 'syncing' && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-50"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isRealtimeConnected
                      ? 'bg-emerald-500'
                      : cloudSyncStatus === 'syncing'
                      ? 'bg-blue-500'
                      : 'bg-amber-500'
                  }`}
                ></span>
              </span>
            </div>

            {isAdminAuthenticated ? (
              <button
                onClick={() => setViewMode('admin')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 lg:px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-md shadow-amber-500/20 transition-all cursor-pointer whitespace-nowrap"
                title="Truy cập Bảng Điều Hành Quản Trị BTC"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Quản Trị</span> BTC
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-2.5 py-1.5 lg:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-all cursor-pointer whitespace-nowrap"
                title="Đăng nhập Ban Tổ Chức"
              >
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>BTC Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile/Tablet Horizontal Scrollable Tabs (shown until desktop nav kicks in at lg) */}
        <div className="lg:hidden flex items-center space-x-1 py-2 overflow-x-auto custom-scrollbar border-t border-slate-800">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                {item.label}
                {item.badge && (
                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-rose-500 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
