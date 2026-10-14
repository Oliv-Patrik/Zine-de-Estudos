import React, { useEffect } from 'react';
import { X, Play, Pause, SkipForward } from 'lucide-react';
import { Subject, PomodoroMode } from '../types';
import { useI18n } from '../i18n';
import { FocusMascot } from './illustrations/FocusMascot';
import { MaskingTapeStrip } from './illustrations/PunkStickers';

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
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-12 transition-colors select-none animate-in fade-in"
      style={{
        backgroundColor: isDark ? '#0B0C0E' : '#F3EFE6',
        color: isDark ? '#F5F2EB' : '#111317',
      }}
    >
      {/* Top row with exit button */}
      <div className="w-full max-w-4xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          {subject && (
            <span
              className="px-3 py-1 border-2 border-black font-stencil uppercase tracking-wider text-xs font-bold"
              style={{
                backgroundColor: subject.color,
                color: '#FFFFFF',
              }}
            >
              {subject.name}
            </span>
          )}
          {topic && (
            <span className="text-xs font-semibold opacity-75 truncate max-w-xs sm:max-w-md font-sans-body">
              {topic}
            </span>
          )}
        </div>

        <button
          onClick={onClose}
          className="p-2 border-2 border-black punk-btn bg-[#DC2626] text-white"
          title={t('pomodoro.exitFocusMode')}
        >
          <X size={20} />
        </button>
      </div>

      {/* Center Zone: Mascot + Giant Timer */}
      <div className="flex flex-col items-center justify-center my-auto relative">
        <div className="absolute -top-3 left-10">
          <MaskingTapeStrip width="w-24" rotation={-4} />
        </div>

        <div className="mb-4 scale-95 sm:scale-105">
          <FocusMascot theme={isDark ? 'dark' : 'light'} />
        </div>

        <div className="text-7xl sm:text-9xl font-black font-timer-mono tracking-tight my-2 tabular-nums">
          {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
        </div>

        <div className="text-base font-black uppercase tracking-widest text-[#DC2626] font-stencil">
          {mode === 'focus' ? t('pomodoro.focus') : t('pomodoro.shortBreak')}
        </div>

        <p className="mt-4 text-center max-w-md text-sm sm:text-base font-marker text-[#DC2626]">
          &ldquo;{t('pomodoro.quote1')}&rdquo;
        </p>

        {/* Minimalist Controls */}
        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={onTogglePlay}
            className="px-8 py-3 bg-[#DC2626] text-white font-stencil font-black text-sm tracking-wider uppercase border-2 border-black punk-btn flex items-center gap-2"
          >
            {isRunning ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
            <span>{isRunning ? t('pomodoro.pause') : t('pomodoro.start')}</span>
          </button>

          <button
            onClick={onSkip}
            className="p-3 border-2 border-black punk-btn"
            title={t('pomodoro.skip')}
          >
            <SkipForward size={18} />
          </button>
        </div>
      </div>

      {/* Bottom hint */}
      <div className="text-xs font-stencil tracking-wider uppercase opacity-60">
        ESC PARA SAIR · ESPAÇO PARA PAUSAR/RETOMAR
      </div>
    </div>
  );
};
