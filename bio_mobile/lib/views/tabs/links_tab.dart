import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/bio_provider.dart';
import '../../widgets/glass_card.dart';

class LinksTab extends StatefulWidget {
  const LinksTab({Key? key}) : super(key: key);

  @override
  State<LinksTab> createState() => _LinksTabState();
}

class _LinksTabState extends State<LinksTab> {
  void _showAddLinkDialog(BuildContext context) {
    final titleController = TextEditingController();
    final urlController = TextEditingController(text: 'https://');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF161B26),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text(
          'Thêm Liên Kết Mới',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: titleController,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: 'Tiêu đề (VD: Portfolio, Dự án mới, Shopee)',
                labelStyle: const TextStyle(color: Colors.white70),
                filled: true,
                fillColor: Colors.white.withOpacity(0.06),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: urlController,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                labelText: 'Đường dẫn URL',
                labelStyle: const TextStyle(color: Colors.white70),
                filled: true,
                fillColor: Colors.white.withOpacity(0.06),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Hủy', style: TextStyle(color: Colors.white60)),
          ),
          ElevatedButton(
            onPressed: () {
              if (titleController.text.trim().isNotEmpty && urlController.text.trim().isNotEmpty) {
                Provider.of<BioProvider>(context, listen: false)
                    .addSocialLink(titleController.text.trim(), urlController.text.trim());
                Navigator.pop(ctx);
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF00F2FE),
              foregroundColor: Colors.black,
            ),
            child: const Text('Thêm ngay'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<BioProvider>();
    final links = provider.profile.links;
    final socials = provider.profile.socials;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Danh Sách Liên Kết Nổi Bật',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              ElevatedButton.icon(
                onPressed: () => _showAddLinkDialog(context),
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Thêm Link'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF00F2FE),
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          if (links.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(40),
                child: Column(
                  children: [
                    Icon(Icons.link_off_rounded, size: 48, color: Colors.white.withOpacity(0.3)),
                    const SizedBox(height: 12),
                    Text(
                      'Chưa có liên kết nào. Hãy nhấn "Thêm Link"!',
                      style: TextStyle(color: Colors.white.withOpacity(0.5)),
                    ),
                  ],
                ),
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: links.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final link = links[index];
                return GlassCard(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(0xFF00F2FE).withOpacity(0.15),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.link_rounded, color: Color(0xFF00F2FE), size: 20),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              link.title,
                              style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              link.url,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontSize: 13,
                                color: Colors.white.withOpacity(0.5),
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete_outline, color: Colors.redAccent, size: 22),
                        onPressed: () => provider.removeSocialLink(link.id),
                      ),
                    ],
                  ),
                );
              },
            ),

          const SizedBox(height: 28),
          const Text(
            'Mạng Xã Hội Trực Tiếp',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          const SizedBox(height: 12),

          GlassCard(
            child: Column(
              children: [
                _buildSocialInput(
                  context,
                  icon: Icons.facebook,
                  iconColor: const Color(0xFF1877F2),
                  label: 'Facebook Profile URL',
                  initialValue: socials['facebook'] ?? '',
                  onChanged: (val) => provider.updateSocialAccount('facebook', val),
                ),
                const Divider(color: Colors.white12, height: 24),
                _buildSocialInput(
                  context,
                  icon: Icons.camera_alt_outlined,
                  iconColor: const Color(0xFFE4405F),
                  label: 'Instagram Profile URL',
                  initialValue: socials['instagram'] ?? '',
                  onChanged: (val) => provider.updateSocialAccount('instagram', val),
                ),
                const Divider(color: Colors.white12, height: 24),
                _buildSocialInput(
                  context,
                  icon: Icons.music_note_outlined,
                  iconColor: const Color(0xFF00F2FE),
                  label: 'TikTok Profile URL',
                  initialValue: socials['tiktok'] ?? '',
                  onChanged: (val) => provider.updateSocialAccount('tiktok', val),
                ),
                const Divider(color: Colors.white12, height: 24),
                _buildSocialInput(
                  context,
                  icon: Icons.play_circle_outline,
                  iconColor: const Color(0xFFFF0000),
                  label: 'YouTube Channel URL',
                  initialValue: socials['youtube'] ?? '',
                  onChanged: (val) => provider.updateSocialAccount('youtube', val),
                ),
              ],
            ),
          ),
          const SizedBox(height: 30),
        ],
      ),
    );
  }

  Widget _buildSocialInput(
    BuildContext context, {
    required IconData icon,
    required Color iconColor,
    required String label,
    required String initialValue,
    required ValueChanged<String> onChanged,
  }) {
    return Row(
      children: [
        Icon(icon, color: iconColor, size: 24),
        const SizedBox(width: 14),
        Expanded(
          child: TextFormField(
            initialValue: initialValue,
            onChanged: onChanged,
            style: const TextStyle(color: Colors.white, fontSize: 14),
            decoration: InputDecoration(
              isDense: true,
              hintText: label,
              hintStyle: const TextStyle(color: Colors.white30, fontSize: 13),
              border: InputBorder.none,
            ),
          ),
        ),
      ],
    );
  }
}
