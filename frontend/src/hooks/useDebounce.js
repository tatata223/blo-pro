import { useState, useEffect } from 'react';

/**
 * Хук для debounce значения
 * @param {any} value - значение для debounce
 * @param {number} delay - задержка в миллисекундах
 * @returns {any} - debounced значение
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};







