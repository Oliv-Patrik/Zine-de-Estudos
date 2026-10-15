import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  AppStateData,
  StudySession,
  Subject,
  GoalTask,
  PomodoroSettings,
  SyncStatus,
  AppLanguage,
  AppTheme,
  GoogleUserProfile,
} from './types';
import { loadLocalState, saveLocalState, generateSeedData, clearAllLocalData, getTodayDateString } from './lib/storage';
import {
  requestGoogleAccessToken,
  fetchUserProfile,
  signOutGoogle,
  fetchFromDrive,
  uploadToDrive,
  getCachedToken,
  mergeAppState,
  isTokenExpired,
} from './lib/googleDrive';
import { I18nProvider, useI18n } from './i18n';
import { ToastProvider, useToast } from './components/Toast';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { PomodoroTimer } from './components/PomodoroTimer';
import { DailyGoals } from './components/DailyGoals';
import { ConsistencyCharts } from './components/ConsistencyCharts';
import { SessionsList } from './components/SessionsList';
import { GarageRadioPlayer } from './components/GarageRadioPlayer';
import { SessionFormModal } from './components/SessionFormModal';
import { SubjectManagerModal } from './components/SubjectManagerModal';
import { SettingsModal } from './components/SettingsModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';

const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';
const STORAGE_LOGGED_IN_KEY = 'caderno_user_logged_in';

