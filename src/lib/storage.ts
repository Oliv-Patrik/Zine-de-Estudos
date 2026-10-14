import { AppStateData, StudySession, GoalTask, Subject } from '../types';
import { DEFAULT_SUBJECTS } from '../constants/palette';

const STORAGE_KEY = 'caderno_estudos_state_v1';

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
    'Leitura dos capítulos 3 e 4',
    'Resolução de problemas de grafos e DFS/BFS',
    'Implementação de protocolo raft',
    'Teoria dos tipos e sistemas de inferência',
    'Arquitetura orientada a eventos e CQRS',
    'Prototipação de componentes acessíveis',
    'Análise assintótica e algoritmos gulosos',
    'Consistência eventual e vetores de versão',
    'Otimização de consultas e índices compostos',
  ];

  const sessions: StudySession[] = [];
  let sessionIdCounter = 1;

  // Ensure current active streak of 12 days including today
  for (let offset = 0; offset < 90; offset++) {
    // Determine if student studied on this day
    // Last 12 days: every day has studies (creating 12-day active streak)
    // Earlier: realistic pattern (about 70% of days)
    const studied = offset < 12 || Math.sin(offset * 0.45) > -0.3;
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
          notes: s === 0 ? 'Foco profundo, sem distrações. Anotações feitas no bloco.' : undefined,
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
      text: 'Escrever resumo da aula de Sistemas Distribuídos',
      completed: false,
      date: today,
      createdAt: Date.now() - 7200000,
    },
    {
      id: 'task-4',
      text: 'Resolver 5 exercícios de fixação',
      completed: false,
      date: today,
      createdAt: Date.now() - 3600000,
    },
  ];

  return {
    version: 1,
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
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = generateSeedData();
      saveLocalState(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as AppStateData;
    // Basic verification
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export function clearAllLocalData(): AppStateData {
  localStorage.removeItem(STORAGE_KEY);
  const emptyState: AppStateData = {
    version: 1,
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
