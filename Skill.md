# Skill.md — Badminton Tournament Application Specification

Tài liệu này ghi lại toàn bộ cấu trúc, logic nghiệp vụ, quy tắc tính điểm, kiến trúc UI/UX và danh mục component của ứng dụng **Quản Lý Giải Cầu Lông Đôi (Badminton Tournament Management)** để có thể tái tạo hoặc mở rộng chính xác theo yêu cầu.

---

## 1. Tổng Quan & Mục Tiêu Nghiệp Vụ

- **Tên Ứng Dụng**: ISC Badminton Open 2026 (Giải Đấu Cầu Lông Đôi Nam)
- **Hình thức thi đấu**: Đôi nam, 10 cặp đấu chia làm 2 bảng (Bảng A và Bảng B, mỗi bảng 5 cặp).
- **Trạng thái thực tế giải đấu**: Giải đấu gồm 24 trận đấu (20 trận vòng bảng + 2 trận Bán Kết + 1 trận Tranh Hạng Ba + 1 trận Chung Kết).
- **Mô hình cập nhật kết quả**: Kết quả các trận đấu được Ban Tổ Chức (BTC) cập nhật chính thức sau khi mỗi trận đấu kết thúc. Không sử dụng tính năng mô phỏng hay trạng thái LIVE ngẫu nhiên.
- **Tiến trình giải đấu**:
  1. **Vòng Bảng**: 20 trận (mỗi bảng 10 trận vòng tròn 1 lượt). Mỗi trận đấu 1 set 21 điểm (chạm 21 thắng).
  2. **Vòng Bán Kết**: Nhất Bảng A gặp Nhì Bảng B; Nhất Bảng B gặp Nhì Bảng A (1 set 21 điểm).
  3. **Tranh Hạng Ba**: 2 đội thua bán kết gặp nhau (1 set 21 điểm).
  4. **Chung Kết**: 2 đội thắng bán kết tranh cúp vô địch (Thi đấu 3 set thắng 2 - Best of 3, 15 điểm/set).

---

## 2. Quy Tắc Tính Điểm & Xếp Hạng Vòng Bảng

1. **Thắng 1 trận** = 1 điểm xếp hạng (Ranking Points).
2. **Thua 1 trận** = 0 điểm.
3. **Tiêu chí xếp hạng ưu tiên (Tie-breaker rules)**:
   - **Ưu tiên 1**: Số trận thắng (Ranking Points) — Cặp nào có nhiều trận thắng hơn xếp trên.
   - **Ưu tiên 2 (Khi đồng trận thắng)**: Xét **Tổng điểm thua ở những trận thua — Đ.Thua (TT)** (`lostMatchScoreDeficit`).
     - *Cách tính*: Chỉ cộng cách biệt điểm ở những trận nhận thất bại (Ví dụ: Thua 19-21 tính 2đ, thua 18-21 tính 3đ $\rightarrow$ Tổng điểm thua $= 2 + 3 = 5$ điểm). Đội không thua trận nào tính 0 điểm.
     - *Quy tắc xếp hạng*: Cặp nào có **tổng điểm thua ở những trận thua ít hơn** sẽ xếp trên (thể hiện sự bám đuổi quyết liệt và phòng ngự tốt hơn).
   - **Ưu tiên 3**: Hiệu số tổng điểm ghi được / điểm thua (`pointDiff = pointsFor - pointsAgainst`).
   - **Ưu tiên 4**: Tổng điểm ghi được (`pointsFor`).
4. **Top 2 mỗi bảng** giành quyền vào Vòng Bán Kết (A1, A2, B1, B2).

### 2.3. Quy Định Bổ Sung: Đánh Lại Điểm & Xử Lý Bỏ Cuộc / Bỏ Giải
1. **Các trường hợp được đánh lại điểm (Let / Quả cầu hỏng)**:
   - Có ngoại cảnh can thiệp bất ngờ (cầu sân khác bay sang, người/vật cản vào sân giữa pha cầu).
   - Bên nhận chưa sẵn sàng khi bên phát giao cầu (và không có động tác cố tình đón cầu).
   - Cầu bị hỏng/gãy cánh lông giữa pha đánh hoặc cầu mắc lại trên đỉnh lưới (trừ quả giao cầu chạm lưới).
   - Trọng tài/hai bên không thể xác định chính xác cầu trong hay ngoài sân.
