import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { storageService, getXpFromDifficulty, suggestDifficultyFromTime } from '../services/storageService';
import { audioService } from '../services/audioService';
import confetti from 'canvas-confetti';

const AppContext = createContext();

const PRIORITY_ORDER = { red: 0, yellow: 1, green: 2 };

const MICROSTEP_XP_BONUS = 2;

const MAX_DAILY_PLAY_MINUTES = 30;

// ============================================
// MAPEO RETO → JUEGO
// ============================================
const CHALLENGE_TO_GAME = {
  'ch-organizacion-escolar': 'simon',
  'ch-procrastinacion-5min': 'minesweeper',
};

// ============================================
// REGLAS DEL COFRE
// ============================================
const CHEST_MIN_DAYS_FOR_FULL_REWARD = 3;
const CHEST_MINUTES_FULL = 20;
const CHEST_MINUTES_PARTIAL = 5;

function getTodayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getTodayKeyForPlay() {
  return getTodayKey();
}

function getNextMonday() {
  const now = new Date();
  const day = now.getDay();

  if (day === 1) {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  const target = new Date(now);
  target.setDate(target.getDate() + daysUntilMonday);

  const y = target.getFullYear();
  const m = String(target.getMonth() + 1).padStart(2, '0');
  const d = String(target.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDaysSinceStart(startDate) {
  if (!startDate) return -1;
  const start = new Date(startDate + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

function getChallengeTimeStatus(challenge) {
  if (!challenge || !challenge.startDate) return 'pending';
  const diffDays = getDaysSinceStart(challenge.startDate);
  const duration = challenge.durationDays || 14;
  if (diffDays < 0) return 'pending';
  if (diffDays < 7) return 'primary';
  if (diffDays < duration) return 'background';
  return 'closed';
}

function countCompletedDays(challenge) {
  if (!challenge) return 0;
  return Object.values(challenge.checkIns || {}).filter(
    (v) => v === 'si' || v === 'masOMenos'
  ).length;
}

function sortTasksByPriority(tasks) {
  return [...tasks].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority] ?? 1;
    const pb = PRIORITY_ORDER[b.priority] ?? 1;
    if (pa !== pb) return pa - pb;
    const oa = a.order ?? parseInt(a.id) ?? 0;
    const ob = b.order ?? parseInt(b.id) ?? 0;
    return oa - ob;
  });
}

function recomputeStatus(tasks) {
  const completed = tasks.filter((t) => t.status === 'completed');
  const pending = sortTasksByPriority(tasks.filter((t) => t.status !== 'completed'));

  const recomputed = pending.map((t, i) => ({
    ...t,
    status: i === 0 ? 'active' : 'queued'
  }));

  return [...recomputed, ...completed];
}

function grantReward(stats, amount) {
  return {
    ...stats,
    xp: (stats.xp || 0) + amount,
    coins: (stats.coins || 0) + amount
  };
}

export const AppProvider = ({ children }) => {
  const [state, setState] = useState(() => storageService.get());

  const [celebration, setCelebration] = useState(null);
  const [sparkyNudge, setSparkyNudge] = useState(null);
  const [activeTab, setActiveTab] = useState('today');
  const [activeScreen, setActiveScreen] = useState('none');

  const lastActivityRef = useRef(Date.now());

  useEffect(() => {
    const checkDailyReset = () => {
      const today = getTodayKey();
      setState((prev) => {
        if (prev.lastResetDate === today) return prev;

        const completedToday = prev.tasks.filter((t) => t.status === 'completed').length;
        const xpEarnedToday = prev.tasks
          .filter((t) => t.status === 'completed')
          .reduce((sum, t) => sum + (t.xpReward || 0), 0);

        const newHistory = [...(prev.dailyHistory || [])];
        if (prev.lastResetDate && completedToday > 0) {
          newHistory.push({
            date: prev.lastResetDate,
            completedCount: completedToday,
            xpEarned: xpEarnedToday
          });
        }
        const trimmedHistory = newHistory.slice(-30);

        const remaining = prev.tasks.filter((t) => t.status !== 'completed');
        const recomputed = recomputeStatus(remaining);

        return {
          ...prev,
          tasks: recomputed,
          stats: { ...prev.stats, tasksCompletedToday: 0 },
          lastResetDate: today,
          dailyHistory: trimmedHistory
        };
      });
    };

    checkDailyReset();
    const interval = setInterval(checkDailyReset, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    storageService.save(state);
  }, [state]);

  useEffect(() => {
    audioService.setEnabled(state.settings.soundEnabled);
  }, [state.settings.soundEnabled]);

  // ============================================
  // EFECTO 1: DETECTAR RETOS AL DÍA 7 Y DISPARAR COFRE
  // ============================================
  useEffect(() => {
    const challenges = state.activeChallenges || [];
    if (challenges.length === 0) return;

    let triggeredChest = null;
    const updated = challenges.map((c) => {
      if (c.daySevenReached) return c;

      const daysSinceStart = getDaysSinceStart(c.startDate);
      if (daysSinceStart < 7) return c;

      const completedDays = countCompletedDays(c);
      const gameId = CHALLENGE_TO_GAME[c.id];

      if (!gameId) {
        return { ...c, daySevenReached: true };
      }

      if (state.pendingChest) {
        return { ...c, daySevenReached: true };
      }

      const minutes = completedDays >= CHEST_MIN_DAYS_FOR_FULL_REWARD
        ? CHEST_MINUTES_FULL
        : CHEST_MINUTES_PARTIAL;

      triggeredChest = {
        gameId,
        minutes,
        challengeId: c.id,
        challengeTitle: c.title,
        challengeIcon: c.icon,
        completedDays,
        createdAt: Date.now()
      };

      return { ...c, daySevenReached: true };
    });

    const hasChanges = updated.some((c, i) => c !== challenges[i]);
    if (!hasChanges && !triggeredChest) return;

    setState((prev) => ({
      ...prev,
      activeChallenges: updated,
      pendingChest: triggeredChest || prev.pendingChest
    }));
  }, [state.activeChallenges, state.pendingChest]);

  // ============================================
  // EFECTO 2: AUTO-ARCHIVADO DE RETOS
  // ============================================
  useEffect(() => {
    const challenges = state.activeChallenges || [];
    if (challenges.length === 0) return;

    const toKeep = [];
    const toArchive = [];
    let partialChest = null;

    challenges.forEach((c) => {
      const status = getChallengeTimeStatus(c);
      if (status === 'closed') {
        if (!c.daySevenReached) {
          const gameId = CHALLENGE_TO_GAME[c.id];
          if (gameId && !state.pendingChest && !partialChest) {
            partialChest = {
              gameId,
              minutes: CHEST_MINUTES_PARTIAL,
              challengeId: c.id,
              challengeTitle: c.title,
              challengeIcon: c.icon,
              completedDays: countCompletedDays(c),
              createdAt: Date.now()
            };
          }
        }
        toArchive.push({ ...c, archivedAt: Date.now(), status: 'archived' });
      } else {
        toKeep.push(c);
      }
    });

    toKeep.sort((a, b) => {
      if (a.startDate !== b.startDate) {
        return (b.startDate || '').localeCompare(a.startDate || '');
      }
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    if (toKeep.length > 2) {
      const extra = toKeep.splice(2);
      extra.forEach((c) => {
        toArchive.push({ ...c, archivedAt: Date.now(), status: 'archived' });
      });
    }

    if (toArchive.length === 0 && !partialChest) return;

    setState((prev) => ({
      ...prev,
      activeChallenges: toKeep,
      archivedChallenges: [...(prev.archivedChallenges || []), ...toArchive],
      pendingChest: partialChest || prev.pendingChest
    }));
  }, [state.activeChallenges, state.pendingChest]);

  useEffect(() => {
    if (!state.settings.reminderNudgeEnabled) return;
    const intervalSeconds = (state.settings.reminderIntervalMinutes || 4) * 60;
    const checkInterval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      if (elapsedSeconds >= intervalSeconds && !sparkyNudge) {
        try { audioService.playReminderNudge(); } catch (e) {}
        const pendingTasks = state.tasks.filter((t) => t.status !== 'completed');
        const name = state.profile.username || 'amiguito';
        let nudgeText = `¡Ey ${name}! 🐾 ¿Hacemos una pausa de 2 minutos o seguimos con una misión?`;
        if (pendingTasks.length > 0) {
          nudgeText = `¡Ey ${name}! Sparky vio que tienes "${pendingTasks[0].title.slice(0, 30)}..." ¿Hacemos solo un micro-paso?`;
        }
        setSparkyNudge({ message: nudgeText, time: Date.now() });
      }
    }, 15000);
    return () => clearInterval(checkInterval);
  }, [
    state.settings.reminderNudgeEnabled,
    state.settings.reminderIntervalMinutes,
    state.profile.username,
    state.tasks,
    sparkyNudge
  ]);

  const recordActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (sparkyNudge) setSparkyNudge(null);
  }, [sparkyNudge]);

  // ==========================================
  // ACCIONES: PERFIL
  // ==========================================
  const setUserName = useCallback((name) => {
    recordActivity();
    setState((prev) => ({ ...prev, profile: { ...prev.profile, username: name } }));
  }, [recordActivity]);

  const setUserAge = useCallback((age) => {
    recordActivity();
    const num = parseInt(age, 10);
    setState((prev) => ({
      ...prev,
      profile: { ...prev.profile, age: isNaN(num) ? prev.profile.age : num }
    }));
  }, [recordActivity]);

  const setUserAvatar = useCallback((avatar) => {
    recordActivity();
    setState((prev) => ({ ...prev, profile: { ...prev.profile, avatar } }));
  }, [recordActivity]);

  // ==========================================
  // ACCIONES: ACCESORIOS
  // ==========================================
  const unlockAccessory = useCallback((accessoryId, cost = 0) => {
    recordActivity();
    try { audioService.playSuccess(); } catch (e) {}
    setState((prev) => {
      if (prev.unlockedAccessories.includes(accessoryId)) return prev;
      if ((prev.stats.coins || 0) < cost) return prev;
      return {
        ...prev,
        unlockedAccessories: [...prev.unlockedAccessories, accessoryId],
        stats: { ...prev.stats, coins: (prev.stats.coins || 0) - cost }
      };
    });
  }, [recordActivity]);

  const equipAccessory = useCallback((slot, accessoryId) => {
    recordActivity();
    try { audioService.playPop(); } catch (e) {}
    setState((prev) => ({
      ...prev,
      equippedAccessories: {
        ...prev.equippedAccessories,
        [slot]: accessoryId
      }
    }));
  }, [recordActivity]);

  const unequipAccessory = useCallback((slot) => {
    recordActivity();
    try { audioService.playClick(); } catch (e) {}
    setState((prev) => ({
      ...prev,
      equippedAccessories: {
        ...prev.equippedAccessories,
        [slot]: null
      }
    }));
  }, [recordActivity]);

  // ==========================================
  // ACCIONES: SETTINGS
  // ==========================================
  const updateSettings = useCallback((newSettings) => {
    recordActivity();
    setState((prev) => ({ ...prev, settings: { ...prev.settings, ...newSettings } }));
  }, [recordActivity]);

  const toggleSound = useCallback(() => {
    recordActivity();
    setState((prev) => {
      const next = !prev.settings.soundEnabled;
      audioService.setEnabled(next);
      if (next) {
        try { audioService.playPop(); } catch (e) {}
      }
      return { ...prev, settings: { ...prev.settings, soundEnabled: next } };
    });
  }, [recordActivity]);

  // ==========================================
  // ACCIONES: XP / COINS
  // ==========================================
  const addXp = useCallback((amount) => {
    recordActivity();
    setState((prev) => ({
      ...prev,
      stats: grantReward(prev.stats, amount)
    }));
  }, [recordActivity]);

  const awardStars = useCallback((amount, reasonTitle) => {
    recordActivity();
    try { audioService.playSuccess(); } catch (e) {}
    try {
      confetti({ particleCount: 65, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}

    setState((prev) => ({
      ...prev,
      stats: grantReward(prev.stats, amount)
    }));

    setCelebration({
      type: 'mini',
      title: reasonTitle || '¡ENERGÍA EXTRA!',
      stars: amount,
      message: `¡Ganaste +${amount} XP!`
    });
  }, [recordActivity]);

  // ==========================================
  // ACCIONES: TAREAS
  // ==========================================
  const addTask = useCallback((newTask) => {
    recordActivity();
    try { audioService.playClick(); } catch (e) {}
    setState((prev) => {
      const timeMinutes = newTask.timeMinutes || 10;
      const difficulty = newTask.difficulty || suggestDifficultyFromTime(timeMinutes);
      const xpReward = getXpFromDifficulty(difficulty);

      const taskObj = {
        id: Date.now().toString(),
        title: newTask.title,
        timeMinutes,
        difficulty,
        xpReward,
        category: newTask.category || 'general',
        status: 'queued',
        priority: newTask.priority || 'yellow',
        color: newTask.color || '#ff6b00',
        microSteps: newTask.microSteps || [],
        slotId: newTask.slotId || null,
        slotDate: newTask.slotDate || null,
        photo: newTask.photo || null,
        order: Date.now()
      };
      const allTasks = [...prev.tasks, taskObj];
      return { ...prev, tasks: recomputeStatus(allTasks) };
    });
  }, [recordActivity]);

  const deleteTask = useCallback((taskId) => {
    recordActivity();
    try { audioService.playClick(); } catch (e) {}
    setState((prev) => {
      const filtered = prev.tasks.filter((t) => t.id !== taskId);
      return { ...prev, tasks: recomputeStatus(filtered) };
    });
  }, [recordActivity]);

  const setTaskPriority = useCallback((taskId, priority) => {
    recordActivity();
    try { audioService.playPop(); } catch (e) {}
    setState((prev) => {
      const updated = prev.tasks.map((t) =>
        t.id === taskId ? { ...t, priority } : t
      );
      return { ...prev, tasks: recomputeStatus(updated) };
    });
  }, [recordActivity]);

  const moveTaskOrder = useCallback((taskId, direction) => {
    recordActivity();
    try { audioService.playPop(); } catch (e) {}
    setState((prev) => {
      const sorted = sortTasksByPriority(prev.tasks);
      const idx = sorted.findIndex((t) => t.id === taskId);
      if (idx === -1) return prev;

      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= sorted.length) return prev;

      const task = sorted[idx];
      const neighbor = sorted[targetIdx];

      if (task.priority !== neighbor.priority) return prev;

      const taskOrder = task.order ?? parseInt(task.id) ?? Date.now();
      const neighborOrder = neighbor.order ?? parseInt(neighbor.id) ?? Date.now();

      const updated = prev.tasks.map((t) => {
        if (t.id === task.id) return { ...t, order: neighborOrder };
        if (t.id === neighbor.id) return { ...t, order: taskOrder };
        return t;
      });

      return { ...prev, tasks: updated };
    });
  }, [recordActivity]);

  const setTaskAlarm = useCallback((taskId, time, sound = 'campanita') => {
    recordActivity();
    try { audioService.playSuccess(); } catch (e) {}
    setState((prev) => {
      const task = prev.tasks.find((t) => t.id === taskId);
      if (!task) return prev;

      const todayKey = getTodayKey();
      const existingAlarms = (prev.alarms || []).filter(
        (a) => a.taskId !== taskId
      );

      return {
        ...prev,
        alarms: [
          ...existingAlarms,
          {
            id: 'al_task_' + Date.now(),
            taskId,
            dateKey: todayKey,
            time,
            label: task.title,
            sound,
            enabled: true,
            triggered: false
          }
        ]
      };
    });
  }, [recordActivity]);

  const removeTaskAlarm = useCallback((taskId) => {
    recordActivity();
    try { audioService.playClick(); } catch (e) {}
    setState((prev) => ({
      ...prev,
      alarms: (prev.alarms || []).filter((a) => a.taskId !== taskId)
    }));
  }, [recordActivity]);

  const setTaskDifficulty = useCallback((taskId, difficulty) => {
    recordActivity();
    try { audioService.playPop(); } catch (e) {}
    setState((prev) => {
      const updated = prev.tasks.map((t) =>
        t.id === taskId
          ? { ...t, difficulty, xpReward: getXpFromDifficulty(difficulty) }
          : t
      );
      return { ...prev, tasks: recomputeStatus(updated) };
    });
  }, [recordActivity]);

  const editTask = useCallback((taskId, updates) => {
    recordActivity();
    try { audioService.playClick(); } catch (e) {}
    setState((prev) => {
      const updated = prev.tasks.map((t) =>
        t.id === taskId ? { ...t, ...updates } : t
      );
      return { ...prev, tasks: recomputeStatus(updated) };
    });
  }, [recordActivity]);

  const setTaskPhoto = useCallback((taskId, photoBase64) => {
    recordActivity();
    try { audioService.playSuccess(); } catch (e) {}
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, photo: photoBase64 } : t
      )
    }));
  }, [recordActivity]);

  const removeTaskPhoto = useCallback((taskId) => {
    recordActivity();
    try { audioService.playClick(); } catch (e) {}
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, photo: null } : t
      )
    }));
  }, [recordActivity]);

  const completeActiveTask = useCallback((taskId) => {
    recordActivity();

    setState((prev) => {
      const taskToComplete = prev.tasks.find((t) => t.id === taskId);
      if (!taskToComplete) return prev;

      try { audioService.playSuccess(); } catch (e) {}
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#34d399', '#6ee7b7']
        });
      } catch (e) {}

      const updated = prev.tasks.map((t) =>
        t.id === taskId ? { ...t, status: 'completed' } : t
      );

      const recomputed = recomputeStatus(updated);

      setCelebration({
        type: 'mini',
        title: '¡Lo lograste!',
        stars: taskToComplete.xpReward,
        message: 'Sparky está orgulloso 🐾'
      });

      return {
        ...prev,
        tasks: recomputed,
        stats: {
          ...grantReward(prev.stats, taskToComplete.xpReward),
          tasksCompletedToday: (prev.stats.tasksCompletedToday || 0) + 1
        }
      };
    });
  }, [recordActivity]);

  const toggleMicroStep = useCallback((taskId, stepId) => {
    recordActivity();
    try { audioService.playPop(); } catch (e) {}
    setState((prev) => {
      let bonusXp = 0;

      const updatedTasks = prev.tasks.map((task) => {
        if (task.id !== taskId) return task;
        const updatedSteps = (task.microSteps || []).map((step) => {
          if (step.id === stepId) {
            const willBeDone = !step.done;
            if (willBeDone) bonusXp += MICROSTEP_XP_BONUS;
            return { ...step, done: willBeDone };
          }
          return step;
        });
        const allDone = updatedSteps.length > 0 && updatedSteps.every((s) => s.done);
        return {
          ...task,
          microSteps: updatedSteps,
          status: allDone ? 'completed' : task.status
        };
      });

      return {
        ...prev,
        tasks: recomputeStatus(updatedTasks),
        stats: bonusXp > 0 ? grantReward(prev.stats, bonusXp) : prev.stats
      };
    });
  }, [recordActivity]);

  const assignTaskToSlot = useCallback((taskId, slotId, dateKey) => {
    recordActivity();
    try { audioService.playPop(); } catch (e) {}
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, slotId, slotDate: dateKey } : t
      )
    }));
  }, [recordActivity]);

  const unassignTaskFromSlot = useCallback((taskId) => {
    recordActivity();
    try { audioService.playClick(); } catch (e) {}
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, slotId: null, slotDate: null } : t
      )
    }));
  }, [recordActivity]);

  const updateTemplateBlock = useCallback((dayId, blockId, updates) => {
    recordActivity();
    try { audioService.playClick(); } catch (e) {}
    setState((prev) => ({
      ...prev,
      weeklyTemplate: {
        ...prev.weeklyTemplate,
        [dayId]: (prev.weeklyTemplate[dayId] || []).map((b) =>
          b.id === blockId ? { ...b, ...updates } : b
        )
      }
    }));
  }, [recordActivity]);

  const addTemplateBlock = useCallback((dayId, block) => {
    recordActivity();
    try { audioService.playPop(); } catch (e) {}
    const newBlock = {
      id: 'blk_' + Date.now(),
      time: block.time || '00:00 - 00:00',
      title: block.title || 'Nuevo bloque',
      icon: block.icon || 'schedule',
      type: block.type || 'fixed',
      duration: block.duration || ''
    };
    setState((prev) => ({
      ...prev,
      weeklyTemplate: {
        ...prev.weeklyTemplate,
        [dayId]: [...(prev.weeklyTemplate[dayId] || []), newBlock]
      }
    }));
  }, [recordActivity]);

  const deleteTemplateBlock = useCallback((dayId, blockId) => {
    recordActivity();
    try { audioService.playClick(); } catch (e) {}
    setState((prev) => ({
      ...prev,
      weeklyTemplate: {
        ...prev.weeklyTemplate,
        [dayId]: (prev.weeklyTemplate[dayId] || []).filter((b) => b.id !== blockId)
      }
    }));
  }, [recordActivity]);

  const setDayOverride = useCallback((dateKey, blocks) => {
    recordActivity();
    setState((prev) => ({
      ...prev,
      dayOverrides: { ...prev.dayOverrides, [dateKey]: blocks }
    }));
  }, [recordActivity]);

  const clearDayOverride = useCallback((dateKey) => {
    recordActivity();
    setState((prev) => {
      const copy = { ...prev.dayOverrides };
      delete copy[dateKey];
      return { ...prev, dayOverrides: copy };
    });
  }, [recordActivity]);

  const setActiveWeek = useCallback((weekId) => {
    recordActivity();
    setState((prev) => ({ ...prev, activeWeek: weekId }));
  }, [recordActivity]);

  const addCompletedTip = useCallback((tipKey) => {
    recordActivity();
    setState((prev) => {
      if (prev.completedTips.includes(tipKey)) return prev;
      return { ...prev, completedTips: [...prev.completedTips, tipKey] };
    });
  }, [recordActivity]);

  const acceptChallenge = useCallback((challengeId) => {
    recordActivity();
    setState((prev) => ({
      ...prev,
      activeChallenges: (prev.activeChallenges || []).map((c) =>
        c.id === challengeId ? { ...c, status: 'accepted' } : c
      )
    }));
  }, [recordActivity]);

  const completeChallenge = useCallback((challengeId) => {
    recordActivity();
    setState((prev) => ({
      ...prev,
      activeChallenges: (prev.activeChallenges || []).map((c) =>
        c.id === challengeId
          ? { ...c, status: 'completed', completedAt: Date.now() }
          : c
      )
    }));
  }, [recordActivity]);

  const setChallengeCheckIn = useCallback((challengeId, dateKey, value) => {
    recordActivity();
    setState((prev) => ({
      ...prev,
      activeChallenges: (prev.activeChallenges || []).map((c) => {
        if (c.id !== challengeId) return c;
        if (!c.startDate) return c;

        const start = new Date(c.startDate + 'T00:00:00');
        const today = new Date(dateKey + 'T00:00:00');
        const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24));
        const duration = c.durationDays || 14;

        if (diffDays < 0 || diffDays >= duration) return c;

        const now = new Date();
        const todayKey = (() => {
          const y = now.getFullYear();
          const m = String(now.getMonth() + 1).padStart(2, '0');
          const d = String(now.getDate()).padStart(2, '0');
          return `${y}-${m}-${d}`;
        })();
        if (dateKey !== todayKey) return c;

        return {
          ...c,
          checkIns: {
            ...(c.checkIns || {}),
            [dateKey]: value
          }
        };
      })
    }));
  }, [recordActivity]);

  const startChallenge = useCallback((challengeData) => {
    recordActivity();
    setState((prev) => {
      const existing = (prev.activeChallenges || []).find(
        (c) => c.id === challengeData.id
      );
      if (existing) return prev;

      const startDate = getNextMonday();

      return {
        ...prev,
        activeChallenges: [
          ...(prev.activeChallenges || []),
          {
            ...challengeData,
            startDate,
            durationDays: challengeData.durationDays || 14,
            checkIns: {},
            status: 'pending',
            createdAt: Date.now(),
            daySevenReached: false
          }
        ]
      };
    });
  }, [recordActivity]);

  // ==========================================
  // COFRE
  // ==========================================
  const openChest = useCallback(() => {
    recordActivity();
    setState((prev) => {
      const chest = prev.pendingChest;
      if (!chest) return prev;

      try { audioService.playSuccess(); } catch (e) {}
      try {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#fbbf24', '#f59e0b', '#ea580c', '#10b981', '#06b6d4']
        });
      } catch (e) {}

      const alreadyUnlocked = prev.unlockedGames.includes(chest.gameId);

      return {
        ...prev,
        pendingChest: null,
        unlockedGames: alreadyUnlocked
          ? prev.unlockedGames
          : [...prev.unlockedGames, chest.gameId],
        gameBalances: {
          ...(prev.gameBalances || {}),
          [chest.gameId]:
            ((prev.gameBalances || {})[chest.gameId] || 0) + chest.minutes
        }
      };
    });
  }, [recordActivity]);

  // ==========================================
  // CONSUMO DE TIEMPO DE JUEGO
  // ==========================================
  const consumeGameTime = useCallback((gameId, minutes) => {
    if (!gameId || !minutes || minutes <= 0) return;
    setState((prev) => {
      const today = getTodayKeyForPlay();
      const isSameDay = prev.dailyPlayDate === today;
      const currentDaily = isSameDay ? (prev.dailyPlayMinutes || 0) : 0;
      const newDaily = Math.min(MAX_DAILY_PLAY_MINUTES, currentDaily + minutes);

      const currentBalance = (prev.gameBalances || {})[gameId] || 0;
      const newBalance = Math.max(0, currentBalance - minutes);

      return {
        ...prev,
        dailyPlayDate: today,
        dailyPlayMinutes: newDaily,
        gameBalances: {
          ...(prev.gameBalances || {}),
          [gameId]: newBalance
        }
      };
    });
  }, []);

  const buyGameTime = useCallback((gameId, minutes, cost) => {
    if (!gameId || !minutes || minutes <= 0) return false;
    if ((state.stats.coins || 0) < cost) return false;

    recordActivity();
    setState((prev) => {
      if ((prev.stats.coins || 0) < cost) return prev;
      return {
        ...prev,
        stats: { ...prev.stats, coins: (prev.stats.coins || 0) - cost },
        gameBalances: {
          ...(prev.gameBalances || {}),
          [gameId]: ((prev.gameBalances || {})[gameId] || 0) + minutes
        }
      };
    });
    try { audioService.playSuccess(); } catch (e) {}
    return true;
  }, [recordActivity, state.stats.coins]);

  const saveQuizAnswers = useCallback((key, payload) => {
    recordActivity();
    setState((prev) => ({
      ...prev,
      quizAnswers: {
        ...(prev.quizAnswers || {}),
        [key]: {
          ...payload,
          completedAt: Date.now()
        }
      }
    }));
  }, [recordActivity]);

  // ==========================================
  // DIARIO
  // ==========================================
  const addDiaryEntry = useCallback((entry) => {
    recordActivity();
    setState((prev) => {
      const exists = (prev.diaryEntries || []).some(
        (e) => e.dateKey === entry.dateKey
      );

      if (exists) return prev;

      const tipMessages = Array.isArray(entry.tipMessages)
        ? entry.tipMessages
        : entry.tipExplanation
        ? [entry.tipExplanation]
        : [];

      const newEntry = {
        id: 'dy_' + Date.now(),
        dateKey: entry.dateKey,
        weekId: entry.weekId,
        day: entry.day,
        tipTitle: entry.tipTitle || '',
        tipMessages,
        tipExplanation: tipMessages.join('\n\n'),
        userNote: '',
        createdAt: Date.now()
      };

      return {
        ...prev,
        diaryEntries: [...(prev.diaryEntries || []), newEntry]
      };
    });
  }, [recordActivity]);

  const updateDiaryNote = useCallback((entryId, userNote) => {
    recordActivity();
    setState((prev) => ({
      ...prev,
      diaryEntries: (prev.diaryEntries || []).map((e) =>
        e.id === entryId ? { ...e, userNote } : e
      )
    }));
  }, [recordActivity]);

  // ==========================================
  // ALARMAS
  // ==========================================
  const addAlarm = useCallback((alarmData) => {
    recordActivity();
    try { audioService.playPop(); } catch (e) {}
    const newAlarm = {
      id: 'al_' + Date.now(),
      ...alarmData,
      enabled: true,
      triggered: false
    };
    setState((prev) => ({
      ...prev,
      alarms: [...(prev.alarms || []), newAlarm]
    }));
    return newAlarm;
  }, [recordActivity]);

  const removeAlarm = useCallback((alarmId) => {
    recordActivity();
    try { audioService.playClick(); } catch (e) {}
    setState((prev) => ({
      ...prev,
      alarms: (prev.alarms || []).filter((a) => a.id !== alarmId)
    }));
  }, [recordActivity]);

  const markAlarmTriggered = useCallback((alarmId) => {
    setState((prev) => ({
      ...prev,
      alarms: (prev.alarms || []).map((a) =>
        a.id === alarmId ? { ...a, triggered: true } : a
      )
    }));
  }, []);

  const removeAlarmByBlock = useCallback((blockId, dateKey) => {
    recordActivity();
    setState((prev) => ({
      ...prev,
      alarms: (prev.alarms || []).filter(
        (a) => !(a.blockId === blockId && a.dateKey === dateKey)
      )
    }));
  }, [recordActivity]);

  const removeAlarmByEvent = useCallback((eventId) => {
    recordActivity();
    setState((prev) => ({
      ...prev,
      alarms: (prev.alarms || []).filter((a) => a.eventId !== eventId)
    }));
  }, [recordActivity]);

  // ==========================================
  // CHECKLISTS
  // ==========================================
  const addChecklist = useCallback((data) => {
    recordActivity();
    try { audioService.playPop(); } catch (e) {}
    const newList = {
      id: 'cl_' + Date.now(),
      title: data.title || 'Nueva rutina',
      emoji: data.emoji || '📋',
      category: data.category || 'manana',
      color: data.color || 'yellow',
      steps: data.steps || []
    };
    setState((prev) => ({
      ...prev,
      checklists: [...(prev.checklists || []), newList]
    }));
    return newList;
  }, [recordActivity]);

  const updateChecklist = useCallback((listId, updates) => {
    recordActivity();
    setState((prev) => ({
      ...prev,
      checklists: (prev.checklists || []).map((c) =>
        c.id === listId ? { ...c, ...updates } : c
      )
    }));
  }, [recordActivity]);

  const deleteChecklist = useCallback((listId) => {
    recordActivity();
    try { audioService.playClick(); } catch (e) {}
    setState((prev) => ({
      ...prev,
      checklists: (prev.checklists || []).filter((c) => c.id !== listId)
    }));
  }, [recordActivity]);

  const toggleChecklistStep = useCallback((listId, stepId) => {
    recordActivity();
    try { audioService.playPop(); } catch (e) {}
    setState((prev) => ({
      ...prev,
      checklists: (prev.checklists || []).map((c) => {
        if (c.id !== listId) return c;
        return {
          ...c,
          steps: (c.steps || []).map((s) =>
            s.id === stepId ? { ...s, done: !s.done } : s
          )
        };
      })
    }));
  }, [recordActivity]);

  const resetChecklist = useCallback((listId) => {
    recordActivity();
    try { audioService.playSuccess(); } catch (e) {}
    setState((prev) => ({
      ...prev,
      checklists: (prev.checklists || []).map((c) =>
        c.id === listId
          ? { ...c, steps: (c.steps || []).map((s) => ({ ...s, done: false })) }
          : c
      )
    }));
  }, [recordActivity]);

  // ==========================================
  // TIPS PERSONALIZADOS
  // ==========================================
  const addCustomTip = useCallback((tip) => {
    recordActivity();
    const newTip = {
      id: 'custom_' + Date.now(),
      day: tip.day,
      title: tip.title,
      explanation: tip.explanation,
      action: tip.action,
      reward: tip.reward || 15,
      isReplacing: tip.isReplacing !== false,
      createdAt: Date.now()
    };
    setState((prev) => ({ ...prev, customTips: [...prev.customTips, newTip] }));
  }, [recordActivity]);

  const updateCustomTip = useCallback((tipId, updates) => {
    recordActivity();
    setState((prev) => ({
      ...prev,
      customTips: prev.customTips.map((t) =>
        t.id === tipId ? { ...t, ...updates } : t
      )
    }));
  }, [recordActivity]);

  const deleteCustomTip = useCallback((tipId) => {
    recordActivity();
    setState((prev) => ({
      ...prev,
      customTips: prev.customTips.filter((t) => t.id !== tipId)
    }));
  }, [recordActivity]);

  // ==========================================
  // PADRES
  // ==========================================
  const setParentPin = useCallback((newPin) => {
    setState((prev) => ({ ...prev, parentPin: newPin }));
  }, []);

  const verifyParentPin = useCallback((pin) => {
    return pin === state.parentPin;
  }, [state.parentPin]);

  // ==========================================
  // NOTAS
  // ==========================================
  const addNote = useCallback((note) => {
    recordActivity();
    try { audioService.playPop(); } catch (e) {}
    const newNote = {
      id: 'note_' + Date.now(),
      text: note.text,
      color: note.color || 'yellow',
      isVoice: note.isVoice === true,
      createdAt: Date.now()
    };
    setState((prev) => ({
      ...prev,
      notes: [newNote, ...(prev.notes || [])]
    }));
    return newNote;
  }, [recordActivity]);

  const updateNote = useCallback((noteId, updates) => {
    recordActivity();
    setState((prev) => ({
      ...prev,
      notes: (prev.notes || []).map((n) =>
        n.id === noteId ? { ...n, ...updates } : n
      )
    }));
  }, [recordActivity]);

  const deleteNote = useCallback((noteId) => {
    recordActivity();
    try { audioService.playClick(); } catch (e) {}
    setState((prev) => ({
      ...prev,
      notes: (prev.notes || []).filter((n) => n.id !== noteId)
    }));
  }, [recordActivity]);

  const convertNoteToTask = useCallback((noteId, options = {}) => {
    recordActivity();
    setState((prev) => {
      const note = (prev.notes || []).find((n) => n.id === noteId);
      if (!note) return prev;

      const timeMinutes = options.timeMinutes || 15;
      const difficulty = options.difficulty || suggestDifficultyFromTime(timeMinutes);
      const xpReward = getXpFromDifficulty(difficulty);

      const newTask = {
        id: Date.now().toString(),
        title: note.text,
        timeMinutes,
        difficulty,
        xpReward,
        category: options.category || 'general',
        status: 'queued',
        priority: options.priority || 'yellow',
        color: options.color || '#ff6b00',
        microSteps: [],
        slotId: null,
        slotDate: null,
        photo: null,
        order: Date.now()
      };

      const allTasks = [...prev.tasks, newTask];
      const updatedTasks = recomputeStatus(allTasks);
      const updatedNotes = (prev.notes || []).filter((n) => n.id !== noteId);

      return {
        ...prev,
        tasks: updatedTasks,
        notes: updatedNotes
      };
    });
    try { audioService.playSuccess(); } catch (e) {}
  }, [recordActivity]);

  // ==========================================
  // EVENTOS
  // ==========================================
  const addCustomEvent = useCallback((event) => {
    recordActivity();
    try { audioService.playPop(); } catch (e) {}
    const newEvent = {
      id: 'evt_' + Date.now(),
      title: event.title,
      date: event.date,
      time: event.time || '',
      category: event.category || 'otro',
      notes: event.notes || '',
      createdAt: Date.now()
    };
    setState((prev) => ({
      ...prev,
      customEvents: [...(prev.customEvents || []), newEvent]
    }));
    return newEvent;
  }, [recordActivity]);

  const updateCustomEvent = useCallback((eventId, updates) => {
    recordActivity();
    setState((prev) => ({
      ...prev,
      customEvents: (prev.customEvents || []).map((e) =>
        e.id === eventId ? { ...e, ...updates } : e
      )
    }));
  }, [recordActivity]);

  const deleteCustomEvent = useCallback((eventId) => {
    recordActivity();
    try { audioService.playClick(); } catch (e) {}
    setState((prev) => ({
      ...prev,
      customEvents: (prev.customEvents || []).filter((e) => e.id !== eventId)
    }));
  }, [recordActivity]);

  // ==========================================
  // TIENDA
  // ==========================================
  const unlockSound = useCallback((soundId, cost = 0) => {
    recordActivity();
    setState((prev) => {
      if (prev.unlockedSounds.includes(soundId)) return prev;
      if ((prev.stats.coins || 0) < cost) return prev;
      return {
        ...prev,
        unlockedSounds: [...prev.unlockedSounds, soundId],
        stats: { ...prev.stats, coins: (prev.stats.coins || 0) - cost }
      };
    });
  }, [recordActivity]);

  const unlockGame = useCallback((gameId, cost = 0) => {
    recordActivity();
    setState((prev) => {
      if (prev.unlockedGames.includes(gameId)) return prev;
      if ((prev.stats.coins || 0) < cost) return prev;
      return {
        ...prev,
        unlockedGames: [...prev.unlockedGames, gameId],
        stats: { ...prev.stats, coins: (prev.stats.coins || 0) - cost }
      };
    });
  }, [recordActivity]);

  const unlockReward = useCallback((rewardId, cost = 0) => {
    recordActivity();
    setState((prev) => {
      if (prev.unlockedRewards.includes(rewardId)) return prev;
      if ((prev.stats.coins || 0) < cost) return prev;
      return {
        ...prev,
        unlockedRewards: [...prev.unlockedRewards, rewardId],
        stats: { ...prev.stats, coins: (prev.stats.coins || 0) - cost }
      };
    });
  }, [recordActivity]);

  const closeCelebration = useCallback(() => setCelebration(null), []);

  const dismissNudge = useCallback(() => {
    recordActivity();
    setSparkyNudge(null);
  }, [recordActivity]);

  const resetApp = useCallback(() => {
    storageService.reset();
    setState(storageService.get());
    setActiveTab('today');
    setActiveScreen('none');
    setCelebration(null);
    setSparkyNudge(null);
  }, []);

  const sortedTasks = sortTasksByPriority(state.tasks);
  const activeTask = sortedTasks.find((t) => t.status !== 'completed') || null;

  const level = Math.floor((state.stats.xp || 0) / 100) + 1;

  const isChallengeActive = useCallback((challenge) => {
    const status = getChallengeTimeStatus(challenge);
    return status === 'primary' || status === 'background' || status === 'pending';
  }, []);

  const getChallengeStatus = useCallback((challenge) => {
    return getChallengeTimeStatus(challenge);
  }, []);

  const getActiveChallengesOrdered = useCallback(() => {
    const sorted = (state.activeChallenges || [])
      .slice()
      .filter((c) => {
        const status = getChallengeTimeStatus(c);
        return status === 'primary' || status === 'background' || status === 'pending';
      })
      .sort((a, b) => {
        if (a.startDate !== b.startDate) {
          return (b.startDate || '').localeCompare(a.startDate || '');
        }
        return (b.createdAt || 0) - (a.createdAt || 0);
      });

    return sorted.map((c, i) => {
      const timeStatus = getChallengeTimeStatus(c);
      let displayPriority;
      if (i === 0) {
        displayPriority = timeStatus === 'pending' ? 'pending' : 'primary';
      } else if (i === 1) {
        displayPriority = 'background';
      } else {
        displayPriority = 'toArchive';
      }
      return { ...c, displayPriority, timeStatus };
    });
  }, [state.activeChallenges]);

  return (
    <AppContext.Provider
      value={{
        state,
        xp: state.stats.xp,
        coins: state.stats.coins || 0,
        level,
        streak: state.stats.streak,
        impulses: state.stats.impulses,
        addXp,
        awardStars,
        userName: state.profile.username,
        userAge: state.profile.age,
        userAvatar: state.profile.avatar,
        setUserName,
        setUserAge,
        setUserAvatar,
        settings: state.settings,
        updateSettings,
        toggleSound,
        tasks: sortedTasks,
        activeTask,
        addTask,
        deleteTask,
        completeActiveTask,
        toggleMicroStep,
        setTaskPriority,
        moveTaskOrder,
        setTaskAlarm,
        removeTaskAlarm,
        setTaskDifficulty,
        editTask,
        setTaskPhoto,
        removeTaskPhoto,
        assignTaskToSlot,
        unassignTaskFromSlot,
        weeklyTemplate: state.weeklyTemplate,
        dayOverrides: state.dayOverrides,
        updateTemplateBlock,
        addTemplateBlock,
        deleteTemplateBlock,
        setDayOverride,
        clearDayOverride,
        completedTips: state.completedTips,
        activeWeek: state.activeWeek,
        setActiveWeek,
        addCompletedTip,
        customTips: state.customTips,
        quizAnswers: state.quizAnswers || {},
        saveQuizAnswers,
        activeChallenges: state.activeChallenges || [],
        archivedChallenges: state.archivedChallenges || [],
        checklists: state.checklists || [],
        addChecklist,
        updateChecklist,
        deleteChecklist,
        toggleChecklistStep,
        resetChecklist,
        alarms: state.alarms || [],
        diaryEntries: state.diaryEntries || [],
        addDiaryEntry,
        updateDiaryNote,
        addAlarm,
        removeAlarm,
        markAlarmTriggered,
        removeAlarmByBlock,
        removeAlarmByEvent,
        startChallenge,
        acceptChallenge,
        setChallengeCheckIn,
        completeChallenge,
        isChallengeActive,
        getChallengeStatus,
        getActiveChallengesOrdered,
        pendingChest: state.pendingChest || null,
        openChest,
        consumeGameTime,
        buyGameTime,
        dailyPlayMinutes: state.dailyPlayMinutes || 0,
        dailyPlayDate: state.dailyPlayDate || null,
        maxDailyPlayMinutes: MAX_DAILY_PLAY_MINUTES,
        gameBalances: state.gameBalances || {},
        addCustomTip,
        updateCustomTip,
        deleteCustomTip,
        parentPin: state.parentPin,
        setParentPin,
        verifyParentPin,
        notes: state.notes || [],
        addNote,
        updateNote,
        deleteNote,
        convertNoteToTask,
        customEvents: state.customEvents || [],
        addCustomEvent,
        updateCustomEvent,
        deleteCustomEvent,
        unlockedSounds: state.unlockedSounds,
        unlockedGames: state.unlockedGames,
        unlockedRewards: state.unlockedRewards,
        unlockedAccessories: state.unlockedAccessories || [],
        equippedAccessories: state.equippedAccessories || { head: null, face: null, shirt: 'shirt-rojo' },
        unlockSound,
        unlockGame,
        unlockReward,
        unlockAccessory,
        equipAccessory,
        unequipAccessory,
        activeTab,
        setActiveTab,
        activeScreen,
        setActiveScreen,
        celebration,
        closeCelebration,
        sparkyNudge,
        dismissNudge,
        recordActivity,
        dailyHistory: state.dailyHistory || [],
        sparkyMessage:
          state.sparkyMessage ||
          '¡Guau! Respira hondo, solo existe esta misión ahora mismo. 🐾',
        setSparkyMessage: (msg) =>
          setState((prev) => ({ ...prev, sparkyMessage: msg })),
        resetApp
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);