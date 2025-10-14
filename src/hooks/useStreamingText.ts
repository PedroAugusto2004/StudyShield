import { useState, useCallback, useRef } from 'react';

export const useStreamingText = () => {
  const [streamingText, setStreamingText] = useState('');
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingTextRef = useRef('');

  const updateStreamingText = useCallback((newText: string) => {
    pendingTextRef.current = newText;

    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Debounce updates for smoother rendering
    updateTimeoutRef.current = setTimeout(() => {
      requestAnimationFrame(() => {
        setStreamingText(pendingTextRef.current);
      });
    }, 16); // ~60fps
  }, []);

  const resetStreamingText = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    pendingTextRef.current = '';
    setStreamingText('');
  }, []);

  return {
    streamingText,
    updateStreamingText,
    resetStreamingText
  };
};