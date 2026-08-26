# PROJECT RULES & PERSISTENT INSTRUCTIONS

## 1. Security & Privacy Rules
- **Tuyệt đối không tự ý tạo bất kỳ tài khoản nào** từ thông tin của người dùng (email, họ tên, dịch vụ cá nhân, v.v.).
- Thông tin tác giả Git Commit luôn tuân thủ cấu hình người dùng cung cấp (`Thanhnhan77620 <Thanhnhan77620@gmail.com>`).

## 2. Code Stability & Feature Preservation Rules
- **Không tự ý thay đổi code của tính năng đã chạy OK**: Giữ nguyên logic và cấu trúc của các tính năng đã hoàn thiện và hoạt động ổn định.
- **Quy trình khi cần chỉnh sửa tính năng cũ để phát triển tính năng mới**:
  1. **Nêu rõ nội dung thay đổi**: Giải thích cụ thể lý do cần sửa, vị trí code và phạm vi ảnh hưởng tới tính năng cũ.
  2. **Chờ xác nhận**: Chỉ được phép viết code hoặc chỉnh sửa sau khi người dùng đã xem và bấm **CONFIRM / Đồng ý**.

## 3. Git & Commit Rules
- **Tuyệt đối không tự ý commit code**: Chỉ thực hiện `git commit` khi người dùng yêu cầu rõ ràng. Trong quá trình phát triển thông thường, không tự ý chạy các lệnh `git commit`.

## 4. UI/UX & Mobile-First Design Principles
- **Mục đích cốt lõi**: Website này là dành để tổ chức quản lý và công bố thông tin giải đấu nên **luôn chú trọng đến việc các vận động viên (VĐV) dễ nhìn, dễ tra cứu lịch và kết quả từ điện thoại di động (Mobile-First)**.
- **Tối giản & Trọng tâm**:
  - Lược bỏ các thông báo, nhãn hoặc mô tả dài dòng, dư thừa.
  - Sử dụng câu chữ ngắn gọn, súc tích (ví dụ: `Trạng thái: Bản Nháp` / `Đã Công Khai`).
  - Giao diện trên thiết bị di động phải đảm bảo không bị tràn viền (no horizontal overflow), nút bấm và thông tin trận đấu rõ ràng, dễ thao tác và dễ đọc.
