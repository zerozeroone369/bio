import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';
import 'package:open_filex/open_filex.dart';
import '../models/app_version_info.dart';

class UpdateService {
  // Phiên bản hiện tại của App đang chạy
  static const String currentAppVersion = '1.0.0';
  static const int currentAppVersionCode = 1;

  final Dio _dio = Dio();

  // Kiểm tra phiên bản mới từ máy chủ
  Future<AppVersionInfo?> checkUpdate(String serverBaseUrl) async {
    try {
      final uri = Uri.parse('$serverBaseUrl/api/app-version');
      final res = await http.get(uri).timeout(const Duration(seconds: 4));

      if (res.statusCode == 200) {
        final data = json.decode(utf8.decode(res.bodyBytes));
        if (data['version'] != null) {
          final verInfo = AppVersionInfo.fromJson(data);
          if (verInfo.isNewerThan(currentAppVersion)) {
            return verInfo;
          }
        }
      }
    } catch (e) {
      debugPrint('[UpdateService] Check update error: $e');
    }
    return null;
  }

  // Tải file APK trực tiếp từ máy chủ cá nhân và mở màn hình cài đè
  Future<bool> downloadAndInstall({
    required String downloadUrl,
    required Function(double progress, String downloadedSize, String totalSize) onProgress,
    required Function(String error) onError,
  }) async {
    try {
      // 1. Lấy thư mục lưu trữ an toàn trên thiết bị Android
      Directory? tempDir;
      if (Platform.isAndroid) {
        tempDir = await getExternalStorageDirectory() ?? await getTemporaryDirectory();
      } else {
        tempDir = await getTemporaryDirectory();
      }

      final savePath = '${tempDir.path}/update_release.apk';
      final file = File(savePath);
      if (await file.exists()) {
        await file.delete();
      }

      // 2. Tải file APK kèm cập nhật % tiến trình theo thời gian thực
      await _dio.download(
        downloadUrl,
        savePath,
        onReceiveProgress: (received, total) {
          if (total > 0) {
            final progress = received / total;
            final receivedMB = (received / (1024 * 1024)).toStringAsFixed(1);
            final totalMB = (total / (1024 * 1024)).toStringAsFixed(1);
            onProgress(progress, receivedMB, totalMB);
          }
        },
      );

      // 3. Mở file APK để Android kích hoạt trình cài đặt đè
      final result = await OpenFilex.open(
        savePath,
        type: 'application/vnd.android.package-archive',
      );

      debugPrint('[UpdateService] OpenFilex result: ${result.type} - ${result.message}');
      return result.type == ResultType.done;
    } catch (e) {
      debugPrint('[UpdateService] Download failed: $e');
      onError(e.toString());
      return false;
    }
  }
}
