import React, { useState, useMemo } from 'react';
import { useTournament } from '../../data/TournamentContext';
import { Match, MatchSet } from '../../types/tournament';
import {
  FileEdit,
  CheckCircle2,
  Clock,
  PlayCircle,
  RotateCcw,
  AlertTriangle,
  AlertCircle,
  Trophy,
  Search,
  Filter,
  X,
  Sparkles,
  Hourglass,
  Users,
  Eye,
} from 'lucide-react';

export const AdminMatchesAndResults: React.FC = () => {
  const {
    matches,
    pairs,
    standingsA,
    standingsB,
    tournament,
    saveMatchScore,
    resetMatch,
    setMatchWalkover,
  } = useTournament();

  const isCompletedLocked = tournament.status === 'COMPLETED';
  const isReadOnly = isCompletedLocked;

  const [selectedGroupFilter, setSelectedGroupFilter] = useState<'ALL' | 'A' | 'B' | 'KNOCKOUT'>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'ALL' | 'FINISHED' | 'LIVE' | 'UPCOMING' | 'WAITING'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [scoringMatch, setScoringMatch] = useState<Match | null>(null);
  const [confirmWalkover, setConfirmWalkover] = useState<{ match: Match; winnerPairId: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState<Match | null>(null);

  // Group readiness helpers
  const groupAMatches = matches.filter(m => m.group === 'A');
  const groupBMatches = matches.filter(m => m.group === 'B');
  const isGroupAFinished = groupAMatches.length > 0 && groupAMatches.every(m => m.status === 'FINISHED');
  const isGroupBFinished = groupBMatches.length > 0 && groupBMatches.every(m => m.status === 'FINISHED');
  const isRoundRobinComplete = isGroupAFinished && isGroupBFinished;

  const sf1Match = matches.find(m => m.id === 'm-sf-1' || m.round === 'SEMI_FINAL');
  const sf2Match = matches.find(m => m.id === 'm-sf-2' || (m.round === 'SEMI_FINAL' && m.id !== sf1Match?.id));
  const isSF1Finished = sf1Match?.status === 'FINISHED' && !!sf1Match.winnerId;
  const isSF2Finished = sf2Match?.status === 'FINISHED' && !!sf2Match.winnerId;
  const isSemiFinalsComplete = isSF1Finished && isSF2Finished;

  const isMatchReadyToScore = (m: Match): { ready: boolean; reason?: string } => {
    if (m.round === 'GROUP_STAGE') return { ready: true };

    const hasRealPair1 = m.pair1 && !m.pair1.id.startsWith('placeholder');
    const hasRealPair2 = m.pair2 && !m.pair2.id.startsWith('placeholder');
    const isSFPublished = tournament.isKnockoutSFPublished || tournament.isScheduleKnockoutPublished;
    const isFinalPublished = tournament.isKnockoutFinalPublished || tournament.isScheduleKnockoutPublished;

    if (m.round === 'SEMI_FINAL') {
      if (!isRoundRobinComplete && (!hasRealPair1 || !hasRealPair2)) {
        return {
          ready: false,
          reason: 'Cần hoàn tất các trận Vòng Bảng (Bảng A & B) để tự động xác định Nhất/Nhì bảng vào Bán Kết!',
        };
      }
      if (!isSFPublished) {
        return {
          ready: false,
          reason: 'Vui lòng vào tab "Bán kết & Chung kết" để kiểm tra và bấm "Công Khai Bán Kết" trước khi ghi nhận điểm!',
        };
      }
      return { ready: true };
    }
    if (m.round === 'FINAL' || m.round === 'THIRD_PLACE') {
      if (!isSemiFinalsComplete && (!hasRealPair1 || !hasRealPair2)) {
        return {
          ready: false,
          reason: 'Cần hoàn tất cả 2 trận Bán Kết 1 & 2 để tự động xác định các cặp đấu vào Chung Kết & Tranh Hạng Ba!',
        };
      }
      if (!isFinalPublished) {
        return {
          ready: false,
          reason: 'Vui lòng vào tab "Bán kết & Chung kết" để kiểm tra và bấm "Công Khai Chung Kết" trước khi ghi nhận điểm!',
        };
      }
      return { ready: true };
    }
    return { ready: true };
  };

  // Score Modal Form state
  const [set1P1, setSet1P1] = useState(21);
  const [set1P2, setSet1P2] = useState(18);
  const [set2P1, setSet2P1] = useState(0);
  const [set2P2, setSet2P2] = useState(0);
  const [set3P1, setSet3P1] = useState(0);
  const [set3P2, setSet3P2] = useState(0);
  const [matchStatus, setMatchStatus] = useState<'FINISHED' | 'LIVE' | 'UPCOMING'>('FINISHED');
  const [scoreError, setScoreError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const knockoutMatches = matches.filter(m => m.round !== 'GROUP_STAGE');

  // Counters for status
  const finishedCount = matches.filter(m => m.status === 'FINISHED').length;
  const liveCount = matches.filter(m => m.status === 'LIVE').length;
  const upcomingCount = matches.filter(m => m.status === 'UPCOMING' && isMatchReadyToScore(m).ready).length;
  const waitingCount = matches.filter(m => !isMatchReadyToScore(m).ready && m.status !== 'FINISHED').length;

  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      // Group filter
      if (selectedGroupFilter === 'A' && m.group !== 'A') return false;
      if (selectedGroupFilter === 'B' && m.group !== 'B') return false;
      if (selectedGroupFilter === 'KNOCKOUT' && m.round === 'GROUP_STAGE') return false;

      // Status filter
      const readiness = isMatchReadyToScore(m);
      if (selectedStatusFilter === 'FINISHED' && m.status !== 'FINISHED') return false;
      if (selectedStatusFilter === 'LIVE' && m.status !== 'LIVE') return false;
      if (selectedStatusFilter === 'UPCOMING' && (m.status !== 'UPCOMING' || !readiness.ready)) return false;
      if (selectedStatusFilter === 'WAITING' && (readiness.ready || m.status === 'FINISHED')) return false;

      // Search Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const searchable = [
          m.matchNumber?.toString(),
          `#${m.matchNumber}`,
          `trận ${m.matchNumber}`,
          `tran ${m.matchNumber}`,
          m.pair1?.code,
          m.pair1?.name,
          m.pair1?.player1?.name,
          m.pair1?.player2?.name,
          m.pair1?.player1?.club,
          m.pair1?.player2?.club,
          m.pair1?.club,
          m.pair2?.code,
          m.pair2?.name,
          m.pair2?.player1?.name,
          m.pair2?.player2?.name,
          m.pair2?.player1?.club,
          m.pair2?.player2?.club,
          m.pair2?.club,
          m.court,
          m.roundLabel,
          m.group ? `bảng ${m.group}` : '',
          m.group ? `bang ${m.group}` : '',
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
  }, [matches, selectedGroupFilter, selectedStatusFilter, searchQuery, isRoundRobinComplete, isSemiFinalsComplete]);

  const handleOpenScoreModal = (match: Match) => {
    setScoringMatch(match);
    setScoreError('');
    const s1 = match.sets[0] || { pair1Score: 21, pair2Score: 18 };
    const s2 = match.sets[1] || { pair1Score: 0, pair2Score: 0 };
    const s3 = match.sets[2] || { pair1Score: 0, pair2Score: 0 };
    setSet1P1(s1.pair1Score);
    setSet1P2(s1.pair2Score);
    setSet2P1(s2.pair1Score);
    setSet2P2(s2.pair2Score);
    setSet3P1(s3.pair1Score);
    setSet3P2(s3.pair2Score);
    setMatchStatus(match.status === 'UPCOMING' ? 'FINISHED' : match.status);
  };

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoringMatch) return;
    setScoreError('');

    const valS1P1 = Number(set1P1);
    const valS1P2 = Number(set1P2);
    const valS2P1 = Number(set2P1);
    const valS2P2 = Number(set2P2);
    const valS3P1 = Number(set3P1);
    const valS3P2 = Number(set3P2);

    if (isNaN(valS1P1) || isNaN(valS1P2) || valS1P1 < 0 || valS1P2 < 0) {
      setScoreError('Điểm số phải là số nguyên dương không âm!');
      return;
    }

    if (matchStatus === 'FINISHED') {
      if (scoringMatch.format === 'BEST_OF_3_15') {
        if (valS1P1 === valS1P2) {
          setScoreError('Set 1 không thể có tỷ số hòa! Vui lòng nhập điểm phân định thắng thua.');
          return;
        }
        if (valS2P1 === valS2P2) {
          setScoreError('Set 2 không thể có tỷ số hòa! Vui lòng nhập điểm phân định thắng thua.');
          return;
        }
        // If tied 1-1 in sets, check set 3
        const p1Set1 = valS1P1 > valS1P2 ? 1 : 0;
        const p2Set1 = valS1P2 > valS1P1 ? 1 : 0;
        const p1Set2 = valS2P1 > valS2P2 ? 1 : 0;
        const p2Set2 = valS2P2 > valS2P1 ? 1 : 0;

        if (p1Set1 + p1Set2 === 1 && p2Set1 + p2Set2 === 1) {
          if (valS3P1 === valS3P2) {
            setScoreError('Khi hòa 1-1 ở 2 set đầu, Set 3 quyết định không thể có tỷ số hòa!');
            return;
          }
        }
      } else {
        // ONE_SET_21
        if (valS1P1 === valS1P2) {
          setScoreError('Trong thi đấu cầu lông, kết thúc trận đấu không thể hòa điểm (ví dụ 21 - 21). Vui lòng nhập điểm chính xác!');
          return;
        }
      }
    }

    let sets: MatchSet[] = [];
    let winnerId = scoringMatch.pair1.id;

    if (scoringMatch.format === 'BEST_OF_3_15') {
      let p1SetsWon = 0;
      let p2SetsWon = 0;
      if (valS1P1 > valS1P2) p1SetsWon++;
      else if (valS1P2 > valS1P1) p2SetsWon++;

      if (valS2P1 > valS2P2) p1SetsWon++;
      else if (valS2P2 > valS2P1) p2SetsWon++;

      sets = [
        { setNumber: 1, pair1Score: valS1P1, pair2Score: valS1P2, isFinished: true },
        { setNumber: 2, pair1Score: valS2P1, pair2Score: valS2P2, isFinished: true },
      ];

      if (p1SetsWon === 1 && p2SetsWon === 1) {
        if (valS3P1 > valS3P2) p1SetsWon++;
        else if (valS3P2 > valS3P1) p2SetsWon++;
        sets.push({
          setNumber: 3,
          pair1Score: valS3P1,
          pair2Score: valS3P2,
          isFinished: true,
        });
      }

      winnerId = p1SetsWon >= p2SetsWon ? scoringMatch.pair1.id : scoringMatch.pair2.id;
    } else {
      // ONE_SET_21
      sets = [
        {
          setNumber: 1,
          pair1Score: valS1P1,
          pair2Score: valS1P2,
          isFinished: matchStatus === 'FINISHED',
        },
      ];
      winnerId = valS1P1 >= valS1P2 ? scoringMatch.pair1.id : scoringMatch.pair2.id;
    }

    saveMatchScore(scoringMatch.id, sets, winnerId, matchStatus);
    setSuccessMsg(`Đã ghi điểm và cập nhật kết quả Trận #${scoringMatch.matchNumber}!`);
    setScoringMatch(null);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleWalkover = (match: Match, winnerPairId: string) => {
    setConfirmWalkover({ match, winnerPairId });
  };

  const handleExecuteWalkover = () => {
    if (!confirmWalkover) return;
    const { match, winnerPairId } = confirmWalkover;
    setMatchWalkover(match.id, winnerPairId);
    setSuccessMsg(`Đã ghi nhận Walkover cho Trận #${match.matchNumber}!`);
    setConfirmWalkover(null);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleResetMatch = (match: Match) => {
    setConfirmReset(match);
  };

  const handleExecuteReset = () => {
    if (!confirmReset) return;
    resetMatch(confirmReset.id);
    setSuccessMsg(`Đã đặt lại Trận #${confirmReset.matchNumber}!`);
    setConfirmReset(null);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-3 sm:p-4 space-y-3">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2.5 border-b border-slate-100 gap-2">
        <div>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 font-display flex items-center gap-1.5">
            <FileEdit className="w-4 h-4 text-blue-600" />
            Bàn Trọng Tài: Ghi Nhận Điểm Số &amp; Tỷ Số ({matches.length} Trận)
          </h2>
        </div>

        {successMsg && (
          <div className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Completed Locked Notification Banner */}
      {isCompletedLocked && (
        <div className="p-3 bg-slate-100 rounded-xl border border-slate-300 text-slate-800 text-xs flex items-center gap-2.5 shadow-xs">
          <AlertCircle className="w-4 h-4 text-slate-600 shrink-0" />
          <div>
            <strong className="font-bold">Hệ thống đã khóa (Đã bế mạc)</strong>
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="space-y-2 bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-200">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm cặp đấu (vd: A1, B2), tên VĐV (vd: Huấn, Thành, Đăng), sân, trận #, vòng đấu..."
            className="w-full pl-8 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
              title="Xóa tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters Row: Group + Status */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2 pt-1 border-t border-slate-200/70">
          {/* Group Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-0.5 hidden sm:inline">
              Bảng:
            </span>
            <button
              onClick={() => setSelectedGroupFilter('ALL')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                selectedGroupFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Tất Cả ({matches.length})
            </button>
            <button
              onClick={() => setSelectedGroupFilter('A')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                selectedGroupFilter === 'A'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-blue-700 hover:bg-blue-50/50 border border-slate-200'
              }`}
            >
              Bảng A ({groupAMatches.length})
            </button>
            <button
              onClick={() => setSelectedGroupFilter('B')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                selectedGroupFilter === 'B'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-amber-700 hover:bg-amber-50/50 border border-slate-200'
              }`}
            >
              Bảng B ({groupBMatches.length})
            </button>
            <button
              onClick={() => setSelectedGroupFilter('KNOCKOUT')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                selectedGroupFilter === 'KNOCKOUT'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-indigo-700 hover:bg-indigo-50/50 border border-slate-200'
              }`}
            >
              Bán Kết &amp; Chung Kết ({knockoutMatches.length})
            </button>
          </div>

          {/* Status Filter Chips */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-0.5 hidden sm:inline">
              Trạng thái:
            </span>
            <button
              onClick={() => setSelectedStatusFilter('ALL')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                selectedStatusFilter === 'ALL'
                  ? 'bg-slate-700 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setSelectedStatusFilter('LIVE')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                selectedStatusFilter === 'LIVE'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              Đang đấu ({liveCount})
            </button>
            <button
              onClick={() => setSelectedStatusFilter('FINISHED')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                selectedStatusFilter === 'FINISHED'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
              }`}
            >
              <CheckCircle2 className="w-2.5 h-2.5" />
              Hoàn tất ({finishedCount})
            </button>
            <button
              onClick={() => setSelectedStatusFilter('UPCOMING')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                selectedStatusFilter === 'UPCOMING'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200'
              }`}
            >
              <Clock className="w-2.5 h-2.5" />
              Sắp đấu ({upcomingCount})
            </button>
          </div>
        </div>

        {/* Results summary message */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
          <div className="flex items-center gap-1.5">
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
              className="text-[10px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center gap-0.5"
            >
              <RotateCcw className="w-2.5 h-2.5" /> Đặt lại tất cả bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Matches Grid List */}
      {filteredMatches.length === 0 ? (
        <div className="p-8 text-center bg-slate-50/80 rounded-xl border border-dashed border-slate-300 space-y-1.5">
          <Search className="w-6 h-6 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-500">Chưa có thông tin</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
          {filteredMatches.map(match => {
            const isFinished = match.status === 'FINISHED';
            const isLive = match.status === 'LIVE';
            const readiness = isMatchReadyToScore(match);
            const isBlocked = !readiness.ready;
            const s1 = match.sets[0];
            const s2 = match.sets[1];
            const s3 = match.sets[2];

            const isPair1Winner = isFinished && match.winnerId === match.pair1?.id;
            const isPair2Winner = isFinished && match.winnerId === match.pair2?.id;
            const isPair1Placeholder = !match.pair1 || match.pair1?.id?.startsWith('placeholder');
            const isPair2Placeholder = !match.pair2 || match.pair2?.id?.startsWith('placeholder');

            return (
              <div
                key={match.id}
                className={`p-2.5 sm:p-3 rounded-xl border transition-all flex flex-col justify-between ${
                  isLive
                    ? 'bg-rose-50/50 border-rose-400 ring-2 ring-rose-400/30 shadow-xs'
                    : isFinished
                    ? 'bg-white border-slate-300 shadow-xs hover:border-slate-400'
                    : isBlocked
                    ? 'bg-amber-50/30 border-amber-300/80 border-dashed'
                    : 'bg-white border-blue-200/90 shadow-xs hover:border-blue-300'
                }`}
              >
                {/* Match Header Info */}
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-extrabold text-[11px]">
                      Trận #{match.matchNumber}
                    </span>
                    <span className="font-bold text-slate-800 text-[11px]">{match.roundLabel || match.court}</span>
                    <span className="text-slate-400 font-medium text-[10px]">&bull; {match.court}</span>
                  </div>

                  {/* PROMINENT STATUS BADGES */}
                  {isLive ? (
                    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] shadow-xs animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      🔴 LIVE
                    </span>
                  ) : isFinished ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-extrabold text-[10px] flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      HOÀN TẤT
                    </span>
                  ) : isBlocked ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-extrabold text-[10px] flex items-center gap-0.5" title={readiness.reason}>
                      <Hourglass className="w-3 h-3 text-amber-700" />
                      CHỜ VÒNG TRƯỚC
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 border border-blue-300 text-blue-800 font-extrabold text-[10px] flex items-center gap-0.5">
                      <Clock className="w-3 h-3 text-blue-600" />
                      SẮP ĐẤU
                    </span>
                  )}
                </div>

                {/* Match Teams & Score Box */}
                <div className="space-y-1.5 py-0.5">
                  {/* Team 1 */}
                  <div
                    className={`flex items-center justify-between p-1.5 rounded-lg transition-colors ${
                      isPair1Winner
                        ? 'bg-emerald-50/80 border border-emerald-200'
                        : isFinished
                        ? 'bg-slate-50/80 border border-slate-100 opacity-80'
                        : 'bg-slate-50/80 border border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-1 min-w-0">
                      <span
                        className={`w-5 h-5 rounded text-[10px] font-black flex items-center justify-center shrink-0 ${
                          match.group === 'B'
                            ? 'bg-amber-200 text-amber-950'
                            : 'bg-blue-200 text-blue-950'
                        }`}
                      >
                        {match.pair1?.code || 'A'}
                      </span>
                      <div className="truncate min-w-0">
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-xs truncate ${
                              isPair1Placeholder
                                ? 'font-medium text-slate-500 italic'
                                : isPair1Winner
                                ? 'font-black text-slate-950'
                                : 'font-bold text-slate-800'
                            }`}
                          >
                            {match.pair1?.name || 'Đội 1'}
                          </span>
                          {isPair1Winner && (
                            <span className="px-1 py-0.2 rounded text-[9px] font-black bg-emerald-600 text-white">
                              THẮNG
                            </span>
                          )}
                        </div>
                        {!isPair1Placeholder && (match.pair1?.player1?.name || match.pair1?.player2?.name) && (
                          <p className="text-[10px] text-slate-500 truncate">
                            {match.pair1?.player1?.name} &amp; {match.pair1?.player2?.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className={`text-xs sm:text-sm px-2 py-0.5 rounded font-black min-w-[28px] text-center tabular-nums ${
                          isPair1Winner
                            ? 'bg-slate-950 text-white shadow-xs'
                            : isFinished
                            ? 'bg-white border border-slate-200 text-slate-700'
                            : 'bg-slate-200/80 text-slate-400'
                        }`}
                      >
                        {isFinished ? (s1?.pair1Score ?? 0) : '-'}
                      </span>
                      {s2 && isFinished && (
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 font-bold text-slate-600 tabular-nums">
                          {s2.pair1Score}
                        </span>
                      )}
                      {s3 && isFinished && (
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 font-bold text-slate-600 tabular-nums">
                          {s3.pair1Score}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Team 2 */}
                  <div
                    className={`flex items-center justify-between p-1.5 rounded-lg transition-colors ${
                      isPair2Winner
                        ? 'bg-emerald-50/80 border border-emerald-200'
                        : isFinished
                        ? 'bg-slate-50/80 border border-slate-100 opacity-80'
                        : 'bg-slate-50/80 border border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-1 min-w-0">
                      <span
                        className={`w-5 h-5 rounded text-[10px] font-black flex items-center justify-center shrink-0 ${
                          match.group === 'B'
                            ? 'bg-amber-200 text-amber-950'
                            : 'bg-blue-200 text-blue-950'
                        }`}
                      >
                        {match.pair2?.code || 'B'}
                      </span>
                      <div className="truncate min-w-0">
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-xs truncate ${
                              isPair2Placeholder
                                ? 'font-medium text-slate-500 italic'
                                : isPair2Winner
                                ? 'font-black text-slate-950'
                                : 'font-bold text-slate-800'
                            }`}
                          >
                            {match.pair2?.name || 'Đội 2'}
                          </span>
                          {isPair2Winner && (
                            <span className="px-1 py-0.2 rounded text-[9px] font-black bg-emerald-600 text-white">
                              THẮNG
                            </span>
                          )}
                        </div>
                        {!isPair2Placeholder && (match.pair2?.player1?.name || match.pair2?.player2?.name) && (
                          <p className="text-[10px] text-slate-500 truncate">
                            {match.pair2?.player1?.name} &amp; {match.pair2?.player2?.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className={`text-xs sm:text-sm px-2 py-0.5 rounded font-black min-w-[28px] text-center tabular-nums ${
                          isPair2Winner
                            ? 'bg-slate-950 text-white shadow-xs'
                            : isFinished
                            ? 'bg-white border border-slate-200 text-slate-700'
                            : 'bg-slate-200/80 text-slate-400'
                        }`}
                      >
                        {isFinished ? (s1?.pair2Score ?? 0) : '-'}
                      </span>
                      {s2 && isFinished && (
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 font-bold text-slate-600 tabular-nums">
                          {s2.pair2Score}
                        </span>
                      )}
                      {s3 && isFinished && (
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 font-bold text-slate-600 tabular-nums">
                          {s3.pair2Score}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Match Action Buttons */}
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <div>
                    {isFinished && !isReadOnly && (
                      <button
                        type="button"
                        onClick={() => handleResetMatch(match)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer transition-colors flex items-center gap-1 text-[11px] font-semibold"
                        title="Hủy điểm / Trả về chưa đấu"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span className="text-[10px]">Đặt lại</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (isBlocked) {
                        alert(readiness.reason || 'Trận đấu chưa sẵn sàng để nhập điểm!');
                        return;
                      }
                      handleOpenScoreModal(match);
                    }}
                    disabled={isReadOnly}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold shadow-xs transition-all flex items-center gap-1 ${
                      isReadOnly
                        ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                        : isBlocked
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 cursor-pointer'
                        : isFinished
                        ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                        : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    }`}
                    title={isBlocked ? readiness.reason : undefined}
                  >
                    <FileEdit className="w-3 h-3" />
                    <span>
                      {isReadOnly
                        ? 'Xem Điểm'
                        : isBlocked
                        ? 'Chờ Vòng Trước'
                        : isFinished
                        ? 'Sửa Tỷ Số'
                        : 'Nhập Điểm'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Nhập Điểm Trận Đấu */}
      {scoringMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-600 block">
                  BÀN TRỌNG TÀI - GHI NHẬN ĐIỂM
                </span>
                <h3 className="text-base font-extrabold text-slate-900">
                  Trận #{scoringMatch.matchNumber} ({scoringMatch.roundLabel})
                </h3>
              </div>
              <button
                onClick={() => setScoringMatch(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveScore} className="space-y-4">
              {/* Teams Presentation */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div>
                  <span className="text-[11px] font-black text-blue-600 block">
                    CẶP 1 ({scoringMatch.pair1?.code || 'Cặp 1'})
                  </span>
                  <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
                    {scoringMatch.pair1?.name || 'Cặp 1'}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-black text-amber-600 block">
                    CẶP 2 ({scoringMatch.pair2?.code || 'Cặp 2'})
                  </span>
                  <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
                    {scoringMatch.pair2?.name || 'Cặp 2'}
                  </p>
                </div>
              </div>

              {/* Set 1 Inputs */}
              <div className="p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>SET 1 {scoringMatch.format === 'ONE_SET_21' ? '(Chạm 21 điểm)' : '(Chạm 15 điểm)'}</span>
                  <span className="text-slate-400 text-[11px]">Tỷ số chính</span>
                </div>
                <div className="grid grid-cols-2 gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSet1P1(Math.max(0, set1P1 - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-100 font-bold text-slate-700 hover:bg-slate-200"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={set1P1}
                      onChange={e => setSet1P1(Number(e.target.value))}
                      className="w-full text-center text-lg font-black py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setSet1P1(set1P1 + 1)}
                      className="w-8 h-8 rounded-lg bg-slate-100 font-bold text-slate-700 hover:bg-slate-200"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSet1P2(Math.max(0, set1P2 - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-100 font-bold text-slate-700 hover:bg-slate-200"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={set1P2}
                      onChange={e => setSet1P2(Number(e.target.value))}
                      className="w-full text-center text-lg font-black py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setSet1P2(set1P2 + 1)}
                      className="w-8 h-8 rounded-lg bg-slate-100 font-bold text-slate-700 hover:bg-slate-200"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Set 2 & 3 for Best of 3 (Chung kết) */}
              {scoringMatch.format === 'BEST_OF_3_15' && (
                <>
                  {/* Set 2 */}
                  <div className="p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>SET 2 (Chạm 15 điểm)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        value={set2P1}
                        onChange={e => setSet2P1(Number(e.target.value))}
                        className="text-center text-base font-black py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                      <input
                        type="number"
                        value={set2P2}
                        onChange={e => setSet2P2(Number(e.target.value))}
                        className="text-center text-base font-black py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Set 3 */}
                  <div className="p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>SET 3 (Nếu hòa 1-1)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        value={set3P1}
                        onChange={e => setSet3P1(Number(e.target.value))}
                        className="text-center text-base font-black py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                      <input
                        type="number"
                        value={set3P2}
                        onChange={e => setSet3P2(Number(e.target.value))}
                        className="text-center text-base font-black py-1.5 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Trạng Thái Trận Đấu
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMatchStatus('FINISHED')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      matchStatus === 'FINISHED'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Hoàn Tất
                  </button>
                  <button
                    type="button"
                    onClick={() => setMatchStatus('LIVE')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      matchStatus === 'LIVE'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs animate-pulse'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Đang Đấu (LIVE)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMatchStatus('UPCOMING')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      matchStatus === 'UPCOMING'
                        ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Chưa Đấu
                  </button>
                </div>
              </div>

              {/* Score Error Alert */}
              {scoreError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{scoreError}</span>
                </div>
              )}

              {/* Submit / Action buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setScoringMatch(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-extrabold hover:bg-blue-700 shadow-md shadow-blue-600/25 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác Nhận &amp; Đồng Bộ Public</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Walkover */}
      {confirmWalkover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Xác Nhận Xử Thắng Walkover</h3>
                <p className="text-xs text-slate-500">Trận #{confirmWalkover.match.matchNumber}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              Xác nhận xử thắng <strong className="text-amber-700">Walkover (21 - 0)</strong> cho cặp đấu{' '}
              <strong>
                {confirmWalkover.winnerPairId === confirmWalkover.match.pair1?.id
                  ? confirmWalkover.match.pair1?.name
                  : confirmWalkover.match.pair2?.name}
              </strong>
              ? Kết quả và điểm số sẽ được tự động tính vào bảng xếp hạng.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmWalkover(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleExecuteWalkover}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-600/20 cursor-pointer"
              >
                Xác Nhận Walkover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Reset Match */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Đặt Lại Trận Đấu</h3>
                <p className="text-xs text-slate-500">Trận #{confirmReset.matchNumber}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              Bạn có chắc muốn hủy điểm và đưa Trận #{confirmReset.matchNumber} ({confirmReset.pair1?.name} vs {confirmReset.pair2?.name}) về trạng thái <strong className="text-slate-900">Chưa Đấu</strong>? Bảng xếp hạng sẽ tự động trừ điểm của trận này.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setConfirmReset(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleExecuteReset}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Xác Nhận Đặt Lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
