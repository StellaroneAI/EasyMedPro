import { Capacitor } from '@capacitor/core';
import { SpeechRecognition, SpeechRecognitionResult } from '@capacitor-community/speech-recognition';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

// --- Type Definitions ---
interface StartListeningOptions {
  language: string;
  onResult: (transcription: string) => void;
  onEndOfSpeech: () => void;
  onError: (error: string) => void;
}

interface SpeakOptions {
  text: string;
  language: string;
}

// --- Web Speech API Fallback ---
const webSpeech = {
  recognition: (window.SpeechRecognition || window.webkitSpeechRecognition) ? new (window.SpeechRecognition || window.webkitSpeechRecognition)() : null,
  synthesis: window.speechSynthesis,

  isSupported: () => !!webSpeech.recognition && !!webSpeech.synthesis,

  startListening: async (options: StartListeningOptions) => {
    if (!webSpeech.recognition) {
      options.onError('Speech recognition not supported on this browser.');
      return;
    }
    webSpeech.recognition.lang = options.language;
    webSpeech.recognition.interimResults = true;
    webSpeech.recognition.continuous = false; // We want it to stop after one utterance

    webSpeech.recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        options.onResult(finalTranscript);
      }
    };

    webSpeech.recognition.onend = () => {
      options.onEndOfSpeech();
    };
    
    webSpeech.recognition.onerror = (event: any) => {
        options.onError(event.error);
    };

    webSpeech.recognition.start();
  },

  stopListening: async () => {
    if (webSpeech.recognition) {
      webSpeech.recognition.stop();
    }
  },

  speak: async (options: SpeakOptions) => {
    if (!webSpeech.synthesis) return;
    const utterance = new SpeechSynthesisUtterance(options.text);
    utterance.lang = options.language;
    webSpeech.synthesis.speak(utterance);
  },
};

// --- Capacitor Native Implementation ---
const capacitorSpeech = {
  isSupported: () => Capacitor.isNativePlatform(),

  requestPermission: async (): Promise<boolean> => {
    const { status } = await SpeechRecognition.requestPermission();
    return status === 'granted';
  },

  startListening: async (options: StartListeningOptions) => {
    const hasPermission = await capacitorSpeech.requestPermission();
    if (!hasPermission) {
      options.onError('Permission denied');
      return;
    }

    SpeechRecognition.start({
      language: options.language,
      partialResults: true,
      popup: false, // We have our own UI
    });

    SpeechRecognition.addListener('partialResults', (data: SpeechRecognitionResult) => {
      if (data.matches && data.matches.length > 0) {
        // On native, we often get a final result here and can stop.
        options.onResult(data.matches[0]);
        SpeechRecognition.stop();
        options.onEndOfSpeech();
      }
    });
  },

  stopListening: async () => {
    await SpeechRecognition.stop();
  },

  speak: async (options: SpeakOptions) => {
    await TextToSpeech.speak(options);
  },
};

// --- Export the correct implementation ---
const useNative = Capacitor.isNativePlatform();

export const speechService = {
  isSupported: useNative ? capacitorSpeech.isSupported : webSpeech.isSupported,
  requestPermission: useNative ? capacitorSpeech.requestPermission : async () => true, // Web requests permission on start
  startListening: useNative ? capacitorSpeech.startListening : webSpeech.startListening,
  stopListening: useNative ? capacitorSpeech.stopListening : webSpeech.stopListening,
  speak: useNative ? capacitorSpeech.speak : webSpeech.speak,
};