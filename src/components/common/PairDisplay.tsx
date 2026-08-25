import React from 'react';
import { Pair } from '../../types/tournament';
import { PlayerAvatar } from './PlayerAvatar';
import { Trophy, Award } from 'lucide-react';

interface PairDisplayProps {
  pair: Pair;
  isWinner?: boolean;
  score?: number;
  setScores?: number[];
  isServing?: boolean;
  align?: 'left' | 'right';
  variant?: 'card' | 'compact' | 'modal';
  className?: string;
}

export const PairDisplay: React.FC<PairDisplayProps> = ({
  pair,
  isWinner = false,
  score,
  setScores,
  isServing = false,
  align = 'left',
  variant = 'card',
  className = '',
}) => {
  const isRight = align === 'right';

  return (
    <div
      className={`flex items-center gap-2.5 sm:gap-3 transition-all ${
        isRight ? 'flex-row-reverse text-right' : 'text-left'
      } ${className}`}
    >
      {/* Visual content: Individual players list stacked vertically with (Unit) */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Player 1: Avatar + Name (Unit) */}
        <div
          className={`flex items-center gap-2 ${
            isRight ? 'flex-row-reverse justify-start' : 'justify-start'
          }`}
        >
          <PlayerAvatar
            name={pair?.player1?.name || 'VĐV 1'}
            avatarUrl={pair?.player1?.avatarUrl}
            size={variant === 'compact' ? 'xs' : 'sm'}
            className="ring-1.5 ring-slate-200 shrink-0"
          />
          <div className="min-w-0 truncate">
            <span
              className={`text-xs sm:text-sm leading-tight ${
                isWinner
                  ? 'font-bold text-emerald-950'
                  : 'font-semibold text-slate-900'
              }`}
            >
              {pair?.player1?.name || 'VĐV 1'}
            </span>
            <span className="text-[11px] font-medium text-slate-500 ml-1">
              ({pair?.player1?.club || pair?.club || 'CLB'})
            </span>
          </div>
        </div>

        {/* Player 2: Avatar + Name (Unit) */}
        <div
          className={`flex items-center gap-2 ${
            isRight ? 'flex-row-reverse justify-start' : 'justify-start'
          }`}
        >
          <PlayerAvatar
            name={pair?.player2?.name || 'VĐV 2'}
            avatarUrl={pair?.player2?.avatarUrl}
            size={variant === 'compact' ? 'xs' : 'sm'}
            className="ring-1.5 ring-slate-200 shrink-0"
          />
          <div className="min-w-0 truncate">
            <span
              className={`text-xs sm:text-sm leading-tight ${
                isWinner
                  ? 'font-bold text-emerald-950'
                  : 'font-semibold text-slate-900'
              }`}
            >
              {pair?.player2?.name || 'VĐV 2'}
            </span>
            <span className="text-[11px] font-medium text-slate-500 ml-1">
              ({pair?.player2?.club || pair?.club || 'CLB'})
            </span>
          </div>
        </div>

        {/* Status indicator badges (if winner or serving) */}
        {(isWinner || isServing) && (
          <div
            className={`flex items-center gap-1.5 pt-0.5 ${
              isRight ? 'flex-row-reverse justify-start' : 'justify-start'
            }`}
          >
            {isWinner && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded-full border border-amber-300">
                <Trophy className="w-2.5 h-2.5 text-amber-600 fill-amber-500" /> Thắng trận
              </span>
            )}
            {isServing && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded-full border border-rose-200">
                🏸 Đang giao cầu
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
