import 'package:flutter/foundation.dart';

/// Keys representing supported languages.
enum LanguageKey {
  english,
  hindi,
  tamil,
  telugu,
  bengali,
  marathi,
  punjabi,
  gujarati,
  kannada,
  malayalam,
  odia,
  assamese,
  urdu,
  kashmiri,
  sindhi,
  manipuri,
  bodo,
  konkani,
  sanskrit,
  maithili,
  santali,
  dogri,
  nepali,
}

class LanguageProvider extends ChangeNotifier {
  LanguageKey _currentLanguage = LanguageKey.english;

  /// Minimal translation store. In a real app this would contain
  /// comprehensive translations similar to the web implementation.
  final Map<LanguageKey, Map<String, dynamic>> _translations = {
    LanguageKey.english: {
      'welcome': 'Welcome',
      'voiceCommands': {'greeting': 'Hello'},
      'patientDashboard': 'Patient Dashboard',
      'ashaDashboard': 'ASHA Dashboard',
      'doctorDashboard': 'Doctor Dashboard',
      'adminDashboard': 'Admin Dashboard',
      'home': 'Home',
      'ai': 'AI',
      'appointments': 'Appointments',
      'health': 'Health',
      'profile': 'Profile',
    },
    LanguageKey.hindi: {
      'welcome': '\u0938\u094d\u0935\u093e\u0917\u0924',
      'voiceCommands': {'greeting': '\u0928\u092e\u0938\u094d\u0924\u0947'},
      'patientDashboard': '\u0930\u094b\u0917\u0940 \u0921\u0948\u0936\u092c\u094b\u0930\u094d\u0921',
      'ashaDashboard': '\u0906\u0936\u093e \u0921\u0948\u0936\u092c\u094b\u0930\u094d\u0921',
      'doctorDashboard': '\u0921\u0949\u0915\u094d\u091f\u0930 \u0921\u0948\u0936\u092c\u094b\u0930\u094d\u0921',
      'adminDashboard': '\u090f\u0921\u092e\u093f\u0928 \u0921\u0948\u0936\u092c\u094b\u0930\u094d\u0921',
      'home': '\u0939\u094b\u092e',
      'ai': '\u090f\u0906\u0908',
      'appointments': '\u0928\u093f\u092f\u0941\u0915\u094d\u0924\u093f\u092f\u093e\u0902',
      'health': '\u0938\u094d\u0935\u093e\u0938\u094d\u0925\u094d\u092f',
      'profile': '\u092a\u094d\u0930\u094b\u092b\u093c\u093e\u0907\u0932',
    },
  };

  LanguageKey get currentLanguage => _currentLanguage;

  void setLanguage(LanguageKey language) {
    _currentLanguage = language;
    notifyListeners();
  }

  String t(String key) {
    final current = _translations[_currentLanguage];
    final value = current?[key];
    if (value is String) return value;
    final fallback = _translations[LanguageKey.english]?[key];
    if (fallback is String) return fallback;
    return key;
  }

  String getVoiceCommand(String command) {
    final current = _translations[_currentLanguage]?['voiceCommands']
        as Map<String, String>?;
    final english =
        _translations[LanguageKey.english]?['voiceCommands'] as Map<String, String>?;
    return current?[command] ?? english?[command] ?? command;
  }

  List<Map<String, String>> getSupportedLanguages() => [
        {'code': 'english', 'name': 'English', 'flag': '🇺🇸'},
        {'code': 'hindi', 'name': 'हिंदी', 'flag': '🇮🇳'},
        {'code': 'tamil', 'name': 'தமிழ்', 'flag': '🇮🇳'},
        {'code': 'telugu', 'name': 'తెలుగు', 'flag': '🇮🇳'},
        {'code': 'bengali', 'name': 'বাংলা', 'flag': '🇮🇳'},
        {'code': 'marathi', 'name': 'मराठी', 'flag': '🇮🇳'},
        {'code': 'punjabi', 'name': 'ਪੰਜਾਬੀ', 'flag': '🇮🇳'},
        {'code': 'gujarati', 'name': 'ગુજરાતી', 'flag': '🇮🇳'},
        {'code': 'kannada', 'name': 'ಕನ್ನಡ', 'flag': '🇮🇳'},
        {'code': 'malayalam', 'name': 'മലയാളം', 'flag': '🇮🇳'},
        {'code': 'odia', 'name': 'ଓଡ଼ିଆ', 'flag': '🇮🇳'},
        {'code': 'assamese', 'name': 'অসমীয়া', 'flag': '🇮🇳'},
        {'code': 'urdu', 'name': 'اردو', 'flag': '🇮🇳'},
        {'code': 'kashmiri', 'name': 'कॉशुर', 'flag': '🇮🇳'},
        {'code': 'sindhi', 'name': 'سنڌي', 'flag': '🇮🇳'},
        {'code': 'manipuri', 'name': 'ꯃꯤꯇꯩꯂꯣꯟ', 'flag': '🇮🇳'},
        {'code': 'bodo', 'name': 'बर\'', 'flag': '🇮🇳'},
        {'code': 'konkani', 'name': 'कोंकणी', 'flag': '🇮🇳'},
        {'code': 'sanskrit', 'name': 'संस्कृतम्', 'flag': '🇮🇳'},
        {'code': 'maithili', 'name': 'मैथिली', 'flag': '🇮🇳'},
        {'code': 'santali', 'name': 'ᱥᱟᱱᱛᱟᱲᱤ', 'flag': '🇮🇳'},
        {'code': 'dogri', 'name': 'डोगरी', 'flag': '🇮🇳'},
        {'code': 'nepali', 'name': 'नेपाली', 'flag': '🇮🇳'},
      ];

  bool isRTL() =>
      const {LanguageKey.urdu, LanguageKey.sindhi}.contains(_currentLanguage);

  String getLanguageClass() =>
      'language-${_currentLanguage.name}${isRTL() ? ' rtl-text' : ''}';
}

