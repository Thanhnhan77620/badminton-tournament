import React, { useState } from 'react';
import { useTournament } from '../../data/TournamentContext';
import {
  Trophy,
  Users,
  Layers,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  PlayCircle,
  FileEdit,
  RotateCcw,
  Cloud,
  RefreshCw,
  Database,
} from 'lucide-react';
import { AdminSectionId } from './AdminPortal';

interface AdminDashboardProps {
  onNavigateSection: (sec: AdminSectionId) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateSection }) => {
  const {
    tournament,
    pairs,
    matches,
    players,
    standingsA,
    standingsB,
    resetAllToDefault,
    clearAllData,
    loadDemoData,
    cloudSyncStatus,
    isRealtimeConnected,
    lastSyncedAt,
    forceCloudSync,
  } = useTournament();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showDemoConfirm, setShowDemoConfirm] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  const handleForceSync = async () => {
    setIsManualSyncing(true);
    await forceCloudSync();
    setTimeout(() => setIsManualSyncing(false), 600);
  };

  // Stats calculation
  const totalMatches = matches.length;
  const finishedMatches = matches.filter(m => m.status === 'FINISHED').length;
  const liveMatches = matches.filter(m => m.status === 'LIVE').length;
  const upcomingMatches = matches.filter(m => m.status === 'UPCOMING').length;
  const progressPercent = totalMatches > 0 ? Math.round((finishedMatches / totalMatches) * 100) : 0;

  const pairsA = pairs.filter(p => p.group === 'A');
  const pairsB = pairs.filter(p => p.group === 'B');

  const topA = standingsA.slice(0, 2);
  const topB = standingsB.slice(0, 2);

  return (
    <div className="space-y-2.5">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md relative overflow-hidden">
        {/* Glow decorative */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3.5">
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Hệ Thống Quản Trị Giải Đấu Trực Tuyến</span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold font-display tracking-tight text-white">
              {tournament.name}
            </h1>
            <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed">
              Chào mừng Ban Tổ Chức! Mọi thay đổi về thông tin giải, danh sách cặp đấu và nhập điểm số tại đây sẽ <strong className="text-amber-300 font-semibold">tự động đồng bộ ngay lập tức</strong> ra trang Public cho khán giả và VĐV.
            </p>
          </div>

          {/* Quick Actions in Banner */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateSection('results')}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileEdit className="w-3.5 h-3.5" />
              <span>Nhập Tỷ Số Trận Đấu</span>
            </button>
            <button
              onClick={() => onNavigateSection('pairs')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Quản Lý Cặp Đấu ({pairs.length})</span>
            </button>
          </div>
        </div>

        {/* Progress Bar in Banner */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] mb-1.5">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Tiến độ thi đấu toàn giải:
            </span>
            <span className="font-bold text-white">
              {finishedMatches}/{totalMatches} trận hoàn tất ({progressPercent}%)
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Card 1: VĐV */}
        <div
          onClick={() => onNavigateSection('players')}
          className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Vận Động Viên
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
              {players.length}
            </span>
            <span className="text-[10px] text-slate-400 ml-1">vận động viên</span>
          </div>
          <div className="mt-1 text-[10px] text-blue-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>Xem &amp; Import Excel</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </div>
        </div>

        {/* Card 2: Cặp Đấu & Bảng */}
        <div
          onClick={() => onNavigateSection('groups')}
          className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Cặp Đấu &amp; Bảng
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
              {pairs.length}
            </span>
            <span className="text-[10px] text-slate-400 ml-1">
              cặp (A: {pairsA.length} | B: {pairsB.length})
            </span>
          </div>
          <div className="mt-1 text-[10px] text-indigo-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>Bốc thăm &amp; Chia Bảng</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </div>
        </div>

        {/* Card 3: Trận Đấu */}
        <div
          onClick={() => onNavigateSection('matches')}
          className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Tổng Số Trận
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
              {totalMatches}
            </span>
            <span className="text-[10px] text-slate-400 ml-1">
              trận ({finishedMatches} xong)
            </span>
          </div>
          <div className="mt-1 text-[10px] text-amber-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>Lịch thi đấu &amp; Sân</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </div>
        </div>

        {/* Card 4: Trạng thái & Live */}
        <div
          onClick={() => onNavigateSection('results')}
          className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Trực Tiếp / Đang Đấu
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PlayCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 font-display">
              {liveMatches}
            </span>
            <span className="text-[10px] text-slate-400">
              đang đánh ({upcomingMatches} chưa đấu)
            </span>
          </div>
          <div className="mt-1 text-[10px] text-emerald-600 font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>Bàn ghi điểm trọng tài</span>
            <ArrowRight className="w-2.5 h-2.5" />
          </div>
        </div>
      </div>

      {/* Cloud Database Real-time Sync Status Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl p-3 sm:p-3.5 border border-indigo-900/50 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-extrabold text-white">Firebase Firestore Cloud Sync</h4>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[9px] font-bold ${
                  isRealtimeConnected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isRealtimeConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
                {isRealtimeConnected ? 'Real-time Đang Hoạt Động' : 'Đang Kết Nối'}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Mọi cập nhật tỉ số, VĐV, bốc thăm sẽ phát trực tiếp (Live Broadcast) tới khán giả tức thì.
              {lastSyncedAt && (
                <span className="text-slate-400 ml-1">
                  (Đồng bộ lần cuối: {lastSyncedAt.toLocaleTimeString('vi-VN')})
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={handleForceSync}
          disabled={isManualSyncing}
          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 ${isManualSyncing ? 'animate-spin' : ''}`} />
          <span>{isManualSyncing ? 'Đang Đồng Bộ...' : 'Đồng Bộ Lên Cloud'}</span>
        </button>
      </div>

      {/* 2-Column Overview Section: Live Standings Snapshot & Quick Tournament Setup Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5 sm:gap-3">
        {/* Left 2 Cols: Live Standings Snapshot */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-3 sm:p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                Dự Kiến Top 2 Mỗi Bảng Bước Vào Bán Kết
              </h3>
              <p className="text-[10px] text-slate-500">
                Tự động tính toán từ kết quả các trận đã đấu theo quy tắc BTC
              </p>
            </div>
            <button
              onClick={() => onNavigateSection('knockout')}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Xem Nhánh Đấu Knockout →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5">
            {/* Group A Preview */}
            <div className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-100 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-blue-950 pb-1 border-b border-blue-100">
                <span>BẢNG A (Top 2 đi tiếp)</span>
                <span className="text-blue-600 font-medium text-[10px]">Thắng / Điểm</span>
              </div>
              <div className="space-y-1">
                {topA.map((st, i) => (
                  <div
                    key={st.pair.id}
                    className="flex items-center justify-between text-xs bg-white p-1.5 rounded-lg border border-blue-100"
                  >
                    <div className="flex items-center gap-1.5 truncate pr-1.5">
                      <span className="w-4 h-4 rounded bg-blue-600 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                        {i === 0 ? 'A1' : 'A2'}
                      </span>
                      <span className="font-bold text-slate-800 truncate text-[11px]">{st.pair.name}</span>
                    </div>
                    <span className="font-black text-blue-700 shrink-0 text-[11px]">
                      {st.won}T ({st.pointsFor}đ)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Group B Preview */}
            <div className="p-2.5 rounded-lg bg-amber-50/50 border border-amber-100 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-950 pb-1 border-b border-amber-100">
                <span>BẢNG B (Top 2 đi tiếp)</span>
                <span className="text-amber-700 font-medium text-[10px]">Thắng / Điểm</span>
              </div>
              <div className="space-y-1">
                {topB.map((st, i) => (
                  <div
                    key={st.pair.id}
                    className="flex items-center justify-between text-xs bg-white p-1.5 rounded-lg border border-amber-100"
                  >
                    <div className="flex items-center gap-1.5 truncate pr-1.5">
                      <span className="w-4 h-4 rounded bg-amber-500 text-slate-950 text-[9px] font-black flex items-center justify-center shrink-0">
                        {i === 0 ? 'B1' : 'B2'}
                      </span>
                      <span className="font-bold text-slate-800 truncate text-[11px]">{st.pair.name}</span>
                    </div>
                    <span className="font-black text-amber-700 shrink-0 text-[11px]">
                      {st.won}T ({st.pointsFor}đ)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Quick Workflow Checklist */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-3 sm:p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Quy Trình Ban Tổ Chức
            </h3>
          </div>

          <div className="space-y-1.5 text-xs">
            <div
              onClick={() => onNavigateSection('tournament')}
              className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                  ✓
                </span>
                <span className="font-semibold text-slate-700 text-[11px]">1. Thông tin giải &amp; Địa điểm</span>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </div>

            <div
              onClick={() => onNavigateSection('rules')}
              className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                  ✓
                </span>
                <span className="font-semibold text-slate-700 text-[11px]">2. Điều lệ, Luật Let &amp; WO</span>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </div>

            <div
              onClick={() => onNavigateSection('players')}
              className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                  ✓
                </span>
                <span className="font-semibold text-slate-700 text-[11px]">3. Danh sách 20 VĐV</span>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </div>

            <div
              onClick={() => onNavigateSection('groups')}
              className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                  ✓
                </span>
                <span className="font-semibold text-slate-700 text-[11px]">4. Ghép cặp &amp; Chia 2 Bảng</span>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </div>

            <div
              onClick={() => onNavigateSection('results')}
              className="p-2 rounded-lg bg-blue-50/70 border border-blue-200/80 flex items-center justify-between hover:bg-blue-100/70 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] animate-pulse">
                  5
                </span>
                <span className="font-bold text-blue-900 text-[11px]">5. Ghi điểm trực tiếp bàn trọng tài</span>
              </div>
              <ArrowRight className="w-3 h-3 text-blue-600" />
            </div>
          </div>

          {/* Reset & Clear Data Controls */}
          {tournament.status === 'UPCOMING' && (
            <div className="pt-2 border-t border-slate-100 space-y-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {!showClearConfirm && (
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(true)}
                    className="text-[10px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-2.5 h-2.5" /> Xóa Trắng Dữ Liệu Giải Đấu (Khởi Tạo Lại)
                  </button>
                )}
              </div>

              {showClearConfirm && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 space-y-1.5 text-xs animate-in fade-in">
                  <p className="text-rose-900 font-bold text-[11px]">
                    ⚠️ Xác nhận xóa trắng toàn bộ cặp đấu và trận đấu để khởi tạo lại danh sách thực tế của BTC?
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        clearAllData();
                        setShowClearConfirm(false);
                      }}
                      className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] cursor-pointer shadow-xs"
                    >
                      Xác Nhận Xóa Trắng
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-semibold cursor-pointer"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
