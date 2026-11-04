import 'dart:math';
import 'package:flutter/material.dart';

class SnowParticle {
  double x;
  double y;
  double radius;
  double speed;
  double swing;
  double swingSpeed;
  double opacity;

  SnowParticle({
    required this.x,
    required this.y,
    required this.radius,
    required this.speed,
    required this.swing,
    required this.swingSpeed,
    required this.opacity,
  });
}

class SnowEffect extends StatefulWidget {
  final int count;
  const SnowEffect({Key? key, this.count = 45}) : super(key: key);

  @override
  State<SnowEffect> createState() => _SnowEffectState();
}

class _SnowEffectState extends State<SnowEffect> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  final List<SnowParticle> _particles = [];
  final Random _random = Random();
  double _time = 0;

  @override
  void initState() {
    super.initState();
    for (int i = 0; i < widget.count; i++) {
      _particles.add(SnowParticle(
        x: _random.nextDouble(),
        y: _random.nextDouble(),
        radius: 1.5 + _random.nextDouble() * 3.0,
        speed: 0.002 + _random.nextDouble() * 0.005,
        swing: 0.02 + _random.nextDouble() * 0.04,
        swingSpeed: 1.0 + _random.nextDouble() * 2.0,
        opacity: 0.4 + _random.nextDouble() * 0.5,
      ));
    }

    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    )..addListener(() {
        _time += 0.03;
        for (var p in _particles) {
          p.y += p.speed;
          p.x += sin(_time * p.swingSpeed) * 0.001;
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
      painter: _SnowPainter(particles: _particles),
      child: const SizedBox.expand(),
    );
  }
}

class _SnowPainter extends CustomPainter {
  final List<SnowParticle> particles;
  _SnowPainter({required this.particles});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..style = PaintingStyle.fill;

    for (var p in particles) {
      final cx = p.x * size.width;
      final cy = p.y * size.height;
      paint.color = Colors.white.withOpacity(p.opacity);
      canvas.drawCircle(Offset(cx, cy), p.radius, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
