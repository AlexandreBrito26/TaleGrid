import { useEffect, useState } from 'react';

export function useReadingProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function calculate() {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total <= 0 ? 100 : Math.min(100, (scrolled / total) * 100));
    }

    window.addEventListener('scroll', calculate, { passive: true });
    calculate();
    return () => window.removeEventListener('scroll', calculate);
  }, []);

  return Math.round(progress);
}
