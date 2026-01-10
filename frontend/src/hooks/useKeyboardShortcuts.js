import { useEffect } from 'react';

/**
 * Хук для обработки клавиатурных сокращений
 * @param {Object} shortcuts - объект с комбинациями клавиш и обработчиками
 * @param {Array} deps - зависимости для useEffect
 * 
 * @example
 * useKeyboardShortcuts({
 *   'ctrl+n': () => onCreateNote(),
 *   'ctrl+s': (e) => { e.preventDefault(); onSave(); },
 *   'escape': () => onCancel(),
 * }, [onCreateNote, onSave, onCancel]);
 */
export const useKeyboardShortcuts = (shortcuts, deps = []) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? event.metaKey : event.ctrlKey;
      const altKey = event.altKey;
      const shiftKey = event.shiftKey;

      // Формируем строку комбинации клавиш
      let combination = '';
      if (ctrlKey) combination += 'ctrl+';
      if (altKey) combination += 'alt+';
      if (shiftKey) combination += 'shift+';
      combination += key;

      // Проверяем, есть ли обработчик для этой комбинации
      const handler = shortcuts[combination];
      if (handler) {
        event.preventDefault();
        handler(event);
        return;
      }

      // Также проверяем без модификаторов
      if (shortcuts[key]) {
        event.preventDefault();
        shortcuts[key](event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortcuts, ...deps]);
};







