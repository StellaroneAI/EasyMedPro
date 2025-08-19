import { useState } from 'react';
import useVoice from '@/hooks/useVoice';

export default function AIHealthAssistant() {
  const { listening, start, stop, speak } = useVoice();
  const [text, setText] = useState('');

  const handleStart = async () => {
    const result = await start();
    if (result) {
      const spoken = Array.isArray(result) ? result.join(' ') : String(result);
      setText(spoken);
    }
  };

  const handleStop = async () => {
    await stop();
  };

  const handleSpeak = () => {
    if (text) speak(text);
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex space-x-2">
        <button onClick={listening ? handleStop : handleStart}>
          {listening ? 'Stop' : 'Start'}
        </button>
        <button onClick={handleSpeak} disabled={!text}>
          Speak
        </button>
      </div>
      <textarea
        className="border p-2"
        value={text}
        placeholder="Speech will appear here"
        readOnly
      />
    </div>
  );
}

