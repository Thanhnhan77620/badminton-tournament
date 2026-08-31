import React, { useState } from 'react';
import { Standing, Match, Pair } from '../types/tournament';
import { PlayerAvatar } from './common/PlayerAvatar';
import { MatchCard } from './common/MatchCard';
import { Trophy, CheckCircle2, Shield, ChevronDown, ChevronUp } from 'lucide-react';

interface StandingsSectionProps {
  standingsA: Standing[];
  standingsB: Standing[];
  matchesA: Match[];
  matchesB: Match[];
  onSelectMatch: (match: Match) => void;
  isGroupAPublished?: boolean;
  isGroupBPublished?: boolean;
  isScheduleAPublished?: boolean;
  isScheduleBPublished?: boolean;
}

export const StandingsSection: React.FC<StandingsSectionProps> = ({
  standingsA,
  standingsB,
  matchesA,
  matchesB,
  onSelectMatch,
  isGroupAPublished = false,
  isGroupBPublished = false,
  isScheduleAPublished = false,
  isScheduleBPublished = false,
}) => {
  const [activeGroup, setActiveGroup] = useState<'A' | 'B' | 'BOTH'>('BOTH');
  const [showTableA, setShowTableA] = useState(true);
  const [showTableB, setShowTableB] = useState(true);
  const [showMatchesA, setShowMatchesA] = useState(true);
  const [showMatchesB, setShowMatchesB] = useState(true);

  const renderStandingsTable = (
    groupName: string,
    standings: Standing[],
    isExpanded: boolean,
    onToggle: () => void,
    isGroupPublished: boolean = false
  ) => {
    if (!isGroupPublished) {
      return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Group Table Header (Draft State) */}
          <div className="bg-slate-900 text-white px-4 sm:px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                groupName === 'A' ? 'bg-blue-600' : 'bg-amber-500 text-slate-950'
              }`}>
                {groupName}
              </span>
              <div>
                <h3 className="text-base font-bold font-display">BẢNG {groupName}</h3>
                <p className="text-[11px] text-amber-300">Bản nháp • Chưa công bố chính thức</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Đang Chuẩn Bị
              </span>
            </div>
          </div>

          <div className="p-8 text-center bg-slate-50/50 space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Shield className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-xs font-bold text-slate-500">
              Chưa có thông tin
            </p>
          </div>
        </div>
      );
    }

    return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Group Table Header */}
      <div className="bg-slate-900 text-white px-4 sm:px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
            groupName === 'A' ? 'bg-blue-600' : 'bg-amber-500 text-slate-950'
          }`}>
            {groupName}
          </span>
          <div>
            <h3 className="text-base font-bold font-display">BẢNG {groupName}</h3>
            <p className="text-[11px] text-slate-400">5 cặp đấu • Vòng tròn 1 lượt (1 set 21 điểm)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Top 2 vào Bán Kết</span>
          </div>

          <button
            onClick={onToggle}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <span>{isExpanded ? 'Thu gọn' : 'Mở rộng'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Standings Table Content */}
      {isExpanded ? (
        <div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[620px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] sm:text-xs md:text-sm font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3 md:py-4 px-3 sm:px-4 text-center w-12 md:w-16">#</th>
              <th className="py-3 md:py-4 px-4 md:px-6">Cặp Vận Động Viên</th>
              <th className="py-3 md:py-4 px-2.5 sm:px-3 text-center w-14 md:w-20" title="Số trận đã đấu">Trận</th>
              <th className="py-3 md:py-4 px-2.5 sm:px-3 text-center w-14 md:w-20 text-emerald-700" title="Thắng">T</th>
              <th className="py-3 md:py-4 px-2.5 sm:px-3 text-center w-14 md:w-20 text-rose-700" title="Thua">B</th>
              <th className="py-3 md:py-4 px-2.5 sm:px-3 text-center w-16 md:w-28" title="Điểm thắng / Điểm thua">Đ.Thắng/Thua</th>
              <th className="py-3 md:py-4 px-2.5 sm:px-3 text-center w-20 md:w-28 text-amber-900 bg-amber-50/70 font-extrabold" title="Tổng điểm thua ở những trận thua (Ví dụ: thua 19-21, 18-21 => 2 + 3 = 5 điểm)">Đ.Thua (TT)</th>
              <th className="py-3 md:py-4 px-3 sm:px-4 text-center w-16 md:w-24 bg-blue-50/70 text-blue-900 font-extrabold" title="Điểm xếp hạng (1 trận thắng = 1 điểm)">Điểm</th>
              <th className="py-3 md:py-4 px-3.5 sm:px-5 text-center w-28 md:w-36">Trạng Thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm md:text-base">
            {standings.length > 0 ? (
              standings.map(item => {
                const isTop2 = item.isQualified;
                return (
                  <tr
                    key={item.pair?.id || item.rank}
                    className={`transition-colors ${
                      isTop2
                        ? 'bg-emerald-50/30 hover:bg-emerald-50/60 font-medium'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3 md:py-4 px-3 sm:px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-md md:rounded-lg font-bold text-xs sm:text-sm md:text-base tabular-nums ${
                          item.rank === 1
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : item.rank === 2
                            ? 'bg-slate-700 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.rank}
                      </span>
                    </td>

                    {/* Pair Info with 2 Players (2 dòng 2 VĐV) */}
                    <td className="py-3 md:py-4 px-3 sm:px-4 md:px-6">
                      <div className="flex flex-col gap-1.5 sm:gap-2 md:gap-3 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3">
                          <PlayerAvatar
                            name={item.pair?.player1?.name || 'VĐV 1'}
                            avatarUrl={item.pair?.player1?.avatarUrl}
                            size="xs"
                            className="ring-1 ring-slate-200 shrink-0 w-5 h-5 sm:w-7 sm:h-7 sm:text-xs md:w-8 md:h-8 md:text-sm"
                          />
                          <div className="min-w-0 flex items-center leading-none overflow-hidden whitespace-nowrap">
                            <span className="font-bold text-slate-900 text-xs sm:text-sm md:text-base lg:text-[17px] whitespace-nowrap">
                              {item.pair?.player1?.name || 'Chưa có VĐV'}
                            </span>
                            <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-500 ml-1 whitespace-nowrap">
                              ({item.pair?.player1?.club || item.pair?.club || 'ISC'})
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3">
                          <PlayerAvatar
                            name={item.pair?.player2?.name || 'VĐV 2'}
                            avatarUrl={item.pair?.player2?.avatarUrl}
                            size="xs"
                            className="ring-1 ring-slate-200 shrink-0 w-5 h-5 sm:w-7 sm:h-7 sm:text-xs md:w-8 md:h-8 md:text-sm"
                          />
                          <div className="min-w-0 flex items-center leading-none overflow-hidden whitespace-nowrap">
                            <span className="font-bold text-slate-900 text-xs sm:text-sm md:text-base lg:text-[17px] whitespace-nowrap">
                              {item.pair?.player2?.name || 'Chưa có VĐV'}
                            </span>
                            <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-slate-500 ml-1 whitespace-nowrap">
                              ({item.pair?.player2?.club || item.pair?.club || 'ISC'})
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Played */}
                    <td className="py-3 md:py-4 px-2.5 sm:px-3 text-center font-semibold text-slate-700 text-xs sm:text-sm md:text-base tabular-nums">
                      {item.played}
                    </td>

                    {/* Won */}
                    <td className="py-3 md:py-4 px-2.5 sm:px-3 text-center font-bold text-emerald-700 text-xs sm:text-sm md:text-base tabular-nums">
                      {item.won}
                    </td>

                    {/* Lost */}
                    <td className="py-3 md:py-4 px-2.5 sm:px-3 text-center font-semibold text-rose-700 text-xs sm:text-sm md:text-base tabular-nums">
                      {item.lost}
                    </td>

                    {/* Points For / Against */}
                    <td className="py-3 md:py-4 px-2.5 sm:px-3 text-center text-slate-600 text-xs sm:text-sm md:text-base tabular-nums">
                      {item.pointsFor} / {item.pointsAgainst}
                    </td>

                    {/* Total Points Deficit in Lost Matches */}
                    <td className="py-3 md:py-4 px-2.5 sm:px-3 text-center font-bold text-xs sm:text-sm md:text-base tabular-nums bg-amber-50/20">
                      {item.lost > 0 ? (
                        <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-md font-extrabold text-amber-900 bg-amber-100/90 border border-amber-300">
                          {item.lostMatchScoreDeficit}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-semibold">0</span>
                      )}
                    </td>

                    {/* Ranking Points */}
                    <td className="py-3 md:py-4 px-3 sm:px-4 text-center bg-blue-50/50 font-extrabold text-blue-900 text-sm sm:text-base md:text-lg lg:text-xl tabular-nums">
                      {item.rankingPoints}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 md:py-4 px-3.5 sm:px-5 text-center">
                      {item.isQualified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs md:text-sm font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full whitespace-nowrap">
                          <span className="text-emerald-600 font-black">✓</span> Vào Bán Kết
                        </span>
                      ) : (
                        <span className="text-[11px] sm:text-xs md:text-sm text-slate-400">Dừng bước</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9} className="py-8 px-4 text-center text-xs sm:text-sm text-slate-500 font-medium">
                  Chưa có dữ liệu bảng đấu.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

          {/* Table Footer Note */}
          <div className="bg-slate-50/80 px-4 md:px-6 py-2.5 md:py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] sm:text-xs md:text-sm text-slate-500 gap-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-emerald-500"></span>
                Top 1 &amp; 2: Giành vé vào Bán Kết
              </span>
              <span className="text-slate-300">•</span>
              <span>1 Trận Thắng = 1 Điểm</span>
              <span className="text-slate-300">•</span>
              <span className="text-amber-900 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Đ.Thua (TT): Tổng điểm thua ở những trận thua (ít điểm thua hơn xếp trên, VD: thua 19-21, 18-21 &rarr; 2 + 3 = 5 điểm)
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={onToggle}
          className="px-5 py-3.5 bg-slate-50 hover:bg-slate-100 text-xs text-slate-600 flex items-center justify-between cursor-pointer transition-colors"
        >
          <span>Đã thu gọn Bảng {groupName} (5 cặp VĐV)</span>
          <span className="text-blue-600 font-bold flex items-center gap-1">
            Bấm để mở rộng <ChevronDown className="w-3.5 h-3.5" />
          </span>
        </div>
      )}
    </div>
  );
  };

  return (
    <section className="py-8 bg-slate-50/70 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Section Header & Group Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display tracking-tight">
                Bảng Đấu &amp; Xếp Hạng Vòng Bảng
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Cập nhật điểm số, hiệu số phụ và thứ hạng tranh vé vào Vòng Bán Kết
              </p>
            </div>
          </div>

          {/* Group Filter Tab Switcher */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveGroup('BOTH')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeGroup === 'BOTH'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cả Hai Bảng (A &amp; B)
            </button>
            <button
              onClick={() => setActiveGroup('A')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeGroup === 'A'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bảng A
            </button>
            <button
              onClick={() => setActiveGroup('B')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeGroup === 'B'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bảng B
            </button>
          </div>
        </div>

        {/* GROUP A CONTAINER */}
        {(activeGroup === 'BOTH' || activeGroup === 'A') && (
          <div className="space-y-4">
            {renderStandingsTable('A', standingsA, showTableA, () => setShowTableA(!showTableA), isGroupAPublished)}

            {/* Group A Matches Accordion */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <button
                onClick={() => setShowMatchesA(!showMatchesA)}
                className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span>DANH SÁCH {isScheduleAPublished ? matchesA.length : 0} TRẬN ĐẤU BẢNG A</span>
                  {!isScheduleAPublished && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md">
                      Chưa công bố
                    </span>
                  )}
                </span>
                <span className="flex items-center gap-1 text-blue-600 font-semibold">
                  {showMatchesA ? 'Thu gọn' : 'Xem chi tiết'}
                  {showMatchesA ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </span>
              </button>

              {showMatchesA && (
                <div className="p-4 bg-slate-50/40">
                  {!isScheduleAPublished || matchesA.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500 font-bold">
                      Chưa có thông tin
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5">
                      {matchesA.map(match => (
                        <MatchCard
                          key={match.id}
                          match={match}
                          onClick={onSelectMatch}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* GROUP B CONTAINER */}
        {(activeGroup === 'BOTH' || activeGroup === 'B') && (
          <div className="space-y-4">
            {renderStandingsTable('B', standingsB, showTableB, () => setShowTableB(!showTableB), isGroupBPublished)}

            {/* Group B Matches Accordion */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <button
                onClick={() => setShowMatchesB(!showMatchesB)}
                className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span>DANH SÁCH {isScheduleBPublished ? matchesB.length : 0} TRẬN ĐẤU BẢNG B</span>
                  {!isScheduleBPublished && (
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md">
                      Chưa công bố
                    </span>
                  )}
                </span>
                <span className="flex items-center gap-1 text-blue-600 font-semibold">
                  {showMatchesB ? 'Thu gọn' : 'Xem chi tiết'}
                  {showMatchesB ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </span>
              </button>

              {showMatchesB && (
                <div className="p-4 bg-slate-50/40">
                  {!isScheduleBPublished || matchesB.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500 font-bold">
                      Chưa có thông tin
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5">
                      {matchesB.map(match => (
                        <MatchCard
                          key={match.id}
                          match={match}
                          onClick={onSelectMatch}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
