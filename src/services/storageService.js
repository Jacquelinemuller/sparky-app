// storageService.js - Persistencia unificada con migración desde claves antiguas

const STORAGE_KEY = 'sparky_planner_v1';

const LEGACY_KEYS = {
  xp: 'sparky_xp',
  tasks: 'sparky_tasks',
  userName: 'sparky_user_name',
  userAvatar: 'sparky_user_avatar'
};

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const DIFFICULTY_XP = {
  facil: 10,
  media: 20,
  dificil: 35,
  epica: 50
};

// ============================================
// AVATARES PREDISEÑADOS (los completamos cuando tengas las fotos)
// ============================================
export const PRESET_AVATARS = [
  // Cuando tengas las fotos, las agregás acá:
  // { id: 'av-1', label: 'Robot', src: '/avatars/robot.png' },
  // { id: 'av-2', label: 'Astronauta', src: '/avatars/astronauta.png' },
  // { id: 'av-3', label: 'Dino', src: '/avatars/dino.png' },
];

// ============================================
// ACCESORIOS (definidos acá para uso futuro en la tienda)
// ============================================
export const ACCESSORIES_CATALOG = [
  // Cabeza
  { id: 'acc-gorra-roja',   slot: 'head',  label: 'Gorra roja',       icon: '🧢', unlock: { type: 'xp', cost: 80 } },
  { id: 'acc-sombrero',     slot: 'head',  label: 'Sombrero mágico',  icon: '🎩', unlock: { type: 'xp', cost: 150 } },
  { id: 'acc-corona',       slot: 'head',  label: 'Corona dorada',    icon: '👑', unlock: { type: 'achievement', key: 'streak7' } },
  // Cara
  { id: 'acc-gafas-sol',    slot: 'face',  label: 'Gafas de sol',     icon: '🕶️', unlock: { type: 'xp', cost: 50 } },
  { id: 'acc-gafas-red',    slot: 'face',  label: 'Gafas redondas',   icon: '👓', unlock: { type: 'xp', cost: 100 } },
  { id: 'acc-gafas-buzo',   slot: 'face',  label: 'Gafas de buzo',    icon: '🥽', unlock: { type: 'achievement', key: 'level5' } },
  // Ropa (color de remera)
  { id: 'shirt-rojo',       slot: 'shirt', label: 'Remera roja',      icon: '🔴', color: '#dc2626', unlock: { type: 'free' } },
  { id: 'shirt-azul',       slot: 'shirt', label: 'Remera azul',      icon: '🔵', color: '#3b82f6', unlock: { type: 'xp', cost: 30 } },
  { id: 'shirt-violeta',    slot: 'shirt', label: 'Remera violeta',   icon: '🟣', color: '#8b5cf6', unlock: { type: 'xp', cost: 60 } },
  { id: 'shirt-verde',      slot: 'shirt', label: 'Remera verde',     icon: '🟢', color: '#10b981', unlock: { type: 'xp', cost: 90 } },
];

