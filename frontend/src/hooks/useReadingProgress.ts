import { useEffect, useState } from 'react';

/**
 * Retorna o progresso de leitura (0–100) baseado na posição de scroll
 * em relação ao elemento alvo (por padrão, o document inteiro).
 */
export function useReadingProgress(targetRef?: React.RefObject<HTMLElement>): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function calculate() {
      const el = targetRef?.current;
      if (el) {
        const { top, height } = el.getBoundingClientRect();
        const viewH = window.innerHeight;
        const scrolled = Math.max(0, -top);
        const total    = Math.max(1, height - viewH);
        setProgress(Math.min(100, (scrolled / total) * 100));
      } else {
        const scrolled = window.scrollY;
        const total    = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(total <= 0 ? 100 : Math.min(100, (scrolled / total) * 100));
      }
    }

    window.addEventListener('scroll', calculate, { passive: true });
    calculate(); // valor inicial
    return () => window.removeEventListener('scroll', calculate);
  }, [targetRef]);

  return Math.round(progress);
}
