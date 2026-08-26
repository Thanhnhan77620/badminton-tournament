import React from 'react';
import { Match, Pair } from '../types/tournament';
import { PlayerAvatar } from './common/PlayerAvatar';
import { useTournament } from '../data/TournamentContext';
import { Trophy, ShieldCheck, Sparkles, ChevronRight, Users } from 'lucide-react';

interface KnockoutSectionProps {
  semiFinal1?: Match | null;
  semiFinal2?: Match | null;
  thirdPlaceMatch?: Match | null;
  finalMatch?: Match | null;
  championPair?: Pair | null;
  onSelectMatch: (match: Match) => void;
}

// Dedicated Bracket Match Card component - Tinh gọn & An Toàn Tuyệt Đối
const BracketMatchCard: React.FC<{
  match?: Match | null;
  headerLabel?: string;
  isFinal?: boolean;
  defaultPair1Label?: string;
  defaultPair2Label?: string;
  isPair1Ready?: boolean;
  isPair2Ready?: boolean;
  pair1Override?: Pair | null;
  pair2Override?: Pair | null;
  onSelectMatch: (match: Match) => void;
}> = ({
  match,
  headerLabel,
  isFinal = false,
  defaultPair1Label = 'Nhất Bảng A',
  defaultPair2Label = 'Nhì Bảng B',
  isPair1Ready = true,
  isPair2Ready = true,
  pair1Override,
  pair2Override,
  onSelectMatch,
}) => {
  if (!match) {
    return (
      <div
        className={`rounded-2xl bg-white transition-all overflow-hidden ${
          isFinal
            ? 'border-2 border-amber-300 shadow-xs'
            : 'border border-slate-200 shadow-xs'
        }`}
      >
        <div className="bg-slate-50 px-3.5 sm:px-4 py-2 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="font-extrabold text-slate-900 truncate">
            {headerLabel || 'Trận đấu'}
          </span>
          <span className="bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
            Chờ Xác Định
          </span>
        </div>
        <div className="p-3 sm:p-3.5 space-y-2 bg-white">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-600 truncate">{defaultPair1Label}</span>
            <span className="text-xs text-slate-400 font-bold">-</span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-600 truncate">{defaultPair2Label}</span>
            <span className="text-xs text-slate-400 font-bold">-</span>
          </div>
        </div>
      </div>
    );
  }

  const effectivePair1 = isPair1Ready ? (pair1Override || match.pair1) : null;
  const effectivePair2 = isPair2Ready ? (pair2Override || match.pair2) : null;

  const isFinished = match.status === 'FINISHED' && isPair1Ready && isPair2Ready;
  const isBestOf3 = match.format === 'BEST_OF_3_15';

  let pair1SetWins = 0;
  let pair2SetWins = 0;
  if (isBestOf3 && match.sets && isPair1Ready && isPair2Ready) {
    match.sets.forEach(set => {
      if (set.pair1Score > set.pair2Score) pair1SetWins++;
      else if (set.pair2Score > set.pair1Score) pair2SetWins++;
    });
  }

  const isPair1Winner = isFinished && match.winnerId === effectivePair1?.id;
  const isPair2Winner = isFinished && match.winnerId === effectivePair2?.id;

  return (
    <div
      onClick={() => onSelectMatch(match)}
      className={`rounded-2xl bg-white transition-all duration-200 cursor-pointer overflow-hidden ${
        isFinal
          ? 'border-2 border-amber-400 shadow-sm hover:shadow-md ring-2 ring-amber-400/20'
          : 'border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {/* Card Header: Tên trận + Trạng thái */}
      <div className="bg-slate-50 px-3.5 sm:px-4 py-2 border-b border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-extrabold text-slate-900 truncate pr-2">
          {match?.matchNumber ? (
            <span className="px-1.5 py-0.5 rounded bg-slate-900 text-white font-black text-[10px] shrink-0">
              #{match.matchNumber}
            </span>
          ) : null}
          <span className="truncate">{headerLabel || match.roundLabel}</span>
        </div>
        <div className="shrink-0">
          <span
            className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
              isFinished
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : match.status === 'LIVE'
                ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                : isPair1Ready && isPair2Ready
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {isFinished
              ? 'Đã Kết Thúc'
              : match.status === 'LIVE'
              ? 'Đang Đấu'
              : isPair1Ready && isPair2Ready
              ? 'Sẵn Sàng'
              : 'Chờ Vòng Trước'}
          </span>
        </div>
      </div>

      {/* Card Body with 2 Pair Boxes */}
      <div className="p-3 sm:p-3.5 space-y-2.5 bg-white">
        {/* Pair 1 Box */}
        {isPair1Ready && effectivePair1 ? (
          <div
            className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${
              isPair1Winner
                ? 'bg-amber-50/70 border border-amber-300 shadow-2xs'
                : 'bg-slate-50/80 border border-slate-200/80'
            }`}
          >
            <div className="flex-1 min-w-0 pr-2 space-y-1.5">
              {/* Player 1 */}
              <div className="flex items-center gap-2 min-w-0">
                <PlayerAvatar
                  name={effectivePair1.player1?.name || 'VĐV 1'}
                  avatarUrl={effectivePair1.player1?.avatarUrl}
                  size="xs"
                  className="ring-1 ring-slate-200 shrink-0 sm:w-7 sm:h-7 sm:text-xs md:w-7.5 md:h-7.5"
                />
                <span
                  className={`text-xs sm:text-[13px] md:text-sm lg:text-[15px] leading-tight truncate ${
                    isPair1Winner ? 'font-black text-slate-950' : 'font-bold text-slate-900'
                  }`}
                >
                  {effectivePair1.player1?.name || 'VĐV 1'}{' '}
                  <span className="text-[11px] sm:text-xs md:text-xs lg:text-[13px] font-semibold text-slate-500">
                    ({effectivePair1.player1?.club || effectivePair1.club || 'ISC'})
                  </span>
                </span>
              </div>

              {/* Player 2 */}
              <div className="flex items-center gap-2 min-w-0">
                <PlayerAvatar
                  name={effectivePair1.player2?.name || 'VĐV 2'}
                  avatarUrl={effectivePair1.player2?.avatarUrl}
                  size="xs"
                  className="ring-1 ring-slate-200 shrink-0 sm:w-7 sm:h-7 sm:text-xs md:w-7.5 md:h-7.5"
                />
                <span
                  className={`text-xs sm:text-[13px] md:text-sm lg:text-[15px] leading-tight truncate ${
                    isPair1Winner ? 'font-black text-slate-950' : 'font-bold text-slate-900'
                  }`}
                >
                  {effectivePair1.player2?.name || 'VĐV 2'}{' '}
                  <span className="text-[11px] sm:text-xs md:text-xs lg:text-[13px] font-semibold text-slate-500">
                    ({effectivePair1.player2?.club || effectivePair1.club || 'ISC'})
                  </span>
                </span>
              </div>
            </div>

            {/* Cúp vàng đánh dấu đội thắng */}
            {isPair1Winner && (
              <div className="px-2 sm:px-3 shrink-0 flex items-center justify-center self-center">
                <span className="text-lg sm:text-xl select-none" title="Thắng trận">
                  🏆
                </span>
              </div>
            )}

            {/* Scores */}
            <div className="shrink-0 self-center">
              {isBestOf3 ? (
                <div className="flex items-center gap-1">
                  {match.sets?.map((set, sIdx) => {
                    const wonSet = set.pair1Score > set.pair2Score;
                    return (
                      <div
                        key={sIdx}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs font-black tabular-nums ${
                          wonSet
                            ? 'bg-slate-950 text-white shadow-2xs'
                            : 'bg-white text-slate-700 border border-slate-200/80'
                        }`}
                      >
                        {set.pair1Score || '-'}
                      </div>
                    );
                  })}
                  <span className="text-xs sm:text-sm font-black text-blue-700 ml-1">
                    ({pair1SetWins})
                  </span>
                </div>
              ) : (
                <div
                  className={`min-w-[36px] sm:min-w-[42px] h-8 sm:h-9 px-2 rounded-xl flex items-center justify-center font-black text-base tabular-nums ${
                    isPair1Winner
                      ? 'bg-slate-950 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-800 border border-slate-200'
                  }`}
                >
                  {match.sets?.[0]?.pair1Score ?? '-'}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-50/70 border border-dashed border-slate-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-slate-200/70 text-slate-500 text-[10px] font-black flex items-center justify-center shrink-0">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-700 block truncate">
                  {defaultPair1Label}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Chờ hoàn tất bảng đấu</span>
              </div>
            </div>
            <span className="text-xs text-slate-400 font-bold px-2">-</span>
          </div>
        )}

        {/* Pair 2 Box */}
        {isPair2Ready && effectivePair2 ? (
          <div
            className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${
              isPair2Winner
                ? 'bg-amber-50/70 border border-amber-300 shadow-2xs'
                : 'bg-slate-50/80 border border-slate-200/80'
            }`}
          >
            <div className="flex-1 min-w-0 pr-2 space-y-1.5">
              {/* Player 1 */}
              <div className="flex items-center gap-2 min-w-0">
                <PlayerAvatar
                  name={effectivePair2.player1?.name || 'VĐV 1'}
                  avatarUrl={effectivePair2.player1?.avatarUrl}
                  size="xs"
                  className="ring-1 ring-slate-200 shrink-0 sm:w-7 sm:h-7 sm:text-xs md:w-7.5 md:h-7.5"
                />
                <span
                  className={`text-xs sm:text-[13px] md:text-sm lg:text-[15px] leading-tight truncate ${
                    isPair2Winner ? 'font-black text-slate-950' : 'font-bold text-slate-900'
                  }`}
                >
                  {effectivePair2.player1?.name || 'VĐV 1'}{' '}
                  <span className="text-[11px] sm:text-xs md:text-xs lg:text-[13px] font-semibold text-slate-500">
                    ({effectivePair2.player1?.club || effectivePair2.club || 'ISC'})
                  </span>
                </span>
              </div>

              {/* Player 2 */}
              <div className="flex items-center gap-2 min-w-0">
                <PlayerAvatar
                  name={effectivePair2.player2?.name || 'VĐV 2'}
                  avatarUrl={effectivePair2.player2?.avatarUrl}
                  size="xs"
                  className="ring-1 ring-slate-200 shrink-0 sm:w-7 sm:h-7 sm:text-xs md:w-7.5 md:h-7.5"
                />
                <span
                  className={`text-xs sm:text-[13px] md:text-sm lg:text-[15px] leading-tight truncate ${
                    isPair2Winner ? 'font-black text-slate-950' : 'font-bold text-slate-900'
                  }`}
                >
                  {effectivePair2.player2?.name || 'VĐV 2'}{' '}
                  <span className="text-[11px] sm:text-xs md:text-xs lg:text-[13px] font-semibold text-slate-500">
                    ({effectivePair2.player2?.club || effectivePair2.club || 'ISC'})
                  </span>
                </span>
              </div>
            </div>

            {/* Cúp vàng đánh dấu đội thắng */}
            {isPair2Winner && (
              <div className="px-2 sm:px-3 shrink-0 flex items-center justify-center self-center">
                <span className="text-lg sm:text-xl select-none" title="Thắng trận">
                  🏆
                </span>
              </div>
            )}

            {/* Scores */}
            <div className="shrink-0 self-center">
              {isBestOf3 ? (
                <div className="flex items-center gap-1">
                  {match.sets?.map((set, sIdx) => {
                    const wonSet = set.pair2Score > set.pair1Score;
                    return (
                      <div
                        key={sIdx}
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs font-black tabular-nums ${
                          wonSet
                            ? 'bg-slate-950 text-white shadow-2xs'
                            : 'bg-white text-slate-700 border border-slate-200/80'
                        }`}
                      >
                        {set.pair2Score || '-'}
                      </div>
                    );
                  })}
                  <span className="text-xs sm:text-sm font-black text-blue-700 ml-1">
                    ({pair2SetWins})
                  </span>
                </div>
              ) : (
                <div
                  className={`min-w-[36px] sm:min-w-[42px] h-8 sm:h-9 px-2 rounded-xl flex items-center justify-center font-black text-base tabular-nums ${
                    isPair2Winner
                      ? 'bg-slate-950 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-800 border border-slate-200'
                  }`}
                >
                  {match.sets?.[0]?.pair2Score ?? '-'}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-slate-50/70 border border-dashed border-slate-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-slate-200/70 text-slate-500 text-[10px] font-black flex items-center justify-center shrink-0">
                <Users className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-slate-700 block truncate">
                  {defaultPair2Label}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Chờ hoàn tất bảng đấu</span>
              </div>
            </div>
            <span className="text-xs text-slate-400 font-bold px-2">-</span>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="bg-white px-3.5 sm:px-4 py-2 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-400">
          {isBestOf3 ? '3 set thắng 2 (15đ)' : '1 set 21 điểm'}
        </span>
        <span className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-0.5">
          Chi tiết <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};

export const KnockoutSection: React.FC<KnockoutSectionProps> = ({
  semiFinal1,
  semiFinal2,
  thirdPlaceMatch,
  finalMatch,
  championPair,
  onSelectMatch,
}) => {
  const { matches, standingsA, standingsB, tournament } = useTournament();

  const isFinalFinished = finalMatch?.status === 'FINISHED';
  const isThirdPlaceFinished = thirdPlaceMatch?.status === 'FINISHED';

  const prizes = tournament.prizes || [];
  const totalPrize = prizes.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalPrizeFormatted = `${totalPrize.toLocaleString('vi-VN')} VNĐ`;

  const prize1 = prizes.find(p => p.rank === 1 || p.medalType === 'gold');
  const prize2 = prizes.find(p => p.rank === 2 || p.medalType === 'silver');
  const prize3 = prizes.find(p => p.rank === 3 || p.medalType === 'bronze');
  const prize4 = prizes.find(p => p.rank === 4 || p.medalType === 'fourth');

  // Group status check
  const matchesGroupA = matches.filter(m => m.group === 'A');
  const matchesGroupB = matches.filter(m => m.group === 'B');
  const isGroupAFinished = matchesGroupA.length > 0 && matchesGroupA.every(m => m.status === 'FINISHED');
  const isGroupBFinished = matchesGroupB.length > 0 && matchesGroupB.every(m => m.status === 'FINISHED');

  // Semi Finals readiness and qualified pairs
  const sf1Pair1 = isGroupAFinished && standingsA.length >= 1 ? standingsA[0].pair : null;
  const sf1Pair2 = isGroupBFinished && standingsB.length >= 2 ? standingsB[1].pair : null;
  const isSF1Ready = isGroupAFinished && isGroupBFinished;

  const sf2Pair1 = isGroupBFinished && standingsB.length >= 1 ? standingsB[0].pair : null;
  const sf2Pair2 = isGroupAFinished && standingsA.length >= 2 ? standingsA[1].pair : null;
  const isSF2Ready = isGroupAFinished && isGroupBFinished;

  // Semi-Final completed checks
  const isSF1Finished = semiFinal1?.status === 'FINISHED' && !!semiFinal1.winnerId;
  const isSF2Finished = semiFinal2?.status === 'FINISHED' && !!semiFinal2.winnerId;

  // Final & 3rd place pairs
  const finalPair1 = isSF1Finished
    ? (semiFinal1.winnerId === semiFinal1.pair1?.id ? (isGroupAFinished ? standingsA[0]?.pair : semiFinal1.pair1) : (isGroupBFinished ? standingsB[1]?.pair : semiFinal1.pair2))
    : null;
  const finalPair2 = isSF2Finished
    ? (semiFinal2.winnerId === semiFinal2.pair1?.id ? (isGroupBFinished ? standingsB[0]?.pair : semiFinal2.pair1) : (isGroupAFinished ? standingsA[1]?.pair : semiFinal2.pair2))
    : null;
  const isFinalReady = isSF1Finished && isSF2Finished;

  const thirdPair1 = isSF1Finished
    ? (semiFinal1.winnerId === semiFinal1.pair1?.id ? (isGroupBFinished ? standingsB[1]?.pair : semiFinal1.pair2) : (isGroupAFinished ? standingsA[0]?.pair : semiFinal1.pair1))
    : null;
  const thirdPair2 = isSF2Finished
    ? (semiFinal2.winnerId === semiFinal2.pair1?.id ? (isGroupAFinished ? standingsA[1]?.pair : semiFinal2.pair2) : (isGroupBFinished ? standingsB[0]?.pair : semiFinal2.pair1))
    : null;
  const isThirdReady = isSF1Finished && isSF2Finished;

  // Dynamic ranking from finalMatch and thirdPlaceMatch (only when matches are actually finished)
  const firstPair = isFinalFinished && finalMatch?.winnerId
    ? (finalMatch.winnerId === finalMatch.pair1?.id ? finalMatch.pair1 : finalMatch.pair2)
    : null;
  const secondPair = isFinalFinished && finalMatch?.winnerId
    ? (finalMatch.winnerId === finalMatch.pair1?.id ? finalMatch.pair2 : finalMatch.pair1)
    : null;
  const thirdPair = isThirdPlaceFinished && thirdPlaceMatch?.winnerId
    ? (thirdPlaceMatch.winnerId === thirdPlaceMatch.pair1?.id ? thirdPlaceMatch.pair1 : thirdPlaceMatch.pair2)
    : null;
  const fourthPair = isThirdPlaceFinished && thirdPlaceMatch?.winnerId
    ? (thirdPlaceMatch.winnerId === thirdPlaceMatch.pair1?.id ? thirdPlaceMatch.pair2 : thirdPlaceMatch.pair1)
    : null;

  return (
    <section className="py-8 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display tracking-tight">
                Vòng Chung Kết &amp; Nhánh Đấu (Knockout)
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Sơ đồ thi đấu trực tiếp Bán Kết, Tranh Hạng Ba và Chung Kết tranh cúp vô địch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isFinalFinished ? (
              <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Đã xác định Nhà Vô Địch 2026
              </span>
            ) : (
              <span className="text-xs font-bold text-blue-800 bg-blue-100 border border-blue-300 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Sơ Đồ Thi Đấu Trực Tiếp
              </span>
            )}
          </div>
        </div>

        {/* TOURNAMENT TOP 4 RESULTS PODIUM - 4 COLUMNS HORIZONTALLY */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              {isFinalFinished
                ? 'Bảng Vàng Thành Tích Chung Cuộc (Top 4 Đội Xuất Sắc)'
                : 'Cơ Cấu Giải Thưởng & Vinh Danh Top 4 Chung Cuộc'}
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Tổng giải thưởng {totalPrizeFormatted}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1st Place - HẠNG NHẤT (VÔ ĐỊCH) */}
            <div className="relative rounded-2xl bg-gradient-to-b from-amber-500/15 via-slate-900 to-slate-950 text-white p-4 sm:p-5 border-2 border-amber-400 shadow-xl space-y-3">
              <div className="flex items-center justify-between gap-1.5 flex-wrap sm:flex-nowrap">
                <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 text-[11px] sm:text-xs font-black uppercase tracking-normal whitespace-nowrap flex items-center gap-1 shadow-xs shrink-0">
                  🥇 {prize1?.title?.toUpperCase() || 'HẠNG NHẤT'}
                </span>
                <span className="text-xs sm:text-sm font-black text-amber-300 font-display whitespace-nowrap">
                  {prize1 ? `${(prize1.amount || 0).toLocaleString('vi-VN')} VNĐ` : '1.000.000 VNĐ'}
                </span>
              </div>

              <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                Huy Chương Vàng + Tiền Mặt
              </div>

              {/* Athletes Info */}
              <div className="space-y-2 pt-1 border-t border-amber-500/30">
                {isFinalFinished && firstPair ? (
                  <>
                    <div className="flex items-center gap-2.5">
                      <PlayerAvatar
                        name={firstPair.player1?.name || 'VĐV 1'}
                        avatarUrl={firstPair.player1?.avatarUrl}
                        size="sm"
                        className="ring-2 ring-amber-400 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-white truncate">
                          {firstPair.player1?.name || 'VĐV 1'}
                        </p>
                        <span className="text-[11px] text-amber-200/80 font-medium">
                          ({firstPair.player1?.club || firstPair.club || 'ISC'})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <PlayerAvatar
                        name={firstPair.player2?.name || 'VĐV 2'}
                        avatarUrl={firstPair.player2?.avatarUrl}
                        size="sm"
                        className="ring-2 ring-amber-400 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-white truncate">
                          {firstPair.player2?.name || 'VĐV 2'}
                        </p>
                        <span className="text-[11px] text-amber-200/80 font-medium">
                          ({firstPair.player2?.club || firstPair.club || 'ISC'})
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-2 text-center bg-slate-900/60 rounded-xl border border-amber-500/20">
                    <p className="text-xs font-bold text-amber-300">Thắng Trận Chung Kết</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Chờ vinh danh sau trận chung kết</p>
                  </div>
                )}
              </div>
            </div>

            {/* 2nd Place - HẠNG NHÌ (Á QUÂN) */}
            <div className="relative rounded-2xl bg-gradient-to-b from-slate-800/90 via-slate-900 to-slate-950 text-white p-4 sm:p-5 border border-slate-700 shadow-md space-y-3">
              <div className="flex items-center justify-between gap-1.5 flex-wrap sm:flex-nowrap">
                <span className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-950 text-[11px] sm:text-xs font-black uppercase tracking-normal whitespace-nowrap flex items-center gap-1 shadow-xs shrink-0">
                  🥈 {prize2?.title?.toUpperCase() || 'HẠNG NHÌ'}
                </span>
                <span className="text-xs sm:text-sm font-black text-slate-200 font-display whitespace-nowrap">
                  {prize2 ? `${(prize2.amount || 0).toLocaleString('vi-VN')} VNĐ` : '700.000 VNĐ'}
                </span>
              </div>

              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Huy Chương Bạc + Tiền Mặt
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-800">
                {isFinalFinished && secondPair ? (
                  <>
                    <div className="flex items-center gap-2.5">
                      <PlayerAvatar
                        name={secondPair.player1?.name || 'VĐV 1'}
                        avatarUrl={secondPair.player1?.avatarUrl}
                        size="sm"
                        className="ring-1 ring-slate-400 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-white truncate">
                          {secondPair.player1?.name || 'VĐV 1'}
                        </p>
                        <span className="text-[11px] text-slate-400 font-medium">
                          ({secondPair.player1?.club || secondPair.club || 'ISC'})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <PlayerAvatar
                        name={secondPair.player2?.name || 'VĐV 2'}
                        avatarUrl={secondPair.player2?.avatarUrl}
                        size="sm"
                        className="ring-1 ring-slate-400 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-white truncate">
                          {secondPair.player2?.name || 'VĐV 2'}
                        </p>
                        <span className="text-[11px] text-slate-400 font-medium">
                          ({secondPair.player2?.club || secondPair.club || 'ISC'})
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-2 text-center bg-slate-900/60 rounded-xl border border-slate-800">
                    <p className="text-xs font-bold text-slate-300">Thua Trận Chung Kết</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Chờ vinh danh sau trận chung kết</p>
                  </div>
                )}
              </div>
            </div>

            {/* 3rd Place - HẠNG BA */}
            <div className="relative rounded-2xl bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 text-white p-4 sm:p-5 border border-amber-800/40 shadow-md space-y-3">
              <div className="flex items-center justify-between gap-1.5 flex-wrap sm:flex-nowrap">
                <span className="px-2.5 py-1 rounded-lg bg-amber-700 text-white text-[11px] sm:text-xs font-black uppercase tracking-normal whitespace-nowrap flex items-center gap-1 shadow-xs shrink-0">
                  🥉 {prize3?.title?.toUpperCase() || 'HẠNG BA'}
                </span>
                <span className="text-xs sm:text-sm font-black text-amber-400 font-display whitespace-nowrap">
                  {prize3 ? `${(prize3.amount || 0).toLocaleString('vi-VN')} VNĐ` : '500.000 VNĐ'}
                </span>
              </div>

              <div className="text-[11px] font-bold text-amber-400/90 uppercase tracking-wider">
                Huy Chương Đồng + Tiền Mặt
              </div>

              <div className="space-y-2 pt-1 border-t border-amber-900/40">
                {isThirdPlaceFinished && thirdPair ? (
                  <>
                    <div className="flex items-center gap-2.5">
                      <PlayerAvatar
                        name={thirdPair.player1?.name || 'VĐV 1'}
                        avatarUrl={thirdPair.player1?.avatarUrl}
                        size="sm"
                        className="ring-1 ring-amber-600 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-white truncate">
                          {thirdPair.player1?.name || 'VĐV 1'}
                        </p>
                        <span className="text-[11px] text-slate-400 font-medium">
                          ({thirdPair.player1?.club || thirdPair.club || 'ISC'})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <PlayerAvatar
                        name={thirdPair.player2?.name || 'VĐV 2'}
                        avatarUrl={thirdPair.player2?.avatarUrl}
                        size="sm"
                        className="ring-1 ring-amber-600 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-white truncate">
                          {thirdPair.player2?.name || 'VĐV 2'}
                        </p>
                        <span className="text-[11px] text-slate-400 font-medium">
                          ({thirdPair.player2?.club || thirdPair.club || 'ISC'})
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-2 text-center bg-slate-900/60 rounded-xl border border-amber-900/30">
                    <p className="text-xs font-bold text-amber-400">Thắng Tranh Hạng Ba</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Chờ vinh danh sau trận tranh Hạng 3</p>
                  </div>
                )}
              </div>
            </div>

            {/* 4th Place - HẠNG TƯ */}
            <div className="relative rounded-2xl bg-gradient-to-b from-blue-950/30 via-slate-900 to-slate-950 text-white p-4 sm:p-5 border border-slate-800 shadow-md space-y-3">
              <div className="flex items-center justify-between gap-1.5 flex-wrap sm:flex-nowrap">
                <span className="px-2.5 py-1 rounded-lg bg-slate-700 text-slate-200 text-[11px] sm:text-xs font-black uppercase tracking-normal whitespace-nowrap flex items-center gap-1 shadow-xs shrink-0">
                  🎖️ {prize4?.title?.toUpperCase() || 'HẠNG TƯ'}
                </span>
                <span className="text-xs sm:text-sm font-black text-blue-300 font-display whitespace-nowrap">
                  {prize4 ? `${(prize4.amount || 0).toLocaleString('vi-VN')} VNĐ` : '300.000 VNĐ'}
                </span>
              </div>

              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                Chỉ Tiền Mặt
              </div>

              <div className="space-y-2 pt-1 border-t border-slate-800">
                {isThirdPlaceFinished && fourthPair ? (
                  <>
                    <div className="flex items-center gap-2.5">
                      <PlayerAvatar
                        name={fourthPair.player1?.name || 'VĐV 1'}
                        avatarUrl={fourthPair.player1?.avatarUrl}
                        size="sm"
                        className="ring-1 ring-slate-600 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-white truncate">
                          {fourthPair.player1?.name || 'VĐV 1'}
                        </p>
                        <span className="text-[11px] text-slate-400 font-medium">
                          ({fourthPair.player1?.club || fourthPair.club || 'ISC'})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <PlayerAvatar
                        name={fourthPair.player2?.name || 'VĐV 2'}
                        avatarUrl={fourthPair.player2?.avatarUrl}
                        size="sm"
                        className="ring-1 ring-slate-600 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-white truncate">
                          {fourthPair.player2?.name || 'VĐV 2'}
                        </p>
                        <span className="text-[11px] text-slate-400 font-medium">
                          ({fourthPair.player2?.club || fourthPair.club || 'ISC'})
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-2 text-center bg-slate-900/60 rounded-xl border border-slate-800">
                    <p className="text-xs font-bold text-slate-300">Thua Tranh Hạng Ba</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Chờ vinh danh sau trận tranh Hạng 3</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* VISUAL TOURNAMENT BRACKET TREE */}
        <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          {/* Top Bar with Shield Title Only */}
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-wide font-display flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              SƠ ĐỒ NHÁNH ĐẤU TRỰC TIẾP
            </h3>
          </div>

          {/* 3 COLUMNS BRACKET LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {/* COLUMN 1: VÒNG BÁN KẾT (2 MATCHES) */}
            <div className="flex flex-col justify-around space-y-5">
              <BracketMatchCard
                match={semiFinal1}
                headerLabel="Bán Kết 1 (Nhất A vs Nhì B)"
                defaultPair1Label="Nhất Bảng A"
                defaultPair2Label="Nhì Bảng B"
                isPair1Ready={isGroupAFinished && !!sf1Pair1}
                isPair2Ready={isGroupBFinished && !!sf1Pair2}
                pair1Override={sf1Pair1}
                pair2Override={sf1Pair2}
                onSelectMatch={onSelectMatch}
              />
              <BracketMatchCard
                match={semiFinal2}
                headerLabel="Bán Kết 2 (Nhất B vs Nhì A)"
                defaultPair1Label="Nhất Bảng B"
                defaultPair2Label="Nhì Bảng A"
                isPair1Ready={isGroupBFinished && !!sf2Pair1}
                isPair2Ready={isGroupAFinished && !!sf2Pair2}
                pair1Override={sf2Pair1}
                pair2Override={sf2Pair2}
                onSelectMatch={onSelectMatch}
              />
            </div>

            {/* COLUMN 2: TRANH HẠNG BA - TÂM ĐIỂM GIỮA */}
            <div className="flex flex-col justify-center my-auto lg:border-x lg:border-slate-100 lg:px-4">
              <div className="my-auto py-2">
                <BracketMatchCard
                  match={thirdPlaceMatch}
                  headerLabel="Trận Tranh Hạng Ba"
                  defaultPair1Label="Thua Bán Kết 1"
                  defaultPair2Label="Thua Bán Kết 2"
                  isPair1Ready={isThirdReady && !!thirdPair1}
                  isPair2Ready={isThirdReady && !!thirdPair2}
                  pair1Override={thirdPair1}
                  pair2Override={thirdPair2}
                  onSelectMatch={onSelectMatch}
                />
              </div>
            </div>

            {/* COLUMN 3: TRẬN CHUNG KẾT */}
            <div className="flex flex-col justify-center my-auto">
              <div className="my-auto py-2">
                <BracketMatchCard
                  match={finalMatch}
                  headerLabel="CHUNG KẾT TRANH CÚP VÔ ĐỊCH"
                  defaultPair1Label="Thắng Bán Kết 1"
                  defaultPair2Label="Thắng Bán Kết 2"
                  isPair1Ready={isFinalReady && !!finalPair1}
                  isPair2Ready={isFinalReady && !!finalPair2}
                  pair1Override={finalPair1}
                  pair2Override={finalPair2}
                  isFinal={true}
                  onSelectMatch={onSelectMatch}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

