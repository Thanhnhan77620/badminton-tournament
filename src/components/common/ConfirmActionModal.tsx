import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, HelpCircle, X } from 'lucide-react';

export type ConfirmActionType = 'publish' | 'unpublish' | 'danger' | 'warning' | 'info';

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  actionType?: ConfirmActionType;
  details?: { label: string; value: string | number }[];
  isSubmitting?: boolean;
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Xác Nhận & Áp Dụng',
  cancelLabel = 'Hủy Bỏ',
  actionType = 'publish',
  details,
  isSubmitting = false,
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (actionType) {
      case 'publish':
        return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
      case 'unpublish':
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-amber-600" />;
      case 'danger':
        return <AlertCircle className="w-6 h-6 text-rose-600" />;
      default:
        return <HelpCircle className="w-6 h-6 text-blue-600" />;
    }
  };

  const getBadgeStyle = () => {
    switch (actionType) {
      case 'publish':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'unpublish':
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'danger':
        return 'bg-rose-50 border-rose-200 text-rose-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getConfirmButtonClasses = () => {
    switch (actionType) {
      case 'publish':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20';
      case 'unpublish':
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20';
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${getBadgeStyle()}`}>
              {getIcon()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-display">{title}</h3>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Xác nhận thay đổi trang Public
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content / Notice */}
        <div className="space-y-3">
          <div className="text-sm text-slate-600 leading-relaxed">{description}</div>

          {details && details.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2">
              <p className="text-xs font-bold text-slate-700">Thông tin chi tiết áp dụng:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {details.map((d, idx) => (
                  <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">{d.label}</span>
                    <span className="font-bold text-slate-900">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 leading-normal">
              <strong>Lưu ý:</strong> Sau khi xác nhận, khán giả và vận động viên trên toàn hệ thống (ở trang Public) sẽ nhìn thấy nội dung cập nhật mới nhất ngay lập tức.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 ${getConfirmButtonClasses()}`}
          >
            {isSubmitting && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