function MainApp({
  appState,
  setAppState,
}: {
  appState: AppStateData;
  setAppState: React.Dispatch<React.SetStateAction<AppStateData>>;
}) {
  const { t, setLanguage } = useI18n();
  const { showToast } = useToast();

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('local');
  const [userProfile, setUserProfile] = useState<GoogleUserProfile | null>(null);

  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [highlightedSessionId, setHighlightedSessionId] = useState<string | null>(null);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState<boolean>(false);

  // Selected subject for Pomodoro
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => {
    return appState.subjects[0]?.id || '';
  });

  // State update helper
  const updateState = useCallback((updater: (prev: AppStateData) => AppStateData) => {
    setAppState((prev) => {
      const next = updater(prev);
      saveLocalState(next);
      return next;
    });
  }, [setAppState]);

  // Update theme on root document
  useEffect(() => {
    if (appState.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#0B0C0E';
      document.body.style.color = '#F5F2EB';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#F3EFE6';
      document.body.style.color = '#111317';
    }
  }, [appState.theme]);

  // Online / Offline listeners
  useEffect(() => {
    const handleOnline = () => {
      const token = getCachedToken();
      if (token) setSyncStatus('synced');
      else setSyncStatus('local');
    };
    const handleOffline = () => setSyncStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync helper with Google Drive (downloads, merges via CRDT, and uploads merged state)
  const syncWithDrive = useCallback(async (token: string, currentState: AppStateData) => {
    try {
      setSyncStatus('syncing');
      const remoteData = await fetchFromDrive(token);
      if (remoteData) {
        // Merge with CRDT last-write-wins by entity id and preserving deletedAt tombstones
        const merged = mergeAppState(currentState, remoteData);
        setAppState(merged);
        saveLocalState(merged);
        await uploadToDrive(token, merged);
      } else {
        // Initial file creation in appDataFolder
        await uploadToDrive(token, currentState);
      }
      setSyncStatus('synced');
    } catch (err) {
      console.error('Drive sync error:', err);
      setSyncStatus('error');
    }
  }, [setAppState]);

  // Debounced auto-save to Google Drive on every change (~2s debounce)
  const isInitialMount = useRef(true);
  const debounceSyncTimerRef = useRef<any>(null);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const token = getCachedToken();
    if (!token || !userProfile || !GOOGLE_CLIENT_ID) return;

    if (debounceSyncTimerRef.current) {
      clearTimeout(debounceSyncTimerRef.current);
    }

    setSyncStatus('syncing');
    debounceSyncTimerRef.current = setTimeout(async () => {
      try {
        let currentToken = getCachedToken();
        if (!currentToken || isTokenExpired()) {
          requestGoogleAccessToken(
            GOOGLE_CLIENT_ID,
            async (newToken) => {
              const ok = await uploadToDrive(newToken, appState);
              setSyncStatus(ok ? 'synced' : 'error');
            },
            () => setSyncStatus('error'),
            true
          );
          return;
        }

        const ok = await uploadToDrive(currentToken, appState);
        if (ok) {
          setSyncStatus('synced');
        } else {
          // Retry once with silent token renewal
          requestGoogleAccessToken(
            GOOGLE_CLIENT_ID,
            async (newToken) => {
              const retryOk = await uploadToDrive(newToken, appState);
              setSyncStatus(retryOk ? 'synced' : 'error');
            },
            () => setSyncStatus('error'),
            true
          );
        }
      } catch (e) {
        console.error('Debounced upload error:', e);
        setSyncStatus('error');
      }
    }, 2000);

    return () => {
      if (debounceSyncTimerRef.current) {
        clearTimeout(debounceSyncTimerRef.current);
      }
    };
  }, [appState, userProfile]);

  // Check login on startup & auto-sync if previously authenticated
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const wasLoggedIn = localStorage.getItem(STORAGE_LOGGED_IN_KEY) === 'true';
    if (!wasLoggedIn) return;

    const initTimer = setTimeout(() => {
      requestGoogleAccessToken(
        GOOGLE_CLIENT_ID,
        async (token) => {
          try {
            const profile = await fetchUserProfile(token);
            if (profile) {
              setUserProfile(profile);
            }
            await syncWithDrive(token, appState);
          } catch (err) {
            console.warn('Auto-sync on load note:', err);
          }
        },
        (err) => {
          console.warn('Silent auto-auth on load error:', err);
          setSyncStatus('local');
        },
        true // silent request
      );
    }, 500);

    return () => clearTimeout(initTimer);
  }, []);

  // Silent token renewal interval while session is active (every 45 minutes)
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !userProfile) return;

    const interval = setInterval(() => {
      requestGoogleAccessToken(
        GOOGLE_CLIENT_ID,
        async (token) => {
          const profile = await fetchUserProfile(token);
          if (profile) setUserProfile(profile);
          await syncWithDrive(token, appState);
        },
        (err) => console.warn('Background token renewal error:', err),
        true // silent
      );
    }, 45 * 60 * 1000);

    return () => clearInterval(interval);
  }, [userProfile, appState, syncWithDrive]);

  // Google Sign In trigger (from button click)
  const handleSignInGoogle = () => {
    if (!GOOGLE_CLIENT_ID) return;

    setSyncStatus('syncing');
    requestGoogleAccessToken(
      GOOGLE_CLIENT_ID,
      async (token) => {
        try {
          const profile = await fetchUserProfile(token);
          setUserProfile(profile || { name: 'Conta Google', email: '' });
          localStorage.setItem(STORAGE_LOGGED_IN_KEY, 'true');
          await syncWithDrive(token, appState);
        } catch (err) {
          console.error('Google Sign In callback error:', err);
          setSyncStatus('error');
        }
      },
      (err) => {
        console.error('Google Auth error:', err);
        setSyncStatus('error');
      },
      false
    );
  };

  // Google Sign Out trigger
  const handleSignOutGoogle = () => {
    const token = getCachedToken();
    signOutGoogle(token);
    setUserProfile(null);
    localStorage.removeItem(STORAGE_LOGGED_IN_KEY);
    setSyncStatus('local');
  };

  // Manual Trigger Sync from Header Badge
  const handleTriggerSync = () => {
    const token = getCachedToken();
    if (token) {
      syncWithDrive(token, appState);
    } else if (GOOGLE_CLIENT_ID) {
      handleSignInGoogle();
    }
  };

  // Filter out soft-deleted items for application calculations and views
  const activeSessions = useMemo(() => {
    return appState.sessions.filter((s) => !s.deletedAt);
  }, [appState.sessions]);

  // Calculate today's studied minutes
  const todayDateStr = getTodayDateString();
  const todayStudiedMinutes = useMemo(() => {
    return activeSessions
      .filter((s) => s.date === todayDateStr)
      .reduce((acc, curr) => acc + curr.durationMinutes, 0);
  }, [activeSessions, todayDateStr]);

  // Total accumulated hours
  const totalHours = useMemo(() => {
    const totalMinutes = activeSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    return Math.round(totalMinutes / 60);
  }, [activeSessions]);

  // Current streak
  const currentStreak = useMemo(() => {
    const dateSet = new Set(activeSessions.map((s) => s.date));
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    let streak = 0;
    const checkDate = dateSet.has(todayStr) ? today : dateSet.has(yesterdayStr) ? yesterday : null;

    if (checkDate) {
      const d = new Date(checkDate);
      while (true) {
        const dStr = d.toISOString().slice(0, 10);
        if (dateSet.has(dStr)) {
          streak++;
          d.setDate(d.getDate() - 1);
        } else {
          break;
        }
      }
    }
    return streak;
  }, [activeSessions]);

  // Scroll to session card in history with pulsing highlight
  const viewSessionInHistory = useCallback((sessionId: string) => {
    setHighlightedSessionId(sessionId);

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    setTimeout(() => {
      const element = document.getElementById(`session-row-${sessionId}`);
      if (element) {
        element.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'center',
        });
      } else {
        const historySection = document.getElementById('sessoes');
        if (historySection) {
          historySection.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'start',
          });
        }
      }
    }, 60);

    setTimeout(() => {
      setHighlightedSessionId((current) => (current === sessionId ? null : current));
    }, 2200);
  }, []);

  // Session handlers
  const handleSaveSession = (
    sessionData: Omit<StudySession, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    let createdId = existingId;
    const now = Date.now();

    updateState((prev) => {
      if (existingId) {
        // Update existing session
        const updated = prev.sessions.map((s) =>
          s.id === existingId ? { ...s, ...sessionData, updatedAt: now } : s
        );
        return { ...prev, sessions: updated };
      } else {
        // Add new session
        createdId = `sess-${now}-${Math.random().toString(36).slice(2, 7)}`;
        const newSession: StudySession = {
          ...sessionData,
          id: createdId,
          createdAt: now,
          updatedAt: now,
        };
        return { ...prev, sessions: [newSession, ...prev.sessions] };
      }
    });

    // Requirement 4: Show Toast with "Ver no histórico" button after saving manual or Pomodoro session
    if (!existingId && createdId) {
      const isFromPomodoro = sessionData.fromPomodoro;
      const message = isFromPomodoro
        ? t('sessions.pomodoroSessionSaved')
        : t('sessions.manualSessionSaved');

      const targetId = createdId;
      showToast({
        id: `created-${targetId}`,
        message,
        duration: 8000,
        action: {
          label: t('sessions.viewInHistory'),
          onClick: () => {
            viewSessionInHistory(targetId);
          },
        },
      });
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    const now = Date.now();
    updateState((prev) => ({
      ...prev,
      sessions: prev.sessions.map((s) =>
        s.id === sessionId ? { ...s, deletedAt: now, updatedAt: now } : s
      ),
    }));
  };

  const handleRestoreSession = (session: StudySession) => {
    const now = Date.now();
    updateState((prev) => {
      const exists = prev.sessions.some((s) => s.id === session.id);
      if (exists) {
        return {
          ...prev,
          sessions: prev.sessions.map((s) =>
            s.id === session.id ? { ...s, deletedAt: null, updatedAt: now } : s
          ),
        };
      }
      return {
        ...prev,
        sessions: [{ ...session, deletedAt: null, updatedAt: now }, ...prev.sessions],
      };
    });
  };

  // Goal task handlers
  const handleAddTask = (text: string) => {
    const now = Date.now();
    const newTask: GoalTask = {
      id: `task-${now}`,
      text,
      completed: false,
      date: todayDateStr,
      createdAt: now,
      updatedAt: now,
    };
    updateState((prev) => ({
      ...prev,
      goalTasks: [newTask, ...prev.goalTasks],
    }));
  };

  const handleToggleTask = (taskId: string) => {
    const now = Date.now();
    updateState((prev) => ({
      ...prev,
      goalTasks: prev.goalTasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed, updatedAt: now } : t
      ),
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    const now = Date.now();
    updateState((prev) => ({
      ...prev,
      goalTasks: prev.goalTasks.map((t) =>
        t.id === taskId ? { ...t, deletedAt: now, updatedAt: now } : t
      ),
    }));
  };

  const handleUpdateTargetMinutes = (mins: number) => {
    updateState((prev) => ({
      ...prev,
      dailyTargetMinutes: mins,
    }));
  };

  // Subject handlers
  const handleAddSubject = (name: string, color: string) => {
    const now = Date.now();
    const newSubj: Subject = {
      id: `subj-${now}`,
      name,
      color,
      createdAt: now,
      updatedAt: now,
    };
    updateState((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSubj],
    }));
    setSelectedSubjectId(newSubj.id);
  };

  const handleUpdateSubject = (id: string, name: string, color: string) => {
    const now = Date.now();
    updateState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) =>
        s.id === id ? { ...s, name, color, updatedAt: now } : s
      ),
    }));
  };

  const handleToggleArchiveSubject = (id: string) => {
    const now = Date.now();
    updateState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) =>
        s.id === id ? { ...s, archived: !s.archived, updatedAt: now } : s
      ),
    }));
  };

  // Settings handlers
  const handleUpdateSettings = (settings: PomodoroSettings) => {
    updateState((prev) => ({
      ...prev,
      pomodoroSettings: settings,
    }));
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(appState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `zine-de-estudos-backup-${todayDateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJson = (jsonData: AppStateData) => {
    setAppState(jsonData);
    saveLocalState(jsonData);
    const token = getCachedToken();
    if (token) {
      uploadToDrive(token, jsonData);
    }
  };

  const handleLoadDemoData = () => {
    const demo = generateSeedData();
    setAppState(demo);
    saveLocalState(demo);
  };

  const handleClearAllData = () => {
    const empty = clearAllLocalData();
    setAppState(empty);
  };

  const handleToggleTheme = () => {
    const newTheme: AppTheme = appState.theme === 'dark' ? 'light' : 'dark';
    updateState((prev) => ({ ...prev, theme: newTheme }));
  };

  const handleToggleLanguage = () => {
    const newLang: AppLanguage = appState.language === 'pt-BR' ? 'en' : 'pt-BR';
    setLanguage(newLang);
    updateState((prev) => ({ ...prev, language: newLang }));
  };

  const handleChangeLanguage = (newLang: AppLanguage) => {
    setLanguage(newLang);
    updateState((prev) => ({ ...prev, language: newLang }));
  };

  const isDark = appState.theme === 'dark';

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors selection:bg-[#DC2626] selection:text-white relative ${
        isDark ? 'bg-[#0B0C0E] text-[#F5F2EB]' : 'bg-[#F3EFE6] text-[#111317]'
      }`}
    >
      {/* Header Bar */}
      <Header
        language={appState.language}
        onToggleLanguage={handleToggleLanguage}
        onChangeLanguage={handleChangeLanguage}
        theme={appState.theme}
        onToggleTheme={handleToggleTheme}
        syncStatus={syncStatus}
        onTriggerSync={handleTriggerSync}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenNewSession={() => {
          setEditingSession(null);
          setIsSessionModalOpen(true);
        }}
        userProfile={userProfile}
        isClientIdConfigured={!!GOOGLE_CLIENT_ID}
        onSignInGoogle={handleSignInGoogle}
        onSignOutGoogle={handleSignOutGoogle}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-12 sm:gap-16 py-6 sm:py-8">
        {/* Hero Section */}
        <HeroSection
          theme={appState.theme}
          currentStreak={currentStreak}
          totalHours={totalHours}
        />

        {/* Pomodoro Timer Centerpiece & Garage Radio Ambient Station */}
        <section id="pomodoro" className="w-full flex flex-col gap-6">
          <PomodoroTimer
            subjects={appState.subjects.filter((s) => !s.deletedAt)}
            settings={appState.pomodoroSettings}
            onSessionComplete={(sess) => handleSaveSession(sess)}
            onToggleSound={(enabled) =>
              updateState((prev) => ({
                ...prev,
                pomodoroSettings: { ...prev.pomodoroSettings, soundEnabled: enabled },
              }))
            }
            onRunningChange={setIsPomodoroRunning}
            selectedSubjectId={selectedSubjectId}
            onSelectSubjectId={setSelectedSubjectId}
            theme={appState.theme}
          />

          {/* Garage Radio Ambient Audio Player */}
          <div id="radio">
            <GarageRadioPlayer
              theme={appState.theme}
              isPomodoroRunning={isPomodoroRunning}
            />
          </div>
        </section>

        {/* Daily Goals & Checklist Section */}
        <DailyGoals
          todayStudiedMinutes={todayStudiedMinutes}
          targetMinutes={appState.dailyTargetMinutes}
          onUpdateTargetMinutes={handleUpdateTargetMinutes}
          tasks={appState.goalTasks.filter((t) => !t.deletedAt)}
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
          onDeleteTask={handleDeleteTask}
          theme={appState.theme}
        />

        {/* Consistency Charts & Heatmap */}
        <ConsistencyCharts
          sessions={activeSessions}
          subjects={appState.subjects.filter((s) => !s.deletedAt)}
          theme={appState.theme}
        />

        {/* Study Sessions Log & History */}
        <SessionsList
          sessions={activeSessions}
          subjects={appState.subjects.filter((s) => !s.deletedAt)}
          onEditSession={(sess) => {
            setEditingSession(sess);
            setIsSessionModalOpen(true);
          }}
          onDeleteSession={handleDeleteSession}
          onRestoreSession={handleRestoreSession}
          onOpenNewSessionModal={() => {
            setEditingSession(null);
            setIsSessionModalOpen(true);
          }}
          theme={appState.theme}
          highlightedSessionId={highlightedSessionId}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        theme={appState.theme}
      />

      {/* Mobile Thumb Navigation */}
      <MobileBottomNav
        onOpenNewSession={() => {
          setEditingSession(null);
          setIsSessionModalOpen(true);
        }}
        theme={appState.theme}
      />

      {/* Modals & Full-screen Overlays */}
      <SessionFormModal
        isOpen={isSessionModalOpen}
        onClose={() => {
          setIsSessionModalOpen(false);
          setEditingSession(null);
        }}
        onSave={handleSaveSession}
        subjects={appState.subjects.filter((s) => !s.deletedAt)}
        onOpenSubjectManager={() => {
          setIsSessionModalOpen(false);
          setIsSubjectModalOpen(true);
        }}
        editingSession={editingSession}
        theme={appState.theme}
      />

      <SubjectManagerModal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        subjects={appState.subjects.filter((s) => !s.deletedAt)}
        onAddSubject={handleAddSubject}
        onUpdateSubject={handleUpdateSubject}
        onToggleArchiveSubject={handleToggleArchiveSubject}
        theme={appState.theme}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={appState.pomodoroSettings}
        onUpdateSettings={handleUpdateSettings}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onLoadDemoData={handleLoadDemoData}
        onClearAllData={handleClearAllData}
        theme={appState.theme}
      />
    </div>
  );
}

export default function App() {
  const [appState, setAppState] = useState<AppStateData>(() => loadLocalState());

  return (
    <I18nProvider initialLang={appState.language}>
      <ToastProvider>
        <MainApp appState={appState} setAppState={setAppState} />
      </ToastProvider>
    </I18nProvider>
  );
}
