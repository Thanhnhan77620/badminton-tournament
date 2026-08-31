import React, { useState } from 'react';
import { useTournament } from '../../data/TournamentContext';
import { FileText, Save, CheckCircle2, MapPin, Calendar, Clock, Trophy, ExternalLink, Lock } from 'lucide-react';

export const AdminTournamentInfo: React.FC = () => {
  const { tournament, updateTournamentInfo } = useTournament();

  const isEditable = tournament.status === 'UPCOMING';

  const [name, setName] = useState(tournament.name);
  const [subtitle, setSubtitle] = useState(tournament.subtitle);
  const [category, setCategory] = useState(tournament.category);
  const [date, setDate] = useState(tournament.date);
  const [timeRange, setTimeRange] = useState(tournament.timeRange);
  const [venueName, setVenueName] = useState(tournament.venueName);
  const [venueAddress, setVenueAddress] = useState(tournament.venueAddress);
  const [venueMapUrl, setVenueMapUrl] = useState(tournament.venueMapUrl || '');
  const [status, setStatus] = useState(tournament.status);

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditable) return;
    updateTournamentInfo({
      name,
      subtitle,
      category,
      date,
      timeRange,
      venueName,
      venueAddress,
      venueMapUrl,
      status,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-3 sm:p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2.5 border-b border-slate-100 gap-2">
        <div>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 font-display flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-600" />
            Cấu Hình Thông Tin Giải Đấu
          </h2>
        </div>

        {!isEditable && (
          <div className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>{tournament.status === 'COMPLETED' ? 'Hệ thống đã khóa (Đã bế mạc)' : 'Đã khóa chỉnh sửa thông tin (Đang diễn ra)'}</span>
          </div>
        )}

        {isSaved && (
          <div className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1 animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Đã lưu &amp; Đồng bộ ra trang Public!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Tên giải */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Tên Giải Đấu (Chính)
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={!isEditable}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
              required
            />
          </div>

          {/* Phụ đề giải */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Phụ Đề / Tên Tiếng Việt
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              disabled={!isEditable}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
              required
            />
          </div>

          {/* Ngày thi đấu */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-blue-600" /> Ngày Thi Đấu
            </label>
            <input
              type="text"
              value={date}
              onChange={e => setDate(e.target.value)}
              disabled={!isEditable}
              placeholder="12 Tháng 09, 2026"
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
              required
            />
          </div>

          {/* Khung giờ */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-600" /> Khung Giờ Thi Đấu
            </label>
            <input
              type="text"
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              disabled={!isEditable}
              placeholder="8h - 12h"
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
              required
            />
          </div>

          {/* Tên địa điểm sân */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-blue-600" /> Tên Sân Thi Đấu
            </label>
            <input
              type="text"
              value={venueName}
              onChange={e => setVenueName(e.target.value)}
              disabled={!isEditable}
              placeholder="Sân Cầu Lông ECO Badminton Court"
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
              required
            />
          </div>

          {/* Link Google Maps */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1 flex items-center gap-1">
              <ExternalLink className="w-3 h-3 text-blue-600" /> Đường dẫn Google Maps
            </label>
            <input
              type="url"
              value={venueMapUrl}
              onChange={e => setVenueMapUrl(e.target.value)}
              disabled={!isEditable}
              placeholder="https://share.google/..."
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Địa chỉ chi tiết */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
            Địa Chỉ Chi Tiết Sân Đấu
          </label>
          <input
            type="text"
            value={venueAddress}
            onChange={e => setVenueAddress(e.target.value)}
            disabled={!isEditable}
            placeholder="128 Đường Số 8, Phường Bình An, TP. Thủ Đức, TP. Hồ Chí Minh"
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
            required
          />
        </div>

        {/* Submit */}
        {isEditable && (
          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-lg font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu &amp; Cập Nhật Ra Trang Public</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