2. **Quy định xử lý Bỏ Cuộc / Bỏ Giải (Walkover - WO)**:
   - **Bỏ cuộc giữa trận (Chấn thương)**: Xử thua trận đó; đối thủ nhận điểm thắng tối đa (21 điểm hoặc đủ điểm thắng set); bảo lưu điểm của cặp bỏ cuộc tại biên bản.
   - **Bỏ giải hoàn toàn ở Vòng Bảng**: Các trận chưa đấu bị xử thua **0 - 21 (Walkover)** cho tất cả đối thủ còn lại; các trận đã đấu trước đó giữ nguyên kết quả.
   - **Bỏ cuộc ở Bán Kết / Chung Kết**: Cặp đối thủ trực tiếp mặc định giành quyền đi tiếp hoặc nhận hạng giải tương ứng (Walkover).
   - **Quyền quyết định tối cao**: Quyết định của Ban Tổ Chức (BTC) là quyết định cuối cùng trong mọi tình huống tranh chấp.

---

## 3. Cơ Cấu Giải Thưởng & Quy Định Huy Chương

- **Tổng Quỹ Thưởng**: **2.500.000 VNĐ** (Quy chuẩn dùng dấu chấm `.` phân tách hàng nghìn).
- **Thuật ngữ giải thưởng đồng bộ**:
  1. 🥇 **Hạng Nhất**: **1.000.000 VNĐ** $\rightarrow$ `Huy Chương Vàng + Tiền Mặt` (Kèm Cúp Vô Địch & Cờ Lưu Niệm).
  2. 🥈 **Hạng Nhì**: **700.000 VNĐ** $\rightarrow$ `Huy Chương Bạc + Tiền Mặt` (Kèm Cờ Lưu Niệm Á Quân).
  3. 🥉 **Hạng Ba**: **500.000 VNĐ** $\rightarrow$ `Huy Chương Đồng + Tiền Mặt` (Kèm Cờ Lưu Niệm Hạng Ba).
  4. 🎖️ **Hạng Tư**: **300.000 VNĐ** $\rightarrow$ `Chỉ Tiền Mặt` (*Không có Huy Chương*).

---

## 4. Quy Chuẩn Thiết Kế UI/UX & Component Chuẩn Mực

### 4.1. Header (`TournamentHeader.tsx`)
- Logo cúp vàng + Tên giải đấu: `BADMINTON OPEN` / `ISC OPEN 2026`.
- Tinh gọn: Không hiển thị tag "2026" lặp lại bên cạnh logo, không có nút tắt giải thưởng góc phải.
- Điều hướng các Tab: `Tổng quan`, `Lịch thi đấu & Kết quả`, `Bảng đấu`, `Vòng Chung Kết`, `Thể thức`.

### 4.2. Hero Banner (`TournamentHero.tsx`)
- **Khối Thời Gian Thi Đấu**: Chữ to rõ ràng, nổi bật (`12 Tháng 09, 2026`, khung giờ `8h - 12h` màu xanh cyan/blue tương phản cao).
- **Khối Địa Điểm**: Sân Cầu Lông ECO Badminton Court kèm link mở trực tiếp Google Maps.
- **Thống số giải đấu**: 10 Cặp VĐV, 2 Bảng Đấu, 24 Trận Đấu, Giải thưởng 2.500.000 VNĐ.
- **Khối Cơ cấu giải thưởng chính thức**: 4 thẻ giải thưởng hiển thị 1 dòng cho mỗi hạng giải, không hiển thị hàng chữ phụ cờ/cúp thừa, tập trung vào số tiền và quyền lợi huy chương.

### 4.3. Hiển Thị Cặp VĐV (`PairDisplay.tsx`)
- Hiển thị 2 dòng xếp dọc rõ ràng:
  - Dòng 1: `[Avatar VĐV 1] Họ Và Tên VĐV 1 (Đơn vị)`
  - Dòng 2: `[Avatar VĐV 2] Họ Và Tên VĐV 2 (Đơn vị)`
