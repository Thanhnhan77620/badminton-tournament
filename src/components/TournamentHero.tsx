import React from 'react';
import { TournamentInfo, Match } from '../types/tournament';
import { Trophy, Calendar, MapPin, Users, ShieldCheck, ChevronRight, Gift, ExternalLink } from 'lucide-react';
import { NavTab } from './TournamentHeader';
import { CountdownTimer } from './common/CountdownTimer';

interface TournamentHeroProps {
  tournament: TournamentInfo;
  onNavigate: (tab: NavTab) => void;
  nextUpcomingMatch?: Match | null;
}

export const TournamentHero: React.FC<TournamentHeroProps> = ({
  tournament,
  onNavigate,
  nextUpcomingMatch,
}) => {
  const prizes = tournament.prizes || [];
  const totalPrize = prizes.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalPrizeFormatted = `${totalPrize.toLocaleString('vi-VN')} VNĐ`;

  return (
    <section className="relative bg-slate-900 text-white overflow-hidden border-b border-slate-800">
      {/* Background Subtle Geometric Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]"></div>
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Tournament Identity & Title */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-4">
            {/* Main Tournament Heading */}
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white font-display uppercase leading-tight">
                {tournament.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 font-normal leading-relaxed">
                {tournament.subtitle} — Hội tụ các cặp đôi xuất sắc tranh tài qua 24 trận đấu tranh cúp vô địch và tổng cơ cấu giải thưởng {totalPrizeFormatted}.
              </p>
            </div>

            {/* Time & Venue Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 shadow-xs">
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-400 font-semibold">Thời gian thi đấu</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                    <p className="text-sm sm:text-base font-bold text-white tracking-wide">{tournament.date}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-500/25 border border-blue-400/50 text-blue-300 text-xs sm:text-sm font-extrabold tracking-wide shadow-xs">
                      {tournament.timeRange}
                    </span>
                  </div>
                </div>
              </div>

              <a
                href={tournament.venueMapUrl || 'https://share.google/8v5rTSLdYcTDDtBeX'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/60 transition-all group shadow-xs"
                title="Mở địa chỉ trên Google Maps"
              >
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-600/30 group-hover:text-indigo-300 shrink-0 transition-colors mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs text-slate-400 font-semibold">Địa điểm tổ chức</p>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-200 transition-colors truncate mt-0.5">
                    {tournament.venueName}
                  </p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{tournament.venueAddress}</p>
                </div>
              </a>
            </div>

            {/* MATCH / TOURNAMENT COUNTDOWN */}
            <div className="w-full bg-slate-900/90 border border-blue-500/30 hover:border-blue-400/50 transition-colors rounded-xl p-2.5 sm:p-3 shadow-lg bg-radial from-blue-950/20 to-slate-900/90">
              <CountdownTimer
                scheduledDate={tournament.rawDate || tournament.date || '12/09/2026'}
                scheduledTime="08:00"
                title="ĐẾM NGƯỢC ĐẾN GIẢI ĐẤU"
                variant="banner"
              />
            </div>

            {/* Quick Action Navigation */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                onClick={() => onNavigate('schedule')}
                className="px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-blue-950 flex items-center gap-2 transition-all cursor-pointer"
              >
                Xem Lịch &amp; Kết Quả
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('groups')}
                className="px-4 py-2 sm:px-5 sm:py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs sm:text-sm font-bold rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                Bảng Xếp Hạng A &amp; B
              </button>

              <button
                onClick={() => onNavigate('knockout')}
                className="px-4 py-2 sm:px-5 sm:py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-xs sm:text-sm font-bold rounded-xl border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                Vòng Chung Kết
              </button>
            </div>
          </div>

          {/* Right Column: Key Tournament Stats Matrix */}
          <div className="lg:col-span-5 xl:col-span-5 flex flex-col space-y-3">
            <div className="h-full bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col justify-between space-y-3">
              <div className="border-b border-slate-700 pb-2 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Thông Số Giải Đấu
                </span>
                <span className="text-[11px] text-blue-400 font-medium">ISC Sports</span>
              </div>

              {/* 4 Primary Stats Cards stretched evenly */}
              <div className="grid grid-cols-2 gap-2.5 flex-1">
                <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-700/80 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    Cặp VĐV
                  </div>
                  <div className="mt-1.5">
                    <p className="text-lg sm:text-xl font-black text-white font-display">10 Cặp</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">20 Vận động viên</p>
                  </div>
                </div>

                <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-700/80 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                    Bảng Đấu
                  </div>
                  <div className="mt-1.5">
                    <p className="text-lg sm:text-xl font-black text-white font-display">2 Bảng</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">5 cặp / bảng</p>
                  </div>
                </div>

                <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-700/80 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    Tổng Trận
                  </div>
                  <div className="mt-1.5">
                    <p className="text-lg sm:text-xl font-black text-white font-display">24 Trận</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">20 Bảng + 4 CK</p>
                  </div>
                </div>

                <div className="bg-slate-900/70 p-3 rounded-xl border border-slate-700/80 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                    <Gift className="w-3.5 h-3.5 text-amber-400" />
                    Giải Thưởng
                  </div>
                  <div className="mt-1.5">
                    <p className="text-sm sm:text-base font-black text-amber-300 font-display whitespace-nowrap tracking-tight leading-tight">
                      {totalPrizeFormatted}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{prizes.length} Hạng giải</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- CƠ CẤU GIẢI THƯỞNG BANNER RIBBON (Integrated inside Hero) --- */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-2xl p-4 sm:p-5 border border-amber-500/40 shadow-xl space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Trophy className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-400">
                  CƠ CẤU GIẢI THƯỞNG CHÍNH THỨC
                </h3>
              </div>
            </div>
            <div className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs font-bold text-amber-300">
              Tổng Quỹ Thưởng: <strong>{totalPrizeFormatted}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {prizes.map((pz, idx) => {
              const formattedAmt = `${(pz.amount || 0).toLocaleString('vi-VN')} VNĐ`;

              if (pz.rank === 1 || pz.medalType === 'gold') {
                return (
                  <div
                    key={pz.rank || idx}
                    className="bg-gradient-to-b from-amber-500/20 to-amber-950/40 border border-amber-400/60 rounded-xl p-3.5 shadow-sm space-y-1.5 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                        🥇 {pz.title.toUpperCase() || 'QUÁN QUÂN'}
                      </span>
                      <span className="text-sm font-black text-amber-300">{formattedAmt}</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-amber-200 pt-0.5">
                      Huy Chương Vàng + Tiền Mặt
                    </p>
                  </div>
                );
              }

              if (pz.rank === 2 || pz.medalType === 'silver') {
                return (
                  <div
                    key={pz.rank || idx}
                    className="bg-gradient-to-b from-slate-400/15 to-slate-900/60 border border-slate-400/40 rounded-xl p-3.5 shadow-sm space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-slate-300 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                        🥈 {pz.title.toUpperCase() || 'Á QUÂN'}
                      </span>
                      <span className="text-xs font-black text-slate-200">{formattedAmt}</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-200 pt-0.5">
                      Huy Chương Bạc + Tiền Mặt
                    </p>
                  </div>
                );
              }

              if (pz.rank === 3 || pz.medalType === 'bronze') {
                return (
                  <div
                    key={pz.rank || idx}
                    className="bg-gradient-to-b from-amber-700/15 to-slate-900/60 border border-amber-700/40 rounded-xl p-3.5 shadow-sm space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-amber-700 text-white text-[10px] font-black uppercase tracking-wider">
                        🥉 {pz.title.toUpperCase() || 'HẠNG BA'}
                      </span>
                      <span className="text-xs font-black text-amber-300">{formattedAmt}</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-amber-300 pt-0.5">
                      Huy Chương Đồng + Tiền Mặt
                    </p>
                  </div>
                );
              }

              return (
                <div
                  key={pz.rank || idx}
                  className="bg-gradient-to-b from-blue-900/20 to-slate-900/60 border border-blue-600/30 rounded-xl p-3.5 shadow-sm space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-slate-700 text-white text-[10px] font-black uppercase tracking-wider">
                      🎖️ {pz.title.toUpperCase() || `HẠNG ${pz.rank}`}
                    </span>
                    <span className="text-xs font-black text-blue-300">{formattedAmt}</span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-300 pt-0.5">
                    Thưởng Tiền Mặt
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
