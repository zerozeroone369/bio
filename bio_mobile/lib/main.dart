import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'providers/bio_provider.dart';
import 'views/dashboard_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Color(0xFF10141E),
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );
  runApp(const BioApp());
}

class BioApp extends StatelessWidget {
  const BioApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => BioProvider()),
      ],
      child: MaterialApp(
        title: 'Bio Link Studio',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          brightness: Brightness.dark,
          scaffoldBackgroundColor: const Color(0xFF0B0E14),
          colorScheme: const ColorScheme.dark(
            primary: Color(0xFF00F2FE),
            secondary: Color(0xFF00F5A0),
            surface: Color(0xFF10141E),
            background: Color(0xFF0B0E14),
          ),
          textTheme: GoogleFonts.plusJakartaSansTextTheme(
            ThemeData.dark().textTheme,
          ),
          appBarTheme: const AppBarTheme(
            backgroundColor: Color(0xFF10141E),
            elevation: 0,
          ),
        ),
        home: const DashboardScreen(),
      ),
    );
  }
}
