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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display tracking-tight">
                Danh Sách Cặp Đấu
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Các cặp vận động viên tham gia tranh tài tại hai Bảng A và B
              </p>
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
                className="w-full sm:w-64 pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer p-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Group Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setSelectedGroup('ALL')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  selectedGroup === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất Cả ({publicPairs.length})
              </button>
              <button
                onClick={() => setSelectedGroup('A')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  selectedGroup === 'A'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bảng A ({isGroupAPublished ? pairsA.length : 0})
              </button>
              <button
                onClick={() => setSelectedGroup('B')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
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
                className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Pair Header Meta */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        pair.group === 'A'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}
                    >
                      Bảng {pair.group}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      {pair.code || ''}
                    </span>
                  </div>

                  {/* Doubles Players Row */}
                  <div className="space-y-2">
                    {/* Player 1 */}
                    <div className="flex items-center gap-2.5 sm:gap-3 bg-slate-50/80 p-2 sm:p-2.5 rounded-xl border border-slate-100">
                      <PlayerAvatar
                        name={pair.player1?.name || 'VĐV 1'}
                        avatarUrl={pair.player1?.avatarUrl}
                        size="md"
                        className="ring-1 ring-slate-200 shrink-0 w-8 h-8 sm:w-10 sm:h-10"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          VĐV 1
                        </span>
                        <div className="flex items-center leading-none overflow-hidden whitespace-nowrap mt-0.5">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 whitespace-nowrap">
                            {pair.player1?.name || 'Chưa đặt tên'}
                          </p>
                          <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 ml-1 whitespace-nowrap">
                            ({pair.player1?.club || pair.club || 'ISC'})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Player 2 */}
                    <div className="flex items-center gap-2.5 sm:gap-3 bg-slate-50/80 p-2 sm:p-2.5 rounded-xl border border-slate-100">
                      <PlayerAvatar
                        name={pair.player2?.name || 'VĐV 2'}
                        avatarUrl={pair.player2?.avatarUrl}
                        size="md"
                        className="ring-1 ring-slate-200 shrink-0 w-8 h-8 sm:w-10 sm:h-10"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          VĐV 2
                        </span>
                        <div className="flex items-center leading-none overflow-hidden whitespace-nowrap mt-0.5">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 whitespace-nowrap">
                            {pair.player2?.name || 'Chưa đặt tên'}
                          </p>
                          <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 ml-1 whitespace-nowrap">
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
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
            <p className="text-xs font-bold text-slate-500">
              Chưa có thông tin
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
