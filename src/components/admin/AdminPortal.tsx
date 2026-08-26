import React, { useState } from 'react';
import { useTournament } from '../../data/TournamentContext';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Users,
  Layers,
  Award,
  Eye,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  Lock,
  PlayCircle,
  CheckCircle2,
  Sparkles,
  Menu,
  X,
  Columns,
  AlertTriangle,
} from 'lucide-react';
import { AdminDashboard } from './AdminDashboard';
import { AdminTournamentInfo } from './AdminTournamentInfo';
import { AdminRules } from './AdminRules';
import { AdminPlayers } from './AdminPlayers';
import { AdminPairsAndGroups } from './AdminPairsAndGroups';
import { AdminMatchesAndResults } from './AdminMatchesAndResults';

export type AdminSectionId =
  | 'dashboard'
  | 'tournament'
  | 'rules'
  | 'players'
  | 'pairs'
  | 'groups'
  | 'matches'
  | 'results';

interface NavItem {
  id: AdminSectionId;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

export const AdminPortal: React.FC = () => {
  const {
    tournament,
    pairs,
    matches,
    players,
    logout,
    setViewMode,
    setTournamentStatus,
  } = useTournament();

  const [activeSection, setActiveSection] = useState<AdminSectionId>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Bảng Điều Khiển (Dashboard)', icon: LayoutDashboard },
    { id: 'tournament', label: 'Thông Tin Giải Đấu', icon: FileText },
    { id: 'rules', label: 'Điều Lệ & Giải Thưởng', icon: BookOpen },
    { id: 'players', label: 'Vận Động Viên', icon: Users, badge: `${players.length}` },
    { id: 'groups', label: 'Cặp Đấu & Bảng A/B', icon: Layers, badge: `${pairs.length}` },
    { id: 'results', label: 'Bàn Ghi Điểm & Tỷ Số', icon: Award, badge: `${matches.length}` },
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard onNavigateSection={sec => setActiveSection(sec)} />;
      case 'tournament':
        return <AdminTournamentInfo />;
      case 'rules':
        return <AdminRules />;
      case 'players':
        return <AdminPlayers />;
      case 'pairs':
      case 'groups':
        return <AdminPairsAndGroups />;
      case 'matches':
      case 'results':
        return <AdminMatchesAndResults />;
      default:
        return <AdminDashboard onNavigateSection={sec => setActiveSection(sec)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      {/* Top Admin Master Header */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="flex items-center justify-between h-16">
            {/* Left Brand & Mobile Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                title="Mở menu quản trị"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-900/30">
                  <ShieldCheck className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/20 px-1.5 py-0.2 rounded">
                      ADMIN BTC
                    </span>
                    <span className="text-xs font-bold text-slate-400 hidden sm:inline">&bull; Ban Tổ Chức</span>
                  </div>
                  <h1 className="text-sm sm:text-base font-extrabold text-white leading-tight font-display">
                    {tournament.name}
                  </h1>
                </div>
              </div>
            </div>

            {/* Right Controls: Mode Switch & Logout */}
            <div className="flex items-center gap-2.5">
              {/* View Public Mode Switch Button */}
              <button
                onClick={() => setViewMode('public')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-900/30 transition-all cursor-pointer"
                title="Xem trang hiển thị công khai dành cho Khán Giả"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Xem Trang</span> Public
              </button>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors cursor-pointer"
                title="Đăng xuất khỏi tài khoản BTC"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Top-Tabs Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto py-2 sm:py-2.5 px-2.5 sm:px-4 space-y-2 sm:space-y-2.5">
        {/* Top Horizontal Tabs bar */}
        <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-xs flex items-center gap-1 overflow-x-auto custom-scrollbar">
          {navItems.map(item => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tournament Lifecycle Safety Lock Banner */}
        <div
          className={`rounded-xl p-2.5 sm:p-3 border transition-all shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 ${
            tournament.status === 'IN_PROGRESS'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950'
              : tournament.status === 'COMPLETED'
              ? 'bg-slate-900 text-white border-slate-700'
              : 'bg-blue-500/10 border-blue-500/30 text-blue-950'
          }`}
        >
          <div className="flex items-start sm:items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                tournament.status === 'IN_PROGRESS'
                  ? 'bg-emerald-600 text-white'
                  : tournament.status === 'COMPLETED'
                  ? 'bg-slate-800 text-amber-300'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {tournament.status === 'IN_PROGRESS' ? (
                <ShieldAlert className="w-4 h-4" />
              ) : tournament.status === 'COMPLETED' ? (
                <Lock className="w-4 h-4" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </div>

            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${
                    tournament.status === 'IN_PROGRESS'
                      ? 'bg-emerald-600 text-white'
                      : tournament.status === 'COMPLETED'
                      ? 'bg-slate-700 text-slate-200'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {tournament.status === 'IN_PROGRESS'
                    ? 'TRẠNG THÁI: ĐANG DIỄN RA'
                    : tournament.status === 'COMPLETED'
                    ? 'Hệ thống đã khóa (Đã bế mạc)'
                    : 'TRẠNG THÁI: CHUẨN BỊ (DRAFT / UPCOMING)'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick status switcher buttons */}
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => setShowStatusModal(true)}
              className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Chuyển Giai Đoạn Giải</span>
            </button>
          </div>
        </div>

        {/* Quick Context Summary Ribbon */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-4 shadow-sm border border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/30">
              <Columns className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-white flex items-center gap-2">
                <span>Không Gian Quản Trị Giải Đấu</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.2 rounded-full border border-emerald-500/30">
                  Thời Gian Thực
                </span>
              </div>
            </div>
          </div>

          {/* Quick Live Stats Pill Box */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <div className="px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>{players.length} VĐV</span>
            </div>
            <div className="px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>{pairs.length} Cặp (A/B)</span>
            </div>
            <div className="px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>{matches.filter(m => m.status === 'FINISHED').length}/{matches.length} Trận Đã Đấu</span>
            </div>
          </div>
        </div>

        {/* Active Section Content */}
        <div className="min-w-0">{renderSectionContent()}</div>
      </main>

      {/* Lifecycle Status Switcher Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Chuyển Giai Đoạn Vận Hành Giải Đấu
                </h3>
              </div>
              <button
                onClick={() => setShowStatusModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Option 1: UPCOMING */}
              <div
                onClick={() => {
                  setTournamentStatus('UPCOMING');
                  setShowStatusModal(false);
                }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                  tournament.status === 'UPCOMING'
                    ? 'border-blue-600 bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="w-5 h-5 rounded-full border-2 border-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                  {tournament.status === 'UPCOMING' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">
                      1. Giai Đoạn Chuẩn Bị (Upcoming / Draft)
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold text-[10px]">
                      Mở Toàn Bộ
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Cho phép thêm/sửa/xóa VĐV thoải mái, bốc thăm chia bảng ngẫu nhiên, sinh lại lịch thi đấu. Trang Public hiển thị Đếm ngược &amp; Danh sách chuẩn bị.
                  </p>
                </div>
              </div>

              {/* Option 2: IN_PROGRESS */}
              <div
                onClick={() => {
                  setTournamentStatus('IN_PROGRESS');
                  setShowStatusModal(false);
                }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                  tournament.status === 'IN_PROGRESS'
                    ? 'border-emerald-600 bg-emerald-50/50'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="w-5 h-5 rounded-full border-2 border-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  {tournament.status === 'IN_PROGRESS' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">
                      2. Giai Đoạn Đang Diễn Ra (Live / In Progress)
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Khóa An Toàn
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    <strong className="text-emerald-700">Khóa xóa VĐV, Khóa xóa Bảng &amp; Khóa đổi cặp.</strong> Chỉ cho phép cập nhật Tên đơn vị VĐV và Nhập điểm bàn Trọng tài. Trang Public mở toàn bộ Lịch đấu, Bảng xếp hạng và Nhánh Bán Kết / Chung Kết.
                  </p>
                </div>
              </div>

              {/* Option 3: COMPLETED */}
              <div
                onClick={() => {
                  setTournamentStatus('COMPLETED');
                  setShowStatusModal(false);
                }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                  tournament.status === 'COMPLETED'
                    ? 'border-purple-600 bg-purple-50/50'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="w-5 h-5 rounded-full border-2 border-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                  {tournament.status === 'COMPLETED' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">
                      3. Giai Đoạn Bế Mạc &amp; Đã Kết Thúc (Completed / Archive)
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-bold text-[10px]">
                      Chỉ Đọc (Read-only)
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Lưu trữ kết quả chung cuộc, vinh danh nhà Vô địch &amp; Thứ hạng. Khóa toàn bộ các thao tác chỉnh sửa tỷ số để bảo toàn hồ sơ giải đấu.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-72 bg-white h-full p-4 space-y-3 z-10 flex flex-col justify-between shadow-2xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-extrabold uppercase text-slate-800">
                  Menu Quản Trị BTC
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map(item => {
                  const isActive = activeSection === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-black ${
                          isActive ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setViewMode('public');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> Xem Trang Public
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
