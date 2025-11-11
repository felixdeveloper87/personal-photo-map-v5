import { useState, useEffect, useRef } from 'react';

/**
 * Hook para medir a altura do header dinamicamente
 * @returns {number} A altura do header em pixels
 */
export const useHeaderHeight = () => {
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef(null);

  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        setHeaderHeight(height);
      }
    };

    // Medir altura inicial
    updateHeaderHeight();

    // Observar mudanças de tamanho (resize, mudanças de conteúdo)
    const resizeObserver = new ResizeObserver(() => {
      updateHeaderHeight();
    });

    if (headerRef.current) {
      resizeObserver.observe(headerRef.current);
    }

    // Também escutar eventos de resize da janela
    window.addEventListener('resize', updateHeaderHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

  return { headerHeight, headerRef };
};

