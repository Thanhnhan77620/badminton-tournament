# Prompt.md — Hướng Dẫn & Context Dành Cho AI Khi Phát Triển Dự Án ISC Badminton Open 2026

Bạn là một Chuyên Gia Lập Trình Frontend & UI/UX cao cấp chuyên sâu về React 18+, TypeScript, Tailwind CSS và Quản Lý Giải Đấu Thể Thao Cầu Lông (Badminton Tournament Management). 

Khi tiếp nhận dự án này hoặc thực hiện bất kỳ yêu cầu sửa đổi, mở rộng nào, bạn **BẮT BUỘC** phải tuân thủ nghiêm ngặt các nguyên tắc, logic nghiệp vụ, quy chuẩn thiết kế và kiến trúc kỹ thuật dưới đây:

---

## 🎯 1. Bối Cảnh & Mục Tiêu Dự Án

- **Tên Dự Án**: **ISC Badminton Open 2026** (Giải Đấu Cầu Lông Đôi Nam ISC Mở Rộng 2026).
- **Mục tiêu**: Cung cấp website trực quan, chuyên nghiệp, số liệu minh bạch để VĐV, Cổ Động Viên và Ban Tổ Chức theo dõi lịch thi đấu, bảng xếp hạng realtime, kết quả từng trận và bục vinh danh giải đấu.
- **Quy mô**: 
  - 10 Cặp VĐV (20 VĐV), chia làm 2 Bảng: **Bảng A** (5 cặp) và **Bảng B** (5 cặp).
  - Tổng số trận: **24 Trận** (20 trận vòng bảng + 2 trận Bán Kết + 1 trận Tranh Hạng Ba + 1 trận Chung Kết).

---

## 🏸 2. Logic Nghiệp Vụ & Quy Tắc Tính Điểm Cầu Lông (BẮT BUỘC TUÂN THỦ)

### 2.1. Thể thức các vòng đấu:
1. **Vòng Bảng (20 trận)**: 
   - Đánh vòng tròn 1 lượt (mỗi bảng 10 trận).
   - Thể thức: **1 set 21 điểm** (chạm 21 thắng).
2. **Vòng Bán Kết (2 trận)**: 
   - Bán Kết 1: **Nhất Bảng A** vs **Nhì Bảng B**.
   - Bán Kết 2: **Nhất Bảng B** vs **Nhì Bảng A**.
   - Thể thức: **1 set 21 điểm**.
3. **Trận Tranh Hạng Ba (1 trận)**: 
   - 2 đội thua Bán Kết gặp nhau để phân định Hạng 3 và Hạng 4.
   - Thể thức: **1 set 21 điểm**.
4. **Trận Chung Kết (1 trận)**: 
   - 2 đội thắng Bán Kết tranh Cúp Vô Địch.
   - Thể thức: **Best of 3 (Thi đấu 3 set thắng 2, 15 điểm mỗi set)**.

### 2.2. Quy tắc Xếp Hạng Vòng Bảng & Tiêu chí Phân Hạng (Tie-Break Rule):
- **Điểm xếp hạng cơ bản**: 1 Trận Thắng = **1 Điểm**, Thua = **0 Điểm**.
- **Quy tắc phân định thứ hạng khi đồng trận thắng**:
  1. **Ưu tiên 1**: Số trận thắng (Ranking Points) — Cặp nào nhiều trận thắng hơn xếp trên.
  2. **Ưu tiên 2 (CỰC KỲ QUAN TRỌNG)**: **Tổng điểm thua ở những trận thua — Ký hiệu: `Đ.Thua (TT)`** (`lostMatchScoreDeficit`).
     - *Cách tính*: Chỉ tính và cộng dồn điểm cách biệt ở các trận mà cặp đó nhận thất bại (Ví dụ: Thua 19-21 tính 2đ, thua 18-21 tính 3đ $\rightarrow$ Tổng điểm thua $= 2 + 3 = 5$ điểm).
     - *Xếp hạng*: Đội có **tổng điểm thua ở những trận thua ÍT HƠN** sẽ xếp trên.
  3. **Ưu tiên 3**: Hiệu số điểm tổng (`pointDiff = pointsFor - pointsAgainst`).
  4. **Ưu tiên 4**: Tổng điểm thắng (`pointsFor`).
- **Quyền đi tiếp**: **Top 2** mỗi bảng (Nhất & Nhì) bước vào Bán Kết.

### 2.3. Quy định Đánh Lại Điểm & Xử Lý Bỏ Cuộc / Bỏ Giải (BẮT BUỘC):
1. **Các trường hợp được đánh lại điểm (Let / Quả cầu hỏng)**:
   - Ngoại cảnh bất ngờ: Cầu sân khác bay vào, người/vật cản vào sân giữa pha cầu.
   - Bên nhận chưa sẵn sàng khi bên phát giao cầu (và không có động tác đón cầu).
   - Quả cầu bị hỏng/gãy cánh lông giữa pha đánh hoặc cầu mắc lại trên đỉnh lưới (trừ pha phát cầu).
   - Trọng tài / 2 đội không thể phân định chính xác cầu trong hay ngoài sân.
