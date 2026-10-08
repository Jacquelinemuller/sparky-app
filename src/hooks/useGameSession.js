import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';

const UI_TICK_MS = 1000;
const SAVE_TICK_MS = 5000;

function getTodayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function useGameSession(gameId, isActive) {
  const {
    state,
    consumeGameTime,
    maxDailyPlayMinutes
  } = useApp();

  const [sessionActive, setSessionActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [dailySecondsLeft, setDailySecondsLeft] = useState(0);
  const [blockReason, setBlockReason] = useState(null);
  const [sessionKey, setSessionKey] = useState(0);

  const elapsedSecondsRef = useRef(0);
  const lastSavedSecondsRef = useRef(0);
  const initialBalanceSecondsRef = useRef(0);
  const initialDailyLeftSecondsRef = useRef(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!isActive || !gameId) {
      setSessionActive(false);
      setBlockReason(null);
      setSecondsLeft(0);
      setDailySecondsLeft(0);
      return;
    }

    const today = getTodayKey();
    const balance = (state.gameBalances || {})[gameId] || 0;
    const dailyUsed = state.dailyPlayDate === today ? (state.dailyPlayMinutes || 0) : 0;
    const dailyLeft = Math.max(0, maxDailyPlayMinutes - dailyUsed);

    if (balance <= 0) {
      setBlockReason('no-balance');
      setSessionActive(false);
      return;
    }
    if (dailyLeft <= 0) {
      setBlockReason('no-daily');
      setSessionActive(false);
      return;
    }

    elapsedSecondsRef.current = 0;
    lastSavedSecondsRef.current = 0;
    initialBalanceSecondsRef.current = balance * 60;
    initialDailyLeftSecondsRef.current = dailyLeft * 60;

    setSecondsLeft(balance * 60);
    setDailySecondsLeft(dailyLeft * 60);
    setBlockReason(null);
    setSessionActive(true);
  }, [isActive, gameId, sessionKey, maxDailyPlayMinutes, state.gameBalances, state.dailyPlayDate, state.dailyPlayMinutes]);

  useEffect(() => {
    if (!sessionActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      elapsedSecondsRef.current += 1;

      const elapsed = elapsedSecondsRef.current;
      const balanceLeft = initialBalanceSecondsRef.current - elapsed;
      const dailyLeft = initialDailyLeftSecondsRef.current - elapsed;

      setSecondsLeft(Math.max(0, Math.round(balanceLeft)));
      setDailySecondsLeft(Math.max(0, Math.round(dailyLeft)));

      if (balanceLeft <= 0 || dailyLeft <= 0) {
        const toSave = elapsedSecondsRef.current - lastSavedSecondsRef.current;
        if (toSave > 0) {
          consumeGameTime(gameId, toSave / 60);
          lastSavedSecondsRef.current = elapsedSecondsRef.current;
        }
        setSessionActive(false);
        setBlockReason(balanceLeft <= 0 ? 'no-balance' : 'no-daily');
        return;
      }

      const secondsSinceLastSave = elapsedSecondsRef.current - lastSavedSecondsRef.current;
      if (secondsSinceLastSave * 1000 >= SAVE_TICK_MS) {
        consumeGameTime(gameId, secondsSinceLastSave / 60);
        lastSavedSecondsRef.current = elapsedSecondsRef.current;
      }
    }, UI_TICK_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sessionActive, gameId, consumeGameTime]);

  const endSession = useCallback(() => {
    const toSave = elapsedSecondsRef.current - lastSavedSecondsRef.current;
    if (toSave > 0) {
      consumeGameTime(gameId, toSave / 60);
      lastSavedSecondsRef.current = elapsedSecondsRef.current;
    }
    setSessionActive(false);
  }, [gameId, consumeGameTime]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      const toSave = elapsedSecondsRef.current - lastSavedSecondsRef.current;
      if (toSave > 0 && sessionActive) {
        consumeGameTime(gameId, toSave / 60);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (totalSeconds) => {
    const s = Math.max(0, totalSeconds);
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
  };

  return {
    sessionActive,
    secondsLeft,
    dailySecondsLeft,
    formattedTime: formatTime(secondsLeft),
    formattedDaily: formatTime(dailySecondsLeft),
    blockReason,
    endSession,
    restart: () => setSessionKey((k) => k + 1)
  };
}