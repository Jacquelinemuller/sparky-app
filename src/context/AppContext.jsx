import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { storageService, getXpFromDifficulty, suggestDifficultyFromTime } from '../services/storageService';
import { audioService } from '../services/audioService';
import confetti from 'canvas-confetti';

const AppContext = createContext();

const PRIORITY_ORDER = { red: 0, yellow: 1, green: 2 };

const MICROSTEP_XP_BONUS = 2;

function getTodayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function sortTasksByPriority(tasks) {
  return [...tasks].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority] ?? 1;
    const pb = PRIORITY_ORDER[b.priority] ?? 1;
    if (pa !== pb) return pa - pb;
    return parseInt(a.id) - parseInt(b.id);
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
      return {
        ...prev,
        unlockedAccessories: [...prev.unlockedAccessories, accessoryId],
        stats: { ...prev.stats, xp: Math.max(0, (prev.stats.xp || 0) - cost) }
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
  // ACCIONES: XP / RACHA
  // ==========================================
  const addXp = useCallback((amount) => {
    recordActivity();
    setState((prev) => ({
      ...prev,
      stats: { ...prev.stats, xp: (prev.stats.xp || 0) + amount }
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
      stats: { ...prev.stats, xp: (prev.stats.xp || 0) + amount }
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
        photo: newTask.photo || null
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
          ...prev.stats,
          xp: (prev.stats.xp || 0) + taskToComplete.xpReward,
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
        stats: {
          ...prev.stats,
          xp: (prev.stats.xp || 0) + bonusXp
        }
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

  const setParentPin = useCallback((newPin) => {
    setState((prev) => ({ ...prev, parentPin: newPin }));
  }, []);

  const verifyParentPin = useCallback((pin) => {
    return pin === state.parentPin;
  }, [state.parentPin]);

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
        photo: null
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

  const unlockSound = useCallback((soundId, cost = 0) => {
    recordActivity();
    setState((prev) => {
      if (prev.unlockedSounds.includes(soundId)) return prev;
      return {
        ...prev,
        unlockedSounds: [...prev.unlockedSounds, soundId],
        stats: { ...prev.stats, xp: Math.max(0, (prev.stats.xp || 0) - cost) }
      };
    });
  }, [recordActivity]);

  const unlockGame = useCallback((gameId, cost = 0) => {
    recordActivity();
    setState((prev) => {
      if (prev.unlockedGames.includes(gameId)) return prev;
      return {
        ...prev,
        unlockedGames: [...prev.unlockedGames, gameId],
        stats: { ...prev.stats, xp: Math.max(0, (prev.stats.xp || 0) - cost) }
      };
    });
  }, [recordActivity]);

  const unlockReward = useCallback((rewardId, cost = 0) => {
    recordActivity();
    setState((prev) => {
      if (prev.unlockedRewards.includes(rewardId)) return prev;
      return {
        ...prev,
        unlockedRewards: [...prev.unlockedRewards, rewardId],
        stats: { ...prev.stats, xp: Math.max(0, (prev.stats.xp || 0) - cost) }
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

  return (
    <AppContext.Provider
      value={{
        state,
        xp: state.stats.xp,
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