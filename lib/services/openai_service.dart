import 'dart:typed_data';
import 'package:dart_openai/dart_openai.dart';

class EnhancedVoiceService {
  EnhancedVoiceService() {
    OpenAI.apiKey = const String.fromEnvironment('OPENAI_API_KEY');
  }

  Future<String> speechToText(Uint8List audioBytes, {String? language}) async {
    try {
      final file = OpenAIFile.fromBytes(audioBytes, filename: 'audio.webm');
      final transcription = await OpenAI.instance.audio.transcriptions.create(
        file: file,
        model: 'whisper-1',
        language: _getWhisperLanguageCode(language),
        responseFormat: 'text',
        temperature: 0.1,
      );
      return transcription.text;
    } catch (e) {
      throw Exception('Failed to transcribe audio');
    }
  }

  Future<Uint8List> textToSpeech(String text, {String language = 'english'}) async {
    try {
      final voice = _getOptimalVoice(language);
      final response = await OpenAI.instance.audio.speech.create(
        model: 'tts-1-hd',
        voice: voice,
        input: text,
        responseFormat: 'mp3',
        speed: 0.9,
      );
      return response.file.bytes;
    } catch (e) {
      throw Exception('Failed to generate speech');
    }
  }

  Future<String> processHealthQuery(String query, {String language = 'english', Map<String, dynamic> context = const {}}) async {
    try {
      final completion = await OpenAI.instance.chat.create(
        model: 'gpt-4',
        messages: [
          OpenAIChatCompletionChoiceMessage(role: 'system', content: _getSystemPrompt(language, context)),
          OpenAIChatCompletionChoiceMessage(role: 'user', content: query),
        ],
        maxTokens: 500,
        temperature: 0.7,
      );
      return completion.choices.first.message.content ?? 'I apologize, I could not process your request.';
    } catch (e) {
      throw Exception('Failed to process health query');
    }
  }

  String _getOptimalVoice(String language) {
    const voiceMapping = {
      'english': 'nova',
      'hindi': 'alloy',
      'tamil': 'shimmer',
      'telugu': 'alloy',
      'bengali': 'echo',
      'marathi': 'nova',
      'punjabi': 'fable',
      'gujarati': 'shimmer',
      'kannada': 'nova',
      'malayalam': 'alloy',
      'odia': 'echo',
      'assamese': 'fable',
    };
    return voiceMapping[language] ?? 'nova';
  }

  String? _getWhisperLanguageCode(String? language) {
    if (language == null) return null;
    const codes = {
      'english': 'en',
      'hindi': 'hi',
      'tamil': 'ta',
      'telugu': 'te',
      'bengali': 'bn',
      'marathi': 'mr',
      'punjabi': 'pa',
      'gujarati': 'gu',
      'kannada': 'kn',
      'malayalam': 'ml',
      'odia': 'or',
      'assamese': 'as',
    };
    return codes[language];
  }

  String _getSystemPrompt(String language, Map<String, dynamic> context) {
    const prompts = {
      'english': 'You are EasyMedPro\'s AI health assistant. Provide helpful, accurate health information in simple English. Keep responses concise (2-3 sentences). Always recommend consulting healthcare professionals for serious concerns.',
      'hindi': 'आप EasyMedPro के AI स्वास्थ्य सहायक हैं। सरल हिंदी में उपयोगी, सटीक स्वास्थ्य जानकारी प्रदान करें। जवाब संक्षिप्त रखें (2-3 वाक्य)। गंभीर समस्याओं के लिए हमेशा स्वास्थ्य पेशेवरों से सलाह लेने की सिफारिश करें।',
      'tamil': 'நீங்கள் EasyMedPro இன் AI சுகாதார உதவியாளர். எளிய தமிழில் பயனுள்ள, துல்லியமான சுகாதார தகவல்களை வழங்கவும். பதில்களை சுருக்கமாக வைக்கவும் (2-3 வாக்கியங்கள்). தீவிர கவலைகளுக்கு எப்போதும் சுகாதார நிபுணர்களை அணுக பரிந்துரைக்கவும்.',
      'telugu': 'మీరు EasyMedPro యొక్క AI ఆరోగ్య సహాయకులు. సరళమైన తెలుగులో ఉపయోగకరమైన, ఖచ్చితమైన ఆరోగ్య సమాచారాన్ని అందించండి. ప్రతిస్పందనలను సంక్షిప్తంగా ఉంచండి (2-3 వాక్యాలు). తీవ్రమైన ఆందోళనల కోసం ఎల్లప్పుడూ ఆరోగ్య నిపుణులను సంప్రదించాలని సిఫార్సు చేయండి.',
    };
    return prompts[language] ?? prompts['english']!;
  }
}

final voiceService = EnhancedVoiceService();
