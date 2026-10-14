import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
} from './lib/googleDrive';
import { I18nProvider } from './i18n';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { PomodoroTimer } from './components/PomodoroTimer';
import { FocusModeOverlay } from './components/FocusModeOverlay';
import { DailyGoals } from './components/DailyGoals';
import { ConsistencyCharts } from './components/ConsistencyCharts';
import { SessionsList } from './components/SessionsList';
import { SessionFormModal } from './components/SessionFormModal';
import { SubjectManagerModal } from './components/SubjectManagerModal';
import { SettingsModal } from './components/SettingsModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';

const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';
const STORAGE_LOGGED_IN_KEY = 'caderno_user_logged_in';

export default function App() {
  const [appState, setAppState] = useState<AppStateData>(() => loadLocalState());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('local');
  const [userProfile, setUserProfile] = useState<GoogleUserProfile | null>(null);

  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Selected subject for Pomodoro
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => {
    return appState.subjects[0]?.id || '';
  });

  // Sync state changes to localStorage and Drive (if authenticated)
  const updateState = useCallback((updater: (prev: AppStateData) => AppStateData) => {
    setAppState((prev) => {
      const next = updater(prev);
      saveLocalState(next);

      // If connected to Google Drive, trigger background cloud push
      const token = getCachedToken();
      if (token) {
        setSyncStatus('syncing');
        uploadToDrive(token, next)
          .then((success) => setSyncStatus(success ? 'synced' : 'error'))
          .catch(() => setSyncStatus('error'));
      }

      return next;
    });
  }, []);

  // Update theme on root document
  useEffect(() => {
    if (appState.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#121518';
      document.body.style.color = '#F4F6F8';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#F4F6F8';
      document.body.style.color = '#121518';
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

  // Sync helper with Google Drive
  const syncWithDrive = useCallback(async (token: string, currentState: AppStateData) => {
    try {
      setSyncStatus('syncing');
      const remoteData = await fetchFromDrive(token);
      if (remoteData) {
        // Conflict resolution: compare lastModified
        if (remoteData.lastModified > currentState.lastModified) {
          setAppState(remoteData);
          saveLocalState(remoteData);
        } else {
          // Local is newer or equal, push local
          await uploadToDrive(token, currentState);
        }
      } else {
        // First time cloud sync, create initial file in Drive
        await uploadToDrive(token, currentState);
      }
      setSyncStatus('synced');
    } catch (err) {
      console.error('Drive sync error:', err);
      setSyncStatus('error');
    }
  }, []);

  // Check login on startup & auto-sync if previously authenticated
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const wasLoggedIn = localStorage.getItem(STORAGE_LOGGED_IN_KEY) === 'true';
    if (!wasLoggedIn) return;

    // Give GIS script a brief moment to initialize
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
          // Don't disturb the user; stay in local mode
          setSyncStatus('local');
        },
        true // silent request
      );
    }, 500);

    return () => clearTimeout(initTimer);
  }, []); // Run on startup

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

  // Calculate today's studied minutes
  const todayDateStr = getTodayDateString();
  const todayStudiedMinutes = useMemo(() => {
    return appState.sessions
      .filter((s) => s.date === todayDateStr)
      .reduce((acc, curr) => acc + curr.durationMinutes, 0);
  }, [appState.sessions, todayDateStr]);

  // Total accumulated hours
  const totalHours = useMemo(() => {
    const totalMinutes = appState.sessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    return Math.round(totalMinutes / 60);
  }, [appState.sessions]);

  // Current streak
  const currentStreak = useMemo(() => {
    const dateSet = new Set(appState.sessions.map((s) => s.date));
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
  }, [appState.sessions]);

  // Session handlers
  const handleSaveSession = (
    sessionData: Omit<StudySession, 'id' | 'createdAt'>,
    existingId?: string
  ) => {
    updateState((prev) => {
      if (existingId) {
        // Update existing session
        const updated = prev.sessions.map((s) =>
          s.id === existingId ? { ...s, ...sessionData } : s
        );
        return { ...prev, sessions: updated };
      } else {
        // Add new session
        const newSession: StudySession = {
          ...sessionData,
          id: `sess-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          createdAt: Date.now(),
        };
        return { ...prev, sessions: [newSession, ...prev.sessions] };
      }
    });
  };

  const handleDeleteSession = (sessionId: string) => {
    updateState((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((s) => s.id !== sessionId),
    }));
  };

  // Goal task handlers
  const handleAddTask = (text: string) => {
    const newTask: GoalTask = {
      id: `task-${Date.now()}`,
      text,
      completed: false,
      date: todayDateStr,
      createdAt: Date.now(),
    };
    updateState((prev) => ({
      ...prev,
      goalTasks: [newTask, ...prev.goalTasks],
    }));
  };

  const handleToggleTask = (taskId: string) => {
    updateState((prev) => ({
      ...prev,
      goalTasks: prev.goalTasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    updateState((prev) => ({
      ...prev,
      goalTasks: prev.goalTasks.filter((t) => t.id !== taskId),
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
    const newSubj: Subject = {
      id: `subj-${Date.now()}`,
      name,
      color,
      createdAt: Date.now(),
    };
    updateState((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSubj],
    }));
    setSelectedSubjectId(newSubj.id);
  };

  const handleUpdateSubject = (id: string, name: string, color: string) => {
    updateState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => (s.id === id ? { ...s, name, color } : s)),
    }));
  };

  const handleToggleArchiveSubject = (id: string) => {
    updateState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => (s.id === id ? { ...s, archived: !s.archived } : s)),
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
    const content = JSON.stringify(appState, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `caderno_estudos_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (imported: AppStateData) => {
    setAppState(imported);
    saveLocalState(imported);
  };

  const handleLoadDemoData = () => {
    const demo = generateSeedData();
    setAppState(demo);
    saveLocalState(demo);
  };

  const handleClearAllData = () => {
    const clean = clearAllLocalData();
    setAppState(clean);
  };

  // Theme & Language toggles
  const handleToggleTheme = () => {
    const nextTheme: AppTheme = appState.theme === 'dark' ? 'light' : 'dark';
    updateState((prev) => ({ ...prev, theme: nextTheme }));
  };

  const handleToggleLanguage = () => {
    const nextLang: AppLanguage = appState.language === 'pt-BR' ? 'en' : 'pt-BR';
    updateState((prev) => ({ ...prev, language: nextLang }));
  };

  const activeSubject = appState.subjects.find((s) => s.id === selectedSubjectId) || appState.subjects[0];

  return (
    <I18nProvider
      initialLang={appState.language}
      onLanguageChange={(l) => updateState((prev) => ({ ...prev, language: l }))}
    >
      <div className="min-h-screen flex flex-col risograph-texture">
        {/* Top Bar Header */}
        <Header
          language={appState.language}
          onToggleLanguage={handleToggleLanguage}
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
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-12 sm:gap-16">
          {/* Hero Section */}
          <HeroSection
            theme={appState.theme}
            currentStreak={currentStreak}
            totalHours={totalHours}
          />

          {/* Pomodoro Timer Centerpiece */}
          <section id="pomodoro" className="w-full">
            <PomodoroTimer
              subjects={appState.subjects}
              settings={appState.pomodoroSettings}
              onSessionComplete={(sess) => handleSaveSession(sess)}
              onOpenFocusMode={() => setIsFocusModeOpen(true)}
              selectedSubjectId={selectedSubjectId}
              onSelectSubjectId={setSelectedSubjectId}
              theme={appState.theme}
            />
          </section>

          {/* Daily Goals & Checklist Section (Breath of Contrast Block) */}
          <DailyGoals
            todayStudiedMinutes={todayStudiedMinutes}
            targetMinutes={appState.dailyTargetMinutes}
            onUpdateTargetMinutes={handleUpdateTargetMinutes}
            tasks={appState.goalTasks}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            theme={appState.theme}
          />

          {/* Consistency Charts & Heatmap */}
          <ConsistencyCharts
            sessions={appState.sessions}
            subjects={appState.subjects}
            theme={appState.theme}
          />

          {/* Study Sessions Log & History */}
          <SessionsList
            sessions={appState.sessions}
            subjects={appState.subjects}
            onEditSession={(sess) => {
              setEditingSession(sess);
              setIsSessionModalOpen(true);
            }}
            onDeleteSession={handleDeleteSession}
            onOpenNewSessionModal={() => {
              setEditingSession(null);
              setIsSessionModalOpen(true);
            }}
            theme={appState.theme}
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
        <FocusModeOverlay
          isOpen={isFocusModeOpen}
          onClose={() => setIsFocusModeOpen(false)}
          remainingSeconds={25 * 60}
          isRunning={false}
          onTogglePlay={() => {}}
          onSkip={() => {}}
          mode="focus"
          subject={activeSubject}
          theme={appState.theme}
        />

        <SessionFormModal
          isOpen={isSessionModalOpen}
          onClose={() => {
            setIsSessionModalOpen(false);
            setEditingSession(null);
          }}
          onSave={handleSaveSession}
          subjects={appState.subjects}
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
          subjects={appState.subjects}
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
    </I18nProvider>
  );
}
