import { useCountUp } from '@/hooks/useCountUp';

interface NumberCounterProps {
  end: number;
  suffix?: string;
  duration?: number;
  decimals?: number;
  className?: string;
}

const NumberCounter = ({ end, suffix = '', duration = 2000, decimals = 0, className = '' }: NumberCounterProps) => {
  const { ref, value } = useCountUp({ end, suffix, duration, decimals });

  return (
    <div 
      ref={ref} 
      className={`animate-number ${className}`}
    >
      {value}
    </div>
  );
};

export default NumberCounter;