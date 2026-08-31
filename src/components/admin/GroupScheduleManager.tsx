import React, { useState } from 'react';
import { useTournament } from '../../data/TournamentContext';
import { Match, Pair, ScoringFormat } from '../../types/tournament';
import { ConfirmActionModal, ConfirmActionType } from '../common/ConfirmActionModal';
import {
  Calendar,
  Clock,
  Plus,
  Upload,
  Globe,
  EyeOff,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  HelpCircle,
  Sparkles,
  Info,
  GripVertical,
  ArrowUp,
  ArrowDown,
  MoveVertical,
} from 'lucide-react';

interface GroupScheduleManagerProps {
  group: 'A' | 'B';
}

export const GroupScheduleManager: React.FC<GroupScheduleManagerProps> = ({ group }) => {
  const {
    pairs,
    matches,
    tournament,
    createManualMatch,
    importCustomGroupSchedule,
    reorderGroupMatches,
    deleteGroupMatches,
    togglePublishSchedule,
    updateMatch,
  } = useTournament();

  const isEditable = tournament.status === 'UPCOMING';
  const isReadOnly = !isEditable;

  const isPublished = group === 'A' ? (tournament.isScheduleAPublished ?? false) : (tournament.isScheduleBPublished ?? false);

  const groupPairs = pairs.filter(p => p.group === group);
  const groupMatches = matches.filter(m => m.group === group);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Tab: 'list' | 'create_manual' | 'import'
  const [activeTab, setActiveTab] = useState<'list' | 'create_manual' | 'import'>('list');

  // Manual Form State
  const [manualP1Id, setManualP1Id] = useState('');
  const [manualP2Id, setManualP2Id] = useState('');
  const [manualCourt, setManualCourt] = useState('Sân 01');
  const [manualTime, setManualTime] = useState('08:30');
  const [manualFormat, setManualFormat] = useState<ScoringFormat>('ONE_SET_21');
  const [manualError, setManualError] = useState('');

  // Import Schedule Form State
  const [importText, setImportText] = useState('');
  const [importReplace, setImportReplace] = useState(false);
  const [importDefaultCourt, setImportDefaultCourt] = useState('Sân 01');
  const [importDefaultTime, setImportDefaultTime] = useState('08:30');
  const [importError, setImportError] = useState('');

  // Success / Status Message
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Confirmation Modals State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: React.ReactNode;
    confirmLabel?: string;
    actionType: ConfirmActionType;
    details?: { label: string; value: string | number }[];
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionType: 'publish',
    onConfirm: () => {},
  });

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg(null), 5000);
  };

  // Reorder match logic
  const handleReorder = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= groupMatches.length ||
      toIndex >= groupMatches.length
    ) {
      return;
    }
    const items = [...groupMatches];
    const [movedItem] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, movedItem);
    reorderGroupMatches(group, items);
    showStatus(`Đã đổi thứ tự trận đấu thành công (Trận #${fromIndex + 1} ➔ #${toIndex + 1})!`);
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    handleReorder(index, index - 1);
  };

  const handleMoveDown = (index: number) => {
    if (index >= groupMatches.length - 1) return;
    handleReorder(index, index + 1);
  };

  const sampleFormat5Teams = group === 'A' 
    ? `1, A1, A2, Sân 01, 08:30
2, A3, A4, Sân 02, 08:30
3, A5, A1, Sân 01, 08:55
4, A2, A3, Sân 02, 08:55
5, A4, A5, Sân 01, 09:20
6, A1, A3, Sân 02, 09:20
7, A2, A4, Sân 01, 09:45
8, A3, A5, Sân 02, 09:45
9, A1, A4, Sân 01, 10:10
10, A2, A5, Sân 02, 10:10`
    : `11, B1, B2, Sân 01, 08:30
12, B3, B4, Sân 02, 08:30
13, B5, B1, Sân 01, 08:55
14, B2, B3, Sân 02, 08:55
15, B4, B5, Sân 01, 09:20
16, B1, B3, Sân 02, 09:20
17, B2, B4, Sân 01, 09:45
18, B3, B5, Sân 02, 09:45
19, B1, B4, Sân 01, 10:10
20, B2, B5, Sân 02, 10:10`;

  // Handle Manual Match Creation Submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setManualError('');

    if (!manualP1Id || !manualP2Id) {
      setManualError('Vui lòng chọn đầy đủ 2 cặp đấu!');
      return;
    }
    if (manualP1Id === manualP2Id) {
      setManualError('Không thể tạo trận đấu giữa một cặp đấu với chính mình!');
      return;
    }

    const p1 = groupPairs.find(p => p.id === manualP1Id);
    const p2 = groupPairs.find(p => p.id === manualP2Id);

    const res = createManualMatch({
      group,
      pair1Id: manualP1Id,
      pair2Id: manualP2Id,
      court: manualCourt,
      scheduledTime: manualTime,
      format: manualFormat,
    });

    if (!res.success) {
      setManualError(res.error || 'Có lỗi xảy ra khi tạo trận đấu.');
      return;
    }

    setManualP1Id('');
    setManualP2Id('');
    setActiveTab('list');
    showStatus(`Đã tạo thành công trận đấu: ${p1?.code || p1?.name} vs ${p2?.code || p2?.name}`);
  };

  // Handle Import Submit
  const handleImportScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError('');

    if (!importText.trim()) {
      setImportError('Vui lòng dán danh sách thứ tự trận đấu theo mẫu!');
      return;
    }

    const res = importCustomGroupSchedule(group, importText, {
      replaceGroupMatches: importReplace,
      defaultCourt: importDefaultCourt,
      defaultStartTime: importDefaultTime,
    });

    if (!res.success) {
      setImportError(res.error || 'Lỗi xử lý file danh sách trận.');
      return;
    }

    setImportText('');
    setActiveTab('list');
    showStatus(`Đã nhập thành công ${res.count} trận đấu cho Bảng ${group}!`);
  };

  // Triggers Confirm Modal before changing Public state
  const handleRequestTogglePublish = () => {
    const nextState = !isPublished;
    if (nextState) {
      // Confirm Publish
      setConfirmModal({
        isOpen: true,
        title: `Công Khai Lịch Thi Đấu Bảng ${group}`,
        actionType: 'publish',
        confirmLabel: 'Công Khai Ngay',
        description: (
          <p>
            Bạn có chắc chắn muốn <strong>CÔNG KHAI</strong> lịch thi đấu của <strong>Bảng {group}</strong> lên trang Public? 
            Khán giả và VĐV sẽ nhìn thấy toàn bộ {groupMatches.length} trận đấu và thời gian/sân đấu này.
          </p>
        ),
        details: [
          { label: 'Bảng Đấu', value: `Bảng ${group}` },
          { label: 'Số Trận Đấu', value: `${groupMatches.length} trận` },
          { label: 'Trạng Thái Mới', value: 'Công Khai (Public)' },
        ],
        onConfirm: () => {
          togglePublishSchedule(group, true);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          showStatus(`Đã công khai lịch thi đấu Bảng ${group} ra trang Public!`);
        },
      });
    } else {
      // Confirm Unpublish (Draft)
      setConfirmModal({
        isOpen: true,
        title: `Ẩn Lịch Thi Đấu Bảng ${group} (Về Bản Nháp)`,
        actionType: 'unpublish',
        confirmLabel: 'Chuyển Về Bản Nháp',
        description: (
          <p>
            Bạn có chắc chắn muốn <strong>ẨN</strong> lịch thi đấu của <strong>Bảng {group}</strong> khỏi trang Public?
            Trang Public sẽ tạm ẩn lịch thi đấu bảng này cho đến khi bạn bấm Công khai lại.
          </p>
        ),
        details: [
          { label: 'Bảng Đấu', value: `Bảng ${group}` },
          { label: 'Số Trận Đang Có', value: `${groupMatches.length} trận` },
          { label: 'Trạng Thái Mới', value: 'Bản Nháp (Draft - Chỉ BTC)' },
        ],
        onConfirm: () => {
          togglePublishSchedule(group, false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          showStatus(`Đã chuyển lịch thi đấu Bảng ${group} về trạng thái Bản Nháp!`);
        },
      });
    }
  };

  // Delete all matches of this group confirmation
  const handleRequestDeleteGroupMatches = () => {
    setConfirmModal({
      isOpen: true,
      title: `Xóa Toàn Bộ Lịch Đấu Bảng ${group}`,
      actionType: 'danger',
      confirmLabel: 'Xác Nhận Xóa Lịch',
      description: (
        <p>
          Bạn có chắc chắn muốn xóa toàn bộ <strong>{groupMatches.length} trận đấu</strong> thuộc Bảng {group}? 
          Các tỉ số đã chấm (nếu có) sẽ bị xóa. Thao tác này không thể hoàn tác.
        </p>
      ),
      details: [
        { label: 'Bảng Đấu', value: `Bảng ${group}` },
        { label: 'Số Trận Bị Xóa', value: `${groupMatches.length} trận` },
      ],
      onConfirm: () => {
        deleteGroupMatches(group);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        showStatus(`Đã xóa toàn bộ lịch thi đấu của Bảng ${group}!`);
      },
    });
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-200/80">
      {/* Header of Schedule Box */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
            group === 'A' ? 'bg-blue-600 text-white' : 'bg-amber-500 text-slate-950'
          }`}>
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
              Lịch Thi Đấu Bảng {group} ({groupMatches.length} trận)
            </h4>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeTab === 'list'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Danh Sách ({groupMatches.length})
          </button>
          {!isReadOnly && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('create_manual')}
                disabled={groupPairs.length < 2}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'create_manual'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                <Plus className="w-3 h-3" />
                <span>Tạo Tay</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('import')}
                disabled={groupPairs.length < 2}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'import'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                <Upload className="w-3 h-3" />
                <span>Import Thứ Tự</span>
              </button>
            </>
          )}
        </div>
      </div>

      {statusMsg && (
        <div
          className={`p-2.5 mb-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* TAB 1: LIST MATCHES OF THIS GROUP */}
      {activeTab === 'list' && (
        <div className="space-y-2.5">
          {groupMatches.length === 0 ? (
            <div className="py-6 px-4 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-1.5 bg-slate-50/50">
              <Calendar className="w-6 h-6 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-500">Chưa có thông tin</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                {groupMatches.map((match, idx) => {
                  const isDragging = draggedIndex === idx;
                  const isOver = dragOverIndex === idx && draggedIndex !== idx;

                  return (
                    <div
                      key={match.id}
                      draggable={!isReadOnly}
                      onDragStart={e => {
                        if (isReadOnly) return;
                        setDraggedIndex(idx);
                        e.dataTransfer.effectAllowed = 'move';
                        e.dataTransfer.setData('text/plain', idx.toString());
                      }}
                      onDragOver={e => {
                        e.preventDefault();
                        if (isReadOnly) return;
                        e.dataTransfer.dropEffect = 'move';
                        if (dragOverIndex !== idx) setDragOverIndex(idx);
                      }}
                      onDragLeave={() => {
                        if (dragOverIndex === idx) setDragOverIndex(null);
                      }}
                      onDrop={e => {
                        e.preventDefault();
                        if (isReadOnly) return;
                        if (draggedIndex !== null && draggedIndex !== idx) {
                          handleReorder(draggedIndex, idx);
                        }
                        setDraggedIndex(null);
                        setDragOverIndex(null);
                      }}
                      onDragEnd={() => {
                        setDraggedIndex(null);
                        setDragOverIndex(null);
                      }}
                      className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 select-none ${
                        isDragging
                          ? 'opacity-40 bg-slate-100 border-indigo-300 scale-98 shadow-inner'
                          : isOver
                          ? 'border-indigo-500 bg-indigo-50/70 shadow-md ring-2 ring-indigo-400/30'
                          : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
                      }`}
                    >
                      {/* Left: Drag Handle + Match Number */}
                      <div className="flex items-center gap-2 min-w-0">
                        {!isReadOnly && (
                          <div
                            className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors shrink-0"
                            title="Kéo để đổi thứ tự trận đấu"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>
                        )}
                        <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-800 text-[10px] font-black flex items-center justify-center shrink-0">
                          #{match.matchNumber || idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {match.pair1?.code || 'Đội 1'} ({match.pair1?.player1?.name ? `${match.pair1.player1.name} & ${match.pair1.player2?.name}` : match.pair1?.name})
                            </span>
                            <span className="text-[10px] font-bold text-rose-500 px-1 py-0.2 bg-rose-50 rounded">VS</span>
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {match.pair2?.code || 'Đội 2'} ({match.pair2?.player1?.name ? `${match.pair2.player1.name} & ${match.pair2.player2?.name}` : match.pair2?.name})
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1 font-medium">
                              <Clock className="w-2.5 h-2.5" />
                              {match.scheduledTime} &bull; {match.court}
                            </span>
                            <span className="text-slate-400">&bull;</span>
                            <span
                              className={`font-semibold ${
                                match.status === 'FINISHED'
                                  ? 'text-emerald-600'
                                  : match.status === 'LIVE'
                                  ? 'text-rose-600 font-bold animate-pulse'
                                  : 'text-slate-500'
                              }`}
                            >
                              {match.status === 'FINISHED' ? 'Đã thi đấu' : match.status === 'LIVE' ? 'Đang đấu' : 'Sắp đấu'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Quick Move Up/Down Buttons + Score */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {match.status === 'FINISHED' && match.sets && match.sets[0] && (
                          <div className="text-right shrink-0 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                            <span className="text-xs font-black text-slate-900">
                              {match.sets[0].pair1Score} - {match.sets[0].pair2Score}
                            </span>
                          </div>
                        )}

                        {!isReadOnly && (
                          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200/80">
                            <button
                              type="button"
                              onClick={() => handleMoveUp(idx)}
                              disabled={idx === 0}
                              className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-white rounded disabled:opacity-30 disabled:hover:text-slate-500 disabled:hover:bg-transparent transition-all"
                              title="Di chuyển lên trên"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveDown(idx)}
                              disabled={idx === groupMatches.length - 1}
                              className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-white rounded disabled:opacity-30 disabled:hover:text-slate-500 disabled:hover:bg-transparent transition-all"
                              title="Di chuyển xuống dưới"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MANUAL CREATE MATCH */}
      {activeTab === 'create_manual' && (
        <form onSubmit={handleManualSubmit} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              Tạo Tay Trận Đấu Mới (Bảng {group})
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className="text-[11px] text-slate-500 hover:text-slate-800 font-medium"
            >
              Hủy
            </button>
          </div>

          {manualError && (
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{manualError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Pair 1 */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Đội 1 (Cặp Đấu 1) <span className="text-rose-500">*</span>
              </label>
              <select
                value={manualP1Id}
                onChange={e => setManualP1Id(e.target.value)}
                className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">-- Chọn Cặp Đấu 1 --</option>
                {groupPairs.map(p => (
                  <option key={p.id} value={p.id} disabled={p.id === manualP2Id}>
                    [{p.code || '?'}] {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Pair 2 */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Đội 2 (Cặp Đấu 2) <span className="text-rose-500">*</span>
              </label>
              <select
                value={manualP2Id}
                onChange={e => setManualP2Id(e.target.value)}
                className="w-full text-xs py-2 px-2.5 rounded-lg border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">-- Chọn Cặp Đấu 2 --</option>
                {groupPairs.map(p => (
                  <option key={p.id} value={p.id} disabled={p.id === manualP1Id}>
                    [{p.code || '?'}] {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">Sân Đấu</label>
              <input
                type="text"
                value={manualCourt}
                onChange={e => setManualCourt(e.target.value)}
                className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-300 bg-white"
                placeholder="Sân 01"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">Giờ Dự Kiến</label>
              <input
                type="text"
                value={manualTime}
                onChange={e => setManualTime(e.target.value)}
                className="w-full text-xs py-1.5 px-2 rounded-lg border border-slate-300 bg-white"
                placeholder="08:30"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">Thể Thức</label>
              <select
                value={manualFormat}
                onChange={e => setManualFormat(e.target.value as ScoringFormat)}
                className="w-full text-xs py-1.5 px-1.5 rounded-lg border border-slate-300 bg-white font-medium"
              >
                <option value="ONE_SET_21">1 set 21đ</option>
                <option value="BEST_OF_3_15">3 set 15đ</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Trận Đấu</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: IMPORT CUSTOM SCHEDULE */}
      {activeTab === 'import' && (
        <form onSubmit={handleImportScheduleSubmit} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              Import Thứ Tự Trận Đấu Bảng {group}
            </span>
            <button
              type="button"
              onClick={() => setImportText(sampleFormat5Teams)}
              className="text-[10px] text-blue-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              Dán mẫu chuẩn Bảng {group}
            </button>
          </div>

          {importError && (
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{importError}</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-slate-700">
                Nhập danh sách theo format: <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded">Trận, Đội 1, Đội 2</code>
              </label>
              <span className="text-[10px] text-slate-500">Hỗ trợ ngăn cách bằng dấu phẩy, pipe (|) hoặc xuống dòng</span>
            </div>
            <textarea
              rows={5}
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder={`1, ${group}1, ${group}2\n2, ${group}3, ${group}4\n3, ${group}5, ${group}1\n...`}
              className="w-full font-mono text-xs p-2.5 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Options */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={importReplace}
                onChange={e => setImportReplace(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-[11px] font-semibold text-slate-700">
                Xóa và thay thế toàn bộ trận cũ của Bảng {group}
              </span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Nhập Lịch Thi Đấu</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* BOTTOM ACTION BAR OF THIS GROUP: PUBLIC / UNPUBLIC BUTTON */}
      <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full shrink-0 ${isPublished ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="text-xs font-bold text-slate-700">
            Trạng thái:{' '}
            <strong className={isPublished ? 'text-emerald-700' : 'text-amber-700'}>
              {isPublished ? 'Đã Công Khai' : 'Bản Nháp'}
            </strong>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {groupMatches.length > 0 && !isReadOnly && (
            <button
              type="button"
              onClick={handleRequestDeleteGroupMatches}
              className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
              title="Xóa toàn bộ lịch đấu bảng này"
            >
              <Trash2 className="w-3 h-3" />
              <span>Xóa lịch Bảng {group}</span>
            </button>
          )}

          {/* MAIN PUBLIC BUTTON */}
          {!isReadOnly && (
            <button
              type="button"
              onClick={handleRequestTogglePublish}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                isPublished
                  ? 'bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
              }`}
            >
              {isPublished ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                  <span>Ẩn Lịch Bảng {group} (Về Nháp)</span>
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5" />
                  <span>Public Lịch Đấu Bảng {group}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmActionModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
        actionType={confirmModal.actionType}
        confirmLabel={confirmModal.confirmLabel}
        details={confirmModal.details}
      />
    </div>
  );
};