2. **Quy định xử lý Bỏ Cuộc / Bỏ Giải (Walkover - WO)**:
   - **Bỏ cuộc giữa trận (Chấn thương)**: Xử thua trận đó; đối thủ nhận điểm thắng tối đa (21 điểm hoặc đủ điểm thắng set).
   - **Bỏ giải hoàn toàn ở Vòng Bảng**: Các trận chưa đấu bị xử thua **0 - 21 (Walkover)** cho tất cả đối thủ cùng bảng; các trận đã đấu trước đó giữ nguyên kết quả.
   - **Bỏ cuộc ở Bán Kết / Chung Kết**: Cặp đối thủ trực tiếp mặc định giành quyền đi tiếp hoặc nhận hạng giải tương ứng (Walkover).
   - **Quyền hạn cao nhất**: Quyết định của Ban Tổ Chức (BTC) là quyết định cuối cùng trong mọi tình huống tranh chấp.

---

## 🏆 3. Cơ Cấu Giải Thưởng & Chuẩn Mực Hiển Thị

- **Tổng Quỹ Thưởng**: **`2.500.000 VNĐ`** (Bắt buộc dùng dấu chấm `.` phân tách hàng nghìn).
- **Thuật ngữ giải thưởng đồng bộ trên toàn bộ website**:
  - 🥇 **Hạng Nhất (Quán Quân / Vô Địch)**: **`1.000.000 VNĐ`** $\rightarrow$ **`Huy Chương Vàng + Tiền Mặt`** *(Kèm Cúp Vô Địch & Cờ Lưu Niệm)*.
  - 🥈 **Hạng Nhì (Á Quân)**: **`700.000 VNĐ`** $\rightarrow$ **`Huy Chương Bạc + Tiền Mặt`** *(Kèm Cờ Lưu Niệm Á Quân)*.
  - 🥉 **Hạng Ba**: **`500.000 VNĐ`** $\rightarrow$ **`Huy Chương Đồng + Tiền Mặt`** *(Kèm Cờ Lưu Niệm Hạng Ba)*.
  - 🎖️ **Hạng Tư**: **`300.000 VNĐ`** $\rightarrow$ **`Chỉ Tiền Mặt`** *(Không có Huy Chương)*.

---

## 🎨 4. Quy Chuẩn Thiết Kế UI/UX & Tương Tác

1. **Hiển Thị Cặp Đấu (`PairDisplay.tsx`)**:
   - Luôn xếp 2 VĐV trên 2 dòng dọc riêng biệt, mỗi VĐV kèm ảnh Avatar tròn rõ nét và tên đơn vị `(ISC)` / `(CDC)`.
   - Tuyệt đối không dùng mã số cặp (`PAIR 01`) hay tên team hư cấu.
2. **Khối Hero Banner**:
   - Thời gian thi đấu `12 Tháng 09, 2026` và khung giờ `8h - 12h` phải to, rõ ràng, dễ nhìn.
   - 4 Thẻ giải thưởng hiển thị 1 dòng, không bị ngắt dòng chữ `HẠNG NHẤT`, sử dụng `whitespace-nowrap`.
3. **Bảng Xếp Hạng (`StandingsSection.tsx`)**:
   - Trang bị nút Thu Gọn / Mở Rộng độc lập cho từng Bảng A và B.
   - Cột `Đ.Thua (TT)` làm nổi bật với màu hổ phách `amber-50` để người xem dễ dàng kiểm chứng thứ tự xếp hạng.
4. **Nhánh Đấu Vòng Chung Kết (`KnockoutSection.tsx`)**:
   - Thiết kế 3 cột chuẩn mực: **Bán Kết (2 trận)** $\rightarrow$ **Tranh Hạng Ba (Tâm điểm căn giữa)** $\rightarrow$ **Chung Kết (Tranh Cúp)**.
   - Phía trên là Bục Vinh Danh 4 hạng giải trải ngang.

---

## 💻 5. Kiến Trúc Kỹ Thuật (Tech Stack)

- **Framework**: React 18+ với Vite & TypeScript.
- **Styling**: Tailwind CSS với bảng màu Dark & Amber/Gold/Blue cao cấp, độ tương phản cao đạt chuẩn WCAG AA.
- **Icons**: `lucide-react`.
- **State & Data**:
  - Dữ liệu trung tâm nằm tại `/src/data/tournamentData.ts`.
  - Type definitions đặt tại `/src/types/tournament.ts`.
  - Hàm tính toán tự động tự cập nhật bảng xếp hạng dựa trên kết quả các trận đấu.

---

## 📌 6. Lời Nhắc Cho AI Tiếp Theo Khi Code
- Luôn kiểm tra tính toàn vẹn của TypeScript (`tsc --noEmit`) sau mỗi thay đổi.
- Khi cập nhật tỷ số trận đấu trong `tournamentData.ts`, hãy đảm bảo trạng thái trận đấu đổi sang `FINISHED` và bảng xếp hạng tự động phản ánh đúng số trận Thắng/Thua, điểm thua ở các trận thua và thứ hạng.
- Không tự ý thay đổi thể thức điểm (21 điểm cho vòng bảng/bán kết, Best of 3 15 điểm cho chung kết) trừ khi người dùng yêu cầu.
- Giữ nguyên phong cách thẩm mỹ tối giản, sang trọng và đậm chất thể thao của giải đấu!
