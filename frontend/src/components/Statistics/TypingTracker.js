import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../api/api';

const useTypingTracker = (noteId, onSpeedUpdate) => {
  const [sessionId, setSessionId] = useState(null);
  const [charactersTyped, setCharactersTyped] = useState(0);
  const [wordsTyped, setWordsTyped] = useState(0);
  const [typingSpeedWPM, setTypingSpeedWPM] = useState(0);
  const [typingSpeedCPM, setTypingSpeedCPM] = useState(0);
  const startTimeRef = useRef(null);
  const keystrokeTimerRef = useRef(null);
  const lastKeystrokeTimeRef = useRef(null);

  // Начать сессию печати
  const startSession = useCallback(async () => {
    try {
      const response = await api.post('/typing-sessions/start/', {
        note_id: noteId || null
      });
      if (response.data && response.data.session_id) {
        setSessionId(response.data.session_id);
        startTimeRef.current = new Date();
        lastKeystrokeTimeRef.current = new Date();
      }
    } catch (error) {
      console.error('Error starting typing session:', error);
    }
  }, [noteId]);

  // Завершить сессию печати
  const endSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      await api.post('/typing-sessions/end/', {
        session_id: sessionId,
        characters_typed: charactersTyped,
        words_typed: wordsTyped,
        errors_count: 0
      });
      setSessionId(null);
      setCharactersTyped(0);
      setWordsTyped(0);
      setTypingSpeedWPM(0);
      setTypingSpeedCPM(0);
      startTimeRef.current = null;
    } catch (error) {
      console.error('Error ending typing session:', error);
    }
  }, [sessionId, charactersTyped, wordsTyped]);

  // Отслеживание нажатий клавиш
  const handleKeystroke = useCallback((text) => {
    if (!sessionId && !startTimeRef.current) {
      startSession();
    }

    const newCharacters = text.length;
    const newWords = text.trim().split(/\s+/).filter(word => word.length > 0).length;

    setCharactersTyped(newCharacters);
    setWordsTyped(newWords);

    // Рассчитываем скорость в реальном времени
    if (startTimeRef.current) {
      const now = new Date();
      const duration = (now - startTimeRef.current) / 1000 / 60; // в минутах
      
      if (duration > 0) {
        const wpm = newWords / duration;
        const cpm = newCharacters / duration;
        setTypingSpeedWPM(Math.round(wpm));
        setTypingSpeedCPM(Math.round(cpm));

        if (onSpeedUpdate) {
          onSpeedUpdate({ wpm: Math.round(wpm), cpm: Math.round(cpm) });
        }
      }
    }

    // Отправляем данные на сервер каждые 5 секунд
    lastKeystrokeTimeRef.current = new Date();
    
    if (keystrokeTimerRef.current) {
      clearTimeout(keystrokeTimerRef.current);
    }

    keystrokeTimerRef.current = setTimeout(async () => {
      if (sessionId) {
        try {
          await api.post('/typing-sessions/keystroke/', {
            session_id: sessionId,
            characters_typed: newCharacters,
            words_typed: newWords
          });
        } catch (error) {
          console.error('Error sending keystroke data:', error);
        }
      }
    }, 5000);
  }, [sessionId, onSpeedUpdate, startSession]);

  // Автоматическое завершение сессии при размонтировании
  useEffect(() => {
    return () => {
      if (keystrokeTimerRef.current) {
        clearTimeout(keystrokeTimerRef.current);
      }
      endSession();
    };
  }, [endSession]);

  // Автоматическое завершение сессии при отсутствии активности (30 секунд)
  useEffect(() => {
    if (!sessionId) return;

    const inactivityTimer = setInterval(() => {
      if (lastKeystrokeTimeRef.current) {
        const timeSinceLastKeystroke = (new Date() - lastKeystrokeTimeRef.current) / 1000;
        if (timeSinceLastKeystroke > 30) {
          endSession();
        }
      }
    }, 10000); // Проверяем каждые 10 секунд

    return () => clearInterval(inactivityTimer);
  }, [sessionId, endSession]);

  return {
    handleKeystroke,
    typingSpeedWPM,
    typingSpeedCPM,
    charactersTyped,
    wordsTyped,
    endSession
  };
};

export default useTypingTracker;

