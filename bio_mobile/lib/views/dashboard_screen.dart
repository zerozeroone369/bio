import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/bio_provider.dart';
import '../services/update_service.dart';
import '../widgets/update_dialog.dart';
import 'tabs/profile_tab.dart';
import 'tabs/links_tab.dart';
import 'tabs/themes_tab.dart';
import 'tabs/qr_share_tab.dart';
import 'preview/bio_live_preview.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final UpdateService _updateService = UpdateService();
  bool _checkedOnStartup = false;

  final List<Widget> _tabs = const [
    ProfileTab(),
    LinksTab(),
    ThemesTab(),
    QrShareTab(),
  ];

  @override
  void initState() {
    super.initState();
    // Tự động kiểm tra bản cập nhật mới trên Server sau khi giao diện khởi tạo xong
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!_checkedOnStartup) {
        _checkedOnStartup = true;
        Future.delayed(const Duration(milliseconds: 1500), () {
          if (mounted) {
            _performUpdateCheck(silent: true);
          }
        });
      }
    });
  }

  Future<void> _performUpdateCheck({bool silent = false}) async {
    final provider = Provider.of<BioProvider>(context, listen: false);
    final baseUrl = 'http://${provider.networkIp}:${provider.port}';

    if (!silent) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Row(
            children: [
              SizedBox(
                width: 16,
                height: 16,
                child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF00F2FE)),
              ),
              SizedBox(width: 12),
              Text('Đang kiểm tra bản cập nhật từ máy chủ...'),
            ],
          ),
          duration: Duration(seconds: 1),
          behavior: SnackBarBehavior.floating,
        ),
      );
    }

    final newVersion = await _updateService.checkUpdate(baseUrl);

    if (!mounted) return;

    if (newVersion != null) {
      // Hiển thị hộp thoại nâng cấp APK
      UpdateDialog.show(context, newVersion, baseUrl);
    } else {
      if (!silent) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Row(
              children: [
                Icon(Icons.check_circle_outline, color: Color(0xFF00F5A0), size: 18),
                SizedBox(width: 10),
                Text('Bạn đang sử dụng phiên bản mới nhất (v1.0.0)!'),
              ],
            ),
            backgroundColor: const Color(0xFF1B202E),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<BioProvider>();
    final currentIndex = provider.currentTabIndex;

    return Scaffold(
      backgroundColor: const Color(0xFF0B0E14),
      appBar: AppBar(
        backgroundColor: const Color(0xFF10141E),
        elevation: 0,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF00F2FE), Color(0xFF4FACFE)],
                ),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.flash_on_rounded, color: Colors.black, size: 20),
            ),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Bio Link Studio',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Text(
                  '@${provider.profile.username} · v1.0.0',
                  style: const TextStyle(
                    fontSize: 12,
                    color: Color(0xFF00F2FE),
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          // Nút kiểm tra cập nhật thủ công
          IconButton(
            tooltip: 'Kiểm tra bản cập nhật',
            icon: const Icon(Icons.cloud_sync_rounded, color: Colors.white70, size: 22),
            onPressed: () => _performUpdateCheck(silent: false),
          ),
          // Nút xem trước Bio
          IconButton(
            tooltip: 'Xem trước Bio',
            icon: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFF00F5A0).withOpacity(0.15),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF00F5A0).withOpacity(0.4)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.remove_red_eye_outlined, size: 16, color: Color(0xFF00F5A0)),
                  SizedBox(width: 6),
                  Text(
                    'Xem trước',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF00F5A0),
                    ),
                  ),
                ],
              ),
            ),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const BioLivePreview()),
              );
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: IndexedStack(
        index: currentIndex,
        children: _tabs,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF10141E),
          border: Border(top: BorderSide(color: Colors.white.withOpacity(0.08), width: 1)),
        ),
        child: BottomNavigationBar(
          currentIndex: currentIndex,
          onTap: (index) => provider.setTabIndex(index),
          backgroundColor: Colors.transparent,
          elevation: 0,
          type: BottomNavigationBarType.fixed,
          selectedItemColor: const Color(0xFF00F2FE),
          unselectedItemColor: Colors.white.withOpacity(0.4),
          selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
          unselectedLabelStyle: const TextStyle(fontSize: 11),
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.person_outline_rounded),
              activeIcon: Icon(Icons.person_rounded),
              label: 'Hồ sơ',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.link_rounded),
              activeIcon: Icon(Icons.link_rounded),
              label: 'Liên kết',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.palette_outlined),
              activeIcon: Icon(Icons.palette_rounded),
              label: 'Chủ đề & Video',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.qr_code_2_rounded),
              activeIcon: Icon(Icons.qr_code_2_rounded),
              label: 'Mã QR',
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const BioLivePreview()),
          );
        },
        backgroundColor: const Color(0xFF00F2FE),
        foregroundColor: Colors.black,
        elevation: 8,
        icon: const Icon(Icons.play_arrow_rounded),
        label: const Text(
          'Xem Trước Bio',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
      ),
    );
  }
}
