import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
}

const TypewriterText = ({ text, speed = 100, className = '' }: TypewriterTextProps) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPeriod, setShowPeriod] = useState(false);
  const isComplete = currentIndex >= text.length;

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (isComplete) {
      const periodTimeout = setTimeout(() => {
        setShowPeriod(true);
      }, 500);
      return () => clearTimeout(periodTimeout);
    }
  }, [currentIndex, text, speed, isComplete]);

  return (
    <span className={className}>
      {displayText}
      {!isComplete && (
        <span className="inline-block w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-blue-600 rounded-full animate-pulse ml-1 sm:ml-2 md:ml-3 lg:ml-4 align-baseline"></span>
      )}
      {isComplete && (
        <span 
          className={`inline-block rounded-full ml-1 sm:ml-2 md:ml-3 lg:ml-4 align-baseline transition-all duration-1000 ease-out ${
            showPeriod 
              ? 'w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 bg-blue-600' 
              : 'w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-blue-600'
          }`}
        ></span>
      )}
    </span>
  );
};

export default TypewriterText;