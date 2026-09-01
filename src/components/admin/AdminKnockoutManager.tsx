import React, { useState } from 'react';
import { useTournament } from '../../data/TournamentContext';
import {
  Trophy,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Users,
  Eye,
  EyeOff,
  AlertCircle,
  Clock,
  ArrowRight,
  Medal,
  Edit3,
  RotateCcw,
  X,
  Search,
} from 'lucide-react';
import { Match, Pair } from '../../types/tournament';
import { PlayerAvatar } from '../common/PlayerAvatar';

interface EditingKnockoutSlot {
  match: Match;
  slot: 'pair1' | 'pair2';
  placeholderLabel: string;
  currentPair: Pair | null;
  isManual: boolean;
}

export const AdminKnockoutManager: React.FC = () => {
  const {
    tournament,
    pairs,
    matches,
    standingsA,
    standingsB,
    togglePublishKnockoutStage,
    setKnockoutPair,
  } = useTournament();

  const [notification, setNotification] = useState<string>('');
  const [editingSlot, setEditingSlot] = useState<EditingKnockoutSlot | null>(null);
  const [selectedPairId, setSelectedPairId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  // Group status check
  const matchesGroupA = matches.filter(m => m.group === 'A');
  const matchesGroupB = matches.filter(m => m.group === 'B');
  const isGroupAFinished = matchesGroupA.length > 0 && matchesGroupA.every(m => m.status === 'FINISHED');
  const isGroupBFinished = matchesGroupB.length > 0 && matchesGroupB.every(m => m.status === 'FINISHED');
  const isRoundRobinComplete = isGroupAFinished && isGroupBFinished;

  // Standings top pairs
  const topA1 = standingsA.length >= 1 ? standingsA[0].pair : null;
  const topA2 = standingsA.length >= 2 ? standingsA[1].pair : null;
  const topB1 = standingsB.length >= 1 ? standingsB[0].pair : null;
  const topB2 = standingsB.length >= 2 ? standingsB[1].pair : null;

  // Semi Final Matches
  const semiFinal1 = matches.find(
    m => m.id === 'm-sf-1' || m.matchNumber === 21 || (m.round === 'SEMI_FINAL' && m.roundLabel?.includes('1'))
  );
  const semiFinal2 = matches.find(
    m => m.id === 'm-sf-2' || m.matchNumber === 22 || (m.round === 'SEMI_FINAL' && m.roundLabel?.includes('2'))
  );

  const isSF1Finished = semiFinal1?.status === 'FINISHED' && !!semiFinal1.winnerId;
  const isSF2Finished = semiFinal2?.status === 'FINISHED' && !!semiFinal2.winnerId;
  const isSemiFinalsComplete = isSF1Finished && isSF2Finished;

  // Final & Third Place Matches
  const finalMatch = matches.find(
    m => m.id === 'm-final' || m.matchNumber === 24 || m.round === 'FINAL'
  );
  const thirdPlaceMatch = matches.find(
    m => m.id === 'm-third' || m.matchNumber === 23 || m.round === 'THIRD_PLACE'
  );

  const isFinalFinished = finalMatch?.status === 'FINISHED' && !!finalMatch.winnerId;
  const isThirdFinished = thirdPlaceMatch?.status === 'FINISHED' && !!thirdPlaceMatch.winnerId;

  // Publication flags
  const isSFPublished = Boolean(tournament.isKnockoutSFPublished || tournament.isScheduleKnockoutPublished);
  const isFinalPublished = Boolean(tournament.isKnockoutFinalPublished || tournament.isScheduleKnockoutPublished);

  // Computed final/3rd pairs
  const sf1Winner = isSF1Finished && semiFinal1 ? (semiFinal1.winnerId === semiFinal1.pair1?.id ? semiFinal1.pair1 : semiFinal1.pair2) : null;
  const sf1Loser = isSF1Finished && semiFinal1 ? (semiFinal1.winnerId === semiFinal1.pair1?.id ? semiFinal1.pair2 : semiFinal1.pair1) : null;

  const sf2Winner = isSF2Finished && semiFinal2 ? (semiFinal2.winnerId === semiFinal2.pair1?.id ? semiFinal2.pair1 : semiFinal2.pair2) : null;
  const sf2Loser = isSF2Finished && semiFinal2 ? (semiFinal2.winnerId === semiFinal2.pair1?.id ? semiFinal2.pair2 : semiFinal2.pair1) : null;

  // Podium pairs
  const championPair = isFinalFinished && finalMatch ? (finalMatch.winnerId === finalMatch.pair1?.id ? finalMatch.pair1 : finalMatch.pair2) : null;
  const runnerUpPair = isFinalFinished && finalMatch ? (finalMatch.winnerId === finalMatch.pair1?.id ? finalMatch.pair2 : finalMatch.pair1) : null;
  const thirdPair = isThirdFinished && thirdPlaceMatch ? (thirdPlaceMatch.winnerId === thirdPlaceMatch.pair1?.id ? thirdPlaceMatch.pair1 : thirdPlaceMatch.pair2) : null;
  const fourthPair = isThirdFinished && thirdPlaceMatch ? (thirdPlaceMatch.winnerId === thirdPlaceMatch.pair1?.id ? thirdPlaceMatch.pair2 : thirdPlaceMatch.pair1) : null;

  const handleToggleSF = () => {
    const nextVal = !isSFPublished;
    togglePublishKnockoutStage('SF', nextVal);
    showToast(nextVal ? 'Đã CÔNG KHAI 2 trận Bán Kết!' : 'Đã chuyển 2 trận Bán Kết về BẢN NHÁP!');
  };

  const handleToggleFinal = () => {
    const nextVal = !isFinalPublished;
    togglePublishKnockoutStage('FINAL', nextVal);
    showToast(nextVal ? 'Đã CÔNG KHAI Trận Chung Kết & Tranh Hạng Ba!' : 'Đã chuyển Chung Kết & Tranh Hạng Ba về BẢN NHÁP!');
  };

  const openEditModal = (
    match: Match,
    slot: 'pair1' | 'pair2',
    pair: Pair | null | undefined,
    placeholderLabel: string,
    isManual: boolean
  ) => {
    setEditingSlot({
      match,
      slot,
      placeholderLabel,
      currentPair: pair && !pair.id.startsWith('placeholder') ? pair : null,
      isManual,
    });
    setSelectedPairId(pair && !pair.id.startsWith('placeholder') ? pair.id : '');
    setSearchTerm('');
  };

  const handleSavePairOverride = () => {
    if (!editingSlot) return;
    if (!selectedPairId) {
      showToast('Vui lòng chọn 1 cặp đấu từ danh sách.');
      return;
    }
    const res = setKnockoutPair(editingSlot.match.id, editingSlot.slot, selectedPairId);
    if (res.success) {
      showToast('Đã cập nhật cặp đấu thành công!');
      setEditingSlot(null);
    } else {
      showToast(res.error || 'Có lỗi xảy ra khi cập nhật.');
    }
  };

  const handleResetToAuto = () => {
    if (!editingSlot) return;
    const res = setKnockoutPair(editingSlot.match.id, editingSlot.slot, 'AUTO');
    if (res.success) {
      showToast('Đã khôi phục cặp đấu theo kết quả tự động!');
      setEditingSlot(null);
    } else {
      showToast(res.error || 'Có lỗi xảy ra.');
    }
  };

  const renderPairBox = (
    match: Match | undefined,
    slot: 'pair1' | 'pair2',
    pair: Pair | null | undefined,
    placeholderLabel: string,
    isWinner?: boolean
  ) => {
    if (!match) return null;
    const isManual = slot === 'pair1' ? Boolean(match.pair1IsManual) : Boolean(match.pair2IsManual);
    const hasRealPair = Boolean(pair && !pair.id.startsWith('placeholder'));

    return (
      <div
        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
          isWinner
            ? 'bg-amber-500/10 border-amber-400 text-slate-900 shadow-2xs'
            : hasRealPair
            ? isManual
              ? 'bg-blue-50/60 border-blue-200 text-slate-800'
              : 'bg-slate-50 border-slate-200 text-slate-800'
            : 'bg-slate-50/70 border-dashed border-slate-200 text-slate-400'
        }`}
      >
        <div className="min-w-0 flex-1 space-y-1 pr-2">
          {hasRealPair && pair ? (
            <>
              <div className="flex items-center gap-1.5 min-w-0">
                <PlayerAvatar
                  name={pair.player1?.name || 'VĐV 1'}
                  avatarUrl={pair.player1?.avatarUrl}
                  size="xs"
                  className="shrink-0 w-5 h-5"
                />
                <div className="min-w-0 flex items-center leading-none overflow-hidden whitespace-nowrap">
                  <span className="text-xs font-bold whitespace-nowrap">
                    {pair.player1?.name || 'VĐV 1'}
                  </span>
                  <span className="text-[10px] font-normal text-slate-500 ml-1 whitespace-nowrap">
                    ({pair.player1?.club || pair.club || 'ISC'})
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <PlayerAvatar
                  name={pair.player2?.name || 'VĐV 2'}
                  avatarUrl={pair.player2?.avatarUrl}
                  size="xs"
                  className="shrink-0 w-5 h-5"
                />
                <div className="min-w-0 flex items-center leading-none overflow-hidden whitespace-nowrap">
                  <span className="text-xs font-bold whitespace-nowrap">
                    {pair.player2?.name || 'VĐV 2'}
                  </span>
                  <span className="text-[10px] font-normal text-slate-500 ml-1 whitespace-nowrap">
                    ({pair.player2?.club || pair.club || 'ISC'})
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-bold">
                <Users className="w-3 h-3" />
              </div>
              <span className="font-semibold text-slate-600 text-xs">{placeholderLabel}</span>
              <span className="text-[10px] text-slate-400 italic">(Chờ xác định)</span>
            </div>
          )}

          {isManual && (
            <div className="pt-0.5">
              <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                Chỉ định thủ công
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {isWinner && <span className="text-base mr-1 select-none" title="Thắng trận">🏆</span>}
          <button
            type="button"
            onClick={() => openEditModal(match, slot, pair, placeholderLabel, isManual)}
            title="Đổi cặp đấu này"
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-white hover:bg-blue-50 text-blue-700 hover:text-blue-800 border border-slate-200 hover:border-blue-300 shadow-2xs flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>Đổi cặp</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-xs shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 font-display">
              Quản Lý Vòng Bán Kết &amp; Chung Kết
            </h2>
            <p className="text-xs text-slate-500">
              Kiểm tra thông tin cặp đấu được tự động tính toán, duyệt công khai để mở bảng điểm cho Trọng tài.
            </p>
          </div>
        </div>

        {/* Quick Status Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
              isSFPublished
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
          >
            {isSFPublished ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-amber-600" />}
            Bán Kết: {isSFPublished ? 'Đã Công Khai' : 'Bản Nháp'}
          </span>
          <span
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
              isFinalPublished
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
          >
            {isFinalPublished ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-amber-600" />}
            Chung Kết: {isFinalPublished ? 'Đã Công Khai' : 'Bản Nháp'}
          </span>
        </div>
      </div>

      {/* Control Action Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Step 1: Bán Kết Approval Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 text-xs font-black flex items-center justify-center">
                1
              </span>
              <h3 className="text-sm font-extrabold text-slate-900">
                Giai Đoạn Bán Kết (BK1 &amp; BK2)
              </h3>
            </div>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                isSFPublished
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {isSFPublished ? 'Đã Công Khai' : 'Bản Nháp'}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {isRoundRobinComplete ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đã hoàn tất 20 trận vòng bảng. Cặp đấu đã sẵn sàng!
              </span>
            ) : (
              <span className="text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Đang thi đấu Vòng Bảng (hoàn tất {matches.filter(m => m.round === 'GROUP_STAGE' && m.status === 'FINISHED').length}/20 trận).
              </span>
            )}
          </p>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-500">
              {isSFPublished
                ? 'Đang mở cho Public & Bàn Trọng Tài.'
                : 'Chỉ BTC thấy, chưa mở ghi điểm.'}
            </span>
            <button
              onClick={handleToggleSF}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                isSFPublished
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
              }`}
            >
              {isSFPublished ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" /> Thu Hồi Về Nháp
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" /> Công Khai Bán Kết
                </>
              )}
            </button>
          </div>
        </div>

        {/* Step 2: Chung Kết Approval Box */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-black flex items-center justify-center">
                2
              </span>
              <h3 className="text-sm font-extrabold text-slate-900">
                Giai Đoạn Chung Kết &amp; Tranh Hạng 3
              </h3>
            </div>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                isFinalPublished
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {isFinalPublished ? 'Đã Công Khai' : 'Bản Nháp'}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {isSemiFinalsComplete ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Đã hoàn tất 2 trận Bán Kết. 2 đội Thắng &amp; 2 đội Thua đã xác định!
              </span>
            ) : (
              <span className="text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Chờ hoàn tất thi đấu Bán Kết 1 và Bán Kết 2.
              </span>
            )}
          </p>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-500">
              {isFinalPublished
                ? 'Đang mở cho Public & Bàn Trọng Tài.'
                : 'Chỉ BTC thấy, chưa mở ghi điểm.'}
            </span>
            <button
              onClick={handleToggleFinal}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                isFinalPublished
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
              }`}
            >
              {isFinalPublished ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" /> Thu Hồi Về Nháp
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" /> Công Khai Chung Kết
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* VISUAL TOURNAMENT BRACKET TREE - ADMIN VIEW */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wide font-display flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            SƠ ĐỒ NHÁNH ĐẤU TRỰC TIẾP (ADMIN DRAFT &amp; PREVIEW)
          </h3>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Tự động cập nhật theo kết quả thực tế
          </span>
        </div>

        {/* 3 Columns Bracket Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* COLUMN 1: BÁN KẾT */}
          <div className="space-y-4 flex flex-col justify-around">
            {/* BK 1 Card */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white font-black text-[10px]">#21</span>
                  Bán Kết 1 (Nhất A vs Nhì B)
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isSFPublished
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {isSFPublished ? 'Đã Public' : 'Bản Nháp'}
                </span>
              </div>
              <div className="p-3 space-y-2">
                {renderPairBox(
                  semiFinal1,
                  'pair1',
                  semiFinal1?.pair1,
                  'Nhất Bảng A',
                  semiFinal1?.status === 'FINISHED' && semiFinal1.winnerId === semiFinal1.pair1?.id
                )}
                {renderPairBox(
                  semiFinal1,
                  'pair2',
                  semiFinal1?.pair2,
                  'Nhì Bảng B',
                  semiFinal1?.status === 'FINISHED' && semiFinal1.winnerId === semiFinal1.pair2?.id
                )}
              </div>
            </div>

            {/* BK 2 Card */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white font-black text-[10px]">#22</span>
                  Bán Kết 2 (Nhất B vs Nhì A)
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isSFPublished
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {isSFPublished ? 'Đã Public' : 'Bản Nháp'}
                </span>
              </div>
              <div className="p-3 space-y-2">
                {renderPairBox(
                  semiFinal2,
                  'pair1',
                  semiFinal2?.pair1,
                  'Nhất Bảng B',
                  semiFinal2?.status === 'FINISHED' && semiFinal2.winnerId === semiFinal2.pair1?.id
                )}
                {renderPairBox(
                  semiFinal2,
                  'pair2',
                  semiFinal2?.pair2,
                  'Nhì Bảng A',
                  semiFinal2?.status === 'FINISHED' && semiFinal2.winnerId === semiFinal2.pair2?.id
                )}
              </div>
            </div>
          </div>

          {/* COLUMN 2: TRANH HẠNG BA */}
          <div className="flex flex-col justify-center my-auto lg:border-x lg:border-slate-100 lg:px-4">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              <div className="bg-slate-50 px-3 py-2 border-b border-slate-100 flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white font-black text-[10px]">#23</span>
                  Trận Tranh Hạng Ba
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isFinalPublished
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {isFinalPublished ? 'Đã Public' : 'Bản Nháp'}
                </span>
              </div>
              <div className="p-3 space-y-2">
                {renderPairBox(
                  thirdPlaceMatch,
                  'pair1',
                  thirdPlaceMatch?.pair1,
                  'Thua Bán Kết 1',
                  thirdPlaceMatch?.status === 'FINISHED' && thirdPlaceMatch.winnerId === thirdPlaceMatch.pair1?.id
                )}
                {renderPairBox(
                  thirdPlaceMatch,
                  'pair2',
                  thirdPlaceMatch?.pair2,
                  'Thua Bán Kết 2',
                  thirdPlaceMatch?.status === 'FINISHED' && thirdPlaceMatch.winnerId === thirdPlaceMatch.pair2?.id
                )}
              </div>
            </div>
          </div>

          {/* COLUMN 3: TRẬN CHUNG KẾT */}
          <div className="flex flex-col justify-center my-auto">
            <div className="rounded-2xl border-2 border-amber-400 bg-white shadow-md overflow-hidden ring-2 ring-amber-400/20">
              <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/20 px-3 py-2 border-b border-amber-300 flex items-center justify-between text-xs">
                <span className="font-extrabold text-amber-950 flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px]">#24</span>
                  🏆 Trận Chung Kết
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isFinalPublished
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  {isFinalPublished ? 'Đã Public' : 'Bản Nháp'}
                </span>
              </div>
              <div className="p-3 space-y-2">
                {renderPairBox(
                  finalMatch,
                  'pair1',
                  finalMatch?.pair1,
                  'Thắng Bán Kết 1',
                  finalMatch?.status === 'FINISHED' && finalMatch.winnerId === finalMatch.pair1?.id
                )}
                {renderPairBox(
                  finalMatch,
                  'pair2',
                  finalMatch?.pair2,
                  'Thắng Bán Kết 2',
                  finalMatch?.status === 'FINISHED' && finalMatch.winnerId === finalMatch.pair2?.id
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Podium preview if finished */}
        {isFinalFinished && championPair && (
          <div className="pt-4 border-t border-slate-100">
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 p-4 rounded-2xl border border-amber-300 text-center space-y-2">
              <span className="text-xs font-black text-amber-800 uppercase tracking-wider flex items-center justify-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Vinh Danh Nhà Vô Địch 2026
              </span>
              <p className="text-base font-extrabold text-slate-950">
                {championPair.name} ({championPair.player1?.name} &amp; {championPair.player2?.name})
              </p>
            </div>
          </div>
        )}
      </div>

      {/* EDIT KNOCKOUT PAIR MODAL */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-blue-600" />
                  Đổi Cặp Đấu - Trận #{editingSlot.match.matchNumber}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Vị trí: <span className="font-bold text-slate-700">{editingSlot.placeholderLabel}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingSlot(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {/* Current Status Info */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Trạng thái gán hiện tại:</span>
                  {editingSlot.isManual ? (
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Chỉ định thủ công
                    </span>
                  ) : (
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Tự động theo thứ hạng
                    </span>
                  )}
                </div>

                {editingSlot.isManual && (
                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-500">
                      Khôi phục cặp đấu theo bảng xếp hạng tự động:
                    </span>
                    <button
                      type="button"
                      onClick={handleResetToAuto}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Khôi phục Tự Động
                    </button>
                  </div>
                )}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên VĐV hoặc CLB..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                />
              </div>

              {/* Pairs List grouped by Group A / Group B */}
              <div className="space-y-3">
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  Chọn cặp đấu tham gia:
                </label>

                {pairs.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                    Chưa có cặp đấu nào trong giải. Vui lòng import danh sách cặp đấu ở mục Quản lý.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {pairs
                      .filter(p => {
                        if (!searchTerm.trim()) return true;
                        const term = searchTerm.toLowerCase();
                        return (
                          p.name.toLowerCase().includes(term) ||
                          p.code.toLowerCase().includes(term) ||
                          p.player1?.name.toLowerCase().includes(term) ||
                          p.player2?.name.toLowerCase().includes(term) ||
                          p.club?.toLowerCase().includes(term) ||
                          p.player1?.club?.toLowerCase().includes(term) ||
                          p.player2?.club?.toLowerCase().includes(term)
                        );
                      })
                      .map(p => {
                        const isSelected = selectedPairId === p.id;
                        return (
                          <div
                            key={p.id}
                            onClick={() => setSelectedPairId(p.id)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20'
                                : 'bg-white hover:bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                                    p.group === 'A'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-indigo-100 text-indigo-800'
                                  }`}
                                >
                                  {p.code || `Bảng ${p.group}`}
                                </span>
                                <span className="text-xs font-bold text-slate-900 truncate">
                                  {p.player1?.name} &amp; {p.player2?.name}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate">
                                CLB: {p.club || p.player1?.club || p.player2?.club || 'ISC'}
                              </p>
                            </div>

                            <div className="shrink-0 ml-2">
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'border-blue-600 bg-blue-600 text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setEditingSlot(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSavePairOverride}
                disabled={!selectedPairId}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-xs transition-all cursor-pointer"
              >
                Xác Nhận &amp; Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
