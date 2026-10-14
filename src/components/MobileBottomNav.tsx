import React from 'react';
import { Timer, Target, BarChart2, BookOpen, Plus } from 'lucide-react';
import { useI18n } from '../i18n';

interface MobileBottomNavProps {
  onOpenNewSession: () => void;
  theme?: 'dark' | 'light';
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenNewSession,
  theme = 'dark',
}) => {
  const { t } = useI18n();
  const isDark = theme === 'dark';

  return (
    <nav
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 border-t-2 border-black flex items-center justify-around px-2 ${
        isDark
          ? 'bg-[#0B0C0E]/95 text-[#A2A9B5]'
          : 'bg-[#F3EFE6]/95 text-[#3C424C]'
      }`}
    >
      <a
        href="#pomodoro"
        className="flex flex-col items-center justify-center gap-1 text-[11px] font-black uppercase tracking-wider font-stencil hover:text-[#DC2626] transition-colors"
      >
        <Timer size={18} />
        <span>{t('nav.pomodoro')}</span>
      </a>

      <a
        href="#metas"
        className="flex flex-col items-center justify-center gap-1 text-[11px] font-black uppercase tracking-wider font-stencil hover:text-[#DC2626] transition-colors"
      >
        <Target size={18} />
        <span>{t('nav.goals')}</span>
      </a>

      {/* Center Quick Action Float */}
      <button
        onClick={onOpenNewSession}
        className="w-12 h-12 bg-[#DC2626] text-white flex items-center justify-center -mt-5 border-2 border-black shadow-[3px_3px_0px_#000000] hover:bg-[#B91C1C] transition-transform active:translate-x-[2px] active:translate-y-[2px]"
        title={t('sessions.quickLog')}
      >
        <Plus size={24} strokeWidth={3} />
      </button>

      <a
        href="#constancia"
        className="flex flex-col items-center justify-center gap-1 text-[11px] font-black uppercase tracking-wider font-stencil hover:text-[#DC2626] transition-colors"
      >
        <BarChart2 size={18} />
        <span>{t('nav.analytics')}</span>
      </a>

      <a
        href="#sessoes"
        className="flex flex-col items-center justify-center gap-1 text-[11px] font-black uppercase tracking-wider font-stencil hover:text-[#DC2626] transition-colors"
      >
        <BookOpen size={18} />
        <span>{t('nav.history')}</span>
      </a>
    </nav>
  );
};
