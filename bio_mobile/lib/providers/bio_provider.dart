import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/bio_model.dart';

class BioProvider with ChangeNotifier {
  BioProfile _profile = BioProfile.initialDemo();
  int _currentTabIndex = 0;
  bool _isLoading = false;
  String _networkIp = '127.0.0.1';
  int _port = 3000;
  String? _statusMessage;

  BioProfile get profile => _profile;
  int get currentTabIndex => _currentTabIndex;
  bool get isLoading => _isLoading;
  String get networkIp => _networkIp;
  int get port => _port;
  String? get statusMessage => _statusMessage;

  String get publicBioUrl => 'http://$_networkIp:$_port/@${_profile.username}';

  BioProvider() {
    loadCachedProfile();
  }

  void setTabIndex(int index) {
    _currentTabIndex = index;
    notifyListeners();
  }

  void updateBasicInfo({required String name, required String username, required String bio}) {
    _profile.name = name;
    _profile.username = username;
    _profile.bio = bio;
    notifyListeners();
    saveCachedProfile();
  }

  void updateAvatar(String newAvatarPath) {
    _profile.avatar = newAvatarPath;
    notifyListeners();
    saveCachedProfile();
  }

  void setTheme(String themeId) {
    _profile.theme = themeId;
    notifyListeners();
    saveCachedProfile();
  }

  void updateVideoConfig({
    String? url,
    String? name,
    String? size,
    double? overlay,
    double? blur,
    bool? muted,
  }) {
    if (url != null) _profile.video.url = url;
    if (name != null) _profile.video.name = name;
    if (size != null) _profile.video.size = size;
    if (overlay != null) _profile.video.overlay = overlay;
    if (blur != null) _profile.video.blur = blur;
    if (muted != null) _profile.video.muted = muted;
    notifyListeners();
    saveCachedProfile();
  }

  void addSocialLink(String title, String url) {
    final newId = DateTime.now().millisecondsSinceEpoch;
    _profile.links.add(SocialLink(id: newId, title: title, url: url));
    notifyListeners();
    saveCachedProfile();
  }

  void removeSocialLink(int id) {
    _profile.links.removeWhere((l) => l.id == id);
    notifyListeners();
    saveCachedProfile();
  }

  void updateSocialLink(int id, String newTitle, String newUrl) {
    final index = _profile.links.indexWhere((l) => l.id == id);
    if (index != -1) {
      _profile.links[index].title = newTitle;
      _profile.links[index].url = newUrl;
      notifyListeners();
      saveCachedProfile();
    }
  }

  void updateSocialAccount(String platform, String url) {
    _profile.socials[platform] = url;
    notifyListeners();
    saveCachedProfile();
  }

  void setNetworkInfo(String ip, int port) {
    _networkIp = ip;
    _port = port;
    notifyListeners();
  }

  Future<void> loadCachedProfile() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cachedJson = prefs.getString('bio_profile_cache');
      if (cachedJson != null) {
        _profile = BioProfile.fromJson(cachedJson);
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error loading cached profile: $e');
    }
  }

  Future<void> saveCachedProfile() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('bio_profile_cache', _profile.toJson());
    } catch (e) {
      debugPrint('Error saving cached profile: $e');
    }
  }
}
