import React from 'react';
import { Prize } from '../types/tournament';
import { Trophy, Award } from 'lucide-react';

interface PrizeSectionProps {
  prizes: Prize[];
}

export const PrizeSection: React.FC<PrizeSectionProps> = ({ prizes = [] }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
  };

  const totalPrize = prizes.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const getMedalStyle = (type: Prize['medalType']) => {
    switch (type) {
      case 'gold':
        return {
          icon: '🥇',
          border: 'border-amber-300 ring-1 ring-amber-200',
          bg: 'bg-gradient-to-b from-amber-50/80 to-white',
          badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
          amountColor: 'text-amber-700',
          medalLabel: 'Huy Chương Vàng + Tiền Mặt',
        };
      case 'silver':
        return {
          icon: '🥈',
          border: 'border-slate-300',
          bg: 'bg-gradient-to-b from-slate-50 to-white',
          badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
          amountColor: 'text-slate-800',
          medalLabel: 'Huy Chương Bạc + Tiền Mặt',
        };
      case 'bronze':
        return {
          icon: '🥉',
          border: 'border-amber-700/20',
          bg: 'bg-gradient-to-b from-orange-50/40 to-white',
          badgeBg: 'bg-orange-100 text-orange-900 border-orange-200',
          amountColor: 'text-amber-900',
          medalLabel: 'Huy Chương Đồng + Tiền Mặt',
        };
      case 'fourth':
      default:
        return {
          icon: '💵',
          border: 'border-slate-200',
          bg: 'bg-white',
          badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
          amountColor: 'text-slate-700',
          medalLabel: 'Chỉ Tiền Mặt',
        };
    }
  };

  return (
    <section className="py-8 bg-slate-50/60 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display tracking-tight">
                Cơ Cấu Giải Thưởng
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Tổng giá trị giải thưởng {formatCurrency(totalPrize)} trao cho 4 thứ hạng cao nhất
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full shadow-2xs">
              Tổng thưởng: {formatCurrency(totalPrize)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {prizes.map(prize => {
            const style = getMedalStyle(prize.medalType);
            const isChampion = prize.rank === 1;

            return (
              <div
                key={prize.rank}
                className={`relative rounded-2xl p-4 sm:p-5 border ${style.border} ${style.bg} shadow-xs flex flex-col justify-between transition-all hover:shadow-md ${
                  isChampion ? 'sm:-translate-y-1' : ''
                }`}
              >
                {isChampion && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                    Vô Địch Giải
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl filter drop-shadow-xs">{style.icon}</span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap ${style.badgeBg}`}
                    >
                      {prize.titleEn}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900">{prize.title}</h3>
                  <p className="text-[11px] font-semibold text-slate-600 mt-1">
                    {style.medalLabel}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-baseline justify-between gap-1">
                  <span className="text-xs text-slate-500 font-medium shrink-0">Tiền thưởng:</span>
                  <span className={`text-base sm:text-lg font-black tabular-nums whitespace-nowrap tracking-tight font-display ${style.amountColor}`}>
                    {formatCurrency(prize.amount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
