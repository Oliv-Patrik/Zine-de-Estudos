import React, { useEffect } from 'react';
import { X, Play, Pause, SkipForward } from 'lucide-react';
import { Subject, PomodoroMode } from '../types';
import { useI18n } from '../i18n';
import { FocusMascot } from './illustrations/FocusMascot';

interface FocusModeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  remainingSeconds: number;
  isRunning: boolean;
  onTogglePlay: () => void;
  onSkip: () => void;
  mode: PomodoroMode;
  subject?: Subject;
  topic?: string;
  theme?: 'dark' | 'light';
}

export const FocusModeOverlay: React.FC<FocusModeOverlayProps> = ({
  isOpen,
  onClose,
  remainingSeconds,
  isRunning,
  onTogglePlay,
  onSkip,
  mode,
  subject,
  topic,
  theme = 'dark',
}) => {
  const { t } = useI18n();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const isDark = theme === 'dark';

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-12 transition-colors duration-300 select-none animate-in fade-in"
      style={{
        backgroundColor: isDark ? '#0F1216' : '#F1F5F9',
        color: isDark ? '#F4F6F8' : '#0F172A',
      }}
    >
      {/* Top row with exit button */}
      <div className="w-full max-w-4xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          {subject && (
            <span
              className="px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide"
              style={{
                backgroundColor: subject.color + '25',
                color: isDark ? '#E2E8F0' : subject.color,
                border: `1px solid ${subject.color}40`,
              }}
            >
              {subject.name}
            </span>
          )}
          {topic && (
            <span className="text-xs text-[#8A99AD] truncate max-w-xs sm:max-w-md">
              {topic}
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-2.5 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
          title={t('pomodoro.exitFocusMode')}
        >
          <X size={20} />
        </button>
      </div>

      {/* Center Zone: Mascot + Giant Timer */}
      <div className="flex flex-col items-center justify-center my-auto">
        <div className="mb-4 opacity-80 scale-90 sm:scale-100">
          <FocusMascot theme={isDark ? 'dark' : 'light'} />
        </div>

        <div className="text-7xl sm:text-9xl font-bold font-timer-mono tracking-tighter my-2 tabular-nums">
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>

        <div className="text-sm font-semibold uppercase tracking-widest text-[#0E7490] mt-2 font-display">
          {mode === 'focus' ? t('pomodoro.focus') : t('pomodoro.shortBreak')}
        </div>

        <p className="mt-4 text-center max-w-md text-sm sm:text-base font-serif-italic opacity-70">
          &ldquo;{t('pomodoro.quote1')}&rdquo;
        </p>

        {/* Minimalist Controls */}
        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={onTogglePlay}
            className="px-8 py-3 rounded-full bg-[#0E7490] text-white font-display font-bold text-sm tracking-wide hover:bg-[#0891B2] transition-transform active:scale-95 flex items-center gap-2"
          >
            {isRunning ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            <span>{isRunning ? t('pomodoro.pause') : t('pomodoro.start')}</span>
          </button>

          <button
            onClick={onSkip}
            className="p-3 rounded-full border border-current opacity-60 hover:opacity-100 transition-opacity"
            title={t('pomodoro.skip')}
          >
            <SkipForward size={18} />
          </button>
        </div>
      </div>

      {/* Bottom hint */}
      <div className="text-xs opacity-40 font-mono tracking-wider">
        ESC para sair · ESPAÇO para pausar/retomar
      </div>
    </div>
  );
};
