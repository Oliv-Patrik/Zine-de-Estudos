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
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 border-t backdrop-blur-md flex items-center justify-around px-2 ${
        isDark
          ? 'bg-[#121518]/95 border-[#222A33] text-[#94A3B8]'
          : 'bg-[#FFFFFF]/95 border-[#D5DFE8] text-[#64748B]'
      }`}
    >
      <a
        href="#pomodoro"
        className="flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider font-display hover:text-[#0E7490] transition-colors"
      >
        <Timer size={18} />
        <span>{t('nav.pomodoro')}</span>
      </a>

      <a
        href="#metas"
        className="flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider font-display hover:text-[#0E7490] transition-colors"
      >
        <Target size={18} />
        <span>{t('nav.goals')}</span>
      </a>

      {/* Center Quick Action Float */}
      <button
        onClick={onOpenNewSession}
        className="w-12 h-12 rounded-full bg-[#0E7490] text-white flex items-center justify-center -mt-5 shadow-lg border-2 border-[#121518] hover:bg-[#0891B2] transition-transform active:scale-95"
        title={t('sessions.quickLog')}
      >
        <Plus size={22} />
      </button>

      <a
        href="#constancia"
        className="flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider font-display hover:text-[#0E7490] transition-colors"
      >
        <BarChart2 size={18} />
        <span>{t('nav.analytics')}</span>
      </a>

      <a
        href="#sessoes"
        className="flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider font-display hover:text-[#0E7490] transition-colors"
      >
        <BookOpen size={18} />
        <span>{t('nav.history')}</span>
      </a>
    </nav>
  );
};
