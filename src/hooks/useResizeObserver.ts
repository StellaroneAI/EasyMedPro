import { useEffect } from 'react';
import { App } from '@capacitor/app';

export function useResizeObserver(ref: React.RefObject<Element>, callback: () => void) {
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(() => callback());
    observer.observe(ref.current);

    const resume = App.addListener('resume', () => callback());

    return () => {
      observer.disconnect();
      resume.remove();
    };
  }, [ref, callback]);
}

export default useResizeObserver;
