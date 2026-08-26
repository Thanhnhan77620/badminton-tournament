import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { TournamentInfo, Pair, Match, MatchStatus, Standing, Player, ScoringFormat, SupplementaryRegulation } from '../types/tournament';
import {
  tournamentInfo as defaultTournamentInfo,
  initialPlayers as defaultInitialPlayers,
  initialPairs as defaultInitialPairs,
  initialMatches as defaultInitialMatches,
  calculateStandings as defaultCalculateStandings,
  PLACEHOLDER_PAIRS,
  DEFAULT_SUPPLEMENTARY_REGULATIONS,
} from '../data/tournamentData';
import {
  saveTournamentToCloud,
  subscribeTournamentFromCloud,
  getTournamentFromCloud,
  TournamentCloudState,
} from '../lib/firestoreService';

const STORAGE_KEY_TOURNAMENT = 'isc_badminton_tournament_data_v6';
const STORAGE_KEY_AUTH = 'isc_badminton_admin_auth_v1';

export type CloudSyncStatus = 'connected' | 'syncing' | 'offline' | 'error';

export interface TournamentContextType {
  // Authentication
  isAdminAuthenticated: boolean;
  login: (passcode: string) => boolean;
  logout: () => void;

  // View Mode: 'public' | 'admin'
  viewMode: 'public' | 'admin';
  setViewMode: (mode: 'public' | 'admin') => void;

  // Cloud & Real-time status
  cloudSyncStatus: CloudSyncStatus;
  isRealtimeConnected: boolean;
  lastSyncedAt: Date | null;
  forceCloudSync: () => Promise<void>;

  // Tournament Data (Single Source of Truth)
  tournament: TournamentInfo;
  pairs: Pair[];
  matches: Match[];
  players: Player[];

  // Computed standings
  standingsA: Standing[];
  standingsB: Standing[];

  // Data Mutations
  updateTournamentInfo: (info: Partial<TournamentInfo>) => void;
  updateRules: (rules: TournamentInfo['rules']) => void;
  updatePrizes: (prizes: TournamentInfo['prizes']) => void;
  updateSupplementaryRegulations: (regulations: SupplementaryRegulation[]) => void;

  // Player & Pair Management
  addPlayer: (player: Player) => void;
  updatePlayer: (player: Player) => void;
  deletePlayer: (playerId: string) => void;
  importPlayers: (newPlayers: Player[]) => void;

  addPair: (pair: Pair) => { success: boolean; error?: string };
  updatePair: (pair: Pair) => { success: boolean; error?: string };
  deletePair: (pairId: string) => void;
  assignPairGroup: (pairId: string, group: 'A' | 'B') => { success: boolean; error?: string };
  randomizeGroups: () => void;
  importPairsList: (
    items: {
      player1Name: string;
      player1Club?: string;
      player2Name: string;
      player2Club?: string;
      group?: 'A' | 'B';
    }[],
    options?: {
      targetGroup?: 'A' | 'B' | 'AUTO';
      replaceExisting?: boolean;
      autoGenerateMatches?: boolean;
    }
  ) => { success: boolean; count: number; error?: string };

  // Group & Schedule Publication State Management
  togglePublishGroup: (group: 'A' | 'B', publish?: boolean) => void;
  togglePublishSchedule: (group: 'A' | 'B' | 'KNOCKOUT', publish?: boolean) => void;
  createManualMatch: (matchData: {
    group: 'A' | 'B';
    pair1Id: string;
    pair2Id: string;
    court?: string;
    scheduledTime?: string;
    format?: ScoringFormat;
    roundLabel?: string;
  }) => { success: boolean; error?: string };
  importCustomGroupSchedule: (
    group: 'A' | 'B',
    scheduleText: string,
    options?: { replaceGroupMatches?: boolean; defaultCourt?: string; defaultStartTime?: string }
  ) => { success: boolean; count: number; error?: string };
  reorderGroupMatches: (group: 'A' | 'B', reorderedMatches: Match[]) => void;
  deleteGroupMatches: (group: 'A' | 'B') => void;

