import { useState, useEffect, useRef, useCallback } from 'react';

interface SleepTimerHook {
  isActive: boolean;
  timeRemaining: number;
  isPaused: boolean;
  startTimer: (minutes: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  onTimerComplete: (callback: () => void) => void;
}

export const useSleepTimer = (): SleepTimerHook => {
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef<(() => void) | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimer = useCallback((minutes: number) => {
    clearTimer();
    setTimeRemaining(minutes * 60);
    setIsActive(true);
    setIsPaused(false);

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          setIsPaused(false);
          clearTimer();
          if (onCompleteRef.current) {
            onCompleteRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer]);

  const pauseTimer = useCallback(() => {
    if (isActive && !isPaused) {
      clearTimer();
      setIsPaused(true);
    }
  }, [isActive, isPaused, clearTimer]);

  const resumeTimer = useCallback(() => {
    if (isActive && isPaused && timeRemaining > 0) {
      setIsPaused(false);
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            setIsPaused(false);
            clearTimer();
            if (onCompleteRef.current) {
              onCompleteRef.current();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [isActive, isPaused, timeRemaining, clearTimer]);

  const resetTimer = useCallback(() => {
    clearTimer();
    setIsActive(false);
    setIsPaused(false);
    setTimeRemaining(0);
  }, [clearTimer]);

  const onTimerComplete = useCallback((callback: () => void) => {
    onCompleteRef.current = callback;
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    isActive,
    timeRemaining,
    isPaused,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    onTimerComplete,
  };
};