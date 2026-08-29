import { TournamentInfo, Pair, Match, Standing, Player, SupplementaryRegulation, TournamentRuleItem } from '../types/tournament';

export const DEFAULT_SUPPLEMENTARY_REGULATIONS: SupplementaryRegulation[] = [
  {
    id: 'let_rule',
    title: 'Quy Định Đánh Lại Điểm (Quả Cầu Hỏng / "Let")',
    subtitle: 'Các trường hợp pha cầu bị hủy và tiến hành phát lại mà không tính điểm',
    items: [
      {
        id: 'let-1',
        label: '1',
        title: 'Ngoại cảnh can thiệp bất ngờ:',
        description: 'Có cầu từ sân khác bay vào khu vực thi đấu, hoặc có người/vật cản đột ngột di chuyển vào sân làm ảnh hưởng trực tiếp đến pha cầu đang diễn ra.'
      },
      {
        id: 'let-2',
        label: '2',
        title: 'Bên nhận chưa sẵn sàng:',
        description: 'Bên phát cầu thực hiện giao cầu khi bên nhận chưa có tư thế sẵn sàng (với điều kiện bên nhận không có hành động cố gắng đỡ cầu).'
      },
      {
        id: 'let-3',
        label: '3',
        title: 'Cầu hỏng hoặc mắc kẹt trên lưới:',
        description: 'Quả cầu bị gãy cánh lông/vỡ nát bất ngờ giữa pha đánh, hoặc cầu bị mắc lại trên đỉnh lưới (ngoại trừ trường hợp quả giao cầu chạm lưới).'
      },
      {
        id: 'let-4',
        label: '4',
        title: 'Tranh chấp không thể phân định:',
        description: 'Trọng tài hoặc 2 đội không thể xác định chính xác cầu trong hay ngoài sân và không đạt được sự đồng thuận sau khi trao đổi nhanh.'
      }
    ],
    noteTitle: '📌 Lưu ý:',
    noteContent: 'Khi có hiệu lệnh "Đánh lại", bên vừa phát cầu sẽ thực hiện lại quả giao cầu từ ô phát cầu tương ứng với điểm số hiện tại.'
  },
  {
    id: 'walkover_rule',
    title: 'Quy Định Bỏ Cuộc / Bỏ Giải (Walkover - WO)',
    subtitle: 'Biện pháp xử lý điểm số và thứ hạng khi có cặp VĐV không thể hoàn thành giải đấu',
    items: [
      {
        id: 'wo-1',
        label: 'A',
        title: 'Bỏ cuộc giữa trận (Dừng do chấn thương / sự cố):',
        description: 'Cặp đấu dừng trận bị xử thua. Cặp đối thủ được tính thắng với điểm tối đa của trận (21 điểm hoặc đủ điểm thắng set), giữ nguyên điểm số hiện có của cặp bỏ cuộc để ghi nhận biên bản.'
      },
      {
        id: 'wo-2',
        label: 'B',
        title: 'Bỏ giải hoàn toàn ở Vòng Bảng:',
        description: 'Nếu 1 cặp đôi rút lui hoàn toàn khỏi giải: BTC sẽ xử thua 0 - 21 (Walkover) ở tất cả các trận chưa thi đấu của cặp đó. Các trận đã diễn ra trước đó vẫn được bảo lưu kết quả bảng điểm.'
      },
      {
        id: 'wo-3',
        label: 'C',
        title: 'Bỏ cuộc tại Vòng Bán Kết / Chung Kết:',
        description: 'Cặp đối thủ trực tiếp được đặc cách thắng (Walkover) và vào thẳng vòng tiếp theo hoặc nhận hạng giải tương ứng (Quán Quân / Á Quân / Hạng Ba).'
      },
      {
        id: 'wo-4',
        label: 'D',
        title: 'Quyền hạn cao nhất của Ban Tổ Chức (BTC):',
        description: 'Trong các trường hợp phát sinh tranh chấp hoặc trường hợp bất khả kháng, quyết định của BTC là quyết định cuối cùng và có hiệu lực tuyệt đối.'
      }
    ],
    noteTitle: '⚖️ Quyết định:',
    noteContent: 'Mọi vận động viên tham gia cam kết tuân thủ tinh thần thể thao cao thượng, fair-play và tôn trọng quyết định điều hành giải đấu.'
  }
];

