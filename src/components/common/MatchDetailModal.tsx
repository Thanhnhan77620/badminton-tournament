import React from 'react';
import { Match } from '../../types/tournament';
import { PlayerAvatar } from './PlayerAvatar';
import { StatusBadge } from './StatusBadge';
import { X, Trophy, Award, Activity } from 'lucide-react';

interface MatchDetailModalProps {
  match: Match | null;
  onClose: () => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({ match, onClose }) => {
  if (!match) return null;

  const isBestOf3 = match.format === 'BEST_OF_3_15';
  const isLive = match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED';

  // Calculate set wins if Best of 3
  let pair1Wins = 0;
  let pair2Wins = 0;
  if (isBestOf3) {
    match.sets.forEach(set => {
      if (set.pair1Score > set.pair2Score) pair1Wins++;
      else if (set.pair2Score > set.pair1Score) pair2Wins++;
    });
  }

  const isPair1Winner = isFinished && match.winnerId === match.pair1?.id;
  const isPair2Winner = isFinished && match.winnerId === match.pair2?.id;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Modal Container */}
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/30">
              <Trophy className="w-3.5 h-3.5" />
            </span>
            <div>
              <h3 className="font-bold text-xs sm:text-sm font-display leading-tight">
                {match.roundLabel}
              </h3>
              {match.court && (
                <p className="text-[10px] text-slate-400 leading-tight">
                  {match.court}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-4 space-y-2.5 bg-slate-50/50">
          {/* Match Status Bar */}
          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <StatusBadge status={match.status} />
              {isLive && (
                <span className="text-[11px] font-semibold text-rose-600 animate-pulse flex items-center gap-1">
                  <Activity className="w-3 h-3" /> Đang đấu
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium text-slate-500">
              {isBestOf3 ? 'Chạm 15 điểm (Best of 3)' : '1 set 21 điểm'}
            </span>
          </div>

          {/* Teams Confrontation */}
          <div className="space-y-2.5">
            {/* Pair 1 Card */}
            <div
              className={`p-2.5 sm:p-3 rounded-xl border transition-all ${
                isPair1Winner
                  ? 'border-amber-300 bg-[#FEF9EE] shadow-2xs'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold bg-[#0F172A] text-white px-1.5 py-0.5 rounded">
                    CẶP 1
                  </span>
                </div>
                {isPair1Winner && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                    <Award className="w-3 h-3 text-amber-600 fill-amber-500" /> THẮNG TRẬN
                  </span>
                )}
                {isLive && match.currentServingPairId === match.pair1?.id && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-200">
                    <Activity className="w-2.5 h-2.5 animate-pulse" /> Đang giao cầu
                  </span>
                )}
              </div>

              {/* 2 Players Stacked */}
              <div className="space-y-1.5">
                {/* Player 1 */}
                <div className="flex items-center gap-2">
                  <PlayerAvatar
                    name={match.pair1?.player1?.name || 'VĐV 1'}
                    avatarUrl={match.pair1?.player1?.avatarUrl}
                    size="xs"
                    className="w-5 h-5 sm:w-5.5 sm:h-5.5 shrink-0"
                  />
                  <div className="min-w-0 flex-1 flex items-baseline leading-tight">
                    <span className="text-xs sm:text-[13px] font-bold text-slate-900 truncate">
                      {match.pair1?.player1?.name || 'Chưa xác định'}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 ml-1 shrink-0">
                      ({match.pair1?.player1?.club || match.pair1?.club || 'ISC'})
                    </span>
                  </div>
                </div>

                {/* Player 2 */}
                <div className="flex items-center gap-2">
                  <PlayerAvatar
                    name={match.pair1?.player2?.name || 'VĐV 2'}
                    avatarUrl={match.pair1?.player2?.avatarUrl}
                    size="xs"
                    className="w-5 h-5 sm:w-5.5 sm:h-5.5 shrink-0"
                  />
                  <div className="min-w-0 flex-1 flex items-baseline leading-tight">
                    <span className="text-xs sm:text-[13px] font-bold text-slate-900 truncate">
                      {match.pair1?.player2?.name || 'Chưa xác định'}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 ml-1 shrink-0">
                      ({match.pair1?.player2?.club || match.pair1?.club || 'ISC'})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* VS & Big Score Display (Dark Box) */}
            <div className="bg-[#0F172A] text-white rounded-xl p-2.5 sm:p-3 text-center shadow-2xs">
              <p className="text-[9.5px] font-bold tracking-wider text-slate-400 uppercase mb-1">
                {isBestOf3 ? 'TỈ SỐ SET (BEST OF 3)' : 'TỈ SỐ TRẬN ĐẤU (1 SET 21)'}
              </p>

              {isBestOf3 ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-center gap-3 text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight leading-none py-0.5">
                    <span className={pair1Wins > pair2Wins ? 'text-amber-400' : 'text-white'}>
                      {pair1Wins}
                    </span>
                    <span className="text-slate-600 font-light text-xl">:</span>
                    <span className={pair2Wins > pair1Wins ? 'text-amber-400' : 'text-white'}>
                      {pair2Wins}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 pt-1.5 border-t border-slate-800 flex-wrap">
                    {match.sets.map((set, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-800/80 px-2 py-0.5 rounded text-[11px] font-mono"
                      >
                        <span className="text-slate-400 mr-1 text-[10px]">Set {idx + 1}:</span>
                        <span
                          className={
                            set.pair1Score > set.pair2Score ? 'text-amber-400 font-bold' : 'text-slate-300'
                          }
                        >
                          {set.pair1Score || 0}
                        </span>
                        <span className="text-slate-600 mx-1">-</span>
                        <span
                          className={
                            set.pair2Score > set.pair1Score ? 'text-amber-400 font-bold' : 'text-slate-300'
                          }
                        >
                          {set.pair2Score || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4 text-2xl sm:text-3xl font-black tabular-nums py-0.5">
                  <span
                    className={
                      isPair1Winner
                        ? 'text-amber-400'
                        : isLive
                        ? 'text-rose-400'
                        : isFinished
                        ? 'text-white'
                        : 'text-slate-400'
                    }
                  >
                    {match.sets[0]?.pair1Score ?? '-'}
                  </span>
                  <span className="text-slate-600 font-light text-xl">:</span>
                  <span
                    className={
                      isPair2Winner
                        ? 'text-amber-400'
                        : isLive
                        ? 'text-rose-400'
                        : isFinished
                        ? 'text-white'
                        : 'text-slate-400'
                    }
                  >
                    {match.sets[0]?.pair2Score ?? '-'}
                  </span>
                </div>
              )}
            </div>

            {/* Pair 2 Card */}
            <div
              className={`p-2.5 sm:p-3 rounded-xl border transition-all ${
                isPair2Winner
                  ? 'border-amber-300 bg-[#FEF9EE] shadow-2xs'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold bg-[#0F172A] text-white px-1.5 py-0.5 rounded">
                    CẶP 2
                  </span>
                </div>
                {isPair2Winner && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                    <Award className="w-3 h-3 text-amber-600 fill-amber-500" /> THẮNG TRẬN
                  </span>
                )}
                {isLive && match.currentServingPairId === match.pair2?.id && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-200">
                    <Activity className="w-2.5 h-2.5 animate-pulse" /> Đang giao cầu
                  </span>
                )}
              </div>

              {/* 2 Players Stacked */}
              <div className="space-y-1.5">
                {/* Player 1 */}
                <div className="flex items-center gap-2">
                  <PlayerAvatar
                    name={match.pair2?.player1?.name || 'VĐV 1'}
                    avatarUrl={match.pair2?.player1?.avatarUrl}
                    size="xs"
                    className="w-5 h-5 sm:w-5.5 sm:h-5.5 shrink-0"
                  />
                  <div className="min-w-0 flex-1 flex items-baseline leading-tight">
                    <span className="text-xs sm:text-[13px] font-bold text-slate-900 truncate">
                      {match.pair2?.player1?.name || 'Chưa xác định'}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 ml-1 shrink-0">
                      ({match.pair2?.player1?.club || match.pair2?.club || 'ISC'})
                    </span>
                  </div>
                </div>

                {/* Player 2 */}
                <div className="flex items-center gap-2">
                  <PlayerAvatar
                    name={match.pair2?.player2?.name || 'VĐV 2'}
                    avatarUrl={match.pair2?.player2?.avatarUrl}
                    size="xs"
                    className="w-5 h-5 sm:w-5.5 sm:h-5.5 shrink-0"
                  />
                  <div className="min-w-0 flex-1 flex items-baseline leading-tight">
                    <span className="text-xs sm:text-[13px] font-bold text-slate-900 truncate">
                      {match.pair2?.player2?.name || 'Chưa xác định'}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 ml-1 shrink-0">
                      ({match.pair2?.player2?.club || match.pair2?.club || 'ISC'})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-4 py-2.5 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