const DEFAULT_WEEKLY_TEMPLATE = {
  monday: [
    { id: 'school', time: '08:30 - 14:00', title: 'Colegio / Escuela', icon: 'school', type: 'fixed' },
    { id: 'lunch', time: '14:00 - 15:15', title: 'Almuerzo y relax', icon: 'restaurant', type: 'fixed' },
    { id: 'slot_1', time: '15:15 - 16:30', title: 'Ventana de Gran Enfoque', type: 'free_slot', duration: '1h 15m' },
    { id: 'soccer', time: '16:30 - 18:00', title: 'Entrenamiento Fútbol', icon: 'sports_soccer', type: 'fixed' },
    { id: 'shower', time: '18:00 - 18:45', title: 'Ducha y Merienda', icon: 'shower', type: 'fixed' },
    { id: 'slot_2', time: '18:45 - 19:30', title: 'Micro-Misión o Lectura', type: 'free_slot', duration: '45m' },
    { id: 'play', time: '19:30 - 20:30', title: 'Juego libre', icon: 'sports_esports', type: 'fixed' }
  ],
  tuesday: [
    { id: 'school', time: '08:30 - 14:00', title: 'Colegio / Escuela', icon: 'school', type: 'fixed' },
    { id: 'lunch', time: '14:00 - 15:15', title: 'Almuerzo y relax', icon: 'restaurant', type: 'fixed' },
    { id: 'slot_1', time: '15:15 - 16:30', title: 'Ventana de Gran Enfoque', type: 'free_slot', duration: '1h 15m' },
    { id: 'english', time: '16:30 - 18:00', title: 'Clase de Inglés', icon: 'language', type: 'fixed' },
    { id: 'shower', time: '18:00 - 18:45', title: 'Ducha y Merienda', icon: 'shower', type: 'fixed' },
    { id: 'slot_2', time: '18:45 - 19:30', title: 'Micro-Misión o Lectura', type: 'free_slot', duration: '45m' },
    { id: 'play', time: '19:30 - 20:30', title: 'Juego libre', icon: 'sports_esports', type: 'fixed' }
  ],
  wednesday: [
    { id: 'school', time: '08:30 - 14:00', title: 'Colegio / Escuela', icon: 'school', type: 'fixed' },
    { id: 'lunch', time: '14:00 - 15:15', title: 'Almuerzo y relax', icon: 'restaurant', type: 'fixed' },
    { id: 'slot_1', time: '15:15 - 16:30', title: 'Ventana de Gran Enfoque', type: 'free_slot', duration: '1h 15m' },
    { id: 'art', time: '16:30 - 18:00', title: 'Taller de Arte', icon: 'palette', type: 'fixed' },
    { id: 'shower', time: '18:00 - 18:45', title: 'Ducha y Merienda', icon: 'shower', type: 'fixed' },
    { id: 'slot_2', time: '18:45 - 19:30', title: 'Micro-Misión o Lectura', type: 'free_slot', duration: '45m' },
    { id: 'play', time: '19:30 - 20:30', title: 'Juego libre', icon: 'sports_esports', type: 'fixed' }
  ],
  thursday: [
    { id: 'school', time: '08:30 - 14:00', title: 'Colegio / Escuela', icon: 'school', type: 'fixed' },
    { id: 'lunch', time: '14:00 - 15:15', title: 'Almuerzo y relax', icon: 'restaurant', type: 'fixed' },
    { id: 'slot_1', time: '15:15 - 16:30', title: 'Ventana de Gran Enfoque', type: 'free_slot', duration: '1h 15m' },
    { id: 'music', time: '16:30 - 18:00', title: 'Clase de Música', icon: 'music_note', type: 'fixed' },
    { id: 'shower', time: '18:00 - 18:45', title: 'Ducha y Merienda', icon: 'shower', type: 'fixed' },
    { id: 'slot_2', time: '18:45 - 19:30', title: 'Micro-Misión o Lectura', type: 'free_slot', duration: '45m' },
    { id: 'play', time: '19:30 - 20:30', title: 'Juego libre', icon: 'sports_esports', type: 'fixed' }
  ],
  friday: [
    { id: 'school', time: '08:30 - 14:00', title: 'Colegio / Escuela', icon: 'school', type: 'fixed' },
    { id: 'lunch', time: '14:00 - 15:15', title: 'Almuerzo y relax', icon: 'restaurant', type: 'fixed' },
    { id: 'slot_1', time: '15:15 - 16:30', title: 'Ventana de Gran Enfoque', type: 'free_slot', duration: '1h 15m' },
    { id: 'freetime', time: '16:30 - 18:00', title: 'Tiempo libre', icon: 'celebration', type: 'fixed' },
    { id: 'shower', time: '18:00 - 18:45', title: 'Ducha y Merienda', icon: 'shower', type: 'fixed' },
    { id: 'slot_2', time: '18:45 - 19:30', title: 'Micro-Misión o Lectura', type: 'free_slot', duration: '45m' },
    { id: 'family', time: '19:30 - 21:00', title: 'Cena y tiempo en familia', icon: 'family_restroom', type: 'fixed' }
  ],
  saturday: [
    { id: 'sleep', time: '09:00 - 10:30', title: 'Despertar tranquilo', icon: 'bed', type: 'fixed' },
    { id: 'breakfast', time: '10:30 - 11:30', title: 'Desayuno tardío', icon: 'breakfast_dining', type: 'fixed' },
    { id: 'slot_1', time: '11:30 - 13:00', title: 'Ventana de Gran Enfoque', type: 'free_slot', duration: '1h 30m' },
    { id: 'lunch', time: '13:00 - 14:30', title: 'Almuerzo', icon: 'restaurant', type: 'fixed' },
    { id: 'slot_2', time: '14:30 - 16:00', title: 'Micro-Misión o Lectura', type: 'free_slot', duration: '1h 30m' },
    { id: 'play', time: '16:00 - 19:00', title: 'Juego libre / Amigos', icon: 'sports_esports', type: 'fixed' },
    { id: 'dinner', time: '19:00 - 21:00', title: 'Cena y película', icon: 'movie', type: 'fixed' }
  ],
  sunday: [
    { id: 'sleep', time: '09:00 - 10:30', title: 'Despertar tranquilo', icon: 'bed', type: 'fixed' },
    { id: 'breakfast', time: '10:30 - 11:30', title: 'Desayuno tardío', icon: 'breakfast_dining', type: 'fixed' },
    { id: 'slot_1', time: '11:30 - 13:00', title: 'Ventana de Gran Enfoque', type: 'free_slot', duration: '1h 30m' },
    { id: 'lunch', time: '13:00 - 14:30', title: 'Almuerzo familiar', icon: 'restaurant', type: 'fixed' },
    { id: 'slot_2', time: '14:30 - 16:00', title: 'Micro-Misión o Lectura', type: 'free_slot', duration: '1h 30m' },
    { id: 'prep', time: '16:00 - 18:00', title: 'Preparar la semana', icon: 'checklist', type: 'fixed' },
    { id: 'relax', time: '18:00 - 21:00', title: 'Relax y series', icon: 'self_improvement', type: 'fixed' }
  ]
};

