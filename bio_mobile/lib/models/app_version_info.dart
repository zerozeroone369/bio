class AppVersionInfo {
  final String version;
  final int versionCode;
  final String minSupportVersion;
  final String apkUrl;
  final String? fullDownloadUrl;
  final String apkSize;
  final String releaseDate;
  final bool forceUpdate;
  final String title;
  final List<String> changelog;

  AppVersionInfo({
    required this.version,
    required this.versionCode,
    this.minSupportVersion = '1.0.0',
    required this.apkUrl,
    this.fullDownloadUrl,
    this.apkSize = '24.5 MB',
    this.releaseDate = '',
    this.forceUpdate = false,
    this.title = 'Có Bản Nâng Cấp Mới!',
    required this.changelog,
  });

  factory AppVersionInfo.fromJson(Map<String, dynamic> json) {
    var rawChangelog = json['changelog'] as List? ?? [];
    List<String> list = rawChangelog.map((e) => e.toString()).toList();

    return AppVersionInfo(
      version: json['version'] ?? '1.0.0',
      versionCode: json['versionCode'] is int ? json['versionCode'] : int.tryParse(json['versionCode'].toString()) ?? 1,
      minSupportVersion: json['minSupportVersion'] ?? '1.0.0',
      apkUrl: json['apkUrl'] ?? '',
      fullDownloadUrl: json['fullDownloadUrl'],
      apkSize: json['apkSize'] ?? '25 MB',
      releaseDate: json['releaseDate'] ?? '',
      forceUpdate: json['forceUpdate'] ?? false,
      title: json['title'] ?? 'Có Bản Nâng Cấp Mới!',
      changelog: list,
    );
  }

  // So sánh version chuỗi Semantic Versioning (ví dụ '1.0.1' so với '1.0.0')
  bool isNewerThan(String currentVer) {
    try {
      List<int> currentParts = currentVer.split('.').map((e) => int.tryParse(e) ?? 0).toList();
      List<int> latestParts = version.split('.').map((e) => int.tryParse(e) ?? 0).toList();

      for (int i = 0; i < latestParts.length; i++) {
        int c = i < currentParts.length ? currentParts[i] : 0;
        int l = latestParts[i];
        if (l > c) return true;
        if (l < c) return false;
      }
    } catch (_) {}
    return false;
  }
}