export const DEFAULT_RULES: TournamentRuleItem[] = [
  {
    stage: 'Vòng Bảng',
    formatDescription: `• **Thể thức thi đấu**: Chia làm 2 bảng (Bảng A & Bảng B), mỗi bảng gồm 5 cặp đôi thi đấu vòng tròn tính điểm 1 lượt (tổng cộng 10 trận/bảng).
• **Quy định set đấu**: Thi đấu **1 set 21 điểm** chạm 21 (đội nào đạt 21 điểm trước sẽ giành chiến thắng trong trận đấu đó).
• **Quy tắc xếp hạng & Tính điểm**:
  1) **Số trận thắng**: Mỗi trận thắng được tính **1 điểm**.
  2) **Nếu đồng số trận thắng**: Xét **hệ số điểm bị thua trên trận thua** (\`Đ.THUA TT\` - đội bị thua ít điểm hơn xếp trên. Ví dụ: Thua 19–21 [-2 điểm] xếp trên Thua 17–21 [-4 điểm]).
  3) **Điểm ghi được trong trận thua**: Đội ghi được nhiều điểm hơn trong các trận thua xếp trên.
  4) **Hiệu số điểm**: Toàn giải (Điểm thắng - Điểm thua).
  5) **Tổng điểm thắng**: Toàn giải.
  6) **Đối đầu trực tiếp**: Xét kết quả đối đầu nếu các chỉ số trên hoàn toàn bằng nhau.
• **Điều kiện đi tiếp**: **Top 2 cặp đấu** có thành tích tốt nhất mỗi bảng (Nhất Bảng & Nhì Bảng) giành quyền vào vòng Bán Kết.`,
    scoringRules: [
      'Thi đấu 1 set 21 điểm chạm 21 (không áp dụng cách biệt 2 điểm)',
      'Mỗi trận thắng được tính 1 điểm trên bảng xếp hạng',
      'Đồng điểm: Ưu tiên xét đội có hệ số điểm bị thua ít hơn ở các trận thua',
      'Top 2 cặp dẫn đầu mỗi bảng giành vé vào vòng Bán Kết'
    ],
    advancement: 'Top 2 mỗi bảng (Nhất & Nhì Bảng A, B) giành quyền bước vào vòng Bán Kết.',
  },
  {
    stage: 'Bán Kết',
    formatDescription: `• **Thể thức thi đấu**: Đấu loại trực tiếp (Knockout) theo sơ đồ phân nhánh bắt chéo:
  - **Bán Kết 1 (BK1)**: Nhất Bảng A gặp Nhì Bảng B
  - **Bán Kết 2 (BK2)**: Nhất Bảng B gặp Nhì Bảng A
• **Quy định set đấu**: Thi đấu **3 set thắng 2 (Best of 3)**, mỗi set đánh đến **15 điểm** (chạm 15 điểm trước là thắng set).
• **Phân nhánh kết quả sau trận**:
  - **2 cặp đôi giành chiến thắng**: Tiến thẳng vào trận **Chung Kết** tranh Cúp Vô Địch.
  - **2 cặp đôi dừng bước**: Bước vào trận **Tranh Hạng Ba**.`,
    scoringRules: [
      'Thi đấu 3 set thắng 2 (Best of 3), mỗi set 15 điểm chạm 15',
      'Sơ đồ bắt chéo: Nhất A vs Nhì B | Nhất B vs Nhì A',
      '2 cặp thắng vào Chung Kết, 2 cặp thua thi đấu Tranh Hạng Ba'
    ],
    advancement: '2 cặp thắng vào Chung Kết tranh Cúp Vô Địch, 2 cặp thua thi đấu Tranh Hạng Ba.',
  },
  {
    stage: 'Chung Kết & Tranh Hạng Ba',
    formatDescription: `• **Trận Tranh Hạng Ba**: 2 cặp thua ở vòng Bán Kết gặp nhau, thi đấu **1 set 21 điểm** (chạm 21) để xác định **Cặp Hạng Ba** (Huy chương Đồng) và **Cặp Hạng Tư**.
• **Trận Chung Kết Tranh Cúp**: 2 cặp thắng ở Bán Kết tranh tài, thi đấu **3 set thắng 2 (Best of 3 15 điểm)** xác định **Nhà Vô Địch** (Cúp + Huy chương Vàng) và **Á Quân** (Huy chương Bạc).
• **Lễ trao giải & Bế mạc**: Trao cúp lưu niệm, huy chương danh giá và tiền thưởng cho Top 4 cặp VĐV xuất sắc nhất giải đấu ngay sau khi trận Chung Kết kết thúc.`,
    scoringRules: [
      'Chung Kết: Thi đấu 3 set thắng 2 (Best of 3 15 điểm)',
      'Tranh Hạng Ba: Thi đấu 1 set 21 điểm chạm 21',
      'Trao Cúp, Huy chương & Tiền thưởng cho Top 4 chung cuộc'
    ],
    advancement: 'Xác định thứ hạng chung cuộc: Quán Quân (Vàng), Á Quân (Bạc), Hạng Ba (Đồng) và Hạng Tư.',
  },
];

export const tournamentInfo: TournamentInfo = {
  id: 'isc-open-2026',
  name: 'ISC BADMINTON OPEN 2026',
  subtitle: 'Giải Cầu Lông Đôi Nam ISC Mở Rộng 2026',
  category: 'Đôi Nam',
  categoryEn: "Men's Doubles",
  date: '12 Tháng 09, 2026',
  rawDate: '2026-09-12T08:00:00+07:00',
  timeRange: '8h - 12h',
  venueName: 'Sân Cầu Lông ECO Badminton Court',
  venueAddress: '128 Đường Số 8, Phường Bình An, TP. Thủ Đức, TP. Hồ Chí Minh',
  venueMapUrl: 'https://share.google/8v5rTSLdYcTDDtBeX',
  totalPairs: 10,
  groupsCount: 2,
  status: 'IN_PROGRESS', // Đang diễn ra ở vòng bảng
  isGroupAPublished: false,
  isGroupBPublished: false,
  isScheduleAPublished: false,
  isScheduleBPublished: false,
  isScheduleKnockoutPublished: false,
  supplementaryRegulations: DEFAULT_SUPPLEMENTARY_REGULATIONS,
  prizes: [
    {
      rank: 1,
      title: 'Vô Địch',
      titleEn: 'CHAMPION',
      amount: 1000000,
      currency: 'VND',
      medalType: 'gold',
    },
    {
      rank: 2,
      title: 'Á Quân',
      titleEn: 'RUNNER-UP',
      amount: 700000,
      currency: 'VND',
      medalType: 'silver',
    },
    {
      rank: 3,
      title: 'Hạng Ba',
      titleEn: 'THIRD PLACE',
      amount: 500000,
      currency: 'VND',
      medalType: 'bronze',
    },
    {
      rank: 4,
      title: 'Hạng Tư',
      titleEn: 'FOURTH PLACE',
      amount: 300000,
      currency: 'VND',
      medalType: 'fourth',
    },
  ],
  rules: DEFAULT_RULES,
};

export const PLACEHOLDER_PAIRS: Record<string, Pair> = {
  A1: {
    id: 'placeholder-a1',
    pairNumber: 0,
    code: 'A1',
    name: 'Nhất Bảng A',
    player1: { id: 'p-a1-1', name: 'Nhất Bảng A', club: 'Chờ vòng bảng', avatarUrl: '' },
    player2: { id: 'p-a1-2', name: 'Nhất Bảng A', club: 'Chờ vòng bảng', avatarUrl: '' },
    club: 'Chờ xác định',
    group: 'A',
  },
  A2: {
    id: 'placeholder-a2',
    pairNumber: 0,
    code: 'A2',
    name: 'Nhì Bảng A',
    player1: { id: 'p-a2-1', name: 'Nhì Bảng A', club: 'Chờ vòng bảng', avatarUrl: '' },
    player2: { id: 'p-a2-2', name: 'Nhì Bảng A', club: 'Chờ vòng bảng', avatarUrl: '' },
    club: 'Chờ xác định',
    group: 'A',
  },
  B1: {
    id: 'placeholder-b1',
    pairNumber: 0,
    code: 'B1',
    name: 'Nhất Bảng B',
    player1: { id: 'p-b1-1', name: 'Nhất Bảng B', club: 'Chờ vòng bảng', avatarUrl: '' },
    player2: { id: 'p-b1-2', name: 'Nhất Bảng B', club: 'Chờ vòng bảng', avatarUrl: '' },
    club: 'Chờ xác định',
    group: 'B',
  },
  B2: {
    id: 'placeholder-b2',
    pairNumber: 0,
    code: 'B2',
    name: 'Nhì Bảng B',
    player1: { id: 'p-b2-1', name: 'Nhì Bảng B', club: 'Chờ vòng bảng', avatarUrl: '' },
    player2: { id: 'p-b2-2', name: 'Nhì Bảng B', club: 'Chờ vòng bảng', avatarUrl: '' },
    club: 'Chờ xác định',
    group: 'B',
  },
  SF1_WINNER: {
    id: 'placeholder-sf1-w',
    pairNumber: 0,
    code: 'Thắng BK1',
    name: 'Thắng Bán Kết 1',
    player1: { id: 'p-sf1w-1', name: 'Thắng Bán Kết 1', club: 'Chờ Bán kết', avatarUrl: '' },
    player2: { id: 'p-sf1w-2', name: 'Thắng Bán Kết 1', club: 'Chờ Bán kết', avatarUrl: '' },
    club: 'Chờ xác định',
    group: 'A',
  },
  SF2_WINNER: {
    id: 'placeholder-sf2-w',
    pairNumber: 0,
    code: 'Thắng BK2',
    name: 'Thắng Bán Kết 2',
    player1: { id: 'p-sf2w-1', name: 'Thắng Bán Kết 2', club: 'Chờ Bán kết', avatarUrl: '' },
    player2: { id: 'p-sf2w-2', name: 'Thắng Bán Kết 2', club: 'Chờ Bán kết', avatarUrl: '' },
    club: 'Chờ xác định',
    group: 'B',
  },
  SF1_LOSER: {
    id: 'placeholder-sf1-l',
    pairNumber: 0,
    code: 'Thua BK1',
    name: 'Thua Bán Kết 1',
    player1: { id: 'p-sf1l-1', name: 'Thua Bán Kết 1', club: 'Chờ Bán kết', avatarUrl: '' },
    player2: { id: 'p-sf1l-2', name: 'Thua Bán Kết 1', club: 'Chờ Bán kết', avatarUrl: '' },
    club: 'Chờ xác định',
    group: 'A',
  },
  SF2_LOSER: {
    id: 'placeholder-sf2-l',
    pairNumber: 0,
    code: 'Thua BK2',
    name: 'Thua Bán Kết 2',
    player1: { id: 'p-sf2l-1', name: 'Thua Bán Kết 2', club: 'Chờ Bán kết', avatarUrl: '' },
    player2: { id: 'p-sf2l-2', name: 'Thua Bán Kết 2', club: 'Chờ Bán kết', avatarUrl: '' },
    club: 'Chờ xác định',
    group: 'B',
  },
};

