export interface Subject {
  id: string;
  name: string;
  color: string; // cold palette hex
  icon?: string;
  archived?: boolean;
  createdAt: number;
}

export interface StudySession {
  id: string;
  subjectId: string;
  durationMinutes: number;
  date: string; // YYYY-MM-DD
  topic?: string;
  notes?: string;
  fromPomodoro?: boolean;
  createdAt: number;
}

export interface GoalTask {
  id: string;
  text: string;
  completed: boolean;
  date: string; // YYYY-MM-DD
  createdAt: number;
}

export interface DailyGoalConfig {
  targetMinutes: number; // e.g. 120
}

export type PomodoroMode = 'focus' | 'shortBreak' | 'longBreak';

export interface PomodoroSettings {
  focusMinutes: number; // 25
  shortBreakMinutes: number; // 5
  longBreakMinutes: number; // 15
  cyclesBeforeLongBreak: number; // 4
  soundEnabled: boolean;
  autoStartBreaks: boolean;
  notificationsEnabled: boolean;
}

export interface PomodoroState {
  mode: PomodoroMode;
  isRunning: boolean;
  targetEndTime: number | null; // Date.now() + remainingMs
  remainingSeconds: number;
  currentCycle: number; // 1 to cyclesBeforeLongBreak
  selectedSubjectId: string;
  currentTopic: string;
}

export type SyncStatus = 'synced' | 'syncing' | 'error' | 'local' | 'offline';

export type AppLanguage = 'pt-BR' | 'en';
export type AppTheme = 'dark' | 'light';

export interface GoogleUserProfile {
  name: string;
  email: string;
  picture?: string;
}

export interface AppStateData {
  version: number;
  lastModified: number;
  subjects: Subject[];
  sessions: StudySession[];
  goalTasks: GoalTask[];
  dailyTargetMinutes: number;
  pomodoroSettings: PomodoroSettings;
  pomodoroState?: Partial<PomodoroState>;
  language: AppLanguage;
  theme: AppTheme;
}

