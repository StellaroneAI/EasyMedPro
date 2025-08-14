import 'dart:convert';

import 'package:http/http.dart' as http;

/// A simple wrapper around text-generation APIs such as OpenAI or AI4Bharat.
class AiService {
  /// API key for authentication.
  final String apiKey;

  /// Endpoint for text-generation requests.
  final String baseUrl;

  AiService({required this.apiKey, required this.baseUrl});

  /// Sends [prompt] to the configured API and returns the generated text.
  Future<String> generateText(String prompt) async {
    final response = await http.post(
      Uri.parse(baseUrl),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $apiKey',
      },
      body: jsonEncode({'prompt': prompt}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      // Both OpenAI and AI4Bharat return the generated text in `text` or `data`.
      return data['text'] ?? data['data']?['text'] ?? '';
    } else {
      throw Exception('Failed to generate text: ${response.statusCode}');
    }
  }
}
