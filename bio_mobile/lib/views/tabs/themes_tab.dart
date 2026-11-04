import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import '../../providers/bio_provider.dart';
import '../../widgets/glass_card.dart';

class ThemeOption {
  final String id;
  final String name;
  final String description;
  final IconData icon;
  final Color accentColor;
  final String? previewAsset;

  const ThemeOption({
    required this.id,
    required this.name,
    required this.description,
    required this.icon,
    required this.accentColor,
    this.previewAsset,
  });
}

class ThemesTab extends StatelessWidget {
  const ThemesTab({Key? key}) : super(key: key);

  final List<ThemeOption> _themes = const [
    ThemeOption(
      id: 'rainy_night',
      name: 'Đêm Mưa · Trực Tiếp',
      description: 'Hạt mưa rơi động thời gian thực cùng ánh đèn phố đêm',
      icon: Icons.grain_rounded,
      accentColor: Color(0xFF00F2FE),
      previewAsset: 'assets/rainy_city_night.jpg',
    ),
    ThemeOption(
      id: 'winter_snow',
      name: 'Mùa Đông · Trực Tiếp',
      description: 'Hoa tuyết bay lơ lửng bồng bềnh phong cách Anime',
      icon: Icons.ac_unit_rounded,
      accentColor: Color(0xFFE0EAFC),
      previewAsset: 'assets/theme_winter.jpg',
    ),
    ThemeOption(
      id: 'christmas',
      name: 'Giáng Sinh · Ấm Áp',
      description: 'Tone đỏ vàng rực rỡ với ánh nến lung linh',
      icon: Icons.celebration_rounded,
      accentColor: Color(0xFFFF5252),
      previewAsset: 'assets/theme_christmas.jpg',
    ),
    ThemeOption(
      id: 'cyber_glitch',
      name: 'Cyber Glitch · Neon',
      description: 'Phong cách Cyberpunk tương lai với viền phát quang tím xanh',
      icon: Icons.bolt_rounded,
      accentColor: Color(0xFF00F5A0),
    ),
    ThemeOption(
      id: 'carbon',
      name: 'Cacbon · Tối Giản',
      description: 'Vân sợi carbon siêu xe đen mờ lịch lãm và cao cấp',
      icon: Icons.dark_mode_rounded,
      accentColor: Color(0xFF757575),
    ),
    ThemeOption(
      id: 'glassy',
      name: 'Glassmorphism',
      description: 'Kính mờ xuyên thấu siêu thực với ánh sáng mềm',
      icon: Icons.blur_on_rounded,
      accentColor: Color(0xFF8A2387),
    ),
    ThemeOption(
      id: 'custom_video',
      name: 'Video Nền Tự Chọn',
      description: 'Phát video từ máy tính hoặc điện thoại của bạn lặp vô tận',
      icon: Icons.videocam_rounded,
      accentColor: Color(0xFFFF8A00),
    ),
  ];

  Future<void> _pickVideoFile(BuildContext context) async {
    final provider = Provider.of<BioProvider>(context, listen: false);
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['mp4', 'webm', 'mov'],
      );

      if (result != null && result.files.single.path != null) {
        final file = result.files.single;
        provider.updateVideoConfig(
          url: file.path!,
          name: file.name,
          size: '${(file.size / (1024 * 1024)).toStringAsFixed(1)} MB',
        );
        provider.setTheme('custom_video');

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Đã chọn video nền: ${file.name}'),
            backgroundColor: const Color(0xFF00F5A0),
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi khi chọn video: $e'), backgroundColor: Colors.redAccent),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<BioProvider>();
    final currentTheme = provider.profile.theme;
    final video = provider.profile.video;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Thẻ chọn Video nền tùy chỉnh từ máy tính/điện thoại
          GlassCard(
            borderColor: const Color(0xFFFF8A00),
            backgroundColor: const Color(0x33FF8A00),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: const BoxDecoration(
                        color: Color(0xFFFF8A00),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.video_library_rounded, color: Colors.black, size: 20),
                    ),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Tải Video Từ Máy Làm Nền',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                          Text(
                            'Hỗ trợ tệp .mp4, .webm, .mov lặp vô tận',
                            style: TextStyle(fontSize: 12, color: Colors.white70),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                if (video.name.isNotEmpty)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.black38,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.movie_filter_rounded, color: Color(0xFFFF8A00), size: 18),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            video.name,
                            style: const TextStyle(color: Colors.white, fontSize: 13),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (video.size.isNotEmpty)
                          Text(
                            video.size,
                            style: const TextStyle(color: Colors.white54, fontSize: 12),
                          ),
                      ],
                    ),
                  ),
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () => _pickVideoFile(context),
                    icon: const Icon(Icons.file_upload_outlined),
                    label: Text(video.url.isEmpty ? 'Chọn Tệp Video Từ Thiết Bị' : 'Đổi Video Khác'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFFF8A00),
                      foregroundColor: Colors.black,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Tinh chỉnh Lớp phủ Video & Blur
          GlassCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Tinh Chỉnh Hiệu Ứng Nền (Overlay & Blur)',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Lớp phủ tối (Dark Overlay):', style: TextStyle(color: Colors.white70, fontSize: 13)),
                    Text('${video.overlay.round()}%', style: const TextStyle(color: Color(0xFF00F2FE), fontWeight: FontWeight.bold)),
                  ],
                ),
                Slider(
                  value: video.overlay,
                  min: 0,
                  max: 90,
                  activeColor: const Color(0xFF00F2FE),
                  inactiveColor: Colors.white24,
                  onChanged: (val) => provider.updateVideoConfig(overlay: val),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Độ mờ hậu cảnh (Blur):', style: TextStyle(color: Colors.white70, fontSize: 13)),
                    Text('${video.blur.round()}px', style: const TextStyle(color: Color(0xFF00F2FE), fontWeight: FontWeight.bold)),
                  ],
                ),
                Slider(
                  value: video.blur,
                  min: 0,
                  max: 20,
                  activeColor: const Color(0xFF00F2FE),
                  inactiveColor: Colors.white24,
                  onChanged: (val) => provider.updateVideoConfig(blur: val),
                ),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Tắt tiếng video (Muted):', style: TextStyle(color: Colors.white70, fontSize: 13)),
                    Switch(
                      value: video.muted,
                      activeColor: const Color(0xFF00F5A0),
                      onChanged: (val) => provider.updateVideoConfig(muted: val),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Danh sách Bộ sưu tập 7 chủ đề
          const Text(
            'Bộ Sưu Tập Chủ Đề Động',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          const SizedBox(height: 12),

          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _themes.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final t = _themes[index];
              final isSelected = currentTheme == t.id;

              return GlassCard(
                onTap: () => provider.setTheme(t.id),
                borderColor: isSelected ? t.accentColor : Colors.white12,
                backgroundColor: isSelected ? t.accentColor.withOpacity(0.18) : const Color(0x1AFFFFFF),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: t.accentColor.withOpacity(0.2),
                        shape: BoxShape.circle,
                        border: Border.all(color: t.accentColor.withOpacity(0.5), width: 1.5),
                      ),
                      child: Icon(t.icon, color: t.accentColor, size: 22),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            t.name,
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: isSelected ? t.accentColor : Colors.white,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            t.description,
                            style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.6)),
                          ),
                        ],
                      ),
                    ),
                    if (isSelected)
                      Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: t.accentColor,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.check, size: 14, color: Colors.black),
                      ),
                  ],
                ),
              );
            },
          ),
          const SizedBox(height: 30),
        ],
      ),
    );
  }
}
