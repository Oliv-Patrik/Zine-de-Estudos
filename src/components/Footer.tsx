import React from 'react';
import { useI18n } from '../i18n';
import { Zap, Volume2, Shield } from 'lucide-react';
import { SpikedBooksMascot } from './illustrations/PunkArtworks';
import { MaskingTapeStrip, SafetyPinDecal } from './illustrations/PunkStickers';

interface FooterProps {
  onOpenSettings: () => void;
  theme?: 'dark' | 'light';
}

export const Footer: React.FC<FooterProps> = ({ onOpenSettings, theme = 'dark' }) => {
  const { t } = useI18n();
  const isDark = theme === 'dark';

  return (
    <footer
      className={`w-full py-12 px-4 sm:px-6 border-t-2 border-black mt-16 pb-24 md:pb-12 relative transition-colors ${
        isDark ? 'bg-[#0B0C0E] text-[#A2A9B5]' : 'bg-[#F3EFE6] text-[#3C424C]'
      }`}
    >
      <div className="absolute -top-3 left-1/4 hidden sm:block">
        <MaskingTapeStrip width="w-28" rotation={-2} />
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
        {/* Brand identity & Motto */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#DC2626] text-white flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_#000000]">
              <Zap size={13} fill="currentColor" />
            </div>
            <span className="font-stencil font-black text-lg tracking-wider uppercase text-white dark:text-white">
              {t('app.title')}
            </span>
          </div>

          <span className="hidden sm:inline font-bold">·</span>

          <span className="font-marker text-xs text-[#DC2626]">
            &ldquo;{t('app.subtitle')}&rdquo;
          </span>
        </div>

        {/* Links & Attributes */}
        <div className="flex flex-wrap items-center justify-center gap-4 font-stencil uppercase tracking-wider text-xs">
          <button
            onClick={onOpenSettings}
            className="hover:text-[#DC2626] transition-colors font-bold flex items-center gap-1.5"
          >
            <Shield size={13} />
            <span>{t('nav.settings')} & Backup</span>
          </button>
          <span>·</span>
          <span>100% Pessoal & Offline</span>
          <span>·</span>
          <span className="text-[#DC2626] font-bold">DIY · 2026</span>
        </div>
      </div>
    </footer>
  );
};
