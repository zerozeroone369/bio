import 'dart:math';
import 'package:flutter/material.dart';

class RainParticle {
  double x;
  double y;
  double length;
  double speed;
  double opacity;

  RainParticle({
    required this.x,
    required this.y,
    required this.length,
    required this.speed,
    required this.opacity,
  });
}

class RainEffect extends StatefulWidget {
  final int count;
  const RainEffect({Key? key, this.count = 70}) : super(key: key);

  @override
  State<RainEffect> createState() => _RainEffectState();
}

class _RainEffectState extends State<RainEffect> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  final List<RainParticle> _particles = [];
  final Random _random = Random();

  @override
  void initState() {
    super.initState();
    for (int i = 0; i < widget.count; i++) {
      _particles.add(RainParticle(
        x: _random.nextDouble(),
        y: _random.nextDouble(),
        length: 12 + _random.nextDouble() * 18,
        speed: 0.008 + _random.nextDouble() * 0.016,
        opacity: 0.2 + _random.nextDouble() * 0.5,
      ));
    }

    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    )..addListener(() {
        for (var p in _particles) {
          p.y += p.speed;
          if (p.y > 1.0) {
            p.y = -0.05;
            p.x = _random.nextDouble();
          }
        }
        setState(() {});
      })..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: _RainPainter(particles: _particles),
      child: const SizedBox.expand(),
    );
  }
}

class _RainPainter extends CustomPainter {
  final List<RainParticle> particles;
  _RainPainter({required this.particles});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..strokeWidth = 1.3
      ..strokeCap = StrokeCap.round;

    for (var p in particles) {
      final startX = p.x * size.width;
      final startY = p.y * size.height;
      final endX = startX - 2.5; // Góc nghiêng nhẹ của hạt mưa
      final endY = startY + p.length;

      paint.color = Colors.lightBlueAccent.withOpacity(p.opacity);
      canvas.drawLine(Offset(startX, startY), Offset(endX, endY), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
