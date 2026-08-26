import React from 'react';
import { Match } from '../../types/tournament';
import { PlayerAvatar } from './PlayerAvatar';
import { StatusBadge } from './StatusBadge';
import { Trophy, ChevronRight, MapPin } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  onClick?: (match: Match) => void;
  compact?: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onClick, compact = false }) => {
  const isFinished = match.status === 'FINISHED';
  const isBestOf3 = match.format === 'BEST_OF_3_15';

  // Calculate set wins for Best of 3
  let pair1SetWins = 0;
  let pair2SetWins = 0;
  if (isBestOf3) {
    match.sets.forEach(set => {
      if (set.pair1Score > set.pair2Score) pair1SetWins++;
      else if (set.pair2Score > set.pair1Score) pair2SetWins++;
    });
  }

  const isPair1Winner = isFinished && match.winnerId && match.winnerId === match.pair1?.id;
  const isPair2Winner = isFinished && match.winnerId && match.winnerId === match.pair2?.id;

  const isPair1Placeholder = !match.pair1 || match.pair1.id.startsWith('placeholder');
  const isPair2Placeholder = !match.pair2 || match.pair2.id.startsWith('placeholder');

  return (
    <div
      onClick={() => onClick && onClick(match)}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 ease-out ${
        isFinished
          ? 'border-slate-300/90 shadow-xs hover:border-slate-400 hover:shadow-md'
          : 'border-slate-300 shadow-xs hover:border-blue-500 hover:shadow-md'
      } ${onClick ? 'cursor-pointer' : ''} overflow-hidden`}
    >
      {/* Top Accent Indicator on Hover */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 transition-opacity duration-300 ${
          isFinished
            ? 'bg-amber-500 opacity-0 group-hover:opacity-100'
            : 'bg-blue-500 opacity-0 group-hover:opacity-100'
        }`}
      />

      {/* Match Header Bar: Trận Đấu & Trạng Thái */}
      <div className="bg-slate-50 px-3.5 py-2 border-b border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-800 truncate pr-2">
          {match.matchNumber ? (
            <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-black text-[11px] shrink-0 shadow-2xs">
              #{match.matchNumber}
            </span>
          ) : null}
          <span className="font-extrabold text-slate-900 truncate">{match.roundLabel || 'Trận đấu'}</span>
          {match.court && (
            <span className="hidden sm:inline text-slate-400 font-medium text-[11px]">
              &bull; {match.court}
            </span>
          )}
        </div>
        <div className="shrink-0">
          <StatusBadge status={match.status} size="sm" />
        </div>
      </div>

      {/* Main Teams Box */}
      <div className="p-3 sm:p-3.5 space-y-2.5 bg-white">
        {/* Pair 1 Row */}
        <div
          className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl transition-all duration-200 ${
            isPair1Winner
              ? 'bg-amber-50/70 border border-amber-300 shadow-2xs'
              : 'bg-slate-50/80 border border-slate-200/80 group-hover:bg-slate-50 group-hover:border-slate-300'
          }`}
        >
          {isPair1Placeholder ? (
            <div className="flex-1 min-w-0 pr-2 flex items-center gap-2.5 py-1">
              <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-900 font-black text-xs flex items-center justify-center shrink-0">
                {match.pair1?.code || 'A1'}
              </span>
              <div className="min-w-0">
                <p className="text-xs sm:text-[13px] md:text-sm font-bold text-slate-700 italic truncate">
                  {match.pair1?.name || 'Đội 1'}
                </p>
                <p className="text-[11px] text-slate-400 font-medium truncate">
                  (Chờ xác định từ vòng trước)
                </p>
              </div>
            </div>
          ) : (
            /* Pair 1: 2 dòng VĐV xếp dọc */
            <div className="flex-1 min-w-0 pr-2 space-y-1.5">
              {/* Player 1 */}
              <div className="flex items-center gap-2 min-w-0">
                <PlayerAvatar
                  name={match.pair1?.player1?.name || 'VĐV 1'}
                  avatarUrl={match.pair1?.player1?.avatarUrl}
                  size="xs"
                  className="ring-1 ring-slate-200 shrink-0 sm:w-7 sm:h-7 sm:text-xs md:w-7.5 md:h-7.5"
                />
                <span
                  className={`text-xs sm:text-[13px] md:text-sm lg:text-[15px] leading-tight truncate ${
                    isPair1Winner ? 'font-black text-slate-950' : 'font-bold text-slate-900'
                  }`}
                >
                  {match.pair1?.player1?.name || 'Chưa xác định'}{' '}
                  <span className="text-[11px] sm:text-xs md:text-xs lg:text-[13px] font-semibold text-slate-500">
                    ({match.pair1?.player1?.club || match.pair1?.club || 'ISC'})
                  </span>
                </span>
              </div>

              {/* Player 2 */}
              <div className="flex items-center gap-2 min-w-0">
                <PlayerAvatar
                  name={match.pair1?.player2?.name || 'VĐV 2'}
                  avatarUrl={match.pair1?.player2?.avatarUrl}
                  size="xs"
                  className="ring-1 ring-slate-200 shrink-0 sm:w-7 sm:h-7 sm:text-xs md:w-7.5 md:h-7.5"
                />
                <span
                  className={`text-xs sm:text-[13px] md:text-sm lg:text-[15px] leading-tight truncate ${
                    isPair1Winner ? 'font-black text-slate-950' : 'font-bold text-slate-900'
                  }`}
                >
                  {match.pair1?.player2?.name || 'Chưa xác định'}{' '}
                  <span className="text-[11px] sm:text-xs md:text-xs lg:text-[13px] font-semibold text-slate-500">
                    ({match.pair1?.player2?.club || match.pair1?.club || 'ISC'})
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Cúp vàng đánh dấu đội thắng ở vùng giữa */}
          {isPair1Winner && (
            <div className="px-2 sm:px-3 shrink-0 flex items-center justify-center self-center">
              <span className="text-lg sm:text-xl select-none" title="Thắng trận">
                🏆
              </span>
            </div>
          )}

          {/* Scores Pair 1 */}
          <div className="flex items-center gap-1.5 shrink-0 self-center">
            {isBestOf3 ? (
              <div className="flex items-center gap-1">
                {(match.sets || []).map((set, idx) => (
                  <span
                    key={idx}
                    className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-xs sm:text-sm tabular-nums font-black ${
                      set.pair1Score > set.pair2Score && isFinished
                        ? 'bg-slate-950 text-white shadow-2xs'
                        : isFinished
                        ? 'bg-white text-slate-600 border border-slate-200'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isFinished ? (set.pair1Score || 0) : '-'}
                  </span>
                ))}
                {isFinished && (
                  <span className="ml-1 text-xs sm:text-sm font-black text-blue-700 tabular-nums">
                    ({pair1SetWins})
                  </span>
                )}
              </div>
            ) : (
              <span
                className={`min-w-[36px] sm:min-w-[42px] h-8 sm:h-9 px-2 flex items-center justify-center rounded-xl text-base sm:text-lg tabular-nums font-black ${
                  isPair1Winner
                    ? 'bg-slate-950 text-white shadow-xs'
                    : isFinished
                    ? 'bg-slate-100 text-slate-800 border border-slate-200'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isFinished ? (match.sets?.[0]?.pair1Score ?? '-') : '-'}
              </span>
            )}
          </div>
        </div>

        {/* Pair 2 Row */}
        <div
          className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl transition-all duration-200 ${
            isPair2Winner
              ? 'bg-amber-50/70 border border-amber-300 shadow-2xs'
              : 'bg-slate-50/80 border border-slate-200/80 group-hover:bg-slate-50 group-hover:border-slate-300'
          }`}
        >
          {isPair2Placeholder ? (
            <div className="flex-1 min-w-0 pr-2 flex items-center gap-2.5 py-1">
              <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center shrink-0">
                {match.pair2?.code || 'B2'}
              </span>
              <div className="min-w-0">
                <p className="text-xs sm:text-[13px] md:text-sm font-bold text-slate-700 italic truncate">
                  {match.pair2?.name || 'Đội 2'}
                </p>
                <p className="text-[11px] text-slate-400 font-medium truncate">
                  (Chờ xác định từ vòng trước)
                </p>
              </div>
            </div>
          ) : (
            /* Pair 2: 2 dòng VĐV xếp dọc */
            <div className="flex-1 min-w-0 pr-2 space-y-1.5">
              {/* Player 1 */}
              <div className="flex items-center gap-2 min-w-0">
                <PlayerAvatar
                  name={match.pair2?.player1?.name || 'VĐV 1'}
                  avatarUrl={match.pair2?.player1?.avatarUrl}
                  size="xs"
                  className="ring-1 ring-slate-200 shrink-0 sm:w-7 sm:h-7 sm:text-xs md:w-7.5 md:h-7.5"
                />
                <span
                  className={`text-xs sm:text-[13px] md:text-sm lg:text-[15px] leading-tight truncate ${
                    isPair2Winner ? 'font-black text-slate-950' : 'font-bold text-slate-900'
                  }`}
                >
                  {match.pair2?.player1?.name || 'Chưa xác định'}{' '}
                  <span className="text-[11px] sm:text-xs md:text-xs lg:text-[13px] font-semibold text-slate-500">
                    ({match.pair2?.player1?.club || match.pair2?.club || 'ISC'})
                  </span>
                </span>
              </div>

              {/* Player 2 */}
              <div className="flex items-center gap-2 min-w-0">
                <PlayerAvatar
                  name={match.pair2?.player2?.name || 'VĐV 2'}
                  avatarUrl={match.pair2?.player2?.avatarUrl}
                  size="xs"
                  className="ring-1 ring-slate-200 shrink-0 sm:w-7 sm:h-7 sm:text-xs md:w-7.5 md:h-7.5"
                />
                <span
                  className={`text-xs sm:text-[13px] md:text-sm lg:text-[15px] leading-tight truncate ${
                    isPair2Winner ? 'font-black text-slate-950' : 'font-bold text-slate-900'
                  }`}
                >
                  {match.pair2?.player2?.name || 'Chưa xác định'}{' '}
                  <span className="text-[11px] sm:text-xs md:text-xs lg:text-[13px] font-semibold text-slate-500">
                    ({match.pair2?.player2?.club || match.pair2?.club || 'ISC'})
                  </span>
                </span>
              </div>
            </div>
          )}

          {/* Cúp vàng đánh dấu đội thắng ở vùng giữa */}
          {isPair2Winner && (
            <div className="px-2 sm:px-3 shrink-0 flex items-center justify-center self-center">
              <span className="text-lg sm:text-xl select-none" title="Thắng trận">
                🏆
              </span>
            </div>
          )}

          {/* Scores Pair 2 */}
          <div className="flex items-center gap-1.5 shrink-0 self-center">
            {isBestOf3 ? (
              <div className="flex items-center gap-1">
                {(match.sets || []).map((set, idx) => (
                  <span
                    key={idx}
                    className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-xs sm:text-sm tabular-nums font-black ${
                      set.pair2Score > set.pair1Score && isFinished
                        ? 'bg-slate-950 text-white shadow-2xs'
                        : isFinished
                        ? 'bg-white text-slate-600 border border-slate-200'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isFinished ? (set.pair2Score || 0) : '-'}
                  </span>
                ))}
                {isFinished && (
                  <span className="ml-1 text-xs sm:text-sm font-black text-blue-700 tabular-nums">
                    ({pair2SetWins})
                  </span>
                )}
              </div>
            ) : (
              <span
                className={`min-w-[36px] sm:min-w-[42px] h-8 sm:h-9 px-2 flex items-center justify-center rounded-xl text-base sm:text-lg tabular-nums font-black ${
                  isPair2Winner
                    ? 'bg-slate-950 text-white shadow-xs'
                    : isFinished
                    ? 'bg-slate-100 text-slate-800 border border-slate-200'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isFinished ? (match.sets?.[0]?.pair2Score ?? '-') : '-'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer: Xem Chi Tiết */}
      {!compact && (
        <div className="px-3.5 py-2 bg-slate-100/70 border-t border-slate-200 flex items-center justify-end text-xs">
          <span className="inline-flex items-center gap-1 text-blue-600 font-bold group-hover:text-blue-700 group-hover:translate-x-0.5 transition-all text-xs">
            Xem chi tiết <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      )}
    </div>
  );
};

