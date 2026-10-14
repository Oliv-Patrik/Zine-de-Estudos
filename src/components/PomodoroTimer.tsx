import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Maximize2,
  BookOpen,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Subject, PomodoroMode, PomodoroSettings, StudySession } from '../types';
import { useI18n } from '../i18n';
import { playSoftChime } from '../lib/audio';
import { StickerTag, StarburstStar, SparkleDecal } from './illustrations/Stickers';

interface PomodoroTimerProps {
  subjects: Subject[];
  settings: PomodoroSettings;
  onSessionComplete: (session: Omit<StudySession, 'id' | 'createdAt'>) => void;
  onOpenFocusMode: () => void;
  selectedSubjectId: string;
  onSelectSubjectId: (id: string) => void;
  theme?: 'dark' | 'light';
}

const LOCAL_STORAGE_POMO = 'caderno_pomodoro_runtime_v1';

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  subjects,
  settings,
  onSessionComplete,
  onOpenFocusMode,
  selectedSubjectId,
  onSelectSubjectId,
  theme = 'dark',
}) => {
  const { t } = useI18n();
  const isDark = theme === 'dark';

  const [mode, setMode] = useState<PomodoroMode>('focus');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [targetEndTime, setTargetEndTime] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(settings.focusMinutes * 60);
  const [currentCycle, setCurrentCycle] = useState<number>(1);
  const [sessionTopic, setSessionTopic] = useState<string>('');
  const [soundActive, setSoundActive] = useState<boolean>(settings.soundEnabled);

  // Reference to avoid stale state in timer callbacks
  const stateRef = useRef({
    mode,
    isRunning,
    targetEndTime,
    remainingSeconds,
    currentCycle,
    selectedSubjectId,
    sessionTopic,
    settings,
    soundActive,
  });

  useEffect(() => {
    stateRef.current = {
      mode,
      isRunning,
      targetEndTime,
      remainingSeconds,
      currentCycle,
      selectedSubjectId,
      sessionTopic,
      settings,
      soundActive,
    };
  });

  // Load saved timer state on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_POMO);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.mode) setMode(parsed.mode);
        if (parsed.currentCycle) setCurrentCycle(parsed.currentCycle);
        if (parsed.sessionTopic) setSessionTopic(parsed.sessionTopic);
        if (parsed.selectedSubjectId) onSelectSubjectId(parsed.selectedSubjectId);

        if (parsed.isRunning && parsed.targetEndTime) {
          const now = Date.now();
          const diff = Math.max(0, Math.ceil((parsed.targetEndTime - now) / 1000));
          if (diff > 0) {
            setRemainingSeconds(diff);
            setTargetEndTime(parsed.targetEndTime);
            setIsRunning(true);
          } else {
            // Timer expired while away
            setRemainingSeconds(0);
            setIsRunning(false);
            setTargetEndTime(null);
          }
        } else if (parsed.remainingSeconds !== undefined) {
          setRemainingSeconds(parsed.remainingSeconds);
        }
      }
    } catch (err) {
      console.warn('Failed to load pomodoro runtime:', err);
    }
  }, []);

  // Save timer state changes
  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_POMO,
        JSON.stringify({
          mode,
          isRunning,
          targetEndTime,
          remainingSeconds,
          currentCycle,
          selectedSubjectId,
          sessionTopic,
        })
      );
    } catch {
      // Ignore quota errors
    }
  }, [mode, isRunning, targetEndTime, remainingSeconds, currentCycle, selectedSubjectId, sessionTopic]);

  // Total seconds for current phase
  const getTotalSeconds = (targetMode: PomodoroMode): number => {
    switch (targetMode) {
      case 'focus':
        return settings.focusMinutes * 60;
      case 'shortBreak':
        return settings.shortBreakMinutes * 60;
      case 'longBreak':
        return settings.longBreakMinutes * 60;
    }
  };

  const activeTotalSeconds = getTotalSeconds(mode);

  // Precision countdown based on Date.now() and targetEndTime
  useEffect(() => {
    if (!isRunning || !targetEndTime) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((targetEndTime - now) / 1000));
      setRemainingSeconds(diff);

      if (diff <= 0) {
        clearInterval(interval);
        handlePhaseComplete();
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isRunning, targetEndTime]);

  // Synchronize document tab title with remaining countdown
  useEffect(() => {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const modeLabel = mode === 'focus' ? t('pomodoro.focus') : t('pomodoro.shortBreak');

    if (isRunning) {
      document.title = `(${formatted}) ${modeLabel} · ${t('app.title')}`;
    } else {
      document.title = `${t('app.title')} — ${t('app.subtitle')}`;
    }

    return () => {
      document.title = `${t('app.title')} — ${t('app.subtitle')}`;
    };
  }, [remainingSeconds, isRunning, mode, t]);

  // Spacebar shortcut to Start/Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        if (isRunning) {
          handlePause();
        } else {
          handleStart();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, remainingSeconds, mode, targetEndTime]);

  const handleStart = () => {
    const end = Date.now() + remainingSeconds * 1000;
    setTargetEndTime(end);
    setIsRunning(true);
  };

  const handlePause = () => {
    if (targetEndTime) {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((targetEndTime - now) / 1000));
      setRemainingSeconds(diff);
    }
    setIsRunning(false);
    setTargetEndTime(null);
  };

  const handleReset = (targetMode = mode) => {
    setIsRunning(false);
    setTargetEndTime(null);
    setRemainingSeconds(getTotalSeconds(targetMode));
  };

  const handleSwitchMode = (newMode: PomodoroMode) => {
    setMode(newMode);
    setIsRunning(false);
    setTargetEndTime(null);
    setRemainingSeconds(getTotalSeconds(newMode));
  };

  const handlePhaseComplete = () => {
    const current = stateRef.current;
    setIsRunning(false);
    setTargetEndTime(null);

    // Audio chime
    if (current.soundActive) {
      playSoftChime('phaseComplete');
    }

    // Browser Notification
    if ('Notification' in window && Notification.permission === 'granted' && current.settings.notificationsEnabled) {
      const title = current.mode === 'focus' ? 'Foco Concluído!' : 'Pausa Concluída!';
      const body =
        current.mode === 'focus'
          ? 'Excelente trabalho! Hora de respirar e fazer uma pausa.'
          : 'Pausa encerrada. Vamos voltar ao foco?';
      new Notification(title, { body, icon: '/favicon.ico' });
    }

    if (current.mode === 'focus') {
      // Record completed session automatically
      const today = new Date().toISOString().slice(0, 10);
      onSessionComplete({
        subjectId: current.selectedSubjectId || subjects[0]?.id || '',
        durationMinutes: current.settings.focusMinutes,
        date: today,
        topic: current.sessionTopic || undefined,
        fromPomodoro: true,
      });

      // Advance cycle
      const nextCycle =
        current.currentCycle < current.settings.cyclesBeforeLongBreak ? current.currentCycle + 1 : 1;
      setCurrentCycle(nextCycle);

      // If finished the 4th cycle -> long break, otherwise short break
      if (current.currentCycle >= current.settings.cyclesBeforeLongBreak) {
        setMode('longBreak');
        setRemainingSeconds(current.settings.longBreakMinutes * 60);
      } else {
        setMode('shortBreak');
        setRemainingSeconds(current.settings.shortBreakMinutes * 60);
      }
    } else {
      // Returned from break to focus
      setMode('focus');
      setRemainingSeconds(current.settings.focusMinutes * 60);
    }
  };

  const handleSkip = () => {
    handlePhaseComplete();
  };

  // Progress calculations
  const progressFraction = Math.max(0, Math.min(1, 1 - remainingSeconds / activeTotalSeconds));
  const radius = 135;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressFraction);

  const displayMinutes = Math.floor(remainingSeconds / 60);
  const displaySeconds = remainingSeconds % 60;
  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* Playful Stickers floating around timer */}
      <div className="absolute -top-3 -left-4 z-20 hidden sm:block">
        <StickerTag
          text={mode === 'focus' ? t('stickers.focus') : t('stickers.zen')}
          variant="teal"
          rotation={-5}
          icon={<StarburstStar size={14} color="#FFFFFF" />}
        />
      </div>

      <div className="absolute -bottom-3 -right-2 z-20 hidden sm:block">
        <StickerTag
          text={`${t('pomodoro.cycleIndicator', { current: currentCycle, total: settings.cyclesBeforeLongBreak })}`}
          variant="slate"
          rotation={4}
        />
      </div>

      {/* Main Center Card */}
      <div
        className={`w-full rounded-3xl p-6 sm:p-8 border transition-all relative overflow-hidden shadow-sm ${
          isDark
            ? 'bg-[#181F26] border-[#2A3744]'
            : 'bg-[#FFFFFF] border-[#D6E0EA]'
        }`}
      >
        {/* Header row inside timer: Phase tabs & sound/focus toggles */}
        <div className="flex items-center justify-between gap-2 mb-6">
          {/* Segmented Phase Switcher */}
          <div
            className={`inline-flex items-center p-1 rounded-xl text-xs font-semibold ${
              isDark ? 'bg-[#12161B]' : 'bg-[#EDF2F7]'
            }`}
          >
            {(['focus', 'shortBreak', 'longBreak'] as PomodoroMode[]).map((m) => {
              const active = mode === m;
              return (
                <button
                  key={m}
                  onClick={() => handleSwitchMode(m)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-150 ${
                    active
                      ? 'bg-[#0E7490] text-white shadow-sm'
                      : isDark
                      ? 'text-[#94A3B8] hover:text-[#F1F5F9]'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {m === 'focus'
                    ? t('pomodoro.focus')
                    : m === 'shortBreak'
                    ? t('pomodoro.shortBreak')
                    : t('pomodoro.longBreak')}
                </button>
              );
            })}
          </div>

          {/* Quick utility controls (Sound toggle, Focus mode full-screen) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                const next = !soundActive;
                setSoundActive(next);
                if (next) playSoftChime('tick');
              }}
              title={soundActive ? 'Mudo' : 'Ativar som'}
              className={`p-2 rounded-xl text-xs transition-colors ${
                isDark
                  ? 'text-[#94A3B8] hover:text-white hover:bg-[#232D37]'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]'
              }`}
            >
              {soundActive ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            <button
              onClick={onOpenFocusMode}
              title={t('pomodoro.focusMode')}
              className={`p-2 rounded-xl text-xs transition-colors ${
                isDark
                  ? 'text-[#94A3B8] hover:text-white hover:bg-[#232D37]'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0]'
              }`}
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        {/* Circular Dial & Big Typography Timer */}
        <div className="relative flex items-center justify-center py-4">
          <svg className="w-68 h-68 sm:w-80 sm:h-80 -rotate-90 transform" viewBox="0 0 320 320">
            {/* Background Track Ring */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              className={isDark ? 'stroke-[#222C37]' : 'stroke-[#E2E8F0]'}
              strokeWidth="10"
              fill="transparent"
            />
            {/* Animated Active Progress Ring */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              stroke="#0E7490"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-[stroke-dashoffset] duration-300 ease-linear"
            />
          </svg>

          {/* Timer Display inside the Ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
            {/* Cycle indicator */}
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className={`text-[11px] font-bold tracking-wider uppercase font-display px-2.5 py-0.5 rounded-full ${
                  isDark ? 'bg-[#222C37] text-[#94A3B8]' : 'bg-[#E2E8F0] text-[#475569]'
                }`}
              >
                {t('pomodoro.cycleIndicator', {
                  current: currentCycle,
                  total: settings.cyclesBeforeLongBreak,
                })}
              </span>
            </div>

            {/* Giant Monospace Tabular Clock */}
            <div
              className={`text-6xl sm:text-7xl font-bold font-timer-mono tracking-tight my-1 ${
                isDark ? 'text-[#F4F6F8]' : 'text-[#0F172A]'
              }`}
            >
              {String(displayMinutes).padStart(2, '0')}:
              {String(displaySeconds).padStart(2, '0')}
            </div>

            {/* Selected Subject Tag */}
            {activeSubject && (
              <div className="mt-1 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#12161B]/60 text-white backdrop-blur-sm border border-white/10">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: activeSubject.color }}
                />
                <span className="truncate max-w-[150px]">{activeSubject.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Subject Selector & Topic Input */}
        <div className="mt-4 pt-4 border-t border-dashed border-[#2A3744]/40 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <label
              htmlFor="pomo-subject-select"
              className={`text-xs font-semibold shrink-0 flex items-center gap-1.5 ${
                isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'
              }`}
            >
              <BookOpen size={14} />
              {t('pomodoro.chooseSubject')}:
            </label>
            <select
              id="pomo-subject-select"
              value={selectedSubjectId}
              onChange={(e) => onSelectSubjectId(e.target.value)}
              className={`w-full text-xs font-medium rounded-xl px-3 py-2 border transition-colors ${
                isDark
                  ? 'bg-[#12161B] text-[#F1F5F9] border-[#2A3744] focus:border-[#0E7490]'
                  : 'bg-[#F8FAFC] text-[#0F172A] border-[#CBD5E1] focus:border-[#0E7490]'
              }`}
            >
              {subjects
                .filter((s) => !s.archived)
                .map((subj) => (
                  <option key={subj.id} value={subj.id}>
                    {subj.name}
                  </option>
                ))}
            </select>
          </div>

          <input
            type="text"
            value={sessionTopic}
            onChange={(e) => setSessionTopic(e.target.value)}
            placeholder={t('pomodoro.topicPlaceholder')}
            className={`w-full text-xs rounded-xl px-3.5 py-2 border transition-colors ${
              isDark
                ? 'bg-[#12161B] text-[#F1F5F9] border-[#2A3744] placeholder-[#475569] focus:border-[#0E7490]'
                : 'bg-[#F8FAFC] text-[#0F172A] border-[#CBD5E1] placeholder-[#94A3B8] focus:border-[#0E7490]'
            }`}
          />
        </div>

        {/* Primary Controls Bar */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => handleReset()}
            title={t('pomodoro.reset')}
            className={`p-3 rounded-2xl border transition-all ${
              isDark
                ? 'bg-[#1A222B] text-[#94A3B8] border-[#2E3C4B] hover:text-white hover:bg-[#253240]'
                : 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1] hover:text-[#0F172A] hover:bg-[#E2E8F0]'
            }`}
          >
            <RotateCcw size={18} />
          </button>

          {isRunning ? (
            <button
              onClick={handlePause}
              className="px-8 py-3.5 rounded-2xl bg-[#0E7490] text-white font-display font-bold text-sm tracking-wide shadow-md hover:bg-[#0891B2] transition-all flex items-center gap-2 transform active:scale-95"
            >
              <Pause size={18} fill="currentColor" />
              <span>{t('pomodoro.pause')}</span>
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="px-8 py-3.5 rounded-2xl bg-[#0E7490] text-white font-display font-bold text-sm tracking-wide shadow-md hover:bg-[#0891B2] transition-all flex items-center gap-2 transform active:scale-95"
            >
              <Play size={18} fill="currentColor" />
              <span>
                {remainingSeconds < activeTotalSeconds
                  ? t('pomodoro.resume')
                  : t('pomodoro.start')}
              </span>
            </button>
          )}

          <button
            onClick={handleSkip}
            title={t('pomodoro.skip')}
            className={`p-3 rounded-2xl border transition-all ${
              isDark
                ? 'bg-[#1A222B] text-[#94A3B8] border-[#2E3C4B] hover:text-white hover:bg-[#253240]'
                : 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1] hover:text-[#0F172A] hover:bg-[#E2E8F0]'
            }`}
          >
            <SkipForward size={18} />
          </button>
        </div>

        {/* Personality text quote below timer */}
        <p
          className={`text-center text-xs mt-5 italic font-serif-italic ${
            isDark ? 'text-[#8A99AD]' : 'text-[#526071]'
          }`}
        >
          &ldquo;
          {mode === 'focus'
            ? t('pomodoro.quote1')
            : mode === 'shortBreak'
            ? t('pomodoro.quote4')
            : t('pomodoro.quote3')}
          &rdquo;
        </p>
      </div>
    </div>
  );
};
