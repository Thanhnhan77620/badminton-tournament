export type TournamentStatus = 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';

export type MatchStatus = 'UPCOMING' | 'LIVE' | 'FINISHED';

export type MatchRound = 'GROUP_STAGE' | 'SEMI_FINAL' | 'THIRD_PLACE' | 'FINAL';

export type ScoringFormat = 'ONE_SET_21' | 'BEST_OF_3_15';

export interface Player {
  id: string;
  name: string;
  avatarUrl?: string;
  role?: string;
  club?: string;
}

export interface Pair {
  id: string;
  pairNumber: number;
  code: string; // e.g. "PAIR 01"
  name: string; // e.g. "Nguyễn Văn A & Trần Văn B"
  player1: Player;
  player2: Player;
  club: string;
  group: 'A' | 'B';
  seed?: number;
}

export interface MatchSet {
  setNumber: number;
  pair1Score: number;
  pair2Score: number;
  isFinished: boolean;
}

export interface Match {
  id: string;
  matchNumber: number;
  round: MatchRound;
  roundLabel: string;
  group?: 'A' | 'B';
  court: string;
  scheduledTime: string;
  scheduledDate: string;
  status: MatchStatus;
  pair1: Pair;
  pair2: Pair;
  sets: MatchSet[];
  winnerId?: string;
  currentSet?: number;
  currentServingPairId?: string;
  format: ScoringFormat;
  durationMinutes?: number;
  notes?: string;
  pair1IsManual?: boolean;
  pair2IsManual?: boolean;
}

export interface Standing {
  rank: number;
  pair: Pair;
  played: number;
  won: number;
  lost: number;
  pointsFor: number;
  pointsAgainst: number;
  pointDiff: number;
  lostMatchScoreDeficit: number; // Tổng số điểm bị thua cách biệt trong các trận thua (ví dụ: thua 17-21 là thua 4 điểm, thua 19-21 là thua 2 điểm -> đội thua 2 điểm xếp trên)
  lostMatchPointsScored: number; // Tổng số điểm ghi được trong các trận thua (ví dụ: 19 điểm > 17 điểm)
  lostMatchPointsAgainst: number; // Tổng số điểm thua trong các trận bị thua
  rankingPoints: number; // Thắng 1 trận = 1 điểm
  isQualified: boolean;
  form: ('W' | 'L' | 'LIVE')[];
}

export interface Prize {
  rank: number;
  title: string;
  titleEn: string;
  amount: number;
  currency: string;
  medalType: 'gold' | 'silver' | 'bronze' | 'fourth';
}

export interface TournamentRuleItem {
  stage: string;
  formatDescription: string;
  scoringRules: string[];
  advancement: string;
}

export interface RegulationItem {
  id?: string;
  label?: string; // "1", "2", "3", "4" or "A", "B", "C", "D"
  title: string; // e.g. "Ngoại cảnh can thiệp bất ngờ:"
  description: string; // e.g. "Có cầu từ sân khác bay vào..."
}

export interface SupplementaryRegulation {
  id: string; // 'let_rule' | 'walkover_rule'
  title: string;
  subtitle: string;
  items: RegulationItem[];
  noteTitle?: string;
  noteContent?: string;
}

export interface TournamentInfo {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  categoryEn: string;
  date: string;
  rawDate: string;
  timeRange: string;
  venueName: string;
  venueAddress: string;
  venueMapUrl?: string;
  totalPairs: number;
  groupsCount: number;
  status: TournamentStatus;
  prizes: Prize[];
  rules: TournamentRuleItem[];
  rulesVersion?: number;
  supplementaryRegulations?: SupplementaryRegulation[];
  // Publish status for Groups & Schedules (Draft vs Public)
  isGroupAPublished?: boolean;
  isGroupBPublished?: boolean;
  isScheduleAPublished?: boolean;
  isScheduleBPublished?: boolean;
  isScheduleKnockoutPublished?: boolean;
  isKnockoutSFPublished?: boolean;
  isKnockoutFinalPublished?: boolean;
}
