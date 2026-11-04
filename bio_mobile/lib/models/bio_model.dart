import 'dart:convert';

class SocialLink {
  final int id;
  String title;
  String url;
  String? icon;

  SocialLink({
    required this.id,
    required this.title,
    required this.url,
    this.icon,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'title': title,
      'url': url,
      if (icon != null) 'icon': icon,
    };
  }

  factory SocialLink.fromMap(Map<String, dynamic> map) {
    return SocialLink(
      id: map['id'] is int ? map['id'] : int.tryParse(map['id'].toString()) ?? 1,
      title: map['title'] ?? '',
      url: map['url'] ?? '',
      icon: map['icon'],
    );
  }
}

class VideoConfig {
  String url;
  String name;
  String size;
  double overlay; // 0 to 100
  double blur; // 0 to 20
  bool muted;

  VideoConfig({
    this.url = '',
    this.name = '',
    this.size = '',
    this.overlay = 40.0,
    this.blur = 0.0,
    this.muted = true,
  });

  Map<String, dynamic> toMap() {
    return {
      'url': url,
      'name': name,
      'size': size,
      'overlay': overlay,
      'blur': blur,
      'muted': muted,
    };
  }

  factory VideoConfig.fromMap(Map<String, dynamic> map) {
    return VideoConfig(
      url: map['url'] ?? '',
      name: map['name'] ?? '',
      size: map['size'] ?? '',
      overlay: (map['overlay'] as num?)?.toDouble() ?? 40.0,
      blur: (map['blur'] as num?)?.toDouble() ?? 0.0,
      muted: map['muted'] ?? true,
    );
  }
}

class BioProfile {
  String name;
  String username;
  String bio;
  String avatar;
  String theme;
  List<SocialLink> links;
  Map<String, String> socials;
  VideoConfig video;

  BioProfile({
    required this.name,
    required this.username,
    required this.bio,
    required this.avatar,
    this.theme = 'rainy_night',
    required this.links,
    required this.socials,
    required this.video,
  });

  factory BioProfile.initialDemo() {
    return BioProfile(
      name: 'Abg',
      username: 'abg',
      bio: 'Digital Artist & Tarot Creator ✨ Chào mừng bạn đến với thế giới của tôi!',
      avatar: 'assets/avatar_abg.jpg',
      theme: 'rainy_night',
      links: [
        SocialLink(id: 1, title: 'Fb cá nhân', url: 'https://facebook.com/abg'),
        SocialLink(id: 2, title: 'Portfolio & Dự án mới', url: 'https://behance.net'),
      ],
      socials: {
        'facebook': 'https://facebook.com/abg',
        'instagram': 'https://instagram.com/abg',
        'tiktok': 'https://tiktok.com/@abg',
        'youtube': 'https://youtube.com/@abg',
      },
      video: VideoConfig(
        url: '',
        name: 'sample_loop.mp4',
        overlay: 40,
        blur: 0,
        muted: true,
      ),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'name': name,
      'username': username,
      'bio': bio,
      'avatar': avatar,
      'theme': theme,
      'links': links.map((l) => l.toMap()).toList(),
      'socials': socials,
      'video': video.toMap(),
    };
  }

  factory BioProfile.fromMap(Map<String, dynamic> map) {
    var rawLinks = map['links'] as List? ?? [];
    List<SocialLink> parsedLinks = rawLinks.map((item) => SocialLink.fromMap(item as Map<String, dynamic>)).toList();

    var rawSocials = map['socials'] as Map<String, dynamic>? ?? {};
    Map<String, String> parsedSocials = rawSocials.map((k, v) => MapEntry(k, v.toString()));

    return BioProfile(
      name: map['name'] ?? '',
      username: map['username'] ?? '',
      bio: map['bio'] ?? '',
      avatar: map['avatar'] ?? 'assets/avatar_abg.jpg',
      theme: map['theme'] ?? 'rainy_night',
      links: parsedLinks,
      socials: parsedSocials,
      video: map['video'] != null ? VideoConfig.fromMap(map['video']) : VideoConfig(),
    );
  }

  String toJson() => json.encode(toMap());
  factory BioProfile.fromJson(String source) => BioProfile.fromMap(json.decode(source));
}
