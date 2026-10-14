import React from 'react';
import {
  Sun,
  Moon,
  Settings,
  Plus,
  Cloud,
  CloudOff,
  RefreshCw,
  Check,
  AlertCircle,
} from 'lucide-react';
import { AppLanguage, AppTheme, SyncStatus } from '../types';
import { useI18n } from '../i18n';

interface HeaderProps {
  language: AppLanguage;
  onToggleLanguage: () => void;
  theme: AppTheme;
  onToggleTheme: () => void;
  syncStatus: SyncStatus;
  onTriggerSync: () => void;
  onOpenSettings: () => void;
  onOpenNewSession: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
  syncStatus,
  onTriggerSync,
  onOpenSettings,
  onOpenNewSession,
}) => {
  const { t } = useI18n();
  const isDark = theme === 'dark';

  const getSyncIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw size={13} className="animate-spin text-[#38BDF8]" />;
      case 'synced':
        return <Check size={13} className="text-[#34D399]" />;
      case 'error':
        return <AlertCircle size={13} className="text-red-400" />;
      case 'offline':
        return <CloudOff size={13} className="text-[#94A3B8]" />;
      default:
        return <Cloud size={13} className="text-[#94A3B8]" />;
    }
  };

  const getSyncLabel = () => {
    switch (syncStatus) {
      case 'syncing':
        return t('sync.syncing');
      case 'synced':
        return t('sync.synced');
      case 'error':
        return t('sync.error');
      case 'offline':
        return t('sync.offline');
      default:
        return t('sync.localMode');
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors ${
        isDark
          ? 'bg-[#121518]/90 border-[#222A33] text-[#F4F6F8]'
          : 'bg-[#F4F6F8]/90 border-[#D5DFE8] text-[#121518]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#"
          className="text-lg sm:text-xl font-black tracking-tight font-display uppercase whitespace-nowrap shrink-0 flex items-center gap-2 group"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#0E7490] group-hover:scale-125 transition-transform" />
          <span>{t('app.title')}</span>
        </a>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider font-display opacity-80">
          <a
            href="#pomodoro"
            className="hover:opacity-100 hover:text-[#0E7490] transition-colors whitespace-nowrap shrink-0"
          >
            {t('nav.pomodoro')}
          </a>
          <a
            href="#metas"
            className="hover:opacity-100 hover:text-[#0E7490] transition-colors whitespace-nowrap shrink-0"
          >
            {t('nav.goals')}
          </a>
          <a
            href="#constancia"
            className="hover:opacity-100 hover:text-[#0E7490] transition-colors whitespace-nowrap shrink-0"
          >
            {t('nav.analytics')}
          </a>
          <a
            href="#sessoes"
            className="hover:opacity-100 hover:text-[#0E7490] transition-colors whitespace-nowrap shrink-0"
          >
            {t('nav.history')}
          </a>
        </nav>

        {/* Zone 3: Sync state indicator, language/theme toggles & primary action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Cloud Sync Status Badge */}
          <button
            onClick={onTriggerSync}
            title={getSyncLabel()}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
              isDark
                ? 'bg-[#1A2026] border-[#2C3642] text-[#94A3B8] hover:text-white'
                : 'bg-white border-[#D5DFE8] text-[#475569] hover:text-[#121518]'
            }`}
          >
            {getSyncIcon()}
            <span className="truncate max-w-[110px]">{getSyncLabel()}</span>
          </button>

          {/* Language Switcher */}
          <button
            onClick={onToggleLanguage}
            className={`px-2 py-1 rounded-lg text-xs font-bold font-display border transition-colors ${
              isDark
                ? 'bg-[#1A2026] border-[#2C3642] text-[#94A3B8] hover:text-white'
                : 'bg-white border-[#D5DFE8] text-[#475569] hover:text-[#121518]'
            }`}
            title="Alterar idioma / Switch language"
          >
            {language === 'pt-BR' ? 'EN' : 'PT'}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-lg border transition-colors ${
              isDark
                ? 'bg-[#1A2026] border-[#2C3642] text-[#94A3B8] hover:text-white'
                : 'bg-white border-[#D5DFE8] text-[#475569] hover:text-[#121518]'
            }`}
            title="Alternar tema"
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Settings Modal Trigger */}
          <button
            onClick={onOpenSettings}
            className={`p-2 rounded-lg border transition-colors ${
              isDark
                ? 'bg-[#1A2026] border-[#2C3642] text-[#94A3B8] hover:text-white'
                : 'bg-white border-[#D5DFE8] text-[#475569] hover:text-[#121518]'
            }`}
            title={t('nav.settings')}
          >
            <Settings size={15} />
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onOpenNewSession}
            className="px-3.5 py-1.5 rounded-xl bg-[#0E7490] text-white text-xs font-bold font-display hover:bg-[#0891B2] transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">{t('sessions.quickLog')}</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