// 21 Master Players (Vận Động Viên)
export const initialPlayers: Player[] = [
  { id: 'p-01', name: 'Hà Tuấn Kiệt', club: 'ISC', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { id: 'p-02', name: 'Huỳnh Hữu Khang', club: 'ISC', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80' },
  { id: 'p-03', name: 'Nguyễn Thanh Nhân', club: 'ISC', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { id: 'p-04', name: 'Võ Minh Tuấn', club: 'ISC', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' },
  { id: 'p-05', name: 'Phạm Đăng Khôi', club: 'CDC', avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' },
  { id: 'p-06', name: 'Trần Văn Bắc', club: 'ISC', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80' },
  { id: 'p-07', name: 'Hà Cát Thịnh', club: 'CDC', avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80' },
  { id: 'p-08', name: 'Lê Minh Quân', club: 'ISC', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
  { id: 'p-09', name: 'Trịnh Hùng Nam', club: 'ISC', avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80' },
  { id: 'p-10', name: 'Cao Trọng Phước', club: 'CDC', avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80' },
  { id: 'p-11', name: 'Mai Vũ Phong', club: 'CDC', avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80' },
  { id: 'p-12', name: 'Đinh Quốc Khánh Nguyên', club: 'ISC', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
  { id: 'p-13', name: 'Nguyễn Sỹ Thành', club: 'ISC', avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&auto=format&fit=crop&q=80' },
  { id: 'p-14', name: 'Nguyễn Hồng Đăng', club: 'ISC', avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80' },
  { id: 'p-15', name: 'Phạm Mạnh Hà', club: 'ISC', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80' },
  { id: 'p-16', name: 'Trần Văn Huấn', club: 'ISC', avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80' },
  { id: 'p-17', name: 'Trịnh Quốc Việt', club: 'ISC', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80' },
  { id: 'p-18', name: 'Bùi Ngọc Hoàng', club: 'ISC', avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80' },
  { id: 'p-19', name: 'Nguyễn Minh Trọng', club: 'ISC', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80' },
  { id: 'p-20', name: 'Nguyễn Thanh Đủ', club: 'ISC', avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80' },
  { id: 'p-21', name: 'Nguyễn Quốc Nghi', club: 'ISC', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
];

// Helper to look up player
const getPlayer = (id: string): Player => {
  const p = initialPlayers.find(item => item.id === id);
  if (!p) throw new Error(`Player ${id} not found`);
  return p;
};

// 10 Pairs (10 Cặp Đấu Chính Thức)
export const initialPairs: Pair[] = [
  // Group A
  {
    id: 'pair-01',
    pairNumber: 1,
    code: 'A1',
    name: 'Hà Tuấn Kiệt (ISC) & Huỳnh Hữu Khang (ISC)',
    player1: getPlayer('p-01'),
    player2: getPlayer('p-02'),
    club: 'ISC',
    group: 'A',
    seed: 1,
  },
  {
    id: 'pair-02',
    pairNumber: 2,
    code: 'A2',
    name: 'Nguyễn Thanh Nhân (ISC) & Võ Minh Tuấn (ISC)',
    player1: getPlayer('p-03'),
    player2: getPlayer('p-04'),
    club: 'ISC',
    group: 'A',
  },
  {
    id: 'pair-03',
    pairNumber: 3,
    code: 'A3',
    name: 'Phạm Đăng Khôi (CDC) & Trần Văn Bắc (ISC)',
    player1: getPlayer('p-05'),
    player2: getPlayer('p-06'),
    club: 'CDC - ISC',
    group: 'A',
  },
  {
    id: 'pair-04',
    pairNumber: 4,
    code: 'A4',
    name: 'Hà Cát Thịnh (CDC) & Lê Minh Quân (ISC)',
    player1: getPlayer('p-07'),
    player2: getPlayer('p-08'),
    club: 'CDC - ISC',
    group: 'A',
  },
  {
    id: 'pair-05',
    pairNumber: 5,
    code: 'A5',
    name: 'Trịnh Hùng Nam (ISC) & Cao Trọng Phước (CDC)',
    player1: getPlayer('p-09'),
    player2: getPlayer('p-10'),
    club: 'ISC - CDC',
    group: 'A',
  },

  // Group B
  {
    id: 'pair-06',
    pairNumber: 6,
    code: 'B1',
    name: 'Mai Vũ Phong (CDC) & Đinh Quốc Khánh Nguyên (ISC)',
    player1: getPlayer('p-11'),
    player2: getPlayer('p-12'),
    club: 'CDC - ISC',
    group: 'B',
    seed: 2,
  },
  {
    id: 'pair-07',
    pairNumber: 7,
    code: 'B2',
    name: 'Nguyễn Sỹ Thành (ISC) & Nguyễn Hồng Đăng (ISC)',
    player1: getPlayer('p-13'),
    player2: getPlayer('p-14'),
    club: 'ISC',
    group: 'B',
  },
  {
    id: 'pair-08',
    pairNumber: 8,
    code: 'B3',
    name: 'Phạm Mạnh Hà (ISC) & Trần Văn Huấn (ISC)',
    player1: getPlayer('p-15'),
    player2: getPlayer('p-16'),
    club: 'ISC',
    group: 'B',
  },
  {
    id: 'pair-09',
    pairNumber: 9,
    code: 'B4',
    name: 'Trịnh Quốc Việt (ISC) & Bùi Ngọc Hoàng (ISC)',
    player1: getPlayer('p-17'),
    player2: getPlayer('p-18'),
    club: 'ISC',
    group: 'B',
  },
  {
    id: 'pair-10',
    pairNumber: 10,
    code: 'B5',
    name: 'Nguyễn Minh Trọng (ISC) & Nguyễn Thanh Đủ (ISC)',
    player1: getPlayer('p-19'),
    player2: getPlayer('p-20'),
    club: 'ISC',
    group: 'B',
  },
];

// Helper to look up pair
const getPair = (id: string): Pair => {
  const p = initialPairs.find(item => item.id === id);
  if (!p) throw new Error(`Pair ${id} not found`);
  return p;
};

// Full Clean Matches List (24 Trận đấu sẵn sàng thi đấu)
export const initialMatches: Match[] = [
  // --- GROUP A MATCHES ---
  {
    id: 'm-01',
    matchNumber: 1,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng A',
    group: 'A',
    court: 'Sân 01',
    scheduledTime: '08:00',
    scheduledDate: '12/09/2026',
    status: 'UPCOMING',
    pair1: getPair('pair-01'), // A1
    pair2: getPair('pair-02'), // A2
    sets: [{ setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false }],
    format: 'ONE_SET_21',
  },
  {
    id: 'm-02',
    matchNumber: 2,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng A',
    group: 'A',
    court: 'Sân 02',
    scheduledTime: '08:00',
    scheduledDate: '12/09/2026',
    status: 'UPCOMING',
    pair1: getPair('pair-03'), // A3
    pair2: getPair('pair-04'), // A4
    sets: [{ setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false }],
    format: 'ONE_SET_21',
  },
  {
    id: 'm-03',
    matchNumber: 3,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng A',
    group: 'A',
    court: 'Sân 01',
    scheduledTime: '08:25',
    scheduledDate: '12/09/2026',
    status: 'UPCOMING',
    pair1: getPair('pair-05'), // A5
    pair2: getPair('pair-01'), // A1
    sets: [{ setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false }],
    format: 'ONE_SET_21',
  },
  {
    id: 'm-04',
    matchNumber: 4,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng A',
    group: 'A',
    court: 'Sân 02',
    scheduledTime: '08:25',
    scheduledDate: '12/09/2026',
    status: 'UPCOMING',
    pair1: getPair('pair-02'), // A2
    pair2: getPair('pair-03'), // A3
    sets: [{ setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false }],
    format: 'ONE_SET_21',
  },
  {
    id: 'm-05',
    matchNumber: 5,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng A',
    group: 'A',
    court: 'Sân 01',
    scheduledTime: '08:50',
    scheduledDate: '12/09/2026',
    status: 'UPCOMING',
    pair1: getPair('pair-04'), // A4
    pair2: getPair('pair-05'), // A5
    sets: [{ setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false }],
    format: 'ONE_SET_21',
  },
  {
    id: 'm-06',
    matchNumber: 6,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng A',
    group: 'A',
    court: 'Sân 02',
    scheduledTime: '08:50',
    scheduledDate: '12/09/2026',
    status: 'UPCOMING',
    pair1: getPair('pair-01'), // A1
    pair2: getPair('pair-03'), // A3
    sets: [{ setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false }],
    format: 'ONE_SET_21',
  },
  {
    id: 'm-07',
    matchNumber: 7,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng A',
    group: 'A',
    court: 'Sân 01',
    scheduledTime: '09:15',
    scheduledDate: '12/09/2026',
    status: 'UPCOMING',
    pair1: getPair('pair-02'), // A2
    pair2: getPair('pair-04'), // A4
    sets: [{ setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false }],
    format: 'ONE_SET_21',
  },
  {
    id: 'm-08',
    matchNumber: 8,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng A',
    group: 'A',
    court: 'Sân 02',
    scheduledTime: '09:15',
    scheduledDate: '12/09/2026',
    status: 'UPCOMING',
    pair1: getPair('pair-03'), // A3
    pair2: getPair('pair-05'), // A5
    sets: [{ setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false }],
    format: 'ONE_SET_21',
  },
  {
    id: 'm-09',
    matchNumber: 9,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng A',
    group: 'A',
    court: 'Sân 01',
    scheduledTime: '09:40',
    scheduledDate: '12/09/2026',
    status: 'UPCOMING',
    pair1: getPair('pair-01'), // A1
    pair2: getPair('pair-04'), // A4
    sets: [{ setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false }],
    format: 'ONE_SET_21',
  },
  {
    id: 'm-10',
    matchNumber: 10,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng A',
    group: 'A',
    court: 'Sân 02',
    scheduledTime: '09:40',
    scheduledDate: '12/09/2026',
    status: 'UPCOMING',
    pair1: getPair('pair-02'), // A2
    pair2: getPair('pair-05'), // A5
    sets: [{ setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false }],
    format: 'ONE_SET_21',
  },

  // --- GROUP B MATCHES ---
  {
    id: 'm-11',
    matchNumber: 11,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng B',
    group: 'B',
    court: 'Sân 01',
    scheduledTime: '08:00',
    scheduledDate: '12/09/2026',
    status: 'UPCOMING',
    pair1: getPair('pair-06'), // B1
    pair2: getPair('pair-07'), // B2
    sets: [{ setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false }],
    format: 'ONE_SET_21',
  },
  {
    id: 'm-12',
    matchNumber: 12,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng B',
    group: 'B',
    court: 'Sân 02',
    scheduledTime: '08:00',
    scheduledDate: '12/09/2026',
    status: 'UPCOMING',
    pair1: getPair('pair-08'), // B3
    pair2: getPair('pair-09'), // B4
    sets: [{ setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false }],
    format: 'ONE_SET_21',
  },
  {
    id: 'm-13',
    matchNumber: 13,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng B',
    group: 'B',
    court: 'Sân 01',
    scheduledTime: '08:25',
    scheduledDate: '12/09/2026',
    status: 'UPCOMING',
    pair1: getPair('pair-10'), // B5
    pair2: getPair('pair-06'), // B1
    sets: [{ setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false }],
    format: 'ONE_SET_21',
  },
  {
    id: 'm-14',
    matchNumber: 14,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng B',
    group: 'B',
    court: 'Sân 02',
    scheduledTime: '08:25',
    scheduledDate: '12/09/2026',
    status: 'UPCOMING',
    pair1: getPair('pair-07'), // B2
    pair2: getPair('pair-08'), // B3
    sets: [{ setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false }],
    format: 'ONE_SET_21',
  },
  {
    id: 'm-15',
    matchNumber: 15,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng B',
    group: 'B',
    court: 'Sân 01',
    scheduledTime: '08:50',
    scheduledDate: '12/09/2026',
    status: 'UPCOMING',
    pair1: getPair('pair-09'), // B4
    pair2: getPair('pair-10'), // B5
    sets: [{ setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false }],
    format: 'ONE_SET_21',
  },
  {
    id: 'm-16',
    matchNumber: 16,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng B',
    group: 'B',
    court: 'Sân 02',
    scheduledTime: '08:50',
    scheduledDate: '12/09/2026',
    status: 'UPCOMING',
    pair1: getPair('pair-06'), // B1
    pair2: getPair('pair-08'), // B3
    sets: [{ setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false }],
    format: 'ONE_SET_21',
  },
  {
    id: 'm-17',
    matchNumber: 17,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng B',
    group: 'B',
    court: 'Sân 01',
    scheduledTime: '09:15',
    scheduledDate: '12/09/2026',
    status: 'UPCOMING',
    pair1: getPair('pair-07'), // B2
    pair2: getPair('pair-09'), // B4
    sets: [{ setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false }],
    format: 'ONE_SET_21',
  },
  {
    id: 'm-18',
    matchNumber: 18,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng B',
    group: 'B',
    court: 'Sân 02',
    scheduledTime: '09:15',
    scheduledDate: '12/09/2026',
    status: 'UPCOMING',
    pair1: getPair('pair-08'), // B3
    pair2: getPair('pair-10'), // B5
    sets: [{ setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false }],
    format: 'ONE_SET_21',
  },
  {
    id: 'm-19',
    matchNumber: 19,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng B',
    group: 'B',
    court: 'Sân 01',
    scheduledTime: '09:40',
    scheduledDate: '12/09/2026',
    status: 'UPCOMING',
    pair1: getPair('pair-06'), // B1
    pair2: getPair('pair-09'), // B4
    sets: [{ setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false }],
    format: 'ONE_SET_21',
  },
  {
    id: 'm-20',
    matchNumber: 20,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng B',
    group: 'B',
    court: 'Sân 02',
    scheduledTime: '09:40',
    scheduledDate: '12/09/2026',
    status: 'UPCOMING',
    pair1: getPair('pair-07'), // B2
    pair2: getPair('pair-10'), // B5
    sets: [{ setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false }],
    format: 'ONE_SET_21',
  },

  // --- KNOCKOUT STAGE (SEMI-FINALS, 3RD PLACE & FINAL) ---
  {
    id: 'm-sf-1',
    matchNumber: 21,
    round: 'SEMI_FINAL',
    roundLabel: 'Bán Kết 1 (Nhất A vs Nhì B)',
    court: 'Sân 01',
    scheduledTime: '10:15',
    scheduledDate: '12/09/2026',
    status: 'UPCOMING',
    pair1: PLACEHOLDER_PAIRS.A1,
    pair2: PLACEHOLDER_PAIRS.B2,
    sets: [
      { setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false },
      { setNumber: 2, pair1Score: 0, pair2Score: 0, isFinished: false },
      { setNumber: 3, pair1Score: 0, pair2Score: 0, isFinished: false },
    ],
    format: 'BEST_OF_3_15',
  },
  {
    id: 'm-sf-2',
    matchNumber: 22,
    round: 'SEMI_FINAL',
    roundLabel: 'Bán Kết 2 (Nhất B vs Nhì A)',
    court: 'Sân 02',
    scheduledTime: '10:15',
    scheduledDate: '12/09/2026',
    status: 'UPCOMING',
    pair1: PLACEHOLDER_PAIRS.B1,
    pair2: PLACEHOLDER_PAIRS.A2,
    sets: [
      { setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false },
      { setNumber: 2, pair1Score: 0, pair2Score: 0, isFinished: false },
      { setNumber: 3, pair1Score: 0, pair2Score: 0, isFinished: false },
    ],
    format: 'BEST_OF_3_15',
  },
  {
    id: 'm-third',
    matchNumber: 23,
    round: 'THIRD_PLACE',
    roundLabel: 'Trận Tranh Hạng Ba',
    court: 'Sân 02',
    scheduledTime: '11:00',
    scheduledDate: '12/09/2026',
    status: 'UPCOMING',
    pair1: PLACEHOLDER_PAIRS.SF1_LOSER,
    pair2: PLACEHOLDER_PAIRS.SF2_LOSER,
    sets: [{ setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false }],
    format: 'ONE_SET_21',
    notes: 'Tranh giải Ba (500.000đ) và giải Tư (300.000đ).',
  },
  {
    id: 'm-final',
    matchNumber: 24,
    round: 'FINAL',
    roundLabel: 'CHUNG KẾT TRANH CÚP VÔ ĐỊCH',
    court: 'Sân 01 (Sân Trung Tâm)',
    scheduledTime: '11:30',
    scheduledDate: '12/09/2026',
    status: 'UPCOMING',
    pair1: PLACEHOLDER_PAIRS.SF1_WINNER,
    pair2: PLACEHOLDER_PAIRS.SF2_WINNER,
    sets: [
      { setNumber: 1, pair1Score: 0, pair2Score: 0, isFinished: false },
      { setNumber: 2, pair1Score: 0, pair2Score: 0, isFinished: false },
      { setNumber: 3, pair1Score: 0, pair2Score: 0, isFinished: false },
    ],
    format: 'BEST_OF_3_15',
    notes: 'Trận Siêu Chung Kết tranh Cúp Vô Địch 1.000.000đ & Huy chương vàng!',
  },
];

// Helper to compute dynamic standings from matches based on requested rule:
// 1. Thắng 1 trận = 1 điểm (rankingPoints = won)
// 2. Ưu tiên số trận thắng
// 3. Nếu đồng số trận thắng: xét hệ số điểm thua trên trận thua (đội ít điểm thua hơn xếp trên)
// Quy tắc tính điểm & xếp hạng vòng bảng:
// 1. Ưu tiên số trận thắng (1 trận thắng = 1 điểm, cao hơn xếp trên)
// 2. Đồng số trận thắng: Xét hệ số điểm bị thua trên trận thua (đội bị thua ít điểm hơn / ghi nhiều điểm hơn trong trận thua xếp trên. Ví dụ thua 19-21 [thua 2 điểm] xếp trên thua 17-21 [thua 4 điểm])
// 3. Hiệu số điểm thắng/thua toàn giải (lớn hơn xếp trên)
// 4. Tổng điểm thắng toàn giải (lớn hơn xếp trên)
// 5. Tổng điểm thua toàn giải (ít hơn xếp trên)
export function calculateStandings(group: 'A' | 'B', pairs: Pair[], matches: Match[]): Standing[] {
  const groupPairs = pairs.filter(p => p.group === group);
  const groupMatches = matches.filter(m => m.group === group && (m.status === 'FINISHED' || m.status === 'LIVE'));

  const statsMap = new Map<string, {
    played: number;
    won: number;
    lost: number;
    pointsFor: number;
    pointsAgainst: number;
    lostMatchScoreDeficit: number; // Tổng số điểm bị thua cách biệt trong các trận thua (ví dụ thua 19-21 là thua 2 điểm, thua 17-21 là thua 4 điểm)
    lostMatchPointsScored: number; // Tổng số điểm ghi được trong các trận thua (19 điểm > 17 điểm)
    lostMatchPointsAgainst: number; // Tổng số điểm đối phương ghi được trong các trận thua
    form: ('W' | 'L' | 'LIVE')[];
  }>();

  groupPairs.forEach(p => {
    statsMap.set(p.id, {
      played: 0,
      won: 0,
      lost: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      lostMatchScoreDeficit: 0,
      lostMatchPointsScored: 0,
      lostMatchPointsAgainst: 0,
      form: [],
    });
  });

  groupMatches.forEach(m => {
    const s1 = statsMap.get(m.pair1.id);
    const s2 = statsMap.get(m.pair2.id);
    if (!s1 || !s2) return;

    if (m.status === 'LIVE') {
      s1.form.push('LIVE');
      s2.form.push('LIVE');
      return;
    }

    if (m.status === 'FINISHED') {
      let p1Pts = 0;
      let p2Pts = 0;
      m.sets.forEach(set => {
        p1Pts += set.pair1Score;
        p2Pts += set.pair2Score;
      });

      s1.played += 1;
      s2.played += 1;
      s1.pointsFor += p1Pts;
      s1.pointsAgainst += p2Pts;
      s2.pointsFor += p2Pts;
      s2.pointsAgainst += p1Pts;

      if (m.winnerId === m.pair1.id) {
        s1.won += 1;
        s1.form.push('W');
        s2.lost += 1;
        s2.form.push('L');
        // pair2 bị thua trận này:
        // Điểm cách biệt bị thua = p1Pts - p2Pts (ví dụ: 21 - 17 = 4 hoặc 21 - 19 = 2)
        s2.lostMatchScoreDeficit += Math.max(0, p1Pts - p2Pts);
        s2.lostMatchPointsScored += p2Pts; // Ghi được 17 hoặc 19 điểm
        s2.lostMatchPointsAgainst += p1Pts; // Đối phương ghi 21 điểm
      } else if (m.winnerId === m.pair2.id) {
        s2.won += 1;
        s2.form.push('W');
        s1.lost += 1;
        s1.form.push('L');
        // pair1 bị thua trận này:
        s1.lostMatchScoreDeficit += Math.max(0, p2Pts - p1Pts);
        s1.lostMatchPointsScored += p1Pts;
        s1.lostMatchPointsAgainst += p2Pts;
      }
    }
  });

  const standingsList: Standing[] = groupPairs.map(pair => {
    const stats = statsMap.get(pair.id)!;
    // Thắng 1 trận = 1 điểm
    const rankingPoints = stats.won * 1;
    const pointDiff = stats.pointsFor - stats.pointsAgainst;

    return {
      rank: 0,
      pair,
      played: stats.played,
      won: stats.won,
      lost: stats.lost,
      pointsFor: stats.pointsFor,
      pointsAgainst: stats.pointsAgainst,
      pointDiff,
      lostMatchScoreDeficit: stats.lostMatchScoreDeficit,
      lostMatchPointsScored: stats.lostMatchPointsScored,
      lostMatchPointsAgainst: stats.lostMatchPointsAgainst,
      rankingPoints,
      isQualified: false,
      form: stats.form,
    };
  });

  // Sort criteria (Tuân thủ Điều lệ & Thể thức giải):
  // 1. Số trận thắng (1 trận = 1 điểm, nhiều hơn xếp trên)
  // 2. Xét hệ số điểm bị thua trên trận thua (đội thua ít điểm hơn xếp trên: lostMatchScoreDeficit nhỏ hơn xếp trên)
  // 3. Điểm ghi được trong trận thua (nhiều điểm hơn xếp trên)
  // 4. Hiệu số điểm thắng/thua toàn giải (lớn hơn xếp trên)
  // 5. Tổng điểm thắng toàn giải (lớn hơn xếp trên)
  // 6. Đối đầu trực tiếp (Head-to-head) nếu các chỉ số trên bằng nhau
  // 7. Tổng điểm thua toàn giải (ít hơn xếp trên)
  standingsList.sort((a, b) => {
    // 1. Điểm số trận thắng
    if (b.rankingPoints !== a.rankingPoints) {
      return b.rankingPoints - a.rankingPoints;
    }

    // 2. Đồng trận thắng: Xét hệ số điểm bị thua ở các trận thua (ít điểm thua hơn xếp trên)
    if (a.lostMatchScoreDeficit !== b.lostMatchScoreDeficit) {
      return a.lostMatchScoreDeficit - b.lostMatchScoreDeficit;
    }

    // 3. Điểm ghi được trong trận thua (cao hơn xếp trên)
    if (b.lostMatchPointsScored !== a.lostMatchPointsScored) {
      return b.lostMatchPointsScored - a.lostMatchPointsScored;
    }

    // 4. Hiệu số điểm toàn giải
    if (b.pointDiff !== a.pointDiff) {
      return b.pointDiff - a.pointDiff;
    }

    // 5. Tổng điểm thắng toàn giải
    if (b.pointsFor !== a.pointsFor) {
      return b.pointsFor - a.pointsFor;
    }

    // 6. Đối đầu trực tiếp (Head-to-Head) nếu các chỉ số điểm trên đều bằng nhau
    const h2hMatch = groupMatches.find(
      m =>
        m.status === 'FINISHED' &&
        ((m.pair1.id === a.pair.id && m.pair2.id === b.pair.id) ||
          (m.pair1.id === b.pair.id && m.pair2.id === a.pair.id))
    );
    if (h2hMatch && h2hMatch.winnerId) {
      if (h2hMatch.winnerId === a.pair.id) return -1;
      if (h2hMatch.winnerId === b.pair.id) return 1;
    }

    // 7. Tổng điểm thua toàn giải
    return a.pointsAgainst - b.pointsAgainst;
  });

  // Assign ranks & qualification (Top 2 qualify)
  return standingsList.map((standing, index) => ({
    ...standing,
    rank: index + 1,
    isQualified: index < 2,
  }));
}

// Dữ liệu giải đấu khi ĐÃ HOÀN TẤT TOÀN BỘ (dành cho chế độ xem toàn bộ kết quả & trao giải)
export const completedMatchesDemo: Match[] = [
  // Group A
  {
    id: 'm-01',
    matchNumber: 1,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng A',
    group: 'A',
    court: 'Sân 01',
    scheduledTime: '18:00',
    scheduledDate: '12/09/2026',
    status: 'FINISHED',
    pair1: getPair('pair-01'),
    pair2: getPair('pair-02'),
    sets: [{ setNumber: 1, pair1Score: 21, pair2Score: 16, isFinished: true }],
    winnerId: 'pair-01',
    format: 'ONE_SET_21',
    durationMinutes: 18,
  },
  {
    id: 'm-02',
    matchNumber: 2,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng A',
    group: 'A',
    court: 'Sân 02',
    scheduledTime: '18:00',
    scheduledDate: '12/09/2026',
    status: 'FINISHED',
    pair1: getPair('pair-03'),
    pair2: getPair('pair-04'),
    sets: [{ setNumber: 1, pair1Score: 21, pair2Score: 18, isFinished: true }],
    winnerId: 'pair-03',
    format: 'ONE_SET_21',
    durationMinutes: 20,
  },
  {
    id: 'm-03',
    matchNumber: 3,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng A',
    group: 'A',
    court: 'Sân 01',
    scheduledTime: '18:25',
    scheduledDate: '12/09/2026',
    status: 'FINISHED',
    pair1: getPair('pair-05'),
    pair2: getPair('pair-01'),
    sets: [{ setNumber: 1, pair1Score: 14, pair2Score: 21, isFinished: true }],
    winnerId: 'pair-01',
    format: 'ONE_SET_21',
    durationMinutes: 16,
  },
  {
    id: 'm-04',
    matchNumber: 4,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng A',
    group: 'A',
    court: 'Sân 02',
    scheduledTime: '18:25',
    scheduledDate: '12/09/2026',
    status: 'FINISHED',
    pair1: getPair('pair-02'),
    pair2: getPair('pair-03'),
    sets: [{ setNumber: 1, pair1Score: 21, pair2Score: 19, isFinished: true }],
    winnerId: 'pair-02',
    format: 'ONE_SET_21',
    durationMinutes: 22,
  },
  {
    id: 'm-05',
    matchNumber: 5,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng A',
    group: 'A',
    court: 'Sân 01',
    scheduledTime: '18:50',
    scheduledDate: '12/09/2026',
    status: 'FINISHED',
    pair1: getPair('pair-04'),
    pair2: getPair('pair-05'),
    sets: [{ setNumber: 1, pair1Score: 21, pair2Score: 17, isFinished: true }],
    winnerId: 'pair-04',
    format: 'ONE_SET_21',
    durationMinutes: 19,
  },
  {
    id: 'm-06',
    matchNumber: 6,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng A',
    group: 'A',
    court: 'Sân 02',
    scheduledTime: '18:50',
    scheduledDate: '12/09/2026',
    status: 'FINISHED',
    pair1: getPair('pair-01'),
    pair2: getPair('pair-03'),
    sets: [{ setNumber: 1, pair1Score: 21, pair2Score: 17, isFinished: true }],
    winnerId: 'pair-01',
    format: 'ONE_SET_21',
    durationMinutes: 21,
  },
  {
    id: 'm-07',
    matchNumber: 7,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng A',
    group: 'A',
    court: 'Sân 01',
    scheduledTime: '19:15',
    scheduledDate: '12/09/2026',
    status: 'FINISHED',
    pair1: getPair('pair-02'),
    pair2: getPair('pair-04'),
    sets: [{ setNumber: 1, pair1Score: 21, pair2Score: 15, isFinished: true }],
    winnerId: 'pair-02',
    format: 'ONE_SET_21',
    durationMinutes: 17,
  },
  {
    id: 'm-08',
    matchNumber: 8,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng A',
    group: 'A',
    court: 'Sân 02',
    scheduledTime: '19:15',
    scheduledDate: '12/09/2026',
    status: 'FINISHED',
    pair1: getPair('pair-03'),
    pair2: getPair('pair-05'),
    sets: [{ setNumber: 1, pair1Score: 21, pair2Score: 12, isFinished: true }],
    winnerId: 'pair-03',
    format: 'ONE_SET_21',
    durationMinutes: 15,
  },
  {
    id: 'm-09',
    matchNumber: 9,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng A',
    group: 'A',
    court: 'Sân 01',
    scheduledTime: '19:40',
    scheduledDate: '12/09/2026',
    status: 'FINISHED',
    pair1: getPair('pair-01'),
    pair2: getPair('pair-04'),
    sets: [{ setNumber: 1, pair1Score: 21, pair2Score: 13, isFinished: true }],
    winnerId: 'pair-01',
    format: 'ONE_SET_21',
    durationMinutes: 16,
  },
  {
    id: 'm-10',
    matchNumber: 10,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng A',
    group: 'A',
    court: 'Sân 02',
    scheduledTime: '19:40',
    scheduledDate: '12/09/2026',
    status: 'FINISHED',
    pair1: getPair('pair-02'),
    pair2: getPair('pair-05'),
    sets: [{ setNumber: 1, pair1Score: 21, pair2Score: 14, isFinished: true }],
    winnerId: 'pair-02',
    format: 'ONE_SET_21',
    durationMinutes: 18,
  },

  // Group B
  {
    id: 'm-11',
    matchNumber: 11,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng B',
    group: 'B',
    court: 'Sân 01',
    scheduledTime: '18:00',
    scheduledDate: '12/09/2026',
    status: 'FINISHED',
    pair1: getPair('pair-06'),
    pair2: getPair('pair-07'),
    sets: [{ setNumber: 1, pair1Score: 21, pair2Score: 19, isFinished: true }],
    winnerId: 'pair-06',
    format: 'ONE_SET_21',
    durationMinutes: 24,
  },
  {
    id: 'm-12',
    matchNumber: 12,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng B',
    group: 'B',
    court: 'Sân 02',
    scheduledTime: '18:00',
    scheduledDate: '12/09/2026',
    status: 'FINISHED',
    pair1: getPair('pair-08'),
    pair2: getPair('pair-09'),
    sets: [{ setNumber: 1, pair1Score: 21, pair2Score: 16, isFinished: true }],
    winnerId: 'pair-08',
    format: 'ONE_SET_21',
    durationMinutes: 18,
  },
  {
    id: 'm-13',
    matchNumber: 13,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng B',
    group: 'B',
    court: 'Sân 01',
    scheduledTime: '18:25',
    scheduledDate: '12/09/2026',
    status: 'FINISHED',
    pair1: getPair('pair-10'),
    pair2: getPair('pair-06'),
    sets: [{ setNumber: 1, pair1Score: 15, pair2Score: 21, isFinished: true }],
    winnerId: 'pair-06',
    format: 'ONE_SET_21',
    durationMinutes: 17,
  },
  {
    id: 'm-14',
    matchNumber: 14,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng B',
    group: 'B',
    court: 'Sân 02',
    scheduledTime: '18:25',
    scheduledDate: '12/09/2026',
    status: 'FINISHED',
    pair1: getPair('pair-07'),
    pair2: getPair('pair-08'),
    sets: [{ setNumber: 1, pair1Score: 21, pair2Score: 18, isFinished: true }],
    winnerId: 'pair-07',
    format: 'ONE_SET_21',
    durationMinutes: 23,
  },
  {
    id: 'm-15',
    matchNumber: 15,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng B',
    group: 'B',
    court: 'Sân 01',
    scheduledTime: '18:50',
    scheduledDate: '12/09/2026',
    status: 'FINISHED',
    pair1: getPair('pair-09'),
    pair2: getPair('pair-10'),
    sets: [{ setNumber: 1, pair1Score: 21, pair2Score: 19, isFinished: true }],
    winnerId: 'pair-09',
    format: 'ONE_SET_21',
    durationMinutes: 20,
  },
  {
    id: 'm-16',
    matchNumber: 16,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng B',
    group: 'B',
    court: 'Sân 02',
    scheduledTime: '18:50',
    scheduledDate: '12/09/2026',
    status: 'FINISHED',
    pair1: getPair('pair-06'),
    pair2: getPair('pair-08'),
    sets: [{ setNumber: 1, pair1Score: 21, pair2Score: 15, isFinished: true }],
    winnerId: 'pair-06',
    format: 'ONE_SET_21',
    durationMinutes: 19,
  },
  {
    id: 'm-17',
    matchNumber: 17,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng B',
    group: 'B',
    court: 'Sân 01',
    scheduledTime: '19:15',
    scheduledDate: '12/09/2026',
    status: 'FINISHED',
    pair1: getPair('pair-07'),
    pair2: getPair('pair-09'),
    sets: [{ setNumber: 1, pair1Score: 21, pair2Score: 14, isFinished: true }],
    winnerId: 'pair-07',
    format: 'ONE_SET_21',
    durationMinutes: 16,
  },
  {
    id: 'm-18',
    matchNumber: 18,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng B',
    group: 'B',
    court: 'Sân 02',
    scheduledTime: '19:15',
    scheduledDate: '12/09/2026',
    status: 'FINISHED',
    pair1: getPair('pair-08'),
    pair2: getPair('pair-10'),
    sets: [{ setNumber: 1, pair1Score: 21, pair2Score: 17, isFinished: true }],
    winnerId: 'pair-08',
    format: 'ONE_SET_21',
    durationMinutes: 18,
  },
  {
    id: 'm-19',
    matchNumber: 19,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng B',
    group: 'B',
    court: 'Sân 01',
    scheduledTime: '19:40',
    scheduledDate: '12/09/2026',
    status: 'FINISHED',
    pair1: getPair('pair-06'),
    pair2: getPair('pair-09'),
    sets: [{ setNumber: 1, pair1Score: 21, pair2Score: 13, isFinished: true }],
    winnerId: 'pair-06',
    format: 'ONE_SET_21',
    durationMinutes: 16,
  },
  {
    id: 'm-20',
    matchNumber: 20,
    round: 'GROUP_STAGE',
    roundLabel: 'Vòng bảng - Bảng B',
    group: 'B',
    court: 'Sân 02',
    scheduledTime: '19:40',
    scheduledDate: '12/09/2026',
    status: 'FINISHED',
    pair1: getPair('pair-07'),
    pair2: getPair('pair-10'),
    sets: [{ setNumber: 1, pair1Score: 21, pair2Score: 16, isFinished: true }],
    winnerId: 'pair-07',
    format: 'ONE_SET_21',
    durationMinutes: 18,
  },

  // Knockout
  {
    id: 'm-sf-1',
    matchNumber: 21,
    round: 'SEMI_FINAL',
    roundLabel: 'Bán Kết 1 (Nhất A vs Nhì B)',
    court: 'Sân 01',
    scheduledTime: '20:15',
    scheduledDate: '12/09/2026',
    status: 'FINISHED',
    pair1: getPair('pair-01'), // A1
    pair2: getPair('pair-07'), // B2
    sets: [
      { setNumber: 1, pair1Score: 15, pair2Score: 12, isFinished: true },
      { setNumber: 2, pair1Score: 15, pair2Score: 11, isFinished: true },
    ],
    winnerId: 'pair-01',
    format: 'BEST_OF_3_15',
    durationMinutes: 26,
  },
  {
    id: 'm-sf-2',
    matchNumber: 22,
    round: 'SEMI_FINAL',
    roundLabel: 'Bán Kết 2 (Nhất B vs Nhì A)',
    court: 'Sân 02',
    scheduledTime: '20:15',
    scheduledDate: '12/09/2026',
    status: 'FINISHED',
    pair1: getPair('pair-06'), // B1
    pair2: getPair('pair-02'), // A2
    sets: [
      { setNumber: 1, pair1Score: 15, pair2Score: 13, isFinished: true },
      { setNumber: 2, pair1Score: 12, pair2Score: 15, isFinished: true },
      { setNumber: 3, pair1Score: 15, pair2Score: 11, isFinished: true },
    ],
    winnerId: 'pair-06',
    format: 'BEST_OF_3_15',
    durationMinutes: 32,
  },
  {
    id: 'm-third',
    matchNumber: 23,
    round: 'THIRD_PLACE',
    roundLabel: 'Trận Tranh Hạng Ba',
    court: 'Sân 02',
    scheduledTime: '21:00',
    scheduledDate: '12/09/2026',
    status: 'FINISHED',
    pair1: getPair('pair-07'),
    pair2: getPair('pair-02'),
    sets: [{ setNumber: 1, pair1Score: 21, pair2Score: 17, isFinished: true }],
    winnerId: 'pair-07',
    format: 'ONE_SET_21',
    durationMinutes: 22,
  },
  {
    id: 'm-final',
    matchNumber: 24,
    round: 'FINAL',
    roundLabel: 'CHUNG KẾT TRANH CÚP VÔ ĐỊCH',
    court: 'Sân 01 (Sân Trung Tâm)',
    scheduledTime: '21:30',
    scheduledDate: '12/09/2026',
    status: 'FINISHED',
    pair1: getPair('pair-01'),
    pair2: getPair('pair-06'),
    sets: [
      { setNumber: 1, pair1Score: 15, pair2Score: 12, isFinished: true },
      { setNumber: 2, pair1Score: 11, pair2Score: 15, isFinished: true },
      { setNumber: 3, pair1Score: 15, pair2Score: 10, isFinished: true },
    ],
    winnerId: 'pair-01',
    format: 'BEST_OF_3_15',
    durationMinutes: 45,
  },
];
