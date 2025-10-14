import { useCallback, useRef } from 'react';

export const useSmoothScroll = () => {
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const smoothScrollToBottom = useCallback((element: HTMLElement | null, delay = 50) => {
    if (!element) return;

    // Clear any existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Use requestAnimationFrame for smoother scrolling
    scrollTimeoutRef.current = setTimeout(() => {
      requestAnimationFrame(() => {
        element.scrollTo({
          top: element.scrollHeight,
          behavior: 'smooth'
        });
      });
    }, delay);
  }, []);

  const instantScrollToBottom = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    
    requestAnimationFrame(() => {
      element.scrollTop = element.scrollHeight;
    });
  }, []);

  return {
    smoothScrollToBottom,
    instantScrollToBottom
  };
};