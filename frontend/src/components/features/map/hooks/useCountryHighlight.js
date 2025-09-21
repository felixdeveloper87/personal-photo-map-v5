import { useState, useEffect } from 'react';
import { selectHighlightCountries } from '../../../../styles/mapStyles';

export const useCountryHighlight = (isLoggedIn, countriesWithPhotos) => {
  const [highlightedCountries, setHighlightedCountries] = useState([]);
  const [isEffectActive, setIsEffectActive] = useState(false);
  const [highlightIntensity, setHighlightIntensity] = useState(1);

  // Efeito de piscar para usuários não logados
  useEffect(() => {
    if (!isLoggedIn) {
      // Força o início do efeito imediatamente
      setIsEffectActive(true);
      setHighlightIntensity(1.2);

      const interval = setInterval(() => {
        setIsEffectActive(prev => {
          const newState = !prev;
          return newState;
        });

        setHighlightIntensity(prev => {
          const newIntensity = prev === 1 ? 1.2 : 1;
          return newIntensity;
        });
      }, 2000); // Pisca a cada 2 segundos

      return () => {
        clearInterval(interval);
      };
    } else {
      setIsEffectActive(false);
      setHighlightIntensity(1);
    }
  }, [isLoggedIn]);

  // Seleção de países para destacar
  useEffect(() => {
    if (!isLoggedIn && isEffectActive) {
      const randomCountries = selectHighlightCountries(countriesWithPhotos);
      setHighlightedCountries(randomCountries);
    } else {
      setHighlightedCountries([]);
    }
  }, [isLoggedIn, isEffectActive, countriesWithPhotos]);

  return { 
    highlightedCountries, 
    isEffectActive, 
    highlightIntensity 
  };
};
