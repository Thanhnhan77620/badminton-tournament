import React, { useState } from 'react';
import { Pair } from '../types/tournament';
import { PlayerAvatar } from './common/PlayerAvatar';
import { Users, Search } from 'lucide-react';

interface ParticipantsSectionProps {
  pairs: Pair[];
  isGroupAPublished?: boolean;
  isGroupBPublished?: boolean;
}

export const ParticipantsSection: React.FC<ParticipantsSectionProps> = ({
  pairs,
  isGroupAPublished = false,
  isGroupBPublished = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<'ALL' | 'A' | 'B'>('ALL');

  // Filter public pairs based on group publish state (only show pairs of published groups)
  const publicPairs = pairs.filter(p => {
    if (p.group === 'A') return isGroupAPublished;
    if (p.group === 'B') return isGroupBPublished;
    return false;
  });

  const pairsA = publicPairs.filter(p => p.group === 'A');
  const pairsB = publicPairs.filter(p => p.group === 'B');

  const filteredPairs = publicPairs.filter(pair => {
    const matchesGroup = selectedGroup === 'ALL' || pair.group === selectedGroup;
    const query = searchTerm.toLowerCase().trim();
    if (!query) return matchesGroup;

    const matchesSearch =
      (pair.code && pair.code.toLowerCase().includes(query)) ||
      (pair.name && pair.name.toLowerCase().includes(query)) ||
      (pair.player1?.name && pair.player1.name.toLowerCase().includes(query)) ||
      (pair.player2?.name && pair.player2.name.toLowerCase().includes(query)) ||
      (pair.club && pair.club.toLowerCase().includes(query));

    return matchesGroup && matchesSearch;
  });

  return (
    <section className="py-8 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
                Danh Sách Cặp Đấu
              </h2>
            </div>
          </div>

          {/* Controls: Search & Group Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên VĐV, cặp đấu, CLB..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Group Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setSelectedGroup('ALL')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedGroup === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất Cả ({publicPairs.length})
              </button>
              <button
                onClick={() => setSelectedGroup('A')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedGroup === 'A'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bảng A ({isGroupAPublished ? pairsA.length : 0})
              </button>
              <button
                onClick={() => setSelectedGroup('B')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedGroup === 'B'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bảng B ({isGroupBPublished ? pairsB.length : 0})
              </button>
            </div>
          </div>
        </div>

        {/* Pairs Grid */}
        {filteredPairs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPairs.map(pair => (
              <div
                key={pair.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Pair Header Meta */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        pair.group === 'A'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}
                    >
                      Bảng {pair.group}
                    </span>
                  </div>

                  {/* Doubles Players Row */}
                  <div className="space-y-2">
                    {/* Player 1 */}
                    <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                      <PlayerAvatar
                        name={pair.player1?.name || 'VĐV 1'}
                        avatarUrl={pair.player1?.avatarUrl}
                        size="md"
                        className="ring-1 ring-slate-200"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                          VĐV 1
                        </span>
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {pair.player1?.name || 'Chưa đặt tên'}
                          </p>
                          <span className="text-xs font-medium text-slate-500">
                            ({pair.player1?.club || pair.club || 'ISC'})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Player 2 */}
                    <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                      <PlayerAvatar
                        name={pair.player2?.name || 'VĐV 2'}
                        avatarUrl={pair.player2?.avatarUrl}
                        size="md"
                        className="ring-1 ring-slate-200"
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                          VĐV 2
                        </span>
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {pair.player2?.name || 'Chưa đặt tên'}
                          </p>
                          <span className="text-xs font-medium text-slate-500">
                            ({pair.player2?.club || pair.club || 'ISC'})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-700 font-semibold">
              {searchTerm
                ? `Không tìm thấy cặp đấu nào phù hợp với từ khóa "${searchTerm}".`
                : selectedGroup === 'A' && !isGroupAPublished
                ? 'Danh sách cặp đấu Bảng A đang được Ban tổ chức chuẩn bị và chưa công bố chính thức.'
                : selectedGroup === 'B' && !isGroupBPublished
                ? 'Danh sách cặp đấu Bảng B đang được Ban tổ chức chuẩn bị và chưa công bố chính thức.'
                : publicPairs.length === 0
                ? 'Danh sách các cặp đấu đang trong giai đoạn chuẩn bị và chưa công bố chính thức.'
                : 'Chưa có cặp đấu nào trong danh sách.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedGroup('ALL');
                }}
                className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700 underline cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
