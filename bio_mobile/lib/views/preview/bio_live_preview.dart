import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/bio_provider.dart';
import '../../widgets/glass_card.dart';
import '../../widgets/rain_effect.dart';
import '../../widgets/snow_effect.dart';

class BioLivePreview extends StatelessWidget {
  const BioLivePreview({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<BioProvider>();
    final profile = provider.profile;
    final theme = profile.theme;
    final video = profile.video;

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // 1. LAYER HÌNH NỀN HOẶC VIDEO
          Positioned.fill(
            child: _buildBackground(theme, video),
          ),

          // 2. LAYER HIỆU ỨNG THỜI TIẾT ĐỘNG
          if (theme == 'rainy_night')
            const Positioned.fill(child: RainEffect(count: 85)),
          if (theme == 'winter_snow')
            const Positioned.fill(child: SnowEffect(count: 55)),

          // 3. LAYER NỘI DUNG PROFILE VÀ LIÊN KẾT
          SafeArea(
            child: Column(
              children: [
                // Thanh điều khiển đầu trang (Nút đóng & Huy hiệu chế độ xem trước)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.55),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: Colors.white24),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 8,
                              height: 8,
                              decoration: const BoxDecoration(
                                color: Color(0xFF00F5A0),
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 8),
                            const Text(
                              'LIVE PREVIEW',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 1.2,
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: Colors.black.withOpacity(0.55),
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white24),
                          ),
                          child: const Icon(Icons.close, color: Colors.white, size: 20),
                        ),
                        onPressed: () => Navigator.pop(context),
                      ),
                    ],
                  ),
                ),

                // Nội dung chính có thể cuộn
                Expanded(
                  child: SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 10),
                    child: Column(
                      children: [
                        const SizedBox(height: 10),
                        // Avatar hình tròn có viền phát sáng
                        Container(
                          width: 105,
                          height: 105,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 3),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF00F2FE).withOpacity(0.45),
                                blurRadius: 25,
                                spreadRadius: 3,
                              ),
                            ],
                            image: DecorationImage(
                              image: profile.avatar.startsWith('http')
                                  ? NetworkImage(profile.avatar) as ImageProvider
                                  : AssetImage(profile.avatar),
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),

                        // Tên và tick xanh xác thực
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              profile.name,
                              style: const TextStyle(
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                                shadows: [
                                  Shadow(color: Colors.black, blurRadius: 8, offset: Offset(0, 2)),
                                ],
                              ),
                            ),
                            const SizedBox(width: 6),
                            const Icon(Icons.verified, color: Color(0xFF00F2FE), size: 20),
                          ],
                        ),
                        const SizedBox(height: 4),

                        // Username
                        Text(
                          '@${profile.username}',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.white.withOpacity(0.85),
                            fontWeight: FontWeight.w500,
                            shadows: const [
                              Shadow(color: Colors.black, blurRadius: 6),
                            ],
                          ),
                        ),
                        const SizedBox(height: 12),

                        // Tiểu sử Bio
                        if (profile.bio.isNotEmpty)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            child: Text(
                              profile.bio,
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 14,
                                color: Colors.white.withOpacity(0.9),
                                height: 1.4,
                                shadows: const [
                                  Shadow(color: Colors.black87, blurRadius: 10),
                                ],
                              ),
                            ),
                          ),
                        const SizedBox(height: 16),

                        // Hàng icon mạng xã hội nhanh
                        _buildSocialRow(profile.socials),
                        const SizedBox(height: 24),

                        // Danh sách nút liên kết (Social Links)
                        if (profile.links.isEmpty)
                          Text(
                            'Chưa có liên kết nào được cấu hình.',
                            style: TextStyle(color: Colors.white.withOpacity(0.5)),
                          )
                        else
                          ListView.separated(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: profile.links.length,
                            separatorBuilder: (_, __) => const SizedBox(height: 14),
                            itemBuilder: (context, index) {
                              final link = profile.links[index];
                              return GlassCard(
                                borderRadius: 16,
                                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                                backgroundColor: Colors.white.withOpacity(0.12),
                                borderColor: Colors.white.withOpacity(0.25),
                                child: Row(
                                  children: [
                                    const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 18),
                                    const SizedBox(width: 14),
                                    Expanded(
                                      child: Text(
                                        link.title,
                                        textAlign: TextAlign.center,
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.w600,
                                          fontSize: 15,
                                          letterSpacing: 0.5,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: 18),
                                  ],
                                ),
                              );
                            },
                          ),
                        const SizedBox(height: 40),

                        // Footer Bio
                        Text(
                          'TẠO BỞI BIO LINK APP · 2026',
                          style: TextStyle(
                            fontSize: 11,
                            letterSpacing: 1.5,
                            color: Colors.white.withOpacity(0.5),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 20),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBackground(String theme, dynamic video) {
    Widget base;
    switch (theme) {
      case 'rainy_night':
        base = Image.asset('assets/rainy_city_night.jpg', fit: BoxFit.cover);
        break;
      case 'winter_snow':
        base = Image.asset('assets/theme_winter.jpg', fit: BoxFit.cover);
        break;
      case 'christmas':
        base = Image.asset('assets/theme_christmas.jpg', fit: BoxFit.cover);
        break;
      case 'cyber_glitch':
        base = Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFF0F2027), Color(0xFF203A43), Color(0xFF2C5364)],
            ),
          ),
        );
        break;
      case 'carbon':
        base = Container(
          decoration: const BoxDecoration(
            color: Color(0xFF111317),
          ),
        );
        break;
      default:
        base = Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFF141E30), Color(0xFF243B55)],
            ),
          ),
        );
    }

    return Stack(
      children: [
        Positioned.fill(child: base),
        // Lớp mờ (Blur) nếu có
        if (video.blur > 0)
          Positioned.fill(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: video.blur, sigmaY: video.blur),
              child: const SizedBox.expand(),
            ),
          ),
        // Lớp tối (Dark Overlay)
        Positioned.fill(
          child: Container(
            color: Colors.black.withOpacity(video.overlay / 100.0),
          ),
        ),
      ],
    );
  }

  Widget _buildSocialRow(Map<String, String> socials) {
    final active = socials.entries.where((e) => e.value.trim().isNotEmpty).toList();
    if (active.isEmpty) return const SizedBox.shrink();

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: active.map((entry) {
        IconData icon = Icons.public;
        Color color = Colors.white;
        if (entry.key == 'facebook') {
          icon = Icons.facebook;
          color = const Color(0xFF1877F2);
        } else if (entry.key == 'instagram') {
          icon = Icons.camera_alt_outlined;
          color = const Color(0xFFE4405F);
        } else if (entry.key == 'tiktok') {
          icon = Icons.music_note_outlined;
          color = const Color(0xFF00F2FE);
        } else if (entry.key == 'youtube') {
          icon = Icons.play_circle_fill;
          color = const Color(0xFFFF0000);
        }

        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 6),
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: Colors.black.withOpacity(0.4),
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white24),
          ),
          child: Icon(icon, color: color, size: 20),
        );
      }).toList(),
    );
  }
}