  // Match Management & Score Entry
  generateRoundRobinMatches: () => void;
  updateMatch: (matchId: string, updated: Partial<Match>) => void;
  saveMatchScore: (
    matchId: string,
    sets: { setNumber: number; pair1Score: number; pair2Score: number; isFinished: boolean }[],
    winnerId: string,
    status?: 'FINISHED' | 'LIVE' | 'UPCOMING'
  ) => void;
  resetMatch: (matchId: string) => void;
  setMatchWalkover: (matchId: string, winnerId: string) => void;
  setTournamentStatus: (status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED') => void;
  resetAllToDefault: () => void;
  clearAllData: () => void;
  clearAllPlayers: () => void;
  loadDemoData: () => void;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Auth State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_AUTH) === 'true';
    } catch {
      return false;
    }
  });

  const [viewMode, setViewMode] = useState<'public' | 'admin'>('public');

  // Cloud Realtime State
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>('syncing');
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const localUpdateTimestampRef = useRef<number>(Date.now());
  const isApplyingRemoteRef = useRef<boolean>(false);

  // 2. Core Tournament Data initialized from localStorage fallback
  const [tournament, setTournament] = useState<TournamentInfo>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_TOURNAMENT}_info`);
      return saved ? JSON.parse(saved) : { ...defaultTournamentInfo, status: 'IN_PROGRESS' };
    } catch {
      return { ...defaultTournamentInfo, status: 'IN_PROGRESS' };
    }
  });

  const [pairs, setPairs] = useState<Pair[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_TOURNAMENT}_pairs`);
      return saved ? JSON.parse(saved) : defaultInitialPairs;
    } catch {
      return defaultInitialPairs;
    }
  });

  // Helper to sync knockout progression from group stage and semi-finals
  const syncKnockoutProgression = useCallback((rawMatches: Match[], currentPairs: Pair[]): Match[] => {
    if (!rawMatches || rawMatches.length === 0) return rawMatches;

    const groupAMatches = rawMatches.filter(m => m.group === 'A');
    const groupBMatches = rawMatches.filter(m => m.group === 'B');
    const isGroupAFinished = groupAMatches.length > 0 && groupAMatches.every(m => m.status === 'FINISHED');
    const isGroupBFinished = groupBMatches.length > 0 && groupBMatches.every(m => m.status === 'FINISHED');

    const curStandingsA = defaultCalculateStandings('A', currentPairs, rawMatches);
    const curStandingsB = defaultCalculateStandings('B', currentPairs, rawMatches);

    // If group A is completed (or has rank 1 & 2), determine top pairs
    const topA1 =
      (isGroupAFinished || groupAMatches.some(m => m.status === 'FINISHED')) && curStandingsA.length >= 1
        ? curStandingsA[0].pair
        : null;
    const topA2 =
      (isGroupAFinished || groupAMatches.some(m => m.status === 'FINISHED')) && curStandingsA.length >= 2
        ? curStandingsA[1].pair
        : null;
    const topB1 =
      (isGroupBFinished || groupBMatches.some(m => m.status === 'FINISHED')) && curStandingsB.length >= 1
        ? curStandingsB[0].pair
        : null;
    const topB2 =
      (isGroupBFinished || groupBMatches.length > 0 && groupBMatches.some(m => m.status === 'FINISHED')) &&
      curStandingsB.length >= 2
        ? curStandingsB[1].pair
        : null;

    let updated = rawMatches.map(m => {
      // Semi-final 1 (Nhất A vs Nhì B)
      if (
        m.id === 'm-sf-1' ||
        m.matchNumber === 21 ||
        (m.round === 'SEMI_FINAL' && (m.roundLabel?.includes('1') || m.roundLabel?.includes('Nhất A')))
      ) {
        const targetP1 =
          isGroupAFinished && topA1
            ? topA1
            : m.pair1 && !m.pair1.id.startsWith('placeholder') && !isGroupAFinished
            ? m.pair1
            : topA1 && isGroupAFinished
            ? topA1
            : PLACEHOLDER_PAIRS.A1;
        const targetP2 =
          isGroupBFinished && topB2
            ? topB2
            : m.pair2 && !m.pair2.id.startsWith('placeholder') && !isGroupBFinished
            ? m.pair2
            : topB2 && isGroupBFinished
            ? topB2
            : PLACEHOLDER_PAIRS.B2;

        if (m.pair1?.id !== targetP1.id || m.pair2?.id !== targetP2.id || m.format !== 'BEST_OF_3_15') {
          return {
            ...m,
            pair1: targetP1,
            pair2: targetP2,
            format: 'BEST_OF_3_15' as ScoringFormat,
          };
        }
        return m;
      }

      // Semi-final 2 (Nhất B vs Nhì A)
      if (
        m.id === 'm-sf-2' ||
        m.matchNumber === 22 ||
        (m.round === 'SEMI_FINAL' && (m.roundLabel?.includes('2') || m.roundLabel?.includes('Nhất B')))
      ) {
        const targetP1 =
          isGroupBFinished && topB1
            ? topB1
            : m.pair1 && !m.pair1.id.startsWith('placeholder') && !isGroupBFinished
            ? m.pair1
            : topB1 && isGroupBFinished
            ? topB1
            : PLACEHOLDER_PAIRS.B1;
        const targetP2 =
          isGroupAFinished && topA2
            ? topA2
            : m.pair2 && !m.pair2.id.startsWith('placeholder') && !isGroupAFinished
            ? m.pair2
            : topA2 && isGroupAFinished
            ? topA2
            : PLACEHOLDER_PAIRS.A2;

        if (m.pair1?.id !== targetP1.id || m.pair2?.id !== targetP2.id || m.format !== 'BEST_OF_3_15') {
          return {
            ...m,
            pair1: targetP1,
            pair2: targetP2,
            format: 'BEST_OF_3_15' as ScoringFormat,
          };
        }
        return m;
      }

      return m;
    });

    const curSF1 = updated.find(
      m =>
        m.id === 'm-sf-1' ||
        m.matchNumber === 21 ||
        (m.round === 'SEMI_FINAL' && (m.roundLabel?.includes('1') || m.roundLabel?.includes('Nhất A')))
    );
    const curSF2 = updated.find(
      m =>
        m.id === 'm-sf-2' ||
        m.matchNumber === 22 ||
        (m.round === 'SEMI_FINAL' && (m.roundLabel?.includes('2') || m.roundLabel?.includes('Nhất B')))
    );

    const isSF1Done = curSF1?.status === 'FINISHED' && !!curSF1.winnerId;
    const isSF2Done = curSF2?.status === 'FINISHED' && !!curSF2.winnerId;

    const sf1Winner =
      isSF1Done && curSF1 ? (curSF1.winnerId === curSF1.pair1.id ? curSF1.pair1 : curSF1.pair2) : null;
    const sf1Loser =
      isSF1Done && curSF1 ? (curSF1.winnerId === curSF1.pair1.id ? curSF1.pair2 : curSF1.pair1) : null;

    const sf2Winner =
      isSF2Done && curSF2 ? (curSF2.winnerId === curSF2.pair1.id ? curSF2.pair1 : curSF2.pair2) : null;
    const sf2Loser =
      isSF2Done && curSF2 ? (curSF2.winnerId === curSF2.pair1.id ? curSF2.pair2 : curSF2.pair1) : null;

    updated = updated.map(m => {
      // Final match (#24)
      if (m.id === 'm-final' || m.round === 'FINAL' || m.matchNumber === 24) {
        const targetP1 =
          sf1Winner ||
          (m.pair1 && !m.pair1.id.startsWith('placeholder') && !isSF1Done
            ? m.pair1
            : PLACEHOLDER_PAIRS.SF1_WINNER);
        const targetP2 =
          sf2Winner ||
          (m.pair2 && !m.pair2.id.startsWith('placeholder') && !isSF2Done
            ? m.pair2
            : PLACEHOLDER_PAIRS.SF2_WINNER);

        if (m.pair1?.id !== targetP1.id || m.pair2?.id !== targetP2.id) {
          return {
            ...m,
            pair1: targetP1,
            pair2: targetP2,
          };
        }
        return m;
      }

      // Third Place match (#23)
      if (m.id === 'm-third' || m.round === 'THIRD_PLACE' || m.matchNumber === 23) {
        const targetP1 =
          sf1Loser ||
          (m.pair1 && !m.pair1.id.startsWith('placeholder') && !isSF1Done
            ? m.pair1
            : PLACEHOLDER_PAIRS.SF1_LOSER);
        const targetP2 =
          sf2Loser ||
          (m.pair2 && !m.pair2.id.startsWith('placeholder') && !isSF2Done
            ? m.pair2
            : PLACEHOLDER_PAIRS.SF2_LOSER);

        if (m.pair1?.id !== targetP1.id || m.pair2?.id !== targetP2.id) {
          return {
            ...m,
            pair1: targetP1,
            pair2: targetP2,
          };
        }
        return m;
      }

      return m;
    });

    return updated;
  }, []);

  const [matches, setMatches] = useState<Match[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_TOURNAMENT}_matches`);
      const raw = saved ? JSON.parse(saved) : defaultInitialMatches;
      const initialP = pairs && pairs.length > 0 ? pairs : defaultInitialPairs;
      return syncKnockoutProgression(raw, initialP);
    } catch {
      return defaultInitialMatches;
    }
  });

  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_TOURNAMENT}_players`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return defaultInitialPlayers;
  });

  const [isEmergencyUnlocked, setIsEmergencyUnlocked] = useState<boolean>(false);

  const toggleEmergencyUnlock = (unlocked?: boolean) => {
    setIsEmergencyUnlocked(prev => (typeof unlocked === 'boolean' ? unlocked : !prev));
  };

  // Helper to persist state to local storage
  const saveToLocalStorage = useCallback(
    (t: TournamentInfo, p: Pair[], m: Match[], pl: Player[]) => {
      try {
        localStorage.setItem(`${STORAGE_KEY_TOURNAMENT}_info`, JSON.stringify(t));
        localStorage.setItem(`${STORAGE_KEY_TOURNAMENT}_pairs`, JSON.stringify(p));
        localStorage.setItem(`${STORAGE_KEY_TOURNAMENT}_matches`, JSON.stringify(m));
        localStorage.setItem(`${STORAGE_KEY_TOURNAMENT}_players`, JSON.stringify(pl));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
    },
    []
  );

  // Helper to push state changes to Firebase Cloud Firestore
  const syncToCloud = useCallback(
    async (
      newTournament: TournamentInfo,
      newPairs: Pair[],
      newMatches: Match[],
      newPlayers: Player[]
    ) => {
      const ts = Date.now();
      localUpdateTimestampRef.current = ts;
      saveToLocalStorage(newTournament, newPairs, newMatches, newPlayers);
      try {
        setCloudSyncStatus('syncing');
        const success = await saveTournamentToCloud(
          newTournament,
          newPairs,
          newMatches,
          newPlayers,
          ts
        );
        if (success) {
          setCloudSyncStatus('connected');
          setIsRealtimeConnected(true);
          setLastSyncedAt(new Date());
        } else {
          setCloudSyncStatus('offline');
        }
      } catch (error) {
        console.warn('Firestore cloud sync error:', error);
        setCloudSyncStatus('error');
      }
    },
    [saveToLocalStorage]
  );

  // Initialize Firestore Real-time Listener on Mount
  useEffect(() => {
    let isSubscribed = true;

    const unsubscribe = subscribeTournamentFromCloud(
      (cloudData: TournamentCloudState) => {
        if (!isSubscribed) return;

        // If this update was triggered by another client or initial load
        if (cloudData && cloudData.tournament) {
          isApplyingRemoteRef.current = true;
          setTournament(cloudData.tournament);
          setPairs(cloudData.pairs || []);
          const syncedMatches = syncKnockoutProgression(cloudData.matches || [], cloudData.pairs || []);
          setMatches(syncedMatches);
          setPlayers(cloudData.players || []);
          saveToLocalStorage(
            cloudData.tournament,
            cloudData.pairs || [],
            syncedMatches,
            cloudData.players || []
          );
          setCloudSyncStatus('connected');
          setIsRealtimeConnected(true);
          setLastSyncedAt(new Date());
          setTimeout(() => {
            isApplyingRemoteRef.current = false;
          }, 100);
        }
      },
      err => {
        console.warn('[Firebase Firestore] Realtime error:', err);
        setCloudSyncStatus('offline');
        setIsRealtimeConnected(false);
      }
    );

    // Initial check: if cloud has no document yet, bootstrap initial state
    getTournamentFromCloud().then(existingCloud => {
      if (!isSubscribed) return;
      if (!existingCloud) {
        saveTournamentToCloud(tournament, pairs, matches, players).then(() => {
          if (isSubscribed) {
            setCloudSyncStatus('connected');
            setIsRealtimeConnected(true);
            setLastSyncedAt(new Date());
          }
        });
      } else {
        setCloudSyncStatus('connected');
        setIsRealtimeConnected(true);
        setLastSyncedAt(new Date());
      }
    });

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, [saveToLocalStorage, syncKnockoutProgression]);

  // Auth functions
  const login = (passcode: string) => {
    const validCodes = ['btcadmin'];
    if (validCodes.includes(passcode.trim().toLowerCase())) {
      setIsAdminAuthenticated(true);
      try {
        localStorage.setItem(STORAGE_KEY_AUTH, 'true');
      } catch {}
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdminAuthenticated(false);
    setViewMode('public');
    try {
      localStorage.removeItem(STORAGE_KEY_AUTH);
    } catch {}
  };

  // Computations
  const standingsA = useMemo(() => defaultCalculateStandings('A', pairs, matches), [pairs, matches]);
  const standingsB = useMemo(() => defaultCalculateStandings('B', pairs, matches), [pairs, matches]);

  const forceCloudSync = async () => {
    await syncToCloud(tournament, pairs, matches, players);
  };

  const setTournamentStatus = (status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED') => {
    const updated = { ...tournament, status };
    setTournament(updated);
    syncToCloud(updated, pairs, matches, players);
  };

  const updateTournamentInfo = (info: Partial<TournamentInfo>) => {
    const updated = { ...tournament, ...info };
    setTournament(updated);
    syncToCloud(updated, pairs, matches, players);
  };

  const updateRules = (rules: TournamentInfo['rules']) => {
    const updated = { ...tournament, rules };
    setTournament(updated);
    syncToCloud(updated, pairs, matches, players);
  };

  const updatePrizes = (prizes: TournamentInfo['prizes']) => {
    const updated = { ...tournament, prizes };
    setTournament(updated);
    syncToCloud(updated, pairs, matches, players);
  };

  const updateSupplementaryRegulations = (supplementaryRegulations: SupplementaryRegulation[]) => {
    const updated = { ...tournament, supplementaryRegulations };
    setTournament(updated);
    syncToCloud(updated, pairs, matches, players);
  };

  const addPlayer = (newPlayer: Player) => {
    const updatedPlayers = [...players, newPlayer];
    setPlayers(updatedPlayers);
    syncToCloud(tournament, pairs, matches, updatedPlayers);
  };

  const updatePlayer = (updated: Player) => {
    const updatedPlayers = players.map(p => (p.id === updated.id ? updated : p));
    setPlayers(updatedPlayers);

    // Update pairs that contain this player
    const updatedPairs = pairs.map(pair => {
      let p1 = pair.player1;
      let p2 = pair.player2;
      if (p1?.id === updated.id) p1 = updated;
      if (p2?.id === updated.id) p2 = updated;
      return {
        ...pair,
        player1: p1,
        player2: p2,
        name: `${p1?.name || 'VĐV 1'} (${p1?.club || 'CLB'}) & ${p2?.name || 'VĐV 2'} (${p2?.club || 'CLB'})`,
      };
    });
    setPairs(updatedPairs);

    // Synchronize to matches as well
    const updatedMatches = matches.map(m => {
      let p1 = m.pair1;
      let p2 = m.pair2;

      if (p1 && (p1.player1?.id === updated.id || p1.player2?.id === updated.id)) {
        const updatedPlayer1 = p1.player1?.id === updated.id ? updated : p1.player1;
        const updatedPlayer2 = p1.player2?.id === updated.id ? updated : p1.player2;
        p1 = {
          ...p1,
          player1: updatedPlayer1,
          player2: updatedPlayer2,
          name: `${updatedPlayer1?.name || 'VĐV 1'} (${updatedPlayer1?.club || 'CLB'}) & ${updatedPlayer2?.name || 'VĐV 2'} (${updatedPlayer2?.club || 'CLB'})`,
        };
      }

      if (p2 && (p2.player1?.id === updated.id || p2.player2?.id === updated.id)) {
        const updatedPlayer1 = p2.player1?.id === updated.id ? updated : p2.player1;
        const updatedPlayer2 = p2.player2?.id === updated.id ? updated : p2.player2;
        p2 = {
          ...p2,
          player1: updatedPlayer1,
          player2: updatedPlayer2,
          name: `${updatedPlayer1?.name || 'VĐV 1'} (${updatedPlayer1?.club || 'CLB'}) & ${updatedPlayer2?.name || 'VĐV 2'} (${updatedPlayer2?.club || 'CLB'})`,
        };
      }

      return {
        ...m,
        pair1: p1,
        pair2: p2,
      };
    });
    setMatches(updatedMatches);
    syncToCloud(tournament, updatedPairs, updatedMatches, updatedPlayers);
  };

  const deletePlayer = (playerId: string) => {
    const updatedPlayers = players.filter(p => p.id !== playerId);
    setPlayers(updatedPlayers);
    syncToCloud(tournament, pairs, matches, updatedPlayers);
  };

  const importPlayers = (newPlayers: Player[]) => {
    const existingIds = new Set(players.map(p => p.id));
    const filtered = newPlayers.filter(p => !existingIds.has(p.id));
    const updatedPlayers = [...players, ...filtered];
    setPlayers(updatedPlayers);
    syncToCloud(tournament, pairs, matches, updatedPlayers);
  };

  const isDuplicatePairInGroup = (
    player1Id: string,
    player2Id: string,
    targetGroup: 'A' | 'B',
    excludePairId?: string
  ): boolean => {
    return pairs.some(
      p =>
        p.group === targetGroup &&
        p.id !== excludePairId &&
        ((p.player1.id === player1Id && p.player2.id === player2Id) ||
          (p.player1.id === player2Id && p.player2.id === player1Id))
    );
  };

  const addPair = (newPair: Pair): { success: boolean; error?: string } => {
    if (newPair.player1.id === newPair.player2.id) {
      return { success: false, error: 'Vui lòng chọn 2 vận động viên khác nhau!' };
    }

    if (isDuplicatePairInGroup(newPair.player1.id, newPair.player2.id, newPair.group)) {
      return {
        success: false,
        error: `Cặp đấu gồm 2 VĐV này đã tồn tại trong Bảng ${newPair.group}. Trong một bảng đấu không được thêm trùng cặp đấu!`,
      };
    }

    const updatedPairs = [...pairs, newPair];
    setPairs(updatedPairs);
    syncToCloud(tournament, updatedPairs, matches, players);
    return { success: true };
  };

  const updatePair = (updated: Pair): { success: boolean; error?: string } => {
    if (updated.player1.id === updated.player2.id) {
      return { success: false, error: 'Vui lòng chọn 2 vận động viên khác nhau!' };
    }

    if (isDuplicatePairInGroup(updated.player1.id, updated.player2.id, updated.group, updated.id)) {
      return {
        success: false,
        error: `Cặp đấu gồm 2 VĐV này đã tồn tại trong Bảng ${updated.group}. Trong một bảng đấu không được thêm trùng cặp đấu!`,
      };
    }

    const updatedPairs = pairs.map(p => (p.id === updated.id ? updated : p));
    const updatedMatches = matches.map(m => {
      let p1 = m.pair1;
      let p2 = m.pair2;
      if (p1.id === updated.id) p1 = updated;
      if (p2.id === updated.id) p2 = updated;
      return { ...m, pair1: p1, pair2: p2 };
    });

    setPairs(updatedPairs);
    setMatches(updatedMatches);
    syncToCloud(tournament, updatedPairs, updatedMatches, players);
    return { success: true };
  };

  const deletePair = (pairId: string) => {
    const updatedPairs = pairs.filter(p => p.id !== pairId);
    const updatedMatches = matches.filter(m => m.pair1.id !== pairId && m.pair2.id !== pairId);
    setPairs(updatedPairs);
    setMatches(updatedMatches);
    syncToCloud(tournament, updatedPairs, updatedMatches, players);
  };

  const assignPairGroup = (pairId: string, group: 'A' | 'B'): { success: boolean; error?: string } => {
    const targetPair = pairs.find(p => p.id === pairId);
    if (!targetPair) return { success: false, error: 'Không tìm thấy cặp đấu' };

    if (isDuplicatePairInGroup(targetPair.player1.id, targetPair.player2.id, group, pairId)) {
      return {
        success: false,
        error: `Không thể chuyển sang Bảng ${group}: Cặp đấu này đã tồn tại trong Bảng ${group}!`,
      };
    }

    const updatedPairs = pairs.map(p => (p.id === pairId ? { ...p, group } : p));
    setPairs(updatedPairs);
    syncToCloud(tournament, updatedPairs, matches, players);
    return { success: true };
  };

  const randomizeGroups = () => {
    const shuffled = [...pairs].sort(() => Math.random() - 0.5);
    const half = Math.ceil(shuffled.length / 2);
    const newPairs = shuffled.map((p, idx) => ({
      ...p,
      group: (idx < half ? 'A' : 'B') as 'A' | 'B',
      code: `${idx < half ? 'A' : 'B'}${idx < half ? idx + 1 : idx - half + 1}`,
      pairNumber: idx + 1,
    }));
    setPairs(newPairs);
    syncToCloud(tournament, newPairs, matches, players);
  };

  const importPairsList = (
    items: {
      player1Name: string;
      player1Club?: string;
      player2Name: string;
      player2Club?: string;
      group?: 'A' | 'B';
    }[],
    options?: {
      targetGroup?: 'A' | 'B' | 'AUTO';
      replaceExisting?: boolean;
      autoGenerateMatches?: boolean;
    }
  ): { success: boolean; count: number; error?: string } => {
    if (!items || items.length === 0) {
      return { success: false, count: 0, error: 'Danh sách import trống!' };
    }

    const currentPlayers = [...players];
    const newPlayersMap = new Map<string, Player>();
    currentPlayers.forEach(p => newPlayersMap.set(p.name.trim().toLowerCase(), p));

    const getOrCreatePlayer = (name: string, club?: string): Player => {
      const cleanName = name.trim();
      const cleanClub = club?.trim() || 'ISC';
      const key = cleanName.toLowerCase();
      if (newPlayersMap.has(key)) {
        return newPlayersMap.get(key)!;
      }
      const newPlayer: Player = {
        id: `p-imp-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        name: cleanName,
        club: cleanClub,
        avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000000)}?w=150&auto=format&fit=crop&q=80`,
        role: 'VĐV',
      };
      newPlayersMap.set(key, newPlayer);
      currentPlayers.push(newPlayer);
      return newPlayer;
    };

    const targetGroupPref = options?.targetGroup || 'AUTO';
    const replace = options?.replaceExisting ?? false;

    let basePairs: Pair[];
    if (replace) {
      if (targetGroupPref === 'A') {
        basePairs = pairs.filter(p => p.group !== 'A');
      } else if (targetGroupPref === 'B') {
        basePairs = pairs.filter(p => p.group !== 'B');
      } else {
        basePairs = [];
      }
    } else {
      basePairs = [...pairs];
    }

    let addedCount = 0;
    const newCreatedPairs: Pair[] = [];

    items.forEach((item, index) => {
      if (!item.player1Name?.trim() || !item.player2Name?.trim()) return;

      const p1 = getOrCreatePlayer(item.player1Name, item.player1Club);
      const p2 = getOrCreatePlayer(item.player2Name, item.player2Club);

      let group: 'A' | 'B' = 'A';
      if (targetGroupPref === 'A') {
        group = 'A';
      } else if (targetGroupPref === 'B') {
        group = 'B';
      } else if (item.group) {
        group = item.group;
      } else {
        const totalItems = items.length;
        const half = Math.ceil(totalItems / 2);
        group = index < half ? 'A' : 'B';
      }

      const clubStr =
        p1.club === p2.club ? (p1.club || 'ISC') : `${p1.club || 'CLB'} - ${p2.club || 'CLB'}`;
      const pairName = `${p1.name} (${p1.club || 'CLB'}) & ${p2.name} (${p2.club || 'CLB'})`;

      const newPair: Pair = {
        id: `pair-imp-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
        pairNumber: 0,
        code: '',
        name: pairName,
        player1: p1,
        player2: p2,
        club: clubStr,
        group,
      };

      newCreatedPairs.push(newPair);
      addedCount++;
    });

    if (addedCount === 0) {
      return { success: false, count: 0, error: 'Không thể xử lý dòng nào hợp lệ từ danh sách.' };
    }

    const combinedPairs = [...basePairs, ...newCreatedPairs];

    const groupAPairs = combinedPairs
      .filter(p => p.group === 'A')
      .map((p, idx) => ({
        ...p,
        code: `A${idx + 1}`,
      }));

    const groupBPairs = combinedPairs
      .filter(p => p.group === 'B')
      .map((p, idx) => ({
        ...p,
        code: `B${idx + 1}`,
      }));

    const finalPairs = [...groupAPairs, ...groupBPairs].map((p, idx) => ({
      ...p,
      pairNumber: idx + 1,
    }));

    setPlayers(currentPlayers);
    setPairs(finalPairs);

    let finalMatches = matches;

    if (options?.autoGenerateMatches) {
      const groupA = finalPairs.filter(p => p.group === 'A');
      const groupB = finalPairs.filter(p => p.group === 'B');
      const newMatches: Match[] = [];
      let matchCounter = 1;

      const createGroupMatches = (groupList: Pair[], grp: 'A' | 'B') => {
        const n = groupList.length;
        for (let i = 0; i < n; i++) {
          for (let j = i + 1; j < n; j++) {
            const mNum = matchCounter++;
            const court = mNum % 2 === 1 ? 'Sân 01' : 'Sân 02';
            const hour = 8 + Math.floor((mNum - 1) / 2) * 0.5;
            const hStr = Math.floor(hour).toString().padStart(2, '0');
            const mStr = hour % 1 === 0.5 ? '30' : '00';
            newMatches.push({
              id: `m-${mNum.toString().padStart(2, '0')}`,
              matchNumber: mNum,
              round: 'GROUP_STAGE',
              roundLabel: `Vòng bảng - Bảng ${grp}`,
              group: grp,
              court,
              scheduledTime: `${hStr}:${mStr}`,
              scheduledDate: tournament.date,
              status: 'UPCOMING',
              pair1: groupList[i],
              pair2: groupList[j],
              sets: [{ setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false }],
              format: 'ONE_SET_21',
            });
          }
        }
      };

      if (groupA.length >= 2) createGroupMatches(groupA, 'A');
      if (groupB.length >= 2) createGroupMatches(groupB, 'B');

      if (groupA.length >= 2 && groupB.length >= 2) {
        newMatches.push({
          id: 'm-sf-1',
          matchNumber: matchCounter++,
          round: 'SEMI_FINAL',
          roundLabel: 'Bán Kết 1 (Nhất A vs Nhì B)',
          court: 'Sân 01',
          scheduledTime: '10:30',
          scheduledDate: tournament.date,
          status: 'UPCOMING',
          pair1: PLACEHOLDER_PAIRS.SF1_PAIR1,
          pair2: PLACEHOLDER_PAIRS.SF1_PAIR2,
          sets: [
            { setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false },
            { setNumber: 2, pair1Score: 0, pair2Score: 0, isFinished: false },
            { setNumber: 3, pair1Score: 0, pair2Score: 0, isFinished: false },
          ],
          format: 'BEST_OF_3_15',
        });

        newMatches.push({
          id: 'm-sf-2',
          matchNumber: matchCounter++,
          round: 'SEMI_FINAL',
          roundLabel: 'Bán Kết 2 (Nhất B vs Nhì A)',
          court: 'Sân 02',
          scheduledTime: '10:30',
          scheduledDate: tournament.date,
          status: 'UPCOMING',
          pair1: PLACEHOLDER_PAIRS.SF2_PAIR1,
          pair2: PLACEHOLDER_PAIRS.SF2_PAIR2,
          sets: [
            { setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false },
            { setNumber: 2, pair1Score: 0, pair2Score: 0, isFinished: false },
            { setNumber: 3, pair1Score: 0, pair2Score: 0, isFinished: false },
          ],
          format: 'BEST_OF_3_15',
        });

        newMatches.push({
          id: 'm-third',
          matchNumber: matchCounter++,
          round: 'THIRD_PLACE',
          roundLabel: 'Trận Tranh Hạng Ba',
          court: 'Sân 02',
          scheduledTime: '11:00',
          scheduledDate: tournament.date,
          status: 'UPCOMING',
          pair1: PLACEHOLDER_PAIRS.THIRD_PAIR1,
          pair2: PLACEHOLDER_PAIRS.THIRD_PAIR2,
          sets: [{ setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false }],
          format: 'ONE_SET_21',
        });

        newMatches.push({
          id: 'm-final',
          matchNumber: matchCounter++,
          round: 'FINAL',
          roundLabel: 'Chung Kết Tranh Cúp Vô Địch',
          court: 'Sân 01',
          scheduledTime: '11:30',
          scheduledDate: tournament.date,
          status: 'UPCOMING',
          pair1: PLACEHOLDER_PAIRS.FINAL_PAIR1,
          pair2: PLACEHOLDER_PAIRS.FINAL_PAIR2,
          sets: [
            { setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false },
            { setNumber: 2, pair1Score: 0, pair2Score: 0, isFinished: false },
            { setNumber: 3, pair1Score: 0, pair2Score: 0, isFinished: false },
          ],
          format: 'BEST_OF_3_15',
        });
      }

      finalMatches = newMatches;
      setMatches(finalMatches);
    }

    // When importing pairs, automatically set the target group(s) to Draft mode so BTC can review
    let updatedTournamentInfo = { ...tournament };
    if (targetGroupPref === 'A') {
      updatedTournamentInfo.isGroupAPublished = false;
      if (options?.autoGenerateMatches) {
        updatedTournamentInfo.isScheduleAPublished = false;
      }
    } else if (targetGroupPref === 'B') {
      updatedTournamentInfo.isGroupBPublished = false;
      if (options?.autoGenerateMatches) {
        updatedTournamentInfo.isScheduleBPublished = false;
      }
    } else {
      updatedTournamentInfo.isGroupAPublished = false;
      updatedTournamentInfo.isGroupBPublished = false;
      if (options?.autoGenerateMatches) {
        updatedTournamentInfo.isScheduleAPublished = false;
        updatedTournamentInfo.isScheduleBPublished = false;
      }
    }
    setTournament(updatedTournamentInfo);

    syncToCloud(updatedTournamentInfo, finalPairs, finalMatches, currentPlayers);
    return { success: true, count: addedCount };
  };

  // Group & Schedule Publication State Management
  const togglePublishGroup = (group: 'A' | 'B', publish?: boolean) => {
    const key = group === 'A' ? 'isGroupAPublished' : 'isGroupBPublished';
    const currentVal = tournament[key] ?? false;
    const nextVal = typeof publish === 'boolean' ? publish : !currentVal;
    const updated = { ...tournament, [key]: nextVal };
    setTournament(updated);
    syncToCloud(updated, pairs, matches, players);
  };

  const togglePublishSchedule = (group: 'A' | 'B' | 'KNOCKOUT', publish?: boolean) => {
    let key: 'isScheduleAPublished' | 'isScheduleBPublished' | 'isScheduleKnockoutPublished' = 'isScheduleAPublished';
    if (group === 'A') key = 'isScheduleAPublished';
    else if (group === 'B') key = 'isScheduleBPublished';
    else key = 'isScheduleKnockoutPublished';

    const currentVal = tournament[key] ?? false;
    const nextVal = typeof publish === 'boolean' ? publish : !currentVal;
    const updated = { ...tournament, [key]: nextVal };
    setTournament(updated);
    syncToCloud(updated, pairs, matches, players);
  };

  // Manual Match Creation for a Group
  const createManualMatch = (matchData: {
    group: 'A' | 'B';
    pair1Id: string;
    pair2Id: string;
    court?: string;
    scheduledTime?: string;
    format?: ScoringFormat;
    roundLabel?: string;
  }): { success: boolean; error?: string } => {
    const p1 = pairs.find(p => p.id === matchData.pair1Id);
    const p2 = pairs.find(p => p.id === matchData.pair2Id);

    if (!p1 || !p2) {
      return { success: false, error: 'Không tìm thấy thông tin cặp đấu được chọn.' };
    }
    if (p1.id === p2.id) {
      return { success: false, error: 'Hai cặp đấu tham gia trận phải khác nhau.' };
    }

    const nextMatchNumber = matches.length > 0 ? Math.max(...matches.map(m => m.matchNumber || 0)) + 1 : 1;
    const newMatch: Match = {
      id: `m-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      matchNumber: nextMatchNumber,
      round: 'GROUP_STAGE',
      roundLabel: matchData.roundLabel || `Vòng bảng - Bảng ${matchData.group}`,
      group: matchData.group,
      court: matchData.court || (nextMatchNumber % 2 === 1 ? 'Sân 01' : 'Sân 02'),
      scheduledTime: matchData.scheduledTime || '08:30',
      scheduledDate: tournament.date,
      status: 'UPCOMING',
      pair1: p1,
      pair2: p2,
      sets: [{ setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false }],
      format: matchData.format || 'ONE_SET_21',
    };

    const nextMatches = [...matches, newMatch];
    const synced = syncKnockoutProgression(nextMatches, pairs);
    setMatches(synced);
    syncToCloud(tournament, pairs, synced, players);
    return { success: true };
  };

  // Custom Group Schedule Import (Format: 1, A1, A2 | 2, A3, A5 hoặc xuống dòng)
  const importCustomGroupSchedule = (
    group: 'A' | 'B',
    scheduleText: string,
    options?: { replaceGroupMatches?: boolean; defaultCourt?: string; defaultStartTime?: string }
  ): { success: boolean; count: number; error?: string } => {
    if (!scheduleText || !scheduleText.trim()) {
      return { success: false, count: 0, error: 'Vui lòng nhập nội dung lịch thi đấu.' };
    }

    const groupPairs = pairs.filter(p => p.group === group);
    if (groupPairs.length < 2) {
      return {
        success: false,
        count: 0,
        error: `Bảng ${group} cần ít nhất 2 cặp đấu đã được phân bảng trước khi tạo lịch.`,
      };
    }

    // Lookup map by pair code (e.g. "A1", "1", "PAIR 01"), by id, or by pair name
    const pairMap = new Map<string, Pair>();
    groupPairs.forEach((p, idx) => {
      if (p.code) pairMap.set(p.code.toUpperCase().trim(), p);
      pairMap.set(`${group}${idx + 1}`.toUpperCase(), p);
      pairMap.set(`${idx + 1}`, p);
      pairMap.set(p.id.toUpperCase(), p);
      pairMap.set(p.name.toUpperCase().trim(), p);
      if (p.player1?.name) pairMap.set(p.player1.name.toUpperCase().trim(), p);
    });

    // Split text by lines OR pipe (|)
    const rawEntries = scheduleText
      .split(/[\n|]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const generatedMatches: Match[] = [];
    let baseMatchNum = options?.replaceGroupMatches
      ? (matches.filter(m => m.group !== group).length > 0 ? 1 : 1)
      : (matches.length > 0 ? Math.max(...matches.map(m => m.matchNumber || 0)) + 1 : 1);

    const errors: string[] = [];

    rawEntries.forEach((entry, idx) => {
      // Split parts by comma, hyphen, tab or semicolon
      // Formats supported:
      // "1, A1, A2"
      // "1, A1, A2, Sân 01, 08:30"
      // "A1, A2"
      // "A1 - A2"
      const parts = entry.split(/[,;\t\-]+/).map(p => p.trim());
      if (parts.length < 2) return;

      let p1Token = '';
      let p2Token = '';
      let court = options?.defaultCourt || 'Sân 01';
      let time = options?.defaultStartTime || '08:30';

      if (parts.length >= 3 && !isNaN(Number(parts[0]))) {
        // Format: 1, A1, A2
        p1Token = parts[1].toUpperCase();
        p2Token = parts[2].toUpperCase();
        if (parts[3]) court = parts[3];
        if (parts[4]) time = parts[4];
      } else {
        // Format: A1, A2
        p1Token = parts[0].toUpperCase();
        p2Token = parts[1].toUpperCase();
        if (parts[2]) court = parts[2];
        if (parts[3]) time = parts[3];
      }

      // Resolve pairs
      const findPair = (token: string): Pair | undefined => {
        if (!token) return undefined;
        let match = pairMap.get(token);
        if (match) return match;
        // Try prepending group letter if just number "1" -> "A1"
        match = pairMap.get(`${group}${token}`);
        if (match) return match;
        // Try partial name match
        return groupPairs.find(
          p =>
            p.name.toUpperCase().includes(token) ||
            p.code.toUpperCase() === token ||
            p.player1?.name.toUpperCase().includes(token) ||
            p.player2?.name.toUpperCase().includes(token)
        );
      };

      const pair1 = findPair(p1Token);
      const pair2 = findPair(p2Token);

      if (!pair1 || !pair2) {
        errors.push(`Dòng ${idx + 1} ("${entry}"): Không nhận diện được cặp "${p1Token}" hoặc "${p2Token}".`);
        return;
      }
      if (pair1.id === pair2.id) {
        errors.push(`Dòng ${idx + 1}: Hai cặp đấu trùng nhau (${p1Token}).`);
        return;
      }

      const mNumber = baseMatchNum++;
      generatedMatches.push({
        id: `m-grp-${group.toLowerCase()}-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
        matchNumber: mNumber,
        round: 'GROUP_STAGE',
        roundLabel: `Vòng bảng - Bảng ${group}`,
        group,
        court: court || (mNumber % 2 === 1 ? 'Sân 01' : 'Sân 02'),
        scheduledTime: time,
        scheduledDate: tournament.date,
        status: 'UPCOMING',
        pair1,
        pair2,
        sets: [{ setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false }],
        format: 'ONE_SET_21',
      });
    });

    if (generatedMatches.length === 0) {
      return {
        success: false,
        count: 0,
        error: errors.length > 0 ? errors.join(' ') : 'Không tìm thấy dòng lịch đấu hợp lệ nào theo format (trận, đội 1, đội 2).',
      };
    }

    let updatedMatches: Match[];
    if (options?.replaceGroupMatches) {
      // Keep other group and knockout matches, replace only this group
      const otherMatches = matches.filter(m => m.group !== group);
      updatedMatches = [...otherMatches, ...generatedMatches];
    } else {
      updatedMatches = [...matches, ...generatedMatches];
    }

    // Renumber matches cleanly if needed
    const synced = syncKnockoutProgression(updatedMatches, pairs);
    setMatches(synced);
    // Newly created/imported schedule starts in Draft mode (isScheduleAPublished/isScheduleBPublished = false) until explicit Public
    const schedKey = group === 'A' ? 'isScheduleAPublished' : 'isScheduleBPublished';
    const updatedTour = { ...tournament, [schedKey]: false };
    setTournament(updatedTour);
    syncToCloud(updatedTour, pairs, synced, players);

    return { success: true, count: generatedMatches.length };
  };

  const reorderGroupMatches = (group: 'A' | 'B', reorderedMatches: Match[]) => {
    const otherMatches = matches.filter(m => m.group !== group);
    
    // Determine start match number for this group
    const groupAExisting = matches.filter(m => m.group === 'A');
    let startMatchNumber = 1;
    if (group === 'A') {
      startMatchNumber = 1;
    } else {
      startMatchNumber = groupAExisting.length > 0 ? groupAExisting.length + 1 : 11;
    }

    const updatedGroupMatches = reorderedMatches.map((m, index) => ({
      ...m,
      matchNumber: startMatchNumber + index,
    }));

    const nextMatches = [...otherMatches, ...updatedGroupMatches].sort((a, b) => (a.matchNumber || 0) - (b.matchNumber || 0));
    const synced = syncKnockoutProgression(nextMatches, pairs);
    setMatches(synced);
    syncToCloud(tournament, pairs, synced, players);
  };

  const deleteGroupMatches = (group: 'A' | 'B') => {
    const updated = matches.filter(m => m.group !== group);
    const synced = syncKnockoutProgression(updated, pairs);
    setMatches(synced);
    syncToCloud(tournament, pairs, synced, players);
  };

  const generateRoundRobinMatches = () => {
    const groupA = pairs.filter(p => p.group === 'A');
    const groupB = pairs.filter(p => p.group === 'B');
    const newMatches: Match[] = [];
    let matchCounter = 1;

    const createGroupMatches = (groupList: Pair[], grp: 'A' | 'B') => {
      const n = groupList.length;
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const mNum = matchCounter++;
          const court = mNum % 2 === 1 ? 'Sân 01' : 'Sân 02';
          const hour = 8 + Math.floor((mNum - 1) / 2) * 0.5;
          const hStr = Math.floor(hour).toString().padStart(2, '0');
          const mStr = hour % 1 === 0.5 ? '30' : '00';
          newMatches.push({
            id: `m-${mNum.toString().padStart(2, '0')}`,
            matchNumber: mNum,
            round: 'GROUP_STAGE',
            roundLabel: `Vòng bảng - Bảng ${grp}`,
            group: grp,
            court,
            scheduledTime: `${hStr}:${mStr}`,
            scheduledDate: tournament.date,
            status: 'UPCOMING',
            pair1: groupList[i],
            pair2: groupList[j],
            sets: [{ setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false }],
            format: 'ONE_SET_21',
          });
        }
      }
    };

    if (groupA.length >= 2) createGroupMatches(groupA, 'A');
    if (groupB.length >= 2) createGroupMatches(groupB, 'B');

    // Knockout Matches
    const sf1P1 = PLACEHOLDER_PAIRS.A1;
    const sf1P2 = PLACEHOLDER_PAIRS.B2;
    const sf2P1 = PLACEHOLDER_PAIRS.B1;
    const sf2P2 = PLACEHOLDER_PAIRS.A2;

    if (groupA.length >= 2 && groupB.length >= 2) {
      newMatches.push({
        id: 'm-sf-1',
        matchNumber: matchCounter++,
        round: 'SEMI_FINAL',
        roundLabel: 'Bán Kết 1 (Nhất A vs Nhì B)',
        court: 'Sân 01',
        scheduledTime: '10:30',
        scheduledDate: tournament.date,
        status: 'UPCOMING',
        pair1: sf1P1,
        pair2: sf1P2,
        sets: [
          { setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false },
          { setNumber: 2, pair1Score: 0, pair2Score: 0, isFinished: false },
          { setNumber: 3, pair1Score: 0, pair2Score: 0, isFinished: false },
        ],
        format: 'BEST_OF_3_15',
      });
    }

    if (groupA.length >= 2 && groupB.length >= 2) {
      newMatches.push({
        id: 'm-sf-2',
        matchNumber: matchCounter++,
        round: 'SEMI_FINAL',
        roundLabel: 'Bán Kết 2 (Nhất B vs Nhì A)',
        court: 'Sân 02',
        scheduledTime: '10:30',
        scheduledDate: tournament.date,
        status: 'UPCOMING',
        pair1: sf2P1,
        pair2: sf2P2,
        sets: [
          { setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false },
          { setNumber: 2, pair1Score: 0, pair2Score: 0, isFinished: false },
          { setNumber: 3, pair1Score: 0, pair2Score: 0, isFinished: false },
        ],
        format: 'BEST_OF_3_15',
      });
    }

    if (groupA.length >= 2 && groupB.length >= 2) {
      newMatches.push({
        id: 'm-third',
        matchNumber: matchCounter++,
        round: 'THIRD_PLACE',
        roundLabel: 'Trận Tranh Hạng Ba',
        court: 'Sân 02',
        scheduledTime: '11:00',
        scheduledDate: tournament.date,
        status: 'UPCOMING',
        pair1: PLACEHOLDER_PAIRS.THIRD_PAIR1,
        pair2: PLACEHOLDER_PAIRS.THIRD_PAIR2,
        sets: [{ setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false }],
        format: 'ONE_SET_21',
      });
    }

    if (groupA.length >= 2 && groupB.length >= 2) {
      newMatches.push({
        id: 'm-final',
        matchNumber: matchCounter++,
        round: 'FINAL',
        roundLabel: 'Chung Kết Tranh Cúp Vô Địch',
        court: 'Sân 01',
        scheduledTime: '11:30',
        scheduledDate: tournament.date,
        status: 'UPCOMING',
        pair1: PLACEHOLDER_PAIRS.FINAL_PAIR1,
        pair2: PLACEHOLDER_PAIRS.FINAL_PAIR2,
        sets: [
          { setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false },
          { setNumber: 2, pair1Score: 0, pair2Score: 0, isFinished: false },
          { setNumber: 3, pair1Score: 0, pair2Score: 0, isFinished: false },
        ],
        format: 'BEST_OF_3_15',
      });
    }

    setMatches(newMatches);
    syncToCloud(tournament, pairs, newMatches, players);
  };

  const updateMatch = (matchId: string, updated: Partial<Match>) => {
    setMatches(prev => {
      const next = prev.map(m => (m.id === matchId ? { ...m, ...updated } : m));
      const synced = syncKnockoutProgression(next, pairs);
      syncToCloud(tournament, pairs, synced, players);
      return synced;
    });
  };

  const saveMatchScore = (
    matchId: string,
    sets: { setNumber: number; pair1Score: number; pair2Score: number; isFinished: boolean }[],
    winnerId: string,
    status: 'FINISHED' | 'LIVE' | 'UPCOMING' = 'FINISHED'
  ) => {
    setMatches(prev => {
      const next = prev.map(m => {
        if (m.id !== matchId) return m;
        return {
          ...m,
          sets,
          winnerId,
          status,
        };
      });
      const synced = syncKnockoutProgression(next, pairs);
      syncToCloud(tournament, pairs, synced, players);
      return synced;
    });
  };

  const resetMatch = (matchId: string) => {
    setMatches(prev => {
      const next = prev.map(m => {
        if (m.id !== matchId) return m;
        const freshSets = m.sets.map(s => ({
          ...s,
          pair1Score: 0,
          pair2Score: 0,
          isFinished: false,
        }));
        return {
          ...m,
          sets: freshSets,
          winnerId: undefined,
          status: 'UPCOMING' as MatchStatus,
        };
      });
      const synced = syncKnockoutProgression(next, pairs);
      syncToCloud(tournament, pairs, synced, players);
      return synced;
    });
  };

  const setMatchWalkover = (matchId: string, winnerId: string) => {
    setMatches(prev => {
      const next = prev.map(m => {
        if (m.id !== matchId) return m;
        const isPair1Winner = m.pair1?.id === winnerId;
        const sets = [
          {
            setNumber: 1,
            pair1Score: isPair1Winner ? 21 : 0,
            pair2Score: isPair1Winner ? 0 : 21,
            isFinished: true,
          },
        ];
        return {
          ...m,
          sets,
          winnerId,
          status: 'FINISHED' as MatchStatus,
          notes: 'Thắng do đối thủ bỏ cuộc (Walkover 0-21)',
        };
      });
      const synced = syncKnockoutProgression(next, pairs);
      syncToCloud(tournament, pairs, synced, players);
      return synced;
    });
  };

  const resetAllToDefault = () => {
    const resetTour: TournamentInfo = {
      ...defaultTournamentInfo,
      status: 'IN_PROGRESS',
      isGroupAPublished: false,
      isGroupBPublished: false,
      isScheduleAPublished: false,
      isScheduleBPublished: false,
      isScheduleKnockoutPublished: false,
    };
    setTournament(resetTour);
    setPairs(defaultInitialPairs);
    setMatches(defaultInitialMatches);
    setPlayers(defaultInitialPlayers);
    syncToCloud(resetTour, defaultInitialPairs, defaultInitialMatches, defaultInitialPlayers);
  };

  const clearAllData = () => {
    const freshTour: TournamentInfo = {
      ...defaultTournamentInfo,
      status: 'UPCOMING',
      isGroupAPublished: false,
      isGroupBPublished: false,
      isScheduleAPublished: false,
      isScheduleBPublished: false,
      isScheduleKnockoutPublished: false,
    };
    setTournament(freshTour);
    setPairs([]);
    setMatches([]);
    setPlayers([]);
    syncToCloud(freshTour, [], [], []);
  };

  const clearAllPlayers = () => {
    setPlayers([]);
    syncToCloud(tournament, pairs, matches, []);
  };

  const loadDemoData = () => {
    resetAllToDefault();
  };

  return (
    <TournamentContext.Provider
      value={{
        isAdminAuthenticated,
        login,
        logout,
        viewMode,
        setViewMode,
        cloudSyncStatus,
        isRealtimeConnected,
        lastSyncedAt,
        forceCloudSync,
        tournament,
        pairs,
        matches,
        players,
        standingsA,
        standingsB,
        updateTournamentInfo,
        updateRules,
        updatePrizes,
        updateSupplementaryRegulations,
        addPlayer,
        updatePlayer,
        deletePlayer,
        importPlayers,
        addPair,
        updatePair,
        deletePair,
        assignPairGroup,
        randomizeGroups,
        importPairsList,
        togglePublishGroup,
        togglePublishSchedule,
        createManualMatch,
        importCustomGroupSchedule,
        reorderGroupMatches,
        deleteGroupMatches,
        generateRoundRobinMatches,
        updateMatch,
        saveMatchScore,
        resetMatch,
        setMatchWalkover,
        setTournamentStatus,
        resetAllToDefault,
        clearAllData,
        clearAllPlayers,
        loadDemoData,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const ctx = useContext(TournamentContext);
  if (!ctx) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return ctx;
};
