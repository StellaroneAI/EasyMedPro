import { useState } from 'react';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

export function useVoice() {
  const [listening, setListening] = useState(false);

  const speak = async (text: string, lang: string = 'en-US') => {
    await TextToSpeech.speak({ text, lang, rate: 1.0 });
  };

  const start = async (lang: string = 'en-US') => {
    setListening(true);
    const { value } = await SpeechRecognition.start({ language: lang, popup: false });
    return value;
  };

  const stop = async () => {
    await SpeechRecognition.stop();
    setListening(false);
  };

  return { listening, start, stop, speak };
}

export default useVoice;
