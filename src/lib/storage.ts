import { AppStateData, StudySession, GoalTask, Subject } from '../types';
import { DEFAULT_SUBJECTS } from '../constants/palette';

const PRIMARY_STORAGE_KEY = 'zine_estudos_state_v1';
const LEGACY_STORAGE_KEY = 'caderno_estudos_state_v1';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateSeedData(): AppStateData {
  const today = getTodayDateString();
  const subjects: Subject[] = [...DEFAULT_SUBJECTS];

  // Generate 75 rich realistic study sessions over the last 90 days
  const sampleTopics = [
    'Leitura crítica e síntese do manifesto',
    'Resolução de problemas de grafos e DFS/BFS',
    'Arquitetura tolerante a falhas e protocolo Raft',
    'Tipos avançados e compilação sem atalhos',
    'Sistemas distribuídos e consistência eventual',
    'Prototipação de zine e tipografia editorial',
    'Complexidade assintótica e algoritmos gulosos',
    'Controle de versão descentralizado',
    'Otimização de índices e modelagem sem censura',
  ];

  const sessions: StudySession[] = [];
  let sessionIdCounter = 1;

  // Ensure current active streak of 14 days including today
  for (let offset = 0; offset < 90; offset++) {
    const studied = offset < 14 || Math.sin(offset * 0.45) > -0.3;
    if (studied) {
      const dateStr = formatDateOffset(offset);
      const sessionCount = offset % 3 === 0 ? 2 : 1;

      for (let s = 0; s < sessionCount; s++) {
        const subjectIdx = (offset + s) % subjects.length;
        const durations = [25, 45, 50, 60, 90, 120];
        const duration = durations[(offset * 2 + s) % durations.length];

        sessions.push({
          id: `session-seed-${sessionIdCounter++}`,
          subjectId: subjects[subjectIdx].id,
          durationMinutes: duration,
          date: dateStr,
          topic: sampleTopics[(offset + s) % sampleTopics.length],
          notes: s === 0 ? 'Foco absoluto. Anotações feitas no papel com caneta preta.' : undefined,
          fromPomodoro: duration % 25 === 0,
          createdAt: Date.now() - offset * 86400000 - s * 3600000,
        });
      }
    }
  }

  const goalTasks: GoalTask[] = [
    {
      id: 'task-1',
      text: 'Revisar 25 cartões de repetição espaçada',
      completed: true,
      date: today,
      createdAt: Date.now() - 14400000,
    },
    {
      id: 'task-2',
      text: 'Completar 3 blocos de foco no Pomodoro',
      completed: true,
      date: today,
      createdAt: Date.now() - 12000000,
    },
    {
      id: 'task-3',
      text: 'Escrever resumo de Sistemas Distribuídos',
      completed: false,
      date: today,
      createdAt: Date.now() - 7200000,
    },
    {
      id: 'task-4',
      text: 'Resolver 5 exercícios da lista sem consultar gabarito',
      completed: false,
      date: today,
      createdAt: Date.now() - 3600000,
    },
  ];

  return {
    version: 2,
    lastModified: Date.now(),
    subjects,
    sessions,
    goalTasks,
    dailyTargetMinutes: 120,
    pomodoroSettings: {
      focusMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      cyclesBeforeLongBreak: 4,
      soundEnabled: true,
      autoStartBreaks: false,
      notificationsEnabled: false,
    },
    pomodoroState: {
      mode: 'focus',
      isRunning: false,
      targetEndTime: null,
      remainingSeconds: 25 * 60,
      currentCycle: 1,
      selectedSubjectId: subjects[0].id,
      currentTopic: '',
    },
    language: 'pt-BR',
    theme: 'dark',
  };
}

export function loadLocalState(): AppStateData {
  try {
    const raw = localStorage.getItem(PRIMARY_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) {
      const initial = generateSeedData();
      saveLocalState(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as AppStateData;
    if (!parsed.subjects || !parsed.sessions) {
      const initial = generateSeedData();
      saveLocalState(initial);
      return initial;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load local state, using seed data:', err);
    return generateSeedData();
  }
}

export function saveLocalState(state: AppStateData): void {
  try {
    const updated = {
      ...state,
      lastModified: Date.now(),
    };
    localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export function clearAllLocalData(): AppStateData {
  localStorage.removeItem(PRIMARY_STORAGE_KEY);
  localStorage.removeItem(LEGACY_STORAGE_KEY);
  const emptyState: AppStateData = {
    version: 2,
    lastModified: Date.now(),
    subjects: [...DEFAULT_SUBJECTS],
    sessions: [],
    goalTasks: [],
    dailyTargetMinutes: 120,
    pomodoroSettings: {
      focusMinutes: 25,
      shortBreakMinutes: 5,
      longBreakMinutes: 15,
      cyclesBeforeLongBreak: 4,
      soundEnabled: true,
      autoStartBreaks: false,
      notificationsEnabled: false,
    },
    pomodoroState: {
      mode: 'focus',
      isRunning: false,
      targetEndTime: null,
      remainingSeconds: 25 * 60,
      currentCycle: 1,
      selectedSubjectId: DEFAULT_SUBJECTS[0].id,
      currentTopic: '',
    },
    language: 'pt-BR',
    theme: 'dark',
  };
  saveLocalState(emptyState);
  return emptyState;
}
