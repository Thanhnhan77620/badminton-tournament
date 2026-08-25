import React, { useState, useMemo } from 'react';
import { Match, MatchStatus } from '../types/tournament';
import { MatchCard } from './common/MatchCard';
import {
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  RotateCcw,
  X,
} from 'lucide-react';

interface ScheduleSectionProps {
  matches: Match[];
  onSelectMatch: (match: Match) => void;
  liveMatch?: Match | null;
  isScheduleAPublished?: boolean;
  isScheduleBPublished?: boolean;
  isScheduleKnockoutPublished?: boolean;
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  matches,
  onSelectMatch,
  isScheduleAPublished = false,
  isScheduleBPublished = false,
  isScheduleKnockoutPublished = false,
}) => {
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<'ALL' | 'A' | 'B' | 'KNOCKOUT'>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | MatchStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter only published matches for public display
  const publicMatches = useMemo(() => {
    return matches.filter(m => {
      if (m.group === 'A') return isScheduleAPublished;
      if (m.group === 'B') return isScheduleBPublished;
      if (m.round !== 'GROUP_STAGE') return isScheduleKnockoutPublished;
      return true;
    });
  }, [matches, isScheduleAPublished, isScheduleBPublished, isScheduleKnockoutPublished]);

  const finishedCount = publicMatches.filter(m => m.status === 'FINISHED').length;
  const liveCount = publicMatches.filter(m => m.status === 'LIVE').length;
  const upcomingCount = publicMatches.filter(m => m.status === 'UPCOMING').length;

  const groupAMatches = publicMatches.filter(m => m.group === 'A');
  const groupBMatches = publicMatches.filter(m => m.group === 'B');
  const knockoutMatches = publicMatches.filter(m => m.round !== 'GROUP_STAGE');

  const filteredMatches = useMemo(() => {
    return publicMatches.filter(match => {
      // Group / Knockout filter
      if (selectedGroupFilter === 'A' && match.group !== 'A') return false;
      if (selectedGroupFilter === 'B' && match.group !== 'B') return false;
      if (selectedGroupFilter === 'KNOCKOUT' && match.round === 'GROUP_STAGE') return false;

      // Status filter
      if (selectedStatusFilter !== 'ALL' && match.status !== selectedStatusFilter) return false;

      // Search Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const searchable = [
          match.matchNumber?.toString(),
          `#${match.matchNumber}`,
          `trận ${match.matchNumber}`,
          `tran ${match.matchNumber}`,
          match.pair1?.code,
          match.pair1?.name,
          match.pair1?.player1?.name,
          match.pair1?.player2?.name,
          match.pair1?.player1?.club,
          match.pair1?.player2?.club,
          match.pair1?.club,
          match.pair2?.code,
          match.pair2?.name,
          match.pair2?.player1?.name,
          match.pair2?.player2?.name,
          match.pair2?.player1?.club,
          match.pair2?.player2?.club,
          match.pair2?.club,
          match.court,
          match.roundLabel,
          match.group ? `bảng ${match.group}` : '',
          match.group ? `bang ${match.group}` : '',
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchable.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [publicMatches, selectedGroupFilter, selectedStatusFilter, searchQuery]);

  return (
    <section className="py-8 bg-slate-50/70 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
                Lịch Thi Đấu &amp; Kết Quả Trận Đấu
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Toàn bộ lịch trình và kết quả chi tiết 24 trận đấu của giải (Cập nhật trực tiếp sau mỗi trận)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Đã hoàn tất <strong>{finishedCount}</strong>/{matches.length} trận</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar (Identical to Admin Matches & Results) */}
        <div className="space-y-3.5 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm cặp đấu (vd: A1, B2), tên VĐV (vd: Huấn, Thành, Đăng), sân, trận #, vòng đấu..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters Row: Group + Status */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1 border-t border-slate-100">
            {/* Group Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
                Bảng:
              </span>
              <button
                onClick={() => setSelectedGroupFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedGroupFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Tất Cả ({matches.length})
              </button>
              <button
                onClick={() => setSelectedGroupFilter('A')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedGroupFilter === 'A'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:text-blue-700 hover:bg-blue-50/50 border border-slate-200'
                }`}
              >
                Bảng A ({groupAMatches.length})
              </button>
              <button
                onClick={() => setSelectedGroupFilter('B')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedGroupFilter === 'B'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:text-amber-700 hover:bg-amber-50/50 border border-slate-200'
                }`}
              >
                Bảng B ({groupBMatches.length})
              </button>
              <button
                onClick={() => setSelectedGroupFilter('KNOCKOUT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedGroupFilter === 'KNOCKOUT'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50/50 border border-slate-200'
                }`}
              >
                Bán Kết &amp; Chung Kết ({knockoutMatches.length})
              </button>
            </div>

            {/* Status Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
                Trạng thái:
              </span>
              <button
                onClick={() => setSelectedStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedStatusFilter === 'ALL'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setSelectedStatusFilter('LIVE')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedStatusFilter === 'LIVE'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-50 text-rose-700 hover:bg-rose-50 border border-rose-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                Đang đấu ({liveCount})
              </button>
              <button
                onClick={() => setSelectedStatusFilter('FINISHED')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedStatusFilter === 'FINISHED'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                Hoàn tất ({finishedCount})
              </button>
              <button
                onClick={() => setSelectedStatusFilter('UPCOMING')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedStatusFilter === 'UPCOMING'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 text-blue-700 hover:bg-blue-50 border border-blue-200'
                }`}
              >
                <Clock className="w-3 h-3" />
                Sắp đấu ({upcomingCount})
              </button>
            </div>
          </div>

          {/* Results summary message */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <div className="flex items-center gap-2">
              <span>
                Hiển thị <strong className="text-slate-800 font-extrabold">{filteredMatches.length}</strong> / {matches.length} trận
              </span>
              {searchQuery && (
                <span className="text-slate-400">
                  (theo từ khóa: &ldquo;<strong className="text-blue-700">{searchQuery}</strong>&rdquo;)
                </span>
              )}
            </div>

            {(searchQuery || selectedGroupFilter !== 'ALL' || selectedStatusFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedGroupFilter('ALL');
                  setSelectedStatusFilter('ALL');
                }}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Đặt lại tất cả bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* Matches Grid List */}
        {filteredMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {filteredMatches.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                onClick={onSelectMatch}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-800">
              {searchQuery ? 'Không tìm thấy trận đấu nào phù hợp' : 'Chưa có trận đấu nào trong danh sách'}
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {searchQuery
                ? `Không có trận đấu nào khớp với từ khóa "${searchQuery}".`
                : 'Lịch thi đấu các trận sẽ được cập nhật tại đây khi giải đấu diễn ra.'}
            </p>
            {(searchQuery || selectedGroupFilter !== 'ALL' || selectedStatusFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSelectedGroupFilter('ALL');
                  setSelectedStatusFilter('ALL');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-[#0F172A] text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xem tất cả trận đấu</span>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

