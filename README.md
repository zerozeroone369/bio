# Bio Link - Giao diện Giới thiệu Bản thân với Video nền từ Máy tính

Ứng dụng web tạo trang giới thiệu bản thân (Bio Link) hiện đại, tương thích hoàn toàn với các bước trong ảnh mẫu và bổ sung tính năng **tải video từ máy tính làm hình nền động cho Bio**.

## Tính Năng Chính
- **Tải Video Từ Máy Tính Làm Nền Bio**: Chọn bất kỳ tệp video `.mp4`, `.webm`, `.mov` nào trên máy tính của bạn. Video sẽ tự động lặp lại, có tùy chọn bật/tắt tiếng, chỉnh lớp phủ tối (Dark overlay) và độ mờ (Blur).
- **Bộ Sưu Tập Chủ Đề Đa Dạng**: Bao gồm hiệu ứng mưa rơi động ("Đêm mưa · Trực tiếp"), tuyết rơi ("Mùa đông · Trực tiếp"), Giáng sinh, Cacbon, Kiêu hãnh, Cyber Glitch, Glassy và các video mẫu vũ trụ / neon.
- **7 Bước Chuẩn Ảnh Mẫu**:
  1. Bạn biết đến Bio Link bằng cách nào?
  2. Bạn đang sử dụng những nền tảng nào?
  3. Tải ảnh đại diện của bạn lên (kèm ảnh mẫu anime tarot)
  4. Thêm thông tin hồ sơ của bạn (Tên, Bio 0/255)
  5. Bắt đầu bằng một liên kết (Fb, Instagram, TikTok, YouTube, v.v.)
  6. Chọn chủ đề & Tải video nền từ máy
  7. Trông tuyệt vời! (Khung điện thoại iPhone xem trước & Chế độ Bio toàn màn hình)
- **Tích Hợp Chia Sẻ & Mã QR**: Tự động tạo mã QR để người khác quét bằng camera điện thoại.

## Cách Chạy
Mở terminal tại thư mục này và gõ:
```bash
npm run dev
# hoặc
node server.js
```
Truy cập trình duyệt tại: **http://localhost:3000** (hoặc port bạn cấu hình)

## Quy Trình Phát Hành Bản Nâng Cấp Mới (In-App Auto Update)
Khi bạn có tính năng mới và muốn mọi máy đang cài app nhận được bản cập nhật:
```powershell
# Chạy kịch bản tự động cập nhật version và phát hành APK:
.\publish_update.ps1 -Version "1.0.2" -Changelog @("Bổ sung tính năng mới", "Tối ưu hóa tốc độ tải")
```
*Tất cả thiết bị Android đang sử dụng app cũ sẽ nhận được thông báo nâng cấp và tự tải, cài đè ngay lập tức mà vẫn giữ nguyên tài khoản và dữ liệu đã lưu.*
