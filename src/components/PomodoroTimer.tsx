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
import { playGuitarPowerChord, playPunkSound } from '../lib/audio';
import { PunkSticker, MaskingTapeStrip, SafetyPinDecal } from './illustrations/PunkStickers';
import { FocusModeOverlay } from './FocusModeOverlay';

interface PomodoroTimerProps {
  subjects: Subject[];
  settings: PomodoroSettings;
  onSessionComplete: (session: Omit<StudySession, 'id' | 'createdAt'>) => void;
  onOpenFocusMode?: () => void;
  selectedSubjectId: string;
  onSelectSubjectId: (id: string) => void;
  onToggleSound?: (enabled: boolean) => void;
  theme?: 'dark' | 'light';
}

const LOCAL_STORAGE_POMO = 'zine_pomodoro_runtime_v1';

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  subjects,
  settings,
  onSessionComplete,
  onOpenFocusMode,
  selectedSubjectId,
  onSelectSubjectId,
  onToggleSound,
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
  const [isFocusOverlayOpen, setIsFocusOverlayOpen] = useState<boolean>(false);

  // Synchronize internal soundActive state when changed from Settings
  useEffect(() => {
    setSoundActive(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Reference for stable timer callbacks
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

  // Load timer runtime from localStorage
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

  // Save runtime
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

  // Precision countdown
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
    }, 200);

    return () => clearInterval(interval);
  }, [isRunning, targetEndTime]);

  // Synchronize document title
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

  // Spacebar to start/pause
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
    if (soundActive) playPunkSound('click', 0.15);
  };

  const handlePause = () => {
    if (targetEndTime) {
      const now = Date.now();
      const diff = Math.max(0, Math.ceil((targetEndTime - now) / 1000));
      setRemainingSeconds(diff);
    }
    setIsRunning(false);
    setTargetEndTime(null);
    if (soundActive) playPunkSound('click', 0.15);
  };

  const handleReset = (targetMode = mode) => {
    setIsRunning(false);
    setTargetEndTime(null);
    setRemainingSeconds(getTotalSeconds(targetMode));
    if (soundActive) playPunkSound('click', 0.15);
  };

  const handleSwitchMode = (newMode: PomodoroMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setIsRunning(false);
    setTargetEndTime(null);
    setRemainingSeconds(getTotalSeconds(newMode));
    if (soundActive) {
      playGuitarPowerChord(newMode === 'focus' ? 'breakEnd' : 'stageChange', 0.28);
    }
  };

  const handlePhaseComplete = () => {
    const current = stateRef.current;
    setIsRunning(false);
    setTargetEndTime(null);

    // Audio Power Chord Guitar Synthesizer on stage alternate!
    if (current.soundActive) {
      if (current.mode === 'focus') {
        playGuitarPowerChord('focusEnd', 0.32);
      } else {
        playGuitarPowerChord('breakEnd', 0.3);
      }
    }

    // Browser Notification
    if ('Notification' in window && Notification.permission === 'granted' && current.settings.notificationsEnabled) {
      const title = current.mode === 'focus' ? 'Round Destruído!' : 'Pausa Encerrada!';
      const body =
        current.mode === 'focus'
          ? 'Bloco concluído com atitude. Hora de respirar!'
          : 'Pausa encerrada. Hora de voltar pro combate!';
      new Notification(title, { body, icon: '/favicon.svg' });
    }

    if (current.mode === 'focus') {
      const today = new Date().toISOString().slice(0, 10);
      onSessionComplete({
        subjectId: current.selectedSubjectId || subjects[0]?.id || '',
        durationMinutes: current.settings.focusMinutes,
        date: today,
        topic: current.sessionTopic || undefined,
        fromPomodoro: true,
      });

      const nextCycle =
        current.currentCycle < current.settings.cyclesBeforeLongBreak ? current.currentCycle + 1 : 1;
      setCurrentCycle(nextCycle);

      if (current.currentCycle >= current.settings.cyclesBeforeLongBreak) {
        setMode('longBreak');
        setRemainingSeconds(current.settings.longBreakMinutes * 60);
      } else {
        setMode('shortBreak');
        setRemainingSeconds(current.settings.shortBreakMinutes * 60);
      }
    } else {
      setMode('focus');
      setRemainingSeconds(current.settings.focusMinutes * 60);
    }
  };

  const progressFraction = Math.max(0, Math.min(1, 1 - remainingSeconds / activeTotalSeconds));
  const radius = 135;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressFraction);

  const displayMinutes = Math.floor(remainingSeconds / 60);
  const displaySeconds = remainingSeconds % 60;
  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  return (
    <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center">
      {/* Decorative Tape & Safety Pin on timer container */}
      <div className="absolute -top-3 left-6 z-20">
        <MaskingTapeStrip width="w-28" rotation={-3} />
      </div>
      <div className="absolute -bottom-3 -right-2 z-20 hidden sm:block">
        <PunkSticker
          text={`${t('pomodoro.cycleIndicator', { current: currentCycle, total: settings.cyclesBeforeLongBreak })}`}
          variant="black"
          rotation={3}
        />
      </div>
      <div className="absolute top-2 -right-4 z-20 hidden sm:block">
        <SafetyPinDecal size={30} rotation={25} />
      </div>

      {/* Main Center Card (Pasted Xerox Flyer with Hard Shadow) */}
      <div
        className={`w-full p-6 sm:p-8 border-2 transition-all relative overflow-hidden punk-shadow ${
          isDark
            ? 'bg-[#15181D] border-[#2E343D] text-[#F5F2EB]'
            : 'bg-[#FFFFFF] border-[#000000] text-[#111317]'
        }`}
      >
        {/* Header row: Phase tabs & sound/focus toggles */}
        <div className="flex items-center justify-between gap-2 mb-6">
          {/* Segmented Phase Switcher */}
          <div
            className={`inline-flex items-center p-1 border-2 border-black ${
              isDark ? 'bg-[#0B0C0E]' : 'bg-[#EAE4D6]'
            }`}
          >
            {(['focus', 'shortBreak', 'longBreak'] as PomodoroMode[]).map((m) => {
              const active = mode === m;
              return (
                <button
                  key={m}
                  onClick={() => handleSwitchMode(m)}
                  className={`px-3 py-1.5 font-stencil text-xs uppercase tracking-wider transition-all duration-100 ${
                    active
                      ? 'bg-[#DC2626] text-white shadow-[2px_2px_0px_#000000]'
                      : isDark
                      ? 'text-[#A2A9B5] hover:text-white'
                      : 'text-[#3C424C] hover:text-black'
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

          {/* Quick utility controls (Sound, Focus mode) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                const next = !soundActive;
                setSoundActive(next);
                if (onToggleSound) {
                  onToggleSound(next);
                }
                if (next) playGuitarPowerChord('stageChange', 0.28);
              }}
              title={soundActive ? 'Silenciar som de guitarra' : 'Ativar som de guitarra'}
              className={`p-2 border-2 border-black punk-btn text-xs ${
                isDark ? 'bg-[#0B0C0E] text-[#F5F2EB]' : 'bg-white text-black'
              }`}
            >
              {soundActive ? <Volume2 size={16} className="text-[#DC2626]" /> : <VolumeX size={16} className="opacity-50" />}
            </button>

            <button
              onClick={() => {
                setIsFocusOverlayOpen(true);
                if (onOpenFocusMode) onOpenFocusMode();
              }}
              title={t('pomodoro.focusMode')}
              className={`p-2 border-2 border-black punk-btn text-xs ${
                isDark ? 'bg-[#0B0C0E] text-[#F5F2EB]' : 'bg-white text-black'
              }`}
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        {/* Circular Dial with screenprint chalk/tinta stroke */}
        <div className="relative flex items-center justify-center py-4">
          <svg className="w-68 h-68 sm:w-80 sm:h-80 -rotate-90 transform" viewBox="0 0 320 320">
            {/* Background Track Ring */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              className={isDark ? 'stroke-[#252B33]' : 'stroke-[#E5E0D5]'}
              strokeWidth="12"
              fill="transparent"
            />
            {/* Ink/Chalk Texture Ring with Dash Pattern */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              stroke="#DC2626"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="square"
              fill="transparent"
              className="transition-[stroke-dashoffset] duration-200 ease-linear"
            />
          </svg>

          {/* Timer Display inside the Ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
            {/* Round indicator stamp */}
            <div className="flex items-center gap-1.5 mb-1">
              <span className="punk-stamp text-xs font-black px-2 py-0.5">
                {t('pomodoro.cycleIndicator', {
                  current: currentCycle,
                  total: settings.cyclesBeforeLongBreak,
                })}
              </span>
            </div>

            {/* Giant Tabular Clock (clean, high contrast WCAG AA) */}
            <div
              className={`text-6xl sm:text-7xl font-black font-timer-mono tracking-tight my-1 ${
                isDark ? 'text-[#F5F2EB]' : 'text-[#111317]'
              }`}
            >
              {String(displayMinutes).padStart(2, '0')}:
              {String(displaySeconds).padStart(2, '0')}
            </div>

            {/* Selected Subject Tag with ink color dot */}
            {activeSubject && (
              <div
                className="mt-1 flex items-center gap-1.5 px-3 py-1 border-2 border-black font-stencil text-xs uppercase tracking-wider"
                style={{
                  backgroundColor: isDark ? '#0B0C0E' : '#FFFFFF',
                  color: isDark ? '#F5F2EB' : '#111317',
                }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-none shrink-0 border border-black"
                  style={{ backgroundColor: activeSubject.color }}
                />
                <span className="truncate max-w-[150px]">{activeSubject.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Subject Selector & Topic Input */}
        <div className="mt-4 pt-4 border-t-2 border-dashed border-[#2E343D] flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <label
              htmlFor="pomo-subject-select"
              className="text-xs font-bold font-stencil uppercase tracking-wider shrink-0 flex items-center gap-1.5 opacity-80"
            >
              <BookOpen size={14} />
              {t('pomodoro.chooseSubject')}:
            </label>
            <select
              id="pomo-subject-select"
              value={selectedSubjectId}
              onChange={(e) => onSelectSubjectId(e.target.value)}
              className={`w-full text-xs font-bold rounded-none px-3 py-2 border-2 border-black transition-colors ${
                isDark
                  ? 'bg-[#0B0C0E] text-[#F5F2EB]'
                  : 'bg-white text-[#111317]'
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
            className={`w-full text-xs rounded-none px-3.5 py-2.5 border-2 border-black transition-colors ${
              isDark
                ? 'bg-[#0B0C0E] text-[#F5F2EB] placeholder-[#68707E]'
                : 'bg-white text-[#111317] placeholder-[#A2A9B5]'
            }`}
          />
        </div>

        {/* Primary Controls Bar */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => handleReset()}
            title={t('pomodoro.reset')}
            className={`p-3.5 border-2 border-black punk-btn ${
              isDark ? 'bg-[#15181D] text-[#A2A9B5] hover:text-white' : 'bg-white text-black'
            }`}
          >
            <RotateCcw size={18} />
          </button>

          {isRunning ? (
            <button
              onClick={handlePause}
              className="px-8 py-3.5 bg-[#DC2626] text-white font-stencil font-black text-base tracking-wider uppercase border-2 border-black punk-btn flex items-center gap-2"
            >
              <Pause size={18} fill="currentColor" />
              <span>{t('pomodoro.pause')}</span>
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="px-8 py-3.5 bg-[#DC2626] text-white font-stencil font-black text-base tracking-wider uppercase border-2 border-black punk-btn flex items-center gap-2"
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
            onClick={handlePhaseComplete}
            title={t('pomodoro.skip')}
            className={`p-3.5 border-2 border-black punk-btn ${
              isDark ? 'bg-[#15181D] text-[#A2A9B5] hover:text-white' : 'bg-white text-black'
            }`}
          >
            <SkipForward size={18} />
          </button>
        </div>

        {/* Marker handwriting quote below timer */}
        <p className="text-center text-xs mt-5 font-marker text-[#DC2626]">
          &ldquo;
          {mode === 'focus'
            ? t('pomodoro.quote1')
            : mode === 'shortBreak'
            ? t('pomodoro.quote4')
            : t('pomodoro.quote2')}
          &rdquo;
        </p>
      </div>

      {/* Full-Screen Distraction-Free Focus Overlay */}
      <FocusModeOverlay
        isOpen={isFocusOverlayOpen}
        onClose={() => setIsFocusOverlayOpen(false)}
        remainingSeconds={remainingSeconds}
        isRunning={isRunning}
        onTogglePlay={() => {
          if (isRunning) handlePause();
          else handleStart();
        }}
        onSkip={handlePhaseComplete}
        mode={mode}
        subject={activeSubject}
        topic={sessionTopic}
        theme={theme}
      />
    </div>
  );
};
