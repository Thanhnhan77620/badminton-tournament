import React from 'react';
import { TournamentInfo } from '../types/tournament';
import { Trophy, MapPin, Calendar, Mail, Phone, ShieldCheck, ExternalLink } from 'lucide-react';
import { NavTab } from './TournamentHeader';

interface TournamentFooterProps {
  tournament: TournamentInfo;
  onNavigate: (tab: NavTab) => void;
}

export const TournamentFooter: React.FC<TournamentFooterProps> = ({
  tournament,
  onNavigate,
}) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Trophy className="w-4 h-4 text-amber-300" />
              </div>
              <span className="text-base font-extrabold text-white font-display tracking-tight">
                ISC BADMINTON OPEN 2026
              </span>
            </div>
            <p className="text-slate-400 text-xs max-w-md leading-relaxed">
              Trang thông tin &amp; kết quả chính thức của giải đấu Cầu Lông Đôi Nam ISC Badminton Open 2026. Nơi cập nhật lịch thi đấu, bảng xếp hạng, điểm số trực tiếp và các diễn biến kịch tính trên sân.
            </p>
            <div className="pt-2 flex items-center gap-4 text-slate-400 text-xs">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Ban Tổ Chức ISC Sports
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Điều Hướng Nhanh
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('overview')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Tổng quan giải đấu
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('schedule')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Lịch thi đấu &amp; Kết quả
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('groups')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Bảng xếp hạng A &amp; B
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('knockout')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Vòng Chung Kết &amp; Trao Giải
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('rules')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Điều lệ &amp; Thể thức
                </button>
              </li>
            </ul>
          </div>

          {/* Venue & Organizer Info */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Địa Điểm &amp; Liên Hệ
            </h4>
            <div className="space-y-2 text-xs">
              <a
                href={tournament.venueMapUrl || 'https://share.google/8v5rTSLdYcTDDtBeX'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 text-slate-300 hover:text-blue-300 transition-colors group"
                title="Mở địa chỉ trên Google Maps"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300 shrink-0 mt-0.5" />
                <span className="flex-1">
                  {tournament.venueName} — {tournament.venueAddress}
                  <ExternalLink className="w-3 h-3 inline-block ml-1 text-slate-500 group-hover:text-blue-400" />
                </span>
              </a>
              <p className="flex items-center gap-2 text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{tournament.date} ({tournament.timeRange})</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
