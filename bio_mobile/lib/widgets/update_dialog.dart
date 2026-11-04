import 'package:flutter/material.dart';
import '../models/app_version_info.dart';
import '../services/update_service.dart';
import 'glass_card.dart';

class UpdateDialog extends StatefulWidget {
  final AppVersionInfo versionInfo;
  final String serverBaseUrl;

  const UpdateDialog({
    Key? key,
    required this.versionInfo,
    required this.serverBaseUrl,
  }) : super(key: key);

  static Future<void> show(BuildContext context, AppVersionInfo versionInfo, String serverBaseUrl) {
    return showDialog(
      context: context,
      barrierDismissible: !versionInfo.forceUpdate,
      builder: (_) => UpdateDialog(
        versionInfo: versionInfo,
        serverBaseUrl: serverBaseUrl,
      ),
    );
  }

  @override
  State<UpdateDialog> createState() => _UpdateDialogState();
}

class _UpdateDialogState extends State<UpdateDialog> {
  final UpdateService _updateService = UpdateService();
  bool _isDownloading = false;
  double _progress = 0.0;
  String _downloadedSize = '0';
  String _totalSize = '0';
  String? _errorMessage;

  void _startDownload() {
    setState(() {
      _isDownloading = true;
      _errorMessage = null;
      _progress = 0.0;
    });

    final info = widget.versionInfo;
    String finalUrl = info.fullDownloadUrl ?? '';
    if (finalUrl.isEmpty) {
      if (info.apkUrl.startsWith('http')) {
        finalUrl = info.apkUrl;
      } else {
        finalUrl = '${widget.serverBaseUrl}${info.apkUrl}';
      }
    }

    _updateService.downloadAndInstall(
      downloadUrl: finalUrl,
      onProgress: (progress, downloaded, total) {
        setState(() {
          _progress = progress;
          _downloadedSize = downloaded;
          _totalSize = total;
        });
      },
      onError: (err) {
        setState(() {
          _isDownloading = false;
          _errorMessage = 'Tải thất bại. Vui lòng kiểm tra kết nối!';
        });
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final info = widget.versionInfo;

    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
      child: GlassCard(
        borderRadius: 24,
        padding: const EdgeInsets.all(22),
        backgroundColor: const Color(0xE610141E),
        borderColor: const Color(0xFF00F2FE),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header: Icon phát sáng & Tiêu đề
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF00F2FE), Color(0xFF4FACFE)],
                    ),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF00F2FE).withOpacity(0.4),
                        blurRadius: 16,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: const Icon(Icons.system_update_rounded, color: Colors.black, size: 24),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            'BẢN NÂNG CẤP MỚI',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 1.2,
                              color: const Color(0xFF00F2FE),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: const Color(0xFF00F5A0).withOpacity(0.2),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              'v${info.version}',
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF00F5A0),
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Dung lượng: ${info.apkSize}',
                        style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.6)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),

            // Nội dung cập nhật (Changelog)
            const Text(
              'Có gì mới trong phiên bản này?',
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            const SizedBox(height: 10),
            Container(
              constraints: const BoxConstraints(maxHeight: 180),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.black38,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white10),
              ),
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: info.changelog.map((log) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('• ', style: TextStyle(color: Color(0xFF00F2FE), fontSize: 14)),
                          Expanded(
                            child: Text(
                              log,
                              style: TextStyle(
                                fontSize: 13,
                                color: Colors.white.withOpacity(0.85),
                                height: 1.35,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Khu vực tiến trình tải hoặc nút bấm
            if (_isDownloading)
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Đang tải file APK...',
                        style: TextStyle(fontSize: 13, color: Colors.white70),
                      ),
                      Text(
                        '${(_progress * 100).round()}%',
                        style: const TextStyle(
                          color: Color(0xFF00F2FE),
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: LinearProgressIndicator(
                      value: _progress,
                      minHeight: 8,
                      backgroundColor: Colors.white12,
                      valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF00F2FE)),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Đã tải: $_downloadedSize MB / $_totalSize MB',
                    style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.5)),
                  ),
                  const SizedBox(height: 10),
                  const Text(
                    '⚡ Tự động mở trình cài đặt khi tải xong (không mất dữ liệu cũ)',
                    style: TextStyle(fontSize: 11, color: Color(0xFF00F5A0)),
                  ),
                ],
              )
            else ...[
              if (_errorMessage != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Text(
                    _errorMessage!,
                    style: const TextStyle(color: Colors.redAccent, fontSize: 12),
                  ),
                ),
              Row(
                children: [
                  if (!info.forceUpdate)
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.pop(context),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.white70,
                          side: const BorderSide(color: Colors.white24),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                        child: const Text('Để sau'),
                      ),
                    ),
                  if (!info.forceUpdate) const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton.icon(
                      onPressed: _startDownload,
                      icon: const Icon(Icons.download_rounded, size: 18),
                      label: const Text(
                        'CẬP NHẬT NGAY',
                        style: TextStyle(fontWeight: FontWeight.bold),
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00F2FE),
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        elevation: 4,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}
