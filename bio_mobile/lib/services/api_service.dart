import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/bio_model.dart';

class ApiService {
  final String baseUrl;

  ApiService({this.baseUrl = 'http://localhost:3000'});

  // Lấy thông tin mạng nội bộ (IP & Port) để tạo mã QR chuẩn
  Future<Map<String, dynamic>?> getNetworkInfo() async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/api/network-info'));
      if (res.statusCode == 200) {
        return json.decode(utf8.decode(res.bodyBytes));
      }
    } catch (e) {
      // Offline fallback
    }
    return null;
  }

  // Đăng nhập
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/api/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'email': email, 'password': password}),
      );
      return json.decode(utf8.decode(res.bodyBytes));
    } catch (e) {
      return {'success': false, 'error': 'Không thể kết nối đến máy chủ: $e'};
    }
  }

  // Đăng ký
  Future<Map<String, dynamic>> register({
    required String name,
    required String email,
    required String password,
    String? username,
  }) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/api/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'name': name,
          'email': email,
          'password': password,
          'username': username,
        }),
      );
      return json.decode(utf8.decode(res.bodyBytes));
    } catch (e) {
      return {'success': false, 'error': 'Không thể kết nối đến máy chủ: $e'};
    }
  }

  // Lấy dữ liệu hồ sơ Bio công khai
  Future<BioProfile?> fetchBio(String username) async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/api/bio/$username'));
      if (res.statusCode == 200) {
        final data = json.decode(utf8.decode(res.bodyBytes));
        if (data['success'] == true && data['bio'] != null) {
          return BioProfile.fromMap(data['bio']);
        }
      }
    } catch (e) {
      // Fallback
    }
    return null;
  }

  // Lưu hồ sơ Bio lên máy chủ Node.js & MongoDB
  Future<bool> saveBio(String token, BioProfile profile) async {
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/api/profile/save'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: json.encode(profile.toMap()),
      );
      if (res.statusCode == 200) {
        final data = json.decode(utf8.decode(res.bodyBytes));
        return data['success'] == true;
      }
    } catch (e) {
      //
    }
    return false;
  }
}
