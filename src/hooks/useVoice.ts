import { useEffect, useRef, useState } from 'react';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

export function useVoice() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const permissionRequested = useRef(false);

  useEffect(() => {
    // Listen for partial speech recognition results
    const partialListener = SpeechRecognition.addListener('partialResults', ({ value }) => {
      if (Array.isArray(value)) {
        setTranscript(value.join(' '));
      } else if (typeof value === 'string') {
        setTranscript(value);
      }
    });

    return () => {
      partialListener.remove();
    };
  }, []);

  const speak = async (text: string, lang: string = 'en-US') => {
    await TextToSpeech.speak({ text, lang, rate: 1.0 });
  };

  const ensurePermission = async () => {
    if (!permissionRequested.current) {
      await SpeechRecognition.requestPermission();
      permissionRequested.current = true;
    }
    return SpeechRecognition.hasPermission();
  };

  const start = async (lang: string = 'en-US') => {
    const hasPermission = await ensurePermission();
    if (!hasPermission) {
      return [];
    }

    setTranscript('');
    setListening(true);
    const { value } = await SpeechRecognition.start({ language: lang, popup: false, partialResults: true });
    if (Array.isArray(value)) {
      setTranscript(value.join(' '));
    } else if (typeof value === 'string') {
      setTranscript(value);
    }
    return value;
  };

  const stop = async () => {
    await SpeechRecognition.stop();
    setListening(false);
  };

  return { listening, transcript, start, stop, speak };
}

export default useVoice;
