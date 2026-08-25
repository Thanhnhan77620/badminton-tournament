import React, { useState } from 'react';
import { useTournament } from '../../data/TournamentContext';
import { ShieldCheck, Lock, ArrowRight, Eye, Sparkles, AlertCircle, X } from 'lucide-react';

interface LoginPageProps {
  onSuccess?: () => void;
  onBackToPublic?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onBackToPublic }) => {
  const { login, setViewMode } = useTournament();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Vui lòng nhập mật mã truy cập BTC.');
      return;
    }

    setIsLoading(true);
    setError('');

    setTimeout(() => {
      const ok = login(passcode);
      setIsLoading(false);
      if (ok) {
        setViewMode('admin');
        if (onSuccess) onSuccess();
      } else {
        setError('Mật mã không chính xác. Vui lòng thử lại (Gợi ý: admin hoặc isc2026).');
      }
    }, 200);
  };

  const handleQuickLogin = (code: string) => {
    setPasscode(code);
    login(code);
    setViewMode('admin');
    if (onSuccess) onSuccess();
  };

  const handleExit = () => {
    if (onBackToPublic) {
      onBackToPublic();
    } else {
      setViewMode('public');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full relative">
        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-8 space-y-6 relative overflow-hidden">
          {/* Top subtle highlight line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500" />

          {/* Close button if modal */}
          {onBackToPublic && (
            <button
              onClick={handleExit}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto shadow-xs">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wider">
              Cổng Điều Hành Giải Đấu
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
              Đăng Nhập Ban Tổ Chức
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
              Nhập mã quản trị để truy cập trang thiết lập điều lệ, phân bảng và ghi nhận điểm số.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Mật mã Ban Tổ Chức (BTC Passcode)
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passcode}
                  onChange={e => {
                    setPasscode(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Nhập mật khẩu (ví dụ: admin)"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  autoFocus
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <span className="inline-block animate-spin">⏳</span>
              ) : (
                <>
                  <span>Vào Trang Quản Trị</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Access Helper for Development / Demo */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Đăng nhập nhanh (Demo):
              </span>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
              >
                Mã: <code>admin</code>
              </button>
            </div>
            <p className="text-[11px] text-slate-400 text-center">
              Các mã được chấp nhận: <span className="font-mono text-slate-600">admin</span>, <span className="font-mono text-slate-600">isc2026</span>, <span className="font-mono text-slate-600">123456</span>
            </p>
          </div>

          {/* Back to Public Page */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleExit}
              className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" /> Quay lại trang Khách &amp; VĐV (Public)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