- Tên hiển thị đầy đủ, font chữ rõ ràng, không bị cắt cụt.

### 4.4. Bảng Đấu & Bảng Xếp Hạng (`StandingsSection.tsx`)
- Nút **Thu Gọn / Mở Rộng** độc lập cho từng Bảng A và Bảng B.
- Bảng số liệu gồm các cột: `Hạng`, `Cặp Vận Động Viên`, `Số Trận (Đ)`, `Thắng (T)`, `Thua (B)`, `Đ.Thắng/Thua`, `Đ.Thua (TT)` (nổi bật màu hổ phách amber), `Điểm` (nổi bật màu xanh dương), `Trạng Thái` (Vào Bán Kết / Đã Thi Đấu Xong / Đang Thi Đấu).

### 4.5. Vòng Chung Kết & Nhánh Đấu (`KnockoutSection.tsx`)
- **Bảng Vàng Top 4 (Bục vinh danh)**:
  - 4 Cột hiển thị đồng hàng ngang: 🥇 Hạng Nhất (1.000.000 VNĐ), 🥈 Hạng Nhì (700.000 VNĐ), 🥉 Hạng Ba (500.000 VNĐ), 🎖️ Hạng Tư (300.000 VNĐ).
  - Sử dụng `whitespace-nowrap` để nhãn không bị xuống dòng.
- **Sơ Đồ Nhánh Đấu Trực Tiếp (3 Cột)**:
  - **Cột 1**: **VÒNG BÁN KẾT (1 SET 21)** (Bán kết 1: A1 vs B2; Bán kết 2: B1 vs A2).
  - **Cột 2**: **TRANH HẠNG BA (1 SET 21)** (Tâm điểm căn giữa trục dọc giữa 2 đội thua bán kết).
  - **Cột 3**: **TRẬN CHUNG KẾT (BEST OF 3 - 15 ĐIỂM/SET)** (Tranh Cúp Vô Địch).

---

## 5. Cấu Trúc File & Thư Mục

```
/src
├── types/
│   └── tournament.ts              # Interface TypeScript (Player, Pair, Match, Standing, Prize, etc.)
├── data/
│   └── tournamentData.ts          # Mock/Live data 10 cặp, 24 trận, bảng điểm chuẩn xác
├── components/
│   ├── common/
│   │   ├── PlayerAvatar.tsx       # Avatar tròn với fallback chữ cái đầu & ảnh thực tế
│   │   ├── PairDisplay.tsx        # Render 2 VĐV trên/dưới kèm avatar riêng và (Đơn vị)
│   │   ├── StatusBadge.tsx        # Badge trạng thái FINISHED, UPCOMING
│   │   ├── CountdownTimer.tsx     # Bộ đếm ngược realtime theo giờ trận đấu
│   │   ├── MatchCard.tsx          # Card trận đấu chuẩn Option A: VĐV, điểm số, nút chi tiết
│   │   └── MatchDetailModal.tsx   # Modal chi tiết từng set đấu và thông số trận
│   ├── TournamentHeader.tsx       # Thanh điều hướng Header cố định
│   ├── TournamentHero.tsx         # Hero banner, thời gian to rõ, cơ cấu giải thưởng
│   ├── TournamentSummary.tsx      # Tóm tắt thông số giải đấu
│   ├── StandingsSection.tsx       # Bảng xếp hạng 2 bảng A & B với cột Đ.Thua (TT)
│   ├── ScheduleSection.tsx        # Lịch thi đấu với bộ lọc vòng đấu, bảng A/B & trạng thái
│   ├── KnockoutSection.tsx        # Bục vinh danh Top 4 & Sơ đồ nhánh đấu 3 cột
│   ├── ParticipantsSection.tsx    # Danh sách chi tiết 10 cặp đấu
│   ├── PrizeSection.tsx           # Chi tiết cơ cấu giải thưởng
│   ├── RulesSection.tsx           # Quy định & điều lệ giải đấu
│   └── TournamentFooter.tsx       # Footer giải đấu
└── App.tsx                        # Ứng dụng chính điều phối các tab và modal
```
