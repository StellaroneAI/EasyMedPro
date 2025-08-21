import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, PlayCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { speechService } from '@/utils/speech';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

type PermissionState = 'prompt' | 'granted' | 'denied';

export const VoiceAssistant = () => {
  const { t, i18n } = useTranslation('common');
  const [permission, setPermission] = useState<PermissionState>('prompt');
  const [isListening, setIsListening] = useState(false);
  const [hasWelcomed, setHasWelcomed] = useState(false);

  // Check initial permission status on mount for Capacitor
  useEffect(() => {
    if (speechService.isSupported()) {
      speechService.requestPermission?.().then(granted => {
        if (granted) setPermission('granted');
      });
    }
  }, []);

  const handleWelcome = async () => {
    if (!speechService.isSupported()) {
      toast.error(t('voice.notSupported'));
      return;
    }

    const granted = await speechService.requestPermission?.();
    if (!granted) {
      setPermission('denied');
      toast.error(t('voice.permissionDenied'));
      return;
    }
    
    setPermission('granted');
    setHasWelcomed(true);
    await speechService.speak({
      text: t('voice.welcomeMessage'),
      language: i18n.language,
    });
  };

  const handleToggleListening = async () => {
    if (isListening) {
      await speechService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      await speechService.startListening({
        language: i18n.language,
        onResult: (transcription) => {
          console.log('User said:', transcription);
          // In a real app, you would process the command here.
          // For this scaffold, we just show a toast.
          toast(`You said: ${transcription}`);
        },
        onEndOfSpeech: () => {
          setIsListening(false);
        },
        onError: (error) => {
          console.error('Speech recognition error:', error);
          if (error !== 'no-match') { // "no-match" is common, don't always toast it
            toast.error(t('voice.error'));
          }
          setIsListening(false);
        }
      });
    }
  };

  if (!hasWelcomed) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button onClick={handleWelcome} size="lg" className="rounded-full shadow-lg">
          <PlayCircle className="mr-2 h-5 w-5" />
          {t('voice.tapToWelcome')}
        </Button>
      </div>
    );
  }

  if (permission !== 'granted') {
    return null; // Don't show the mic if permission is denied after the welcome attempt.
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={handleToggleListening}
        size="icon"
        className={cn(
          'rounded-full h-14 w-14 shadow-lg transition-all duration-300',
          isListening ? 'bg-red-500 hover:bg-red-600 scale-110' : 'bg-primary hover:bg-primary/90'
        )}
        aria-label={isListening ? t('voice.stopListening') : t('voice.startListening')}
      >
        {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
      </Button>
    </div>
  );
};