export function getXpFromDifficulty(difficulty) {
  return DIFFICULTY_XP[difficulty] || 20;
}

export function suggestDifficultyFromTime(minutes) {
  const m = parseInt(minutes, 10) || 10;
  if (m <= 10) return 'facil';
  if (m <= 25) return 'media';
  if (m <= 45) return 'dificil';
  return 'epica';
}

const DEFAULT_STATE = {
  profile: {
    username: 'Facu',
    age: 10,
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCbmTgT3vtpzmBLv0vXw0QAn8aehn4CMsyUBHsSNXMx2o8664jqQDawyLB6cLjnJyVs3nH8j5Xg0zCgj328DhSV3UrF0OsohiRfTpFBHrtJj1GDkDlPuthZXWL8Y2LdckERxt3tGkN79IPQC-nLUUIKSgWT4uOZNoIVbCydrh3sbjsJr0-_LHtmfolPz11lxF-tT8kUu9k6et0MA51ccMI-jW_-DrVvYQF7SGimyF1t24f8xNMhg1UD4Q'
  },
  stats: {
    xp: 0,
    streak: 0,
    impulses: 0,
    tasksCompletedToday: 0
  },
  settings: {
    soundEnabled: true,
    reminderNudgeEnabled: true,
    reminderIntervalMinutes: 4,
    customPomodoroMinutes: 25
  },
  weeklyTemplate: JSON.parse(JSON.stringify(DEFAULT_WEEKLY_TEMPLATE)),
  dayOverrides: {},
  tasks: [
    {
      id: '1',
      title: 'Hacer problema 3 de mates',
      category: 'school',
      timeMinutes: 12,
      difficulty: 'media',
      xpReward: 20,
      status: 'active',
      priority: 'red',
      color: '#ff6b00',
      microSteps: [],
      photo: null
    },
    {
      id: '2',
      title: 'Guardar mochila de cole',
      category: 'routine',
      timeMinutes: 5,
      difficulty: 'facil',
      xpReward: 10,
      status: 'queued',
      priority: 'yellow',
      color: '#5bb8fe',
      microSteps: [],
      photo: null
    },
    {
      id: '3',
      title: 'Leer 1 capítulo del cómic',
      category: 'leisure',
      timeMinutes: 15,
      difficulty: 'media',
      xpReward: 20,
      status: 'queued',
      priority: 'green',
      color: '#8b5cf6',
      microSteps: [],
      photo: null
    },
    {
      id: '4',
      title: 'Recoger juguetes del suelo',
      category: 'home',
      timeMinutes: 8,
      difficulty: 'facil',
      xpReward: 10,
      status: 'queued',
      priority: 'yellow',
      color: '#f59e0b',
      microSteps: [],
      photo: null
    }
  ],
  notes: [],
  customEvents: [],
  completedTips: [],
  customTips: [],
  unlockedSounds: ['rain'],
  unlockedGames: [],
  unlockedRewards: [],
  unlockedAccessories: ['shirt-rojo'],   // 🆕 La remera roja viene gratis
  equippedAccessories: {
    head: null,
    face: null,
    shirt: 'shirt-rojo'                  // 🆕 Por defecto la roja
  },
  activeWeek: 1,
  parentPin: '1234',
  lastResetDate: null,
  dailyHistory: []
};

