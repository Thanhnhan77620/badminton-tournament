import React, { useState } from 'react';
import { TournamentProvider, useTournament } from './data/TournamentContext';
import { Match } from './types/tournament';
import { TournamentHeader, NavTab } from './components/TournamentHeader';
import { TournamentHero } from './components/TournamentHero';
import { ParticipantsSection } from './components/ParticipantsSection';
import { StandingsSection } from './components/StandingsSection';
import { ScheduleSection } from './components/ScheduleSection';
import { KnockoutSection } from './components/KnockoutSection';
import { RulesSection } from './components/RulesSection';
import { TournamentFooter } from './components/TournamentFooter';
import { MatchDetailModal } from './components/common/MatchDetailModal';
import { LoginPage } from './components/admin/LoginPage';
import { AdminPortal } from './components/admin/AdminPortal';

function PublicAppContent() {
  const {
    tournament,
    pairs,
    matches,
    standingsA,
    standingsB,
    viewMode,
    isAdminAuthenticated,
    setViewMode,
  } = useTournament();

  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const matchesGroupA = matches.filter(m => m.group === 'A');
  const matchesGroupB = matches.filter(m => m.group === 'B');

  const semiFinal1 =
    matches.find(m => m.id === 'm-sf-1') ||
    matches.find(m => m.round === 'SEMI_FINAL') ||
    null;
  const semiFinal2 =
    matches.find(m => m.id === 'm-sf-2') ||
    matches.find(m => m.round === 'SEMI_FINAL' && m.id !== semiFinal1?.id) ||
    null;
  const thirdPlaceMatch =
    matches.find(m => m.id === 'm-third') ||
    matches.find(m => m.round === 'THIRD_PLACE') ||
    null;
  const finalMatch =
    matches.find(m => m.id === 'm-final') ||
    matches.find(m => m.round === 'FINAL') ||
    null;

  const championPair =
    (finalMatch?.status === 'FINISHED' && finalMatch.winnerId &&
      pairs.find(p => p.id === finalMatch.winnerId)) ||
    null;

  const nextUpcomingMatch = matches.find(m => m.status === 'UPCOMING') || null;

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If in Admin view mode
  if (viewMode === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <LoginPage
          onBackToPublic={() => setViewMode('public')}
        />
      );
    }
    return <AdminPortal />;
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Header with BTC Admin button */}
      <TournamentHeader
        tournament={tournament}
        activeTab={activeTab}
        onSelectTab={handleTabChange}
        onOpenLogin={() => {
          if (isAdminAuthenticated) {
            setViewMode('admin');
          } else {
            setIsLoginModalOpen(true);
          }
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {activeTab === 'overview' && (
          <div className="space-y-0">
            <TournamentHero
              tournament={tournament}
              onNavigate={handleTabChange}
              nextUpcomingMatch={nextUpcomingMatch}
            />

            <ParticipantsSection
              pairs={pairs}
              isGroupAPublished={tournament.isGroupAPublished}
              isGroupBPublished={tournament.isGroupBPublished}
            />
            <RulesSection
              rules={tournament.rules}
              supplementaryRegulations={tournament.supplementaryRegulations}
            />
          </div>
        )}

        {activeTab === 'schedule' && (
          <div>
            <div className="bg-slate-900 text-white py-6 border-b border-slate-800">
              <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
                  Lịch Thi Đấu &amp; Kết Quả Trực Tiếp
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Xem toàn bộ {matches.length} trận đấu: Vòng Bảng, Bán Kết, Tranh Hạng Ba và Chung Kết.
                </p>
              </div>
            </div>
            <ScheduleSection
              matches={matches}
              onSelectMatch={setSelectedMatch}
              isScheduleAPublished={tournament.isScheduleAPublished}
              isScheduleBPublished={tournament.isScheduleBPublished}
              isScheduleKnockoutPublished={tournament.isScheduleKnockoutPublished}
            />
          </div>
        )}

        {activeTab === 'groups' && (
          <div>
            <div className="bg-slate-900 text-white py-6 border-b border-slate-800">
              <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
                  Bảng Đấu &amp; Xếp Hạng Vòng Tròn
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Chi tiết thứ hạng, điểm thắng/thua, hiệu số và danh sách trận đấu Bảng A &amp; B.
                </p>
              </div>
            </div>
            <StandingsSection
              standingsA={standingsA}
              standingsB={standingsB}
              matchesA={matchesGroupA}
              matchesB={matchesGroupB}
              onSelectMatch={setSelectedMatch}
              isGroupAPublished={tournament.isGroupAPublished}
              isGroupBPublished={tournament.isGroupBPublished}
              isScheduleAPublished={tournament.isScheduleAPublished}
              isScheduleBPublished={tournament.isScheduleBPublished}
            />
          </div>
        )}

        {activeTab === 'knockout' && (
          <div>
            <div className="bg-slate-900 text-white py-6 border-b border-slate-800">
              <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
                  Vòng Chung Kết &amp; Trao Giải
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Nhánh đấu bán kết, trận tranh hạng ba, chung kết và bục vinh quang giải thưởng.
                </p>
              </div>
            </div>
            <KnockoutSection
              semiFinal1={semiFinal1}
              semiFinal2={semiFinal2}
              thirdPlaceMatch={thirdPlaceMatch}
              finalMatch={finalMatch}
              championPair={championPair}
              onSelectMatch={setSelectedMatch}
            />
          </div>
        )}

        {activeTab === 'rules' && (
          <div>
            <div className="bg-slate-900 text-white py-6 border-b border-slate-800">
              <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
                  Điều Lệ &amp; Thể Thức Giải Đấu
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Quy định chi tiết về cách tính điểm vòng bảng, bán kết, chung kết và tiến trình thi đấu.
                </p>
              </div>
            </div>
            <RulesSection
              rules={tournament.rules}
              supplementaryRegulations={tournament.supplementaryRegulations}
            />
          </div>
        )}
      </main>

      {/* Match Detail Modal Popup */}
      <MatchDetailModal
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
      />

      {/* Login Modal Popup */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md">
            <LoginPage
              onBackToPublic={() => setIsLoginModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <TournamentFooter
        tournament={tournament}
        onNavigate={handleTabChange}
      />
    </div>
  );
}

export default function App() {
  return (
    <TournamentProvider>
      <PublicAppContent />
    </TournamentProvider>
  );
}
