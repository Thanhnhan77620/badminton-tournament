import React, { useState, useMemo } from 'react';
import { useTournament } from '../../data/TournamentContext';
import { Pair, Player } from '../../types/tournament';
import { GroupScheduleManager } from './GroupScheduleManager';
import { ConfirmActionModal, ConfirmActionType } from '../common/ConfirmActionModal';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Shuffle,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  X,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  Upload,
  FileSpreadsheet,
  FileText,
  Check,
  Info,
  Globe,
  EyeOff,
} from 'lucide-react';

export const AdminPairsAndGroups: React.FC = () => {
  const {
    pairs,
    players,
    tournament,
    addPair,
    updatePair,
    deletePair,
    deleteGroupPairs,
    assignPairGroup,
    randomizeGroups,
    generateRoundRobinMatches,
    loadDemoData,
    importPairsList,
    togglePublishGroup,
  } = useTournament();

  const isEditable = tournament.status === 'UPCOMING';

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPair, setEditingPair] = useState<Pair | null>(null);

  // Deletion modal state (replaces window.confirm)
  const [pairToDelete, setPairToDelete] = useState<Pair | null>(null);

  // Generic Confirm Action Modal State (For Public actions and other changes affecting public page)
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

  // Import Pairs Modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importRawText, setImportRawText] = useState('');
  const [importTargetGroup, setImportTargetGroup] = useState<'A' | 'B'>('A');
  const [importReplaceExisting, setImportReplaceExisting] = useState(false);
  const [importError, setImportError] = useState('');

  // Form states
  const [selectedP1Id, setSelectedP1Id] = useState('');
  const [selectedP2Id, setSelectedP2Id] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<'A' | 'B'>('A');
  const [pairCode, setPairCode] = useState('');
  const [formError, setFormError] = useState('');

  const [isSuccessMsg, setIsSuccessMsg] = useState('');
  const [isErrorMsg, setIsErrorMsg] = useState('');

  const pairsA = pairs.filter(p => p.group === 'A');
  const pairsB = pairs.filter(p => p.group === 'B');

  // Sample data template for import
  const sampleImport10Pairs = `Nguyễn Minh Trọng, ISC, Nguyễn Thanh Đủ, ISC
Lê Trọng Nghĩa, ISC, Nguyễn Văn Lập, ISC
Lê Công Huấn, ISC, Nguyễn Thế Toàn, ISC
Phan Tấn Hưng, ISC, Phạm Viết Thiện, ISC
Trần Hoàng Long, Pickle Club, Phạm Đức Thắng, Pickle Club
Võ Hoàng Phúc, ISC, Hồ Bá Nhật Tân, ISC
Nguyễn Sỹ Thành, ISC, Nguyễn Hồng Đăng, ISC
Huỳnh Bảo Trí, ISC, Đỗ Anh Khoa, ISC
Trần Tuấn Kiệt, VĐV Tự Do, Lê Quang Minh, VĐV Tự Do
Ngô Thành Nam, CLB Tennis, Vũ Hoàng Anh, CLB Tennis`;

  const sampleImport4Pairs = `Nguyễn Minh Trọng, ISC, Nguyễn Thanh Đủ, ISC
Lê Trọng Nghĩa, ISC, Nguyễn Văn Lập, ISC
Lê Công Huấn, ISC, Nguyễn Thế Toàn, ISC
Phan Tấn Hưng, ISC, Phạm Viết Thiện, ISC`;

  // Parse raw text into structured items for real-time preview
  const parsedImportItems = useMemo(() => {
    if (!importRawText.trim()) return [];

    const lines = importRawText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    return lines.map((line, idx) => {
      // Split by comma, tab, or semicolon
      const parts = line.split(/[,;\t]+/).map(p => p.trim());

      let player1Name = '';
      let player1Club = 'ISC';
      let player2Name = '';
      let player2Club = 'ISC';
      let isValid = false;

      if (parts.length >= 4) {
        // Format: Tên vđv1, đơn vị, tên vđv2, đơn vị
        player1Name = parts[0] || '';
        player1Club = parts[1] || 'ISC';
        player2Name = parts[2] || '';
        player2Club = parts[3] || player1Club || 'ISC';
        isValid = Boolean(player1Name && player2Name);
      } else if (parts.length === 3) {
        // Fallback: Tên vđv1, Tên vđv2, đơn vị chung
        player1Name = parts[0] || '';
        player2Name = parts[1] || '';
        player1Club = parts[2] || 'ISC';
        player2Club = parts[2] || 'ISC';
        isValid = Boolean(player1Name && player2Name);
      } else if (parts.length === 2) {
        // Fallback: Tên vđv1, Tên vđv2
        player1Name = parts[0] || '';
        player2Name = parts[1] || '';
        player1Club = 'ISC';
        player2Club = 'ISC';
        isValid = Boolean(player1Name && player2Name);
      }

      // Determine prospective group
      const prospectiveGroup: 'A' | 'B' = importTargetGroup === 'B' ? 'B' : 'A';

      return {
        lineNum: idx + 1,
        rawLine: line,
        player1Name,
        player1Club,
        player2Name,
        player2Club,
        prospectiveGroup,
        isValid,
      };
    });
  }, [importRawText, importTargetGroup]);

  const validParsedCount = parsedImportItems.filter(item => item.isValid).length;

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError('');

    if (validParsedCount === 0) {
      setImportError('Vui lòng nhập ít nhất một dòng thông tin cặp đấu hợp lệ!');
      return;
    }

    const itemsToImport = parsedImportItems
      .filter(item => item.isValid)
      .map(item => ({
        player1Name: item.player1Name,
        player1Club: item.player1Club,
        player2Name: item.player2Name,
        player2Club: item.player2Club,
        group: item.prospectiveGroup,
      }));

    const result = importPairsList(itemsToImport, {
      targetGroup: importTargetGroup,
      replaceExisting: importReplaceExisting,
      autoGenerateMatches: false,
    });

    if (!result.success) {
      setImportError(result.error || 'Có lỗi xảy ra trong quá trình nhập danh sách.');
      return;
    }

    setIsImportModalOpen(false);
    setImportRawText('');
    setIsSuccessMsg(`Đã nhập thành công ${result.count} cặp đấu!`);
    setTimeout(() => setIsSuccessMsg(''), 4500);
  };

  const handleOpenAdd = () => {
    setEditingPair(null);
    setSelectedP1Id(players[0]?.id || '');
    setSelectedP2Id(players[1]?.id || '');
    setSelectedGroup('A');
    setPairCode(`A${pairsA.length + 1}`);
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (pair: Pair) => {
    setEditingPair(pair);
    setSelectedP1Id(pair.player1?.id || '');
    setSelectedP2Id(pair.player2?.id || '');
    setSelectedGroup(pair.group || 'A');
    setPairCode(pair.code || '');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleSavePair = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedP1Id || !selectedP2Id) {
      setFormError('Vui lòng chọn đầy đủ 2 vận động viên!');
      return;
    }
    if (selectedP1Id === selectedP2Id) {
      setFormError('Vui lòng chọn 2 vận động viên khác nhau để tạo cặp đôi!');
      return;
    }

    const p1 = players.find(p => p.id === selectedP1Id);
    const p2 = players.find(p => p.id === selectedP2Id);
    if (!p1 || !p2) {
      setFormError('Không tìm thấy thông tin vận động viên đã chọn!');
      return;
    }

    // Check duplicate pair in same group
    const isDuplicate = pairs.some(
      p =>
        p.group === selectedGroup &&
        p.id !== editingPair?.id &&
        ((p.player1?.id === p1.id && p.player2?.id === p2.id) ||
          (p.player1?.id === p2.id && p.player2?.id === p1.id))
    );

    if (isDuplicate) {
      setFormError(
        `Cặp đấu gồm "${p1.name}" và "${p2.name}" đã tồn tại trong Bảng ${selectedGroup}. Trong 1 bảng đấu không được thêm trùng cặp đấu!`
      );
      return;
    }

    const clubStr =
      p1.club === p2.club ? (p1.club || 'ISC') : `${p1.club || 'CLB'} - ${p2.club || 'CLB'}`;
    const pairName = `${p1.name} (${p1.club || 'CLB'}) & ${p2.name} (${p2.club || 'CLB'})`;

    if (editingPair) {
      const res = updatePair({
        ...editingPair,
        name: pairName,
        player1: p1,
        player2: p2,
        club: clubStr,
        group: selectedGroup,
        code: pairCode || editingPair.code,
      });

      if (!res.success) {
        setFormError(res.error || 'Không thể cập nhật cặp đấu');
        return;
      }

      setIsSuccessMsg('Đã cập nhật thông tin cặp đấu thành công!');
    } else {
      const newPairNumber = pairs.length + 1;
      const newPair: Pair = {
        id: `pair-${Date.now().toString().slice(-4)}`,
        pairNumber: newPairNumber,
        code: pairCode || `${selectedGroup}${selectedGroup === 'A' ? pairsA.length + 1 : pairsB.length + 1}`,
        name: pairName,
        player1: p1,
        player2: p2,
        club: clubStr,
        group: selectedGroup,
      };

      const res = addPair(newPair);
      if (!res.success) {
        setFormError(res.error || 'Không thể thêm cặp đấu');
        return;
      }

      setIsSuccessMsg(`Đã tạo thêm cặp đấu mới vào Bảng ${selectedGroup} thành công!`);
    }

    setIsAddModalOpen(false);
    setTimeout(() => setIsSuccessMsg(''), 3500);
  };

  const handleSwitchGroup = (pair: Pair, targetGroup: 'A' | 'B') => {
    const res = assignPairGroup(pair.id, targetGroup);
    if (!res.success) {
      setIsErrorMsg(res.error || `Không thể chuyển sang Bảng ${targetGroup}`);
      setTimeout(() => setIsErrorMsg(''), 4000);
      return;
    }
    setIsSuccessMsg(`Đã chuyển cặp "${pair.name}" sang Bảng ${targetGroup}!`);
    setTimeout(() => setIsSuccessMsg(''), 3000);
  };

  const handleConfirmDelete = () => {
    if (!pairToDelete) return;
    deletePair(pairToDelete.id);
    setIsSuccessMsg(`Đã xóa cặp "${pairToDelete.name}" khỏi danh sách thi đấu!`);
    setPairToDelete(null);
    setTimeout(() => setIsSuccessMsg(''), 3000);
  };

  const handleClearGroupPairs = (target: 'A' | 'B' | 'ALL') => {
    const targetLabel = target === 'ALL' ? 'cả 2 bảng (Bảng A & B)' : `Bảng ${target}`;
    const targetCount = target === 'ALL' ? pairs.length : target === 'A' ? pairsA.length : pairsB.length;

    if (targetCount === 0) {
      setIsErrorMsg(`Không có cặp đấu nào trong ${targetLabel} để xóa.`);
      setTimeout(() => setIsErrorMsg(''), 3000);
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: `Xóa Tất Cả Cặp Đấu - ${targetLabel}`,
      actionType: 'danger',
      confirmLabel: `Xác Nhận Xóa (${targetCount} cặp)`,
      description: (
        <div className="space-y-2">
          <p className="text-slate-700">
            Bạn có chắc chắn muốn xóa <strong>tất cả {targetCount} cặp đấu</strong> trong <strong>{targetLabel}</strong> không?
          </p>
          <p className="text-xs text-rose-600 font-medium">
            ⚠️ Thao tác này sẽ xóa toàn bộ các cặp đấu và lịch thi đấu vòng bảng tương ứng để bạn có thể import hoặc ghép cặp mới lại từ đầu.
          </p>
        </div>
      ),
      details: [
        { label: 'Phạm vi xóa', value: targetLabel },
        { label: 'Số cặp bị xóa', value: `${targetCount} cặp` },
        { label: 'Dữ liệu VĐV gốc', value: 'Vẫn được lưu trữ' },
      ],
      onConfirm: () => {
        const res = deleteGroupPairs(target);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        if (res.success) {
          setIsSuccessMsg(`Đã xóa thành công ${res.count} cặp đấu trong ${targetLabel}! Bạn có thể import lại ngay.`);
          setTimeout(() => setIsSuccessMsg(''), 4000);
        }
      },
    });
  };

  return (
    <div className="space-y-3">
      {/* Top Header with Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-3 sm:p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
        <div>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 font-display flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-600" />
            Ghép Cặp Thi Đấu &amp; Phân Chia Bảng Đấu ({pairs.length} Cặp)
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {isEditable && (
            <>
              {pairs.length > 0 && (
                <button
                  onClick={() => handleClearGroupPairs('ALL')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200 shadow-xs cursor-pointer"
                  title="Xóa tất cả cặp đấu ở cả Bảng A và Bảng B để nhập lại"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Xóa Tất Cả Cặp (2 Bảng)</span>
                </button>
              )}

              <button
                onClick={() => {
                  setImportError('');
                  setIsImportModalOpen(true);
                }}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 shadow-xs cursor-pointer"
                title="Import danh sách cặp đấu"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Import Danh Sách Cặp</span>
              </button>

              <button
                onClick={handleOpenAdd}
                className="px-3 py-1.5 rounded-lg text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1 bg-blue-600 hover:bg-blue-700 shadow-blue-600/25 cursor-pointer"
                title="Ghép cặp mới"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ghép Cặp Mới</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Locked notice in pairs & groups */}
      {!isEditable && (
        <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="text-[11px]">
              <strong>{tournament.status === 'COMPLETED' ? 'Hệ thống đã khóa (Đã bế mạc)' : 'Đã Khóa Cấu Trúc Bảng Đấu (Giải đang diễn ra)'}:</strong> Chức năng thêm, xóa cặp, đổi bảng và nhập danh sách cặp bị khóa để đảm bảo tính toàn vẹn của kết quả giải.
            </span>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      {isSuccessMsg && (
        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between gap-1.5 animate-in fade-in shadow-xs">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{isSuccessMsg}</span>
          </div>
          <button onClick={() => setIsSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {isErrorMsg && (
        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-between gap-1.5 animate-in fade-in shadow-xs">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>{isErrorMsg}</span>
          </div>
          <button onClick={() => setIsErrorMsg('')} className="text-rose-700 hover:text-rose-900">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2 Column View: BẢNG A & BẢNG B */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* GROUP A */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-3 sm:p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-[11px] font-black flex items-center justify-center shadow-xs">
                A
              </span>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                BẢNG A ({pairsA.length} Cặp)
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">
                Top 2 vào Bán Kết
              </span>
              {pairsA.length > 0 && isEditable && (
                <button
                  type="button"
                  onClick={() => handleClearGroupPairs('A')}
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold transition-all flex items-center gap-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer"
                  title="Xóa tất cả cặp đấu trong Bảng A để nhập lại"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                  <span>Xóa Tất Cả</span>
                </button>
              )}
            </div>
          </div>

          {pairsA.length === 0 ? (
            <div className="py-6 px-3 text-center border-2 border-dashed border-slate-200 rounded-lg space-y-1.5">
              <Users className="w-6 h-6 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-500">Chưa có thông tin</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {pairsA.map((pair, idx) => (
                <div
                  key={pair.id}
                  className="p-2 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-blue-50/30 transition-all flex items-center justify-between gap-2 group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded bg-blue-100 text-blue-800 text-[10px] font-black flex items-center justify-center shrink-0">
                      {pair.code || `A${idx + 1}`}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{pair.name}</p>
                    </div>
                  </div>

                  {isEditable && (
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Switch to B */}
                      <button
                        type="button"
                        onClick={() => handleSwitchGroup(pair, 'B')}
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors flex items-center gap-0.5 bg-slate-200 hover:bg-amber-100 text-slate-700 hover:text-amber-800 cursor-pointer"
                        title="Chuyển sang Bảng B"
                      >
                        <ArrowRightLeft className="w-2.5 h-2.5" />
                        <span>Sang B</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(pair)}
                        className="p-1 rounded transition-colors text-slate-500 hover:text-blue-600 hover:bg-white cursor-pointer"
                        title="Sửa cặp đấu"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setPairToDelete(pair)}
                        className="p-1 rounded transition-colors text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Xóa cặp đấu khỏi bảng"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Bottom Action Bar: Public Group A Button */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  (tournament.isGroupAPublished ?? false) ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="text-[11px] font-bold text-slate-700">
                Trạng thái:{' '}
                <strong className={(tournament.isGroupAPublished ?? false) ? 'text-emerald-700' : 'text-amber-700'}>
                  {(tournament.isGroupAPublished ?? false) ? 'Đã Công Khai' : 'Bản Nháp'}
                </strong>
              </span>
            </div>

            {isEditable && (
              <button
                type="button"
                onClick={() => {
                  const isPub = tournament.isGroupAPublished ?? false;
                  setConfirmModal({
                    isOpen: true,
                    title: isPub ? 'Ẩn Danh Sách Cặp Bảng A (Về Nháp)' : 'Công Khai Danh Sách Cặp Bảng A',
                    actionType: isPub ? 'unpublish' : 'publish',
                    confirmLabel: isPub ? 'Chuyển Về Bản Nháp' : 'Công Khai Ngay',
                    description: isPub ? (
                      <p>
                        Bạn có chắc chắn muốn <strong>ẨN</strong> danh sách cặp đấu Bảng A khỏi trang Public?
                      </p>
                    ) : (
                      <p>
                        Sau khi xác nhận, toàn bộ <strong>{pairsA.length} cặp đấu</strong> của Bảng A sẽ được công khai và cập nhật tức thì trên trang Public.
                      </p>
                    ),
                    details: [
                      { label: 'Bảng Đấu', value: 'Bảng A' },
                      { label: 'Số Cặp Đấu', value: `${pairsA.length} cặp` },
                      { label: 'Trạng Thái Mới', value: isPub ? 'Bản Nháp (Draft)' : 'Công Khai (Public)' },
                    ],
                    onConfirm: () => {
                      togglePublishGroup('A', !isPub);
                      setConfirmModal(prev => ({ ...prev, isOpen: false }));
                      setIsSuccessMsg(isPub ? 'Đã chuyển danh sách Bảng A về Bản Nháp.' : 'Đã công khai danh sách Bảng A lên trang Public!');
                      setTimeout(() => setIsSuccessMsg(''), 4000);
                    },
                  });
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1 self-start sm:self-auto ${
                  (tournament.isGroupAPublished ?? false)
                    ? 'bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                }`}
              >
                {(tournament.isGroupAPublished ?? false) ? (
                  <>
                    <EyeOff className="w-3 h-3 text-amber-600" />
                    <span>Ẩn Bảng A (Về Nháp)</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3 h-3" />
                    <span>Public Bảng A</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Group Schedule Manager Component */}
          <GroupScheduleManager group="A" />
        </div>

        {/* GROUP B */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-3 sm:p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 text-[11px] font-black flex items-center justify-center shadow-xs">
                B
              </span>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                BẢNG B ({pairsB.length} Cặp)
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">
                Top 2 vào Bán Kết
              </span>
              {pairsB.length > 0 && isEditable && (
                <button
                  type="button"
                  onClick={() => handleClearGroupPairs('B')}
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold transition-all flex items-center gap-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer"
                  title="Xóa tất cả cặp đấu trong Bảng B để nhập lại"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                  <span>Xóa Tất Cả</span>
                </button>
              )}
            </div>
          </div>

          {pairsB.length === 0 ? (
            <div className="py-6 px-3 text-center border-2 border-dashed border-slate-200 rounded-lg space-y-1.5">
              <Users className="w-6 h-6 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-500">Chưa có thông tin</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {pairsB.map((pair, idx) => (
                <div
                  key={pair.id}
                  className="p-2 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-amber-50/30 transition-all flex items-center justify-between gap-2 group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded bg-amber-100 text-amber-900 text-[10px] font-black flex items-center justify-center shrink-0">
                      {pair.code || `B${idx + 1}`}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{pair.name}</p>
                    </div>
                  </div>

                  {isEditable && (
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Switch to A */}
                      <button
                        type="button"
                        onClick={() => handleSwitchGroup(pair, 'A')}
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors flex items-center gap-0.5 bg-slate-200 hover:bg-blue-100 text-slate-700 hover:text-blue-800 cursor-pointer"
                        title="Chuyển sang Bảng A"
                      >
                        <ArrowRightLeft className="w-2.5 h-2.5" />
                        <span>Sang A</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEdit(pair)}
                        className="p-1 rounded transition-colors text-slate-500 hover:text-blue-600 hover:bg-white cursor-pointer"
                        title="Sửa cặp đấu"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setPairToDelete(pair)}
                        className="p-1 rounded transition-colors text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        title="Xóa cặp đấu khỏi bảng"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Bottom Action Bar: Public Group B Button */}
          <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  (tournament.isGroupBPublished ?? false) ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="text-[11px] font-bold text-slate-700">
                Trạng thái:{' '}
                <strong className={(tournament.isGroupBPublished ?? false) ? 'text-emerald-700' : 'text-amber-700'}>
                  {(tournament.isGroupBPublished ?? false) ? 'Đã Công Khai' : 'Bản Nháp'}
                </strong>
              </span>
            </div>

            {isEditable && (
              <button
                type="button"
                onClick={() => {
                  const isPub = tournament.isGroupBPublished ?? false;
                  setConfirmModal({
                    isOpen: true,
                    title: isPub ? 'Ẩn Danh Sách Cặp Bảng B (Về Nháp)' : 'Công Khai Danh Sách Cặp Bảng B',
                    actionType: isPub ? 'unpublish' : 'publish',
                    confirmLabel: isPub ? 'Chuyển Về Bản Nháp' : 'Công Khai Ngay',
                    description: isPub ? (
                      <p>
                        Bạn có chắc chắn muốn <strong>ẨN</strong> danh sách cặp đấu Bảng B khỏi trang Public?
                      </p>
                    ) : (
                      <p>
                        Sau khi xác nhận, toàn bộ <strong>{pairsB.length} cặp đấu</strong> của Bảng B sẽ được công khai và cập nhật tức thì trên trang Public.
                      </p>
                    ),
                    details: [
                      { label: 'Bảng Đấu', value: 'Bảng B' },
                      { label: 'Số Cặp Đấu', value: `${pairsB.length} cặp` },
                      { label: 'Trạng Thái Mới', value: isPub ? 'Bản Nháp (Draft)' : 'Công Khai (Public)' },
                    ],
                    onConfirm: () => {
                      togglePublishGroup('B', !isPub);
                      setConfirmModal(prev => ({ ...prev, isOpen: false }));
                      setIsSuccessMsg(isPub ? 'Đã chuyển danh sách Bảng B về Bản Nháp.' : 'Đã công khai danh sách Bảng B lên trang Public!');
                      setTimeout(() => setIsSuccessMsg(''), 4000);
                    },
                  });
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1 self-start sm:self-auto ${
                  (tournament.isGroupBPublished ?? false)
                    ? 'bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                }`}
              >
                {(tournament.isGroupBPublished ?? false) ? (
                  <>
                    <EyeOff className="w-3 h-3 text-amber-600" />
                    <span>Ẩn Bảng B (Về Nháp)</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3 h-3" />
                    <span>Public Bảng B</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Group Schedule Manager Component */}
          <GroupScheduleManager group="B" />
        </div>
      </div>

      {/* Modal Pair Add/Edit */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingPair ? 'Chỉnh Sửa Cặp Đấu' : 'Ghép Cặp Đôi Thi Đấu Mới'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSavePair} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Vận Động Viên 1 *
                </label>
                <select
                  value={selectedP1Id}
                  onChange={e => {
                    setSelectedP1Id(e.target.value);
                    setFormError('');
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                >
                  {players.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.club || 'CLB'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Vận Động Viên 2 *
                </label>
                <select
                  value={selectedP2Id}
                  onChange={e => {
                    setSelectedP2Id(e.target.value);
                    setFormError('');
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                >
                  {players.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.club || 'CLB'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Bảng Đấu *
                  </label>
                  <select
                    value={selectedGroup}
                    onChange={e => {
                      setSelectedGroup(e.target.value as 'A' | 'B');
                      setFormError('');
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-blue-700 focus:bg-white focus:outline-none"
                  >
                    <option value="A">Bảng A</option>
                    <option value="B">Bảng B</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Mã Cặp (Mã Hạt Giống)
                  </label>
                  <input
                    type="text"
                    value={pairCode}
                    onChange={e => setPairCode(e.target.value)}
                    placeholder="A1, B1..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
                💡 <strong>Quy định:</strong> Không được thêm cặp đấu trùng nhau trong cùng 1 bảng đấu.
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Lưu Cặp Đấu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (In-App Dialog to fix iframe confirm bug) */}
      {pairToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">
                Xác Nhận Xóa Cặp Đấu
              </h3>
              <p className="text-xs text-slate-500">
                Bạn có chắc chắn muốn xóa cặp đấu:
              </p>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-xs text-slate-800">
                {pairToDelete.name} ({pairToDelete.code} - Bảng {pairToDelete.group})
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                Thao tác này sẽ xóa cặp đấu và loại khỏi các trận đấu liên quan.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPairToDelete(null)}
                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/25 cursor-pointer transition-colors"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Pairs Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Import Danh Sách Cặp Đấu &amp; Bảng Đấu
                  </h3>
                  <p className="text-xs text-slate-500">
                    Nhập hàng loạt các cặp đôi thi đấu theo định dạng chuẩn
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {importError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{importError}</span>
              </div>
            )}

            <form onSubmit={handleImportSubmit} className="space-y-4">
              {/* Format Guide */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-2 text-xs text-blue-900">
                <div className="flex items-center gap-2 font-bold text-blue-950">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Định dạng dòng nhập chuẩn:</span>
                </div>
                <div className="bg-white/90 px-3 py-2 rounded-xl border border-blue-200 font-mono text-[12px] text-blue-800 font-semibold shadow-2xs">
                  Tên vđv1, đơn vị, tên vđv2, đơn vị
                </div>
                <p className="text-[11px] text-blue-700">
                  * Mỗi cặp trên 1 dòng. Dấu phân cách có thể là dấu phẩy (<code>,</code>), chấm phẩy (<code>;</code>) hoặc Tab. Nếu để trống đơn vị, hệ thống sẽ tự động gán mặc định là &ldquo;ISC&rdquo;.
                </p>
              </div>

              {/* Textarea */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Nội dung danh sách cặp thi đấu:
                  </label>
                  {importRawText && (
                    <button
                      type="button"
                      onClick={() => setImportRawText('')}
                      className="px-2 py-0.5 text-rose-600 hover:text-rose-800 font-semibold text-[11px] cursor-pointer"
                    >
                      Xóa nội dung
                    </button>
                  )}
                </div>
                <textarea
                  rows={7}
                  value={importRawText}
                  onChange={e => {
                    setImportRawText(e.target.value);
                    setImportError('');
                  }}
                  placeholder={`Ví dụ:\nNguyễn Minh Trọng, ISC, Nguyễn Thanh Đủ, ISC\nLê Trọng Nghĩa, ISC, Nguyễn Văn Lập, ISC\nTrần Hoàng Long, Tennis Club, Phạm Đức Thắng, Tennis Club\nNguyễn Sỹ Thành, ISC, Nguyễn Hồng Đăng, ISC`}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                  required
                />
              </div>

              {/* Configuration Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                    Quy tắc phân chia bảng:
                  </label>
                  <select
                    value={importTargetGroup}
                    onChange={e => setImportTargetGroup(e.target.value as 'A' | 'B')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
                  >
                    <option value="A">Toàn bộ vào Bảng A</option>
                    <option value="B">Toàn bộ vào Bảng B</option>
                  </select>
                </div>

                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={importReplaceExisting}
                      onChange={e => setImportReplaceExisting(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <span>
                      {importTargetGroup === 'A'
                        ? 'Chỉ thay thế các cặp trong Bảng A (giữ nguyên Bảng B)'
                        : 'Chỉ thay thế các cặp trong Bảng B (giữ nguyên Bảng A)'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Live Preview Table */}
              {parsedImportItems.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">
                      Bản xem trước phân tích ({validParsedCount}/{parsedImportItems.length} cặp hợp lệ):
                    </span>
                  </div>
                  <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200 text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0 text-[11px]">
                        <tr>
                          <th className="py-1.5 px-2.5">#</th>
                          <th className="py-1.5 px-2.5">VĐV 1 (Đơn vị)</th>
                          <th className="py-1.5 px-2.5">VĐV 2 (Đơn vị)</th>
                          <th className="py-1.5 px-2.5">Bảng gán</th>
                          <th className="py-1.5 px-2.5 text-center">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {parsedImportItems.map(item => (
                          <tr key={item.lineNum} className={item.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50'}>
                            <td className="py-1.5 px-2.5 text-slate-400 font-mono">{item.lineNum}</td>
                            <td className="py-1.5 px-2.5 text-slate-900 font-semibold">
                              {item.player1Name ? `${item.player1Name} (${item.player1Club})` : <span className="text-rose-500 italic">Thiếu tên</span>}
                            </td>
                            <td className="py-1.5 px-2.5 text-slate-900 font-semibold">
                              {item.player2Name ? `${item.player2Name} (${item.player2Club})` : <span className="text-rose-500 italic">Thiếu tên</span>}
                            </td>
                            <td className="py-1.5 px-2.5">
                              <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                item.prospectiveGroup === 'A' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                Bảng {item.prospectiveGroup}
                              </span>
                            </td>
                            <td className="py-1.5 px-2.5 text-center">
                              {item.isValid ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                                  <Check className="w-3.5 h-3.5" /> Hợp lệ
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
                                  <AlertCircle className="w-3.5 h-3.5" /> Lỗi dòng
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={validParsedCount === 0 || !isEditable}
                  className={`px-5 py-2 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 ${
                    validParsedCount === 0 || !isEditable
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 cursor-pointer'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Xác Nhận Import {validParsedCount > 0 ? `(${validParsedCount} Cặp)` : ''}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Confirmation Modal for Public Actions & Changes */}
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
