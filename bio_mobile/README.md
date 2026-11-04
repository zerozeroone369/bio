# Bio Link Studio - Ứng Dụng Mobile Flutter Đa Nền Tảng

Ứng dụng Flutter di động cao cấp chuyển đổi từ giao diện Bio Link với 7 bước tùy biến hồ sơ, tải video nền từ máy tính/điện thoại, hiệu ứng mưa rơi động & tuyết rơi thời gian thực, tạo mã QR thông minh và tích hợp Backend Node.js + MongoDB.

---

## 📱 Cấu Trúc Giao Diện 4 Tab Dashboard + Live Preview
1. **Hồ sơ (Profile Tab)**:
   - Đổi họ tên hiển thị, tên người dùng (@username), tiểu sử Bio (0/255 ký tự).
   - Đổi ảnh đại diện avatar từ bộ sưu tập anime tarot hoặc ảnh từ máy.
2. **Liên kết (Links Tab)**:
   - Thêm, sửa, xóa các đường dẫn liên kết nổi bật (Portfolio, Behance, Shopee...).
   - Quản lý 4 mạng xã hội chính: Facebook, Instagram, TikTok, YouTube.
3. **Chủ đề & Video Nền (Themes Tab)**:
   - Chọn tệp video nền `.mp4`, `.webm`, `.mov` từ máy tính hoặc điện thoại.
   - Thanh trượt điều chỉnh: Lớp phủ tối (Dark Overlay %), Độ mờ hậu cảnh (Blur px), Bật/Tắt tiếng.
   - 7 Chủ đề sống động: Đêm Mưa · Trực Tiếp, Mùa Đông · Trực Tiếp, Giáng Sinh, Cyber Glitch, Cacbon, Glassmorphism, Video Tự Chọn.
4. **Mã QR & Chia Sẻ (QR Share Tab)**:
   - Tự động vẽ mã QR độ phân giải cao từ đường dẫn Bio cá nhân.
   - Tương thích camera quét mã trên iPhone và Android.
   - Sao chép đường link chỉ bằng 1 chạm.
5. **Xem Trước Trực Tiếp (Live Bio Preview)**:
   - Chế độ toàn màn hình xem trước như người xem thực tế.
   - Hiệu ứng hạt mưa rơi và hoa tuyết rơi tự vẽ bằng Flutter `CustomPainter` mượt mà 60 FPS.

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Khởi động Máy chủ Backend (Node.js & MongoDB)
Tại thư mục gốc `c:\Users\ADMIN\Downloads\bio`:
```bash
npm run dev
# Hoặc: node server.js
```
Máy chủ sẽ tự động kết nối MongoDB (nếu có daemon mongod) hoặc tự động kích hoạt cơ chế Local Document Database (`data/users.json`).

### 2. Cài đặt Dependencies cho Flutter
Mở terminal tại thư mục `bio_mobile`:
```bash
cd bio_mobile
flutter pub get
```

### 3. Chạy ứng dụng trên Thiết bị / Máy ảo
```bash
flutter run
```

### 4. Đóng gói file cài đặt APK (Android Release)
```bash
flutter build apk --release
```
File APK sẽ được tạo tại: `bio_mobile/build/app/outputs/flutter-apk/app-release.apk`.

---

## 🔄 Cơ Chế Tự Động Cập Nhật In-App (Không Qua CH Play)

Hệ thống được trang bị đầy đủ cơ chế **Self-Hosted In-App Auto Update**:
1. **Kiểm tra phiên bản tự động**: Mỗi khi mở ứng dụng, app gửi request tới endpoint `/api/app-version` trên máy chủ của bạn để so sánh phiên bản.
2. **Quyền Android tự cài đặt**: `AndroidManifest.xml` đã được cấu hình quyền `REQUEST_INSTALL_PACKAGES` và `FileProvider` an toàn.
3. **Ký duyệt Keystore cố định**: Keystore `bio_mobile/android/bio_release.keystore` và file `key.properties` đã được tạo sẵn để đảm bảo mọi lần build APK mới đều mang chữ ký số đồng nhất, giúp **cài đè trơn tru 100% không mất dữ liệu người dùng**.

### Cách Phát Hành Bản Cập Nhật Mới Chỉ Với 1 Lệnh:
Mỗi khi bạn nâng cấp tính năng mới và muốn tất cả người dùng nhận được thông báo cập nhật:
```powershell
# Chạy script tự động cập nhật version.json và publish APK:
.\publish_update.ps1 -Version "1.0.2" -Changelog @("Thêm tính năng mới...", "Tối ưu hiệu năng...")
```
Ngay lập tức, mọi máy đang cài app phiên bản cũ khi mở app sẽ xuất hiện hộp thoại thông báo:
*   Hiển thị thông tin phiên bản mới và danh sách tính năng (Changelog).
*   Thanh tiến trình tải APK thời gian thực (0% -> 100%).
*   Tự động mở màn hình cài đè của Android ngay khi hoàn tất tải.
