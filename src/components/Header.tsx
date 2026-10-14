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
  LogOut,
  Info,
} from 'lucide-react';
import { AppLanguage, AppTheme, SyncStatus, GoogleUserProfile } from '../types';
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
  userProfile: GoogleUserProfile | null;
  isClientIdConfigured: boolean;
  onSignInGoogle: () => void;
  onSignOutGoogle: () => void;
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
  userProfile,
  isClientIdConfigured,
  onSignInGoogle,
  onSignOutGoogle,
}) => {
  const { t } = useI18n();
  const isDark = theme === 'dark';

  const getSyncIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw size={12} className="animate-spin text-[#38BDF8]" />;
      case 'synced':
        return <Check size={12} className="text-[#34D399]" />;
      case 'error':
        return <AlertCircle size={12} className="text-red-400" />;
      case 'offline':
        return <CloudOff size={12} className="text-[#94A3B8]" />;
      default:
        return <Cloud size={12} className="text-[#94A3B8]" />;
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
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider font-display opacity-80">
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

        {/* Zone 3: Google Auth, Sync state, language/theme toggles & primary action */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Google Auth / User Account Area */}
          {userProfile ? (
            /* Logged In User Pill with Sync Status & Logout */
            <div
              className={`flex items-center gap-1.5 p-1 sm:pr-2.5 rounded-full border text-xs font-medium transition-colors ${
                isDark
                  ? 'bg-[#1A2026] border-[#2C3642] text-[#F4F6F8]'
                  : 'bg-white border-[#D5DFE8] text-[#121518]'
              }`}
            >
              {/* User Avatar */}
              {userProfile.picture ? (
                <img
                  src={userProfile.picture}
                  alt={userProfile.name}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#0E7490] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}

              {/* User First Name */}
              <span className="hidden sm:inline text-xs font-semibold max-w-[85px] truncate">
                {userProfile.name.split(' ')[0]}
              </span>

              {/* Sync Status Badge (click to trigger sync) */}
              <button
                onClick={onTriggerSync}
                title={getSyncLabel()}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                  isDark
                    ? 'bg-[#121518] hover:bg-[#222A33] text-[#94A3B8]'
                    : 'bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#475569]'
                }`}
              >
                {getSyncIcon()}
                <span className="hidden md:inline">{getSyncLabel()}</span>
              </button>

              {/* Sign Out Button */}
              <button
                onClick={onSignOutGoogle}
                title={t('sync.signOut')}
                className="p-1 rounded-full text-[#94A3B8] hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : isClientIdConfigured ? (
            /* "Entrar com Google" Button */
            <button
              onClick={onSignInGoogle}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold font-display tracking-tight transition-all shadow-xs ${
                isDark
                  ? 'bg-[#1A2026] hover:bg-[#222A33] text-[#F4F6F8] border-[#2C3642]'
                  : 'bg-white hover:bg-slate-50 text-[#121518] border-[#D5DFE8]'
              }`}
            >
              {/* Google G Logo SVG */}
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.43 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.57 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span className="whitespace-nowrap">{t('sync.signInGoogle')}</span>
            </button>
          ) : (
            /* Client ID not configured -> Discreet Warning & Local Mode */
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border select-none ${
                isDark
                  ? 'bg-[#1A2026] border-[#2C3642] text-[#94A3B8]'
                  : 'bg-white border-[#D5DFE8] text-[#64748B]'
              }`}
              title={t('sync.syncUnavailable')}
            >
              <Info size={12} className="text-[#0E7490]" />
              <span className="hidden sm:inline">{t('sync.localMode')}</span>
              <span className="sm:hidden text-[10px]">Local</span>
            </div>
          )}

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
