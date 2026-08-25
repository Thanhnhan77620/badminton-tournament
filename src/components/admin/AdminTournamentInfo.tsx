import React, { useState } from 'react';
import { useTournament } from '../../data/TournamentContext';
import { FileText, Save, CheckCircle2, MapPin, Calendar, Clock, Trophy, ExternalLink } from 'lucide-react';

export const AdminTournamentInfo: React.FC = () => {
  const { tournament, updateTournamentInfo } = useTournament();

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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-100 gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 font-display flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Cấu Hình Thông Tin Giải Đấu
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Thông tin hiển thị tại Header, Banner Hero và Footer trang Public
          </p>
        </div>

        {isSaved && (
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Đã lưu &amp; Đồng bộ ra trang Public!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Tên giải */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Tên Giải Đấu (Chính)
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              required
            />
          </div>

          {/* Phụ đề giải */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Phụ Đề / Tên Tiếng Việt
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={e => setSubtitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              required
            />
          </div>

          {/* Nội dung thi đấu */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Nội Dung Thi Đấu
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="Đôi Nam">Đôi Nam (Men's Doubles)</option>
              <option value="Đôi Nữ">Đôi Nữ (Women's Doubles)</option>
              <option value="Đôi Nam Nữ">Đôi Nam Nữ (Mixed Doubles)</option>
              <option value="Đơn Nam">Đơn Nam (Men's Singles)</option>
              <option value="Đơn Nữ">Đơn Nữ (Women's Singles)</option>
            </select>
          </div>

          {/* Trạng thái giải */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Trạng Thái Giải Đấu
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="UPCOMING">Sắp diễn ra (Upcoming)</option>
              <option value="IN_PROGRESS">Đang diễn ra (In Progress)</option>
              <option value="COMPLETED">Đã kết thúc (Completed)</option>
            </select>
          </div>

          {/* Ngày thi đấu */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" /> Ngày Thi Đấu
            </label>
            <input
              type="text"
              value={date}
              onChange={e => setDate(e.target.value)}
              placeholder="12 Tháng 09, 2026"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              required
            />
          </div>

          {/* Khung giờ */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" /> Khung Giờ Thi Đấu
            </label>
            <input
              type="text"
              value={timeRange}
              onChange={e => setTimeRange(e.target.value)}
              placeholder="8h - 12h"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              required
            />
          </div>

          {/* Tên địa điểm sân */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" /> Tên Sân Thi Đấu
            </label>
            <input
              type="text"
              value={venueName}
              onChange={e => setVenueName(e.target.value)}
              placeholder="Sân Cầu Lông ECO Badminton Court"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
              required
            />
          </div>

          {/* Link Google Maps */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" /> Đường dẫn Google Maps
            </label>
            <input
              type="url"
              value={venueMapUrl}
              onChange={e => setVenueMapUrl(e.target.value)}
              placeholder="https://share.google/..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Địa chỉ chi tiết */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Địa Chỉ Chi Tiết Sân Đấu
          </label>
          <input
            type="text"
            value={venueAddress}
            onChange={e => setVenueAddress(e.target.value)}
            placeholder="128 Đường Số 8, Phường Bình An, TP. Thủ Đức, TP. Hồ Chí Minh"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
            required
          />
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Lưu &amp; Cập Nhật Ra Trang Public</span>
          </button>
        </div>
      </form>
    </div>
  );
};
