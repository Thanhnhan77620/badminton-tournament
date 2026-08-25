import React from 'react';
import { TournamentInfo } from '../types/tournament';
import { Calendar, MapPin, Award, Layers, CheckCircle2 } from 'lucide-react';

interface TournamentSummaryProps {
  tournament: TournamentInfo;
}

export const TournamentSummary: React.FC<TournamentSummaryProps> = ({ tournament }) => {
  const prizes = tournament.prizes || [];
  const totalPrize = prizes.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalPrizeFormatted = `${totalPrize.toLocaleString('vi-VN')} VNĐ`;
  const championPrize = prizes.find(p => p.rank === 1 || p.medalType === 'gold');
  const championAmtFormatted = championPrize
    ? `${(championPrize.amount || 0).toLocaleString('vi-VN')} VNĐ`
    : '';

  return (
    <section className="py-8 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
              Thông Tin Tổng Quan
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Tóm tắt quy mô, thể thức và địa điểm tổ chức giải đấu {tournament.name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Thời gian & Địa điểm */}
          <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Thời Gian & Địa Điểm</h3>
            <p className="text-xs text-slate-600 mt-1 font-medium">{tournament.date}</p>
            <p className="text-xs text-slate-500">{tournament.timeRange}</p>
            <div className="mt-3 pt-2.5 border-t border-slate-200 text-xs text-slate-700 flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <span className="font-semibold">{tournament.venueName}</span>
            </div>
          </div>

          {/* Card 2: Quy mô & Đối tượng */}
          <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Quy Mô & Phân Bảng</h3>
            <p className="text-xs text-slate-600 mt-1">
              <span className="font-bold text-slate-900">10 Cặp Đấu</span> (20 VĐV)
            </p>
            <p className="text-xs text-slate-500">Chia làm 2 Bảng: Bảng A (5 cặp) & Bảng B (5 cặp)</p>
            <div className="mt-3 pt-2.5 border-t border-slate-200 text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Lấy Top 2 mỗi bảng vào Bán kết
            </div>
          </div>

          {/* Card 3: Thể thức tính điểm */}
          <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Thể Thức Tính Điểm</h3>
            <p className="text-xs text-slate-600 mt-1">
              <span className="font-semibold text-slate-800">Vòng bảng & Bán kết:</span> 1 set 21 điểm
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              <span className="font-semibold text-slate-800">Chung kết:</span> Best of 3 (15 điểm/set)
            </p>
            <div className="mt-3 pt-2.5 border-t border-slate-200 text-xs text-slate-600">
              Không áp dụng cách biệt 2 điểm
            </div>
          </div>

          {/* Card 4: Tổng giải thưởng */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50/70 transition-all shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center mb-3 font-black text-sm">
              🏆
            </div>
            <h3 className="text-sm font-bold text-slate-900">Tổng Giá Trị Giải Thưởng</h3>
            <p className="text-lg font-black text-amber-700 mt-1">{totalPrizeFormatted}</p>
            <p className="text-xs text-slate-600 mt-0.5">Top 3: Huy chương &amp; Tiền mặt | Hạng 4: Tiền mặt</p>
            <div className="mt-3 pt-2.5 border-t border-amber-200/80 text-xs text-amber-800 font-semibold">
              {championPrize?.title || 'Vô địch'}: {championAmtFormatted} + Huy Chương Vàng
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