function migrateLegacyData() {
  try {
    const legacyXp = localStorage.getItem(LEGACY_KEYS.xp);
    const legacyTasks = localStorage.getItem(LEGACY_KEYS.tasks);
    const legacyName = localStorage.getItem(LEGACY_KEYS.userName);
    const legacyAvatar = localStorage.getItem(LEGACY_KEYS.userAvatar);

    if (!legacyXp && !legacyTasks && !legacyName && !legacyAvatar) {
      return null;
    }

    const migrated = JSON.parse(JSON.stringify(DEFAULT_STATE));

    if (legacyXp) migrated.stats.xp = parseInt(legacyXp, 10) || 0;
    if (legacyTasks) migrated.tasks = JSON.parse(legacyTasks);
    if (legacyName) migrated.profile.username = legacyName;
    if (legacyAvatar) migrated.profile.avatar = legacyAvatar;

    Object.values(LEGACY_KEYS).forEach((key) => localStorage.removeItem(key));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));

    return migrated;
  } catch (e) {
    console.error('Error migrando datos antiguos:', e);
    return null;
  }
}

function normalizeTask(task) {
  const difficulty = task.difficulty || suggestDifficultyFromTime(task.timeMinutes);
  return {
    ...task,
    difficulty,
    xpReward: task.xpReward || getXpFromDifficulty(difficulty),
    photo: task.photo || null
  };
}

export const storageService = {
  get() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        const normalizedTasks = (parsed.tasks || DEFAULT_STATE.tasks).map(normalizeTask);

        return {
          ...DEFAULT_STATE,
          ...parsed,
          profile: { ...DEFAULT_STATE.profile, ...(parsed.profile || {}) },
          stats: { ...DEFAULT_STATE.stats, ...(parsed.stats || {}) },
          settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) },
          weeklyTemplate: parsed.weeklyTemplate || DEFAULT_WEEKLY_TEMPLATE,
          dayOverrides: parsed.dayOverrides || {},
          dailyHistory: parsed.dailyHistory || [],
          notes: parsed.notes || [],
          customEvents: parsed.customEvents || [],
          unlockedAccessories: parsed.unlockedAccessories || DEFAULT_STATE.unlockedAccessories,
          equippedAccessories: parsed.equippedAccessories || DEFAULT_STATE.equippedAccessories,
          tasks: normalizedTasks
        };
      }

      const migrated = migrateLegacyData();
      if (migrated) {
        return {
          ...migrated,
          tasks: migrated.tasks.map(normalizeTask),
          notes: migrated.notes || [],
          customEvents: migrated.customEvents || [],
          unlockedAccessories: migrated.unlockedAccessories || DEFAULT_STATE.unlockedAccessories,
          equippedAccessories: migrated.equippedAccessories || DEFAULT_STATE.equippedAccessories
        };
      }

      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    } catch (e) {
      console.error('Error cargando storage:', e);
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  },

  save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Error guardando storage:', e);
    }
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },

  reset() {
    this.clear();
    Object.values(LEGACY_KEYS).forEach((key) => localStorage.removeItem(key));
  }
};