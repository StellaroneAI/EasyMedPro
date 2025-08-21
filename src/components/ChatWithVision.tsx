import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, Send, XCircle, Bot } from 'lucide-react';
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera';
import { toast } from 'react-hot-toast';
import imageCompression from 'browser-image-compression';

import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/Label';
import { Progress } from '@/components/ui/Progress';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { analyzeImage } from '@/services/visionProvider';

// MOCK: In a real app, this would come from an auth context
const MOCK_USER_ID = 'user_123_abc';

type AnalysisStatus = 'idle' | 'uploading' | 'analyzing' | 'success' | 'error';

// Mock upload function to avoid firebase dependency for this PR.
// In a real app, this would be replaced by a call to a storage service.
const mockUploadImageForAnalysis = (
  _file: File,
  _userId: string,
  onProgress: (progress: number) => void
): Promise<{ storagePath: string }> => {
  return new Promise(resolve => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      onProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        resolve({ storagePath: `patients/${_userId}/uploads/mock_image.jpg` });
      }
    }, 200);
  });
};

export const ChatWithVision = () => {
  const { t } = useTranslation('dashboard');
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  const handleImageSelect = async () => {
    try {
      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Prompt, // Prompt user for Camera or Gallery
      });

      if (image.webPath) {
        const originalBlob = await (await fetch(image.webPath)).blob();
        const originalFile = new File([originalBlob], `capture.${image.format}`, { type: originalBlob.type });

        // Compress the image before setting it in state
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };

        toast.promise(imageCompression(originalFile, options), {
          loading: t('chat.compressingImage'),
          success: (compressedFile) => {
            setImageFile(compressedFile);
            return t('chat.compressingSuccess');
          },
          error: t('chat.compressingError'),
        });

        setImagePreview(image.webPath);
        setAnalysisResult(null); // Reset previous results
        setStatus('idle');
      }
    } catch (error: any) {
      if (error.message?.includes('cancelled')) return;
      console.error('Error selecting image:', error);
      toast.error(t('chat.imageSelectError'));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !consent) return;

    setStatus('uploading');
    setUploadProgress(0);
    setAnalysisResult(null);

    try {
      const { storagePath } = await mockUploadImageForAnalysis(imageFile, MOCK_USER_ID, setUploadProgress);
      
      setStatus('analyzing');
      const result = await analyzeImage(storagePath);
      setAnalysisResult(result);
      setStatus('success');
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error(t('chat.analysisError'));
      setStatus('error');
    }
  };

  const isSubmitting = status === 'uploading' || status === 'analyzing';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bot className="mr-2 h-6 w-6" />
          {t('chat.title')}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {status === 'analyzing' && <Skeleton className="h-24 w-full" />}
          {analysisResult && (
            <div className="p-4 bg-secondary rounded-lg text-sm space-y-2">
              <p><strong>{t('chat.results.summary')}:</strong> {analysisResult.summary}</p>
              <p><strong>{t('chat.results.confidence')}:</strong> {analysisResult.confidence}</p>
              <p className="text-xs text-muted-foreground pt-2">{analysisResult.disclaimer}</p>
            </div>
          )}

          {imagePreview && (
            <div className="relative w-40 h-40">
              <img src={imagePreview} alt="Selected preview" className="rounded-lg object-cover w-full h-full" />
              <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-7 w-7 rounded-full" onClick={removeImage}>
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
          )}

          {status === 'uploading' && <Progress value={uploadProgress} />}

          <div className="flex items-start space-x-4">
            <Textarea placeholder={t('chat.textPlaceholder')} value={text} onChange={(e) => setText(e.target.value)} disabled={isSubmitting} />
            <Button type="button" size="icon" onClick={handleImageSelect} disabled={isSubmitting}>
              <Camera className="h-5 w-5" />
              <span className="sr-only">{t('chat.uploadImage')}</span>
            </Button>
          </div>

          {imageFile && (
            <div className="items-top flex space-x-2 pt-2">
              <Checkbox id="consent" checked={consent} onCheckedChange={(checked) => setConsent(Boolean(checked))} disabled={isSubmitting} />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="consent" className="cursor-pointer">{t('chat.consentLabel')}</Label>
                <p className="text-sm text-muted-foreground">{t('chat.consentDisclaimer')}</p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={!imageFile || !consent || isSubmitting}>
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? t('chat.analyzing') : t('chat.analyzeButton')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};