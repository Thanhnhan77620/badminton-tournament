import React, { useState, useMemo } from 'react';
import { useTournament } from '../../data/TournamentContext';
import { Player } from '../../types/tournament';
import {
  Users,
  UserPlus,
  FileSpreadsheet,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  Lock,
  ShieldAlert,
  RotateCcw,
  UserCheck,
  UserX,
  Layers,
  HelpCircle,
} from 'lucide-react';

export const AdminPlayers: React.FC = () => {
  const {
    players,
    pairs,
    tournament,
    isEmergencyUnlocked,
    addPlayer,
    updatePlayer,
    deletePlayer,
    importPlayers,
    clearAllPlayers,
  } = useTournament();

  const isLiveLocked = tournament.status === 'IN_PROGRESS' && !isEmergencyUnlocked;
  const isCompletedLocked = tournament.status === 'COMPLETED';
  const isReadOnly = isCompletedLocked;

  const [searchTerm, setSearchTerm] = useState('');
  const [pairingFilter, setPairingFilter] = useState<'ALL' | 'PAIRED' | 'UNPAIRED'>('ALL');
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [importText, setImportText] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states for add/edit
  const [formData, setFormData] = useState<Partial<Player>>({
    name: '',
    club: 'ISC',
    avatarUrl: '',
    role: '',
  });

  // Pairing calculations
  const getPlayerPair = (playerId: string) => {
    return pairs.find(p => p.player1?.id === playerId || p.player2?.id === playerId);
  };

  const pairedPlayers = useMemo(() => {
    return players.filter(p => pairs.some(pair => pair.player1?.id === p.id || pair.player2?.id === p.id));
  }, [players, pairs]);

  const unpairedPlayers = useMemo(() => {
    return players.filter(p => !pairs.some(pair => pair.player1?.id === p.id || pair.player2?.id === p.id));
  }, [players, pairs]);

  const filteredPlayers = useMemo(() => {
    return players.filter(p => {
      const isPaired = pairs.some(pair => pair.player1?.id === p.id || pair.player2?.id === p.id);
      if (pairingFilter === 'PAIRED' && !isPaired) return false;
      if (pairingFilter === 'UNPAIRED' && isPaired) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(term);
        const matchesClub = p.club && p.club.toLowerCase().includes(term);
        const pair = getPlayerPair(p.id);
        const matchesPair = pair && (pair.name?.toLowerCase().includes(term) || pair.code?.toLowerCase().includes(term));
        return matchesName || matchesClub || matchesPair;
      }
      return true;
    });
  }, [players, pairs, pairingFilter, searchTerm]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      club: 'ISC',
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000000)}?w=150&auto=format&fit=crop&q=80`,
      role: 'Vận Động Viên',
    });
    setEditingPlayer(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({ ...player });
    setIsAddModalOpen(true);
  };

  const handleSavePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    if (editingPlayer) {
      updatePlayer({
        ...editingPlayer,
        name: formData.name.trim(),
        club: formData.club?.trim() || 'ISC',
        avatarUrl:
          formData.avatarUrl?.trim() ||
          editingPlayer.avatarUrl ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: formData.role?.trim() || 'Vận Động Viên',
      });
      setSuccessMsg(`Đã cập nhật thông tin VĐV "${formData.name.trim()}" và đồng bộ toàn bộ bảng đấu, trận đấu và public page!`);
    } else {
      const newId = `p-${Date.now().toString().slice(-4)}`;
      const newPlayer: Player = {
        id: newId,
        name: formData.name.trim(),
        club: formData.club?.trim() || 'ISC',
        avatarUrl:
          formData.avatarUrl?.trim() ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: formData.role?.trim() || 'Vận Động Viên',
      };
      addPlayer(newPlayer);
      setSuccessMsg(`Đã thêm mới VĐV "${newPlayer.name}" thành công!`);
    }

    setIsAddModalOpen(false);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;

    const lines = importText.split('\n');
    const newItems: Player[] = [];

    lines.forEach((line, idx) => {
      const parts = line.split(/[,\t|]/).map(s => s.trim());
      if (parts[0]) {
        const name = parts[0];
        const club = parts[1] || 'ISC';
        newItems.push({
          id: `p-imp-${Date.now()}-${idx}`,
          name,
          club,
          avatarUrl: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80`,
          role: 'VĐV',
        });
      }
    });

    if (newItems.length > 0) {
      importPlayers(newItems);
      setIsImportModalOpen(false);
      setImportText('');
      setSuccessMsg(`Đã import thành công ${newItems.length} VĐV!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const handleClearAllPlayers = () => {
    clearAllPlayers();
    setIsClearAllModalOpen(false);
    setSuccessMsg('Đã xóa sạch toàn bộ danh sách VĐV để bạn import lại!');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
      {/* Header & Action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-100 gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 font-display flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Quản Lý Danh Sách Vận Động Viên ({players.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isLiveLocked
              ? 'Giải đang diễn ra: Khóa xóa VĐV & Thêm mới. Cho phép cập nhật Đơn vị/CLB.'
              : isCompletedLocked
              ? 'Giải đã bế mạc: Danh sách VĐV chỉ đọc (Read-only).'
              : 'Thêm mới, sửa thông tin, xóa hoặc import hàng loạt từ danh sách Excel'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Clear all players button */}
          <button
            onClick={() => setIsClearAllModalOpen(true)}
            disabled={isLiveLocked || isReadOnly || players.length === 0}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              isLiveLocked || isReadOnly || players.length === 0
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 cursor-pointer'
            }`}
            title={
              isLiveLocked
                ? 'Đã khóa xóa danh sách khi giải đang diễn ra'
                : 'Xóa toàn bộ DS để import lại khi import sai'
            }
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Xóa Sạch DS Để Import Lại</span>
          </button>

          <button
            onClick={() => setIsImportModalOpen(true)}
            disabled={isLiveLocked || isReadOnly}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              isLiveLocked || isReadOnly
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200 cursor-pointer'
            }`}
            title={isLiveLocked ? 'Đã khóa import trong khi giải đang diễn ra' : 'Import Excel / CSV'}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import Excel / CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            disabled={isLiveLocked || isReadOnly}
            className={`px-4 py-2 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 ${
              isLiveLocked || isReadOnly
                ? 'bg-slate-400 cursor-not-allowed opacity-60 shadow-none'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25 cursor-pointer'
            }`}
            title={isLiveLocked ? 'Đã khóa thêm VĐV trong khi giải đang diễn ra' : 'Thêm VĐV Mới'}
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm VĐV Mới</span>
          </button>
        </div>
      </div>

      {/* Unpaired Alert Banner if any */}
      {unpairedPlayers.length > 0 && (
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 text-amber-700">
              <UserX className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-amber-950 flex items-center gap-2">
                <span>Thông báo: Có {unpairedPlayers.length} VĐV chưa ghép cặp / VĐV dự bị</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-extrabold text-[10px]">
                  {unpairedPlayers.length} VĐV
                </span>
              </div>
              <p className="text-amber-800 mt-1 leading-relaxed">
                VĐV:{' '}
                <strong>
                  {unpairedPlayers.map(p => `${p.name} (${p.club || 'ISC'})`).join(', ')}
                </strong>{' '}
                hiện chưa được gán vào cặp đấu nào. VĐV này có thể đóng vai trò dự bị hoặc ghép cặp tại tab{' '}
                <strong>"Cặp Đấu & Bảng A/B"</strong>.
              </p>
            </div>
          </div>
          <button
            onClick={() => setPairingFilter('UNPAIRED')}
            className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold rounded-xl text-xs transition-colors shrink-0 cursor-pointer self-start sm:self-center"
          >
            Lọc VĐV Chưa Ghép ({unpairedPlayers.length})
          </button>
        </div>
      )}

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Live locked notification badge */}
      {isLiveLocked && (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Chế độ bảo vệ dữ liệu giải:</strong> Đã khóa quyền Xóa VĐV và Thêm VĐV mới. Bạn vẫn có thể nhấn biểu tượng Chỉnh sửa để cập nhật Tên đơn vị / CLB cho từng VĐV.
          </span>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Pairing Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setPairingFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              pairingFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Tất cả ({players.length})</span>
          </button>
          <button
            onClick={() => setPairingFilter('PAIRED')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              pairingFilter === 'PAIRED'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Đã ghép cặp ({pairedPlayers.length})</span>
          </button>
          <button
            onClick={() => setPairingFilter('UNPAIRED')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              pairingFilter === 'UNPAIRED'
                ? 'bg-white text-amber-800 shadow-xs'
                : 'text-slate-600 hover:text-amber-700'
            }`}
          >
            <UserX className="w-3.5 h-3.5 text-amber-600" />
            <span>Chưa ghép / Dự bị ({unpairedPlayers.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên VĐV, CLB, Cặp..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Players Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 w-12 text-center">STT</th>
              <th className="py-3 px-4">Vận Động Viên</th>
              <th className="py-3 px-4">Đơn Vị / CLB</th>
              <th className="py-3 px-4">Tình Trạng Ghép Cặp</th>
              <th className="py-3 px-4">Mã Định Danh (ID)</th>
              <th className="py-3 px-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPlayers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                  Không tìm thấy vận động viên nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              filteredPlayers.map((player, idx) => {
                const pair = getPlayerPair(player.id);
                const isPaired = !!pair;
                const partnerName = pair ? (pair.player1?.id === player.id ? pair.player2?.name : pair.player1?.name) : null;
                const partnerClub = pair ? (pair.player1?.id === player.id ? pair.player2?.club : pair.player1?.club) : null;

                return (
                  <tr key={player.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 text-center font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={player.avatarUrl}
                          alt={player.name}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{player.name}</span>
                          <span className="text-[10px] text-slate-400">{player.role || 'VĐV'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {player.club || 'ISC'}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      {isPaired ? (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            <span>Cặp {pair?.code || ''} (Bảng {pair?.group || ''})</span>
                          </span>
                          <span className="text-[11px] text-slate-500 hidden lg:inline">
                            Đánh cùng: <strong>{partnerName}</strong> ({partnerClub || 'ISC'})
                          </span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[11px]">
                          <UserX className="w-3 h-3 text-amber-600" />
                          <span>Chưa ghép (Dự bị / Chờ ghép)</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[11px] text-slate-500">
                      {player.id}
                    </td>
                    <td className="py-2.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEdit(player)}
                        disabled={isReadOnly}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                        title={isLiveLocked ? 'Cập nhật Tên Đơn vị/CLB' : 'Chỉnh sửa'}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setPlayerToDelete(player)}
                        disabled={isLiveLocked || isReadOnly}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isLiveLocked || isReadOnly
                            ? 'text-slate-300 cursor-not-allowed opacity-50'
                            : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                        }`}
                        title={isLiveLocked ? 'Không thể xóa VĐV khi giải đang diễn ra' : 'Xóa VĐV'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Add/Edit */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingPlayer ? 'Chỉnh Sửa Vận Động Viên' : 'Thêm Vận Động Viên Mới'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlayer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Họ và Tên VĐV * {isLiveLocked && editingPlayer && '(Đã khóa cố định khi giải đang diễn ra)'}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  disabled={isLiveLocked && !!editingPlayer}
                  className={`w-full px-3.5 py-2 border rounded-xl text-xs font-semibold ${
                    isLiveLocked && !!editingPlayer
                      ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-50 border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600'
                  }`}
                  required
                  autoFocus={!isLiveLocked}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Đơn Vị / Câu Lạc Bộ (CLB)
                </label>
                <input
                  type="text"
                  value={formData.club}
                  onChange={e => setFormData({ ...formData, club: e.target.value })}
                  placeholder="ISC hoặc CDC"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Vai Trò Trong Giải
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  placeholder="VĐV Đôi Nam hoặc VĐV Dự Bị"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Link Ảnh Đại Diện (Avatar URL)
                </label>
                <input
                  type="url"
                  value={formData.avatarUrl}
                  onChange={e => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/25 cursor-pointer"
                >
                  {editingPlayer ? 'Cập Nhật VĐV' : 'Thêm Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Import Excel/CSV */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Import Danh Sách VĐV Từ Excel / Text
                </h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Dán danh sách VĐV từ file Excel hoặc bảng Google Sheet. Định dạng:
              <br />
              <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-bold mt-1 inline-block">
                Họ và Tên [Tab hoặc Dấu Phẩy] Tên Đơn Vị / CLB
              </code>
            </p>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              <textarea
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder="Hà Tuấn Kiệt&#9;ISC&#10;Huỳnh Hữu Khang&#9;ISC&#10;Nguyễn Thanh Nhân&#9;ISC&#10;Nguyễn Quốc Nghi&#9;ISC"
                rows={8}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/25 cursor-pointer"
                >
                  Xác Nhận Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Clear All Confirmation */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600">
              <RotateCcw className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">
                Xác nhận xóa sạch danh sách VĐV?
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa toàn bộ <strong>{players.length} VĐV</strong> hiện tại không?
              Thao tác này cho phép bạn làm trống hoàn toàn danh bạ để import lại danh sách mới từ đầu.
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsClearAllModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleClearAllPlayers}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/25 cursor-pointer"
              >
                Đồng ý xóa sạch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete Single Confirmation */}
      {playerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600">
              <Trash2 className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">Xóa Vận Động Viên</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa VĐV <strong>"{playerToDelete.name}"</strong> khỏi hệ thống?
            </p>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPlayerToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  deletePlayer(playerToDelete.id);
                  setPlayerToDelete(null);
                  setSuccessMsg(`Đã xóa VĐV "${playerToDelete.name}"!`);
                  setTimeout(() => setSuccessMsg(null), 4000);
                }}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/25 cursor-pointer"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
