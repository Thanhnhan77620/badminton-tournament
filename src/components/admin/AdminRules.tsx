import React, { useState, useEffect } from 'react';
import { useTournament } from '../../data/TournamentContext';
import { TournamentRuleItem, Prize } from '../../types/tournament';
import { BookOpen, Save, CheckCircle2, Plus, Trash2, Trophy, Award, AlertTriangle, Sparkles } from 'lucide-react';

export const AdminRules: React.FC = () => {
  const { tournament, updateRules, updatePrizes } = useTournament();

  const [rules, setRules] = useState<TournamentRuleItem[]>(tournament.rules || []);
  const [prizes, setPrizes] = useState<Prize[]>(tournament.prizes || []);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (tournament.rules) {
      setRules(tournament.rules);
    }
    if (tournament.prizes) {
      setPrizes(tournament.prizes);
    }
  }, [tournament.rules, tournament.prizes]);

  const handleRuleChange = (index: number, field: keyof TournamentRuleItem, value: any) => {
    const updated = [...rules];
    updated[index] = { ...updated[index], [field]: value };
    setRules(updated);
  };

  const handleScoringRuleChange = (ruleIdx: number, itemIdx: number, value: string) => {
    const updated = [...rules];
    const scoringRules = [...updated[ruleIdx].scoringRules];
    scoringRules[itemIdx] = value;
    updated[ruleIdx] = { ...updated[ruleIdx], scoringRules };
    setRules(updated);
  };

  const handleAddScoringRule = (ruleIdx: number) => {
    const updated = [...rules];
    updated[ruleIdx] = {
      ...updated[ruleIdx],
      scoringRules: [...updated[ruleIdx].scoringRules, 'Quy định mới...'],
    };
    setRules(updated);
  };

  const handleRemoveScoringRule = (ruleIdx: number, itemIdx: number) => {
    const updated = [...rules];
    updated[ruleIdx] = {
      ...updated[ruleIdx],
      scoringRules: updated[ruleIdx].scoringRules.filter((_, i) => i !== itemIdx),
    };
    setRules(updated);
  };

  const handlePrizeAmountChange = (idx: number, rawValue: string) => {
    const parsed = Math.max(0, parseInt(rawValue, 10) || 0);
    const updated = [...prizes];
    updated[idx] = { ...updated[idx], amount: parsed };
    setPrizes(updated);
  };

  const handlePrizeTitleChange = (idx: number, title: string) => {
    const updated = [...prizes];
    updated[idx] = { ...updated[idx], title };
    setPrizes(updated);
  };

  const currentTotalPrize = prizes.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    updateRules(rules);
    updatePrizes(prizes);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 font-display flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Biên Soạn Điều Lệ &amp; Cơ Cấu Giải Thưởng
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cập nhật quy định tính điểm vòng bảng, bán kết, chung kết, luật Let/Walkover và quỹ tiền thưởng
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isSaved && (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Đã lưu &amp; đồng bộ toàn trang!</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Thay Đổi</span>
          </button>
        </div>
      </div>

      {/* Rules Editor Cards */}
      <div className="space-y-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          1. Quy Định Các Vòng Đấu (Vòng Bảng, Bán Kết, Chung Kết)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {rules.map((rule, ruleIdx) => (
            <div
              key={ruleIdx}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-extrabold text-[10px]">
                    GIAI ĐOẠN 0{ruleIdx + 1}
                  </span>
                </div>

                {/* Stage Title */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Tên Giai Đoạn
                  </label>
                  <input
                    type="text"
                    value={rule.stage}
                    onChange={e => handleRuleChange(ruleIdx, 'stage', e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Format Desc */}
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                    Mô Tả Thể Thức
                  </label>
                  <textarea
                    rows={2}
                    value={rule.formatDescription}
                    onChange={e =>
                      handleRuleChange(ruleIdx, 'formatDescription', e.target.value)
                    }
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Scoring Rules List */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold uppercase text-slate-500">
                      Quy Định Điểm Số &amp; Set
                    </label>
                    <button
                      type="button"
                      onClick={() => handleAddScoringRule(ruleIdx)}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" /> Thêm dòng
                    </button>
                  </div>
                  {rule.scoringRules.map((sc, scIdx) => (
                    <div key={scIdx} className="flex items-start gap-1.5">
                      <textarea
                        rows={2}
                        value={sc}
                        onChange={e =>
                          handleScoringRuleChange(ruleIdx, scIdx, e.target.value)
                        }
                        className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 focus:bg-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveScoringRule(ruleIdx, scIdx)}
                        className="p-1 text-slate-400 hover:text-rose-600 shrink-0"
                        title="Xóa dòng"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advancement */}
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                  Quyền Đi Tiếp / Tiến Trình
                </label>
                <input
                  type="text"
                  value={rule.advancement}
                  onChange={e =>
                    handleRuleChange(ruleIdx, 'advancement', e.target.value)
                  }
                  className="w-full px-3 py-1.5 bg-emerald-50/60 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-900 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prize Editor */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              2. Cơ Cấu Tiền Thưởng Giải Đấu (VNĐ)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sau khi bấm Lưu, tổng giải thưởng và mức thưởng từng hạng sẽ tự động cập nhật ngay trên toàn bộ giao diện công khai.
            </p>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-300/80 text-amber-900 text-xs font-bold flex items-center gap-2 shrink-0">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Tổng Quỹ Thưởng: <strong className="text-amber-700 text-sm font-black">{currentTotalPrize.toLocaleString('vi-VN')} VNĐ</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {prizes.map((pz, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5 hover:bg-white hover:border-slate-300 transition-all shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  {pz.titleEn} (Hạng {pz.rank})
                </span>
                <span className="text-lg">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🎖️'}
                </span>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                  Tên Danh Hiệu
                </label>
                <input
                  type="text"
                  value={pz.title}
                  onChange={e => handlePrizeTitleChange(idx, e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-0.5">
                  Tiền Thưởng (VNĐ)
                </label>
                <input
                  type="number"
                  step={50000}
                  min={0}
                  value={pz.amount === 0 ? '' : pz.amount}
                  placeholder="0"
                  onChange={e => handlePrizeAmountChange(idx, e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-black text-amber-700 focus:outline-none focus:border-amber-500"
                />
                <span className="text-[11px] text-slate-600 block mt-1 font-semibold">
                  = {(pz.amount || 0).toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
