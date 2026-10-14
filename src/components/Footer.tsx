import React from 'react';
import { useI18n } from '../i18n';
import { StarburstStar } from './illustrations/Stickers';

interface FooterProps {
  onOpenSettings: () => void;
  theme?: 'dark' | 'light';
}

export const Footer: React.FC<FooterProps> = ({ onOpenSettings, theme = 'dark' }) => {
  const { t } = useI18n();
  const isDark = theme === 'dark';

  return (
    <footer
      className={`w-full py-12 px-6 border-t mt-16 pb-24 md:pb-12 ${
        isDark ? 'border-[#222A33] text-[#64748B]' : 'border-[#D5DFE8] text-[#94A3B8]'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 font-display font-bold uppercase tracking-wider">
          <StarburstStar size={14} color="#0E7490" />
          <span>{t('app.title')}</span>
          <span>·</span>
          <span className="font-normal font-sans lowercase">{t('app.subtitle')}</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onOpenSettings}
            className="hover:text-[#0E7490] transition-colors font-medium"
          >
            {t('nav.settings')} & Backup
          </button>
          <span>·</span>
          <span>100% Pessoal & Offline</span>
        </div>
      </div>
    </footer>
  );
};
