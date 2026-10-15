import React, { useState, useRef, useEffect } from 'react';
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
  Zap,
  Globe,
} from 'lucide-react';
import { AppLanguage, AppTheme, SyncStatus, GoogleUserProfile } from '../types';
import { useI18n } from '../i18n';
import { MaskingTapeStrip } from './illustrations/PunkStickers';

interface HeaderProps {
  language: AppLanguage;
  onToggleLanguage: () => void;
  onChangeLanguage?: (lang: AppLanguage) => void;
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
  onChangeLanguage,
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
        return <RefreshCw size={12} className="animate-spin text-[#EF4444]" />;
      case 'synced':
        return <Check size={12} className="text-[#22C55E]" />;
      case 'error':
        return <AlertCircle size={12} className="text-[#DC2626]" />;
      case 'offline':
        return <CloudOff size={12} className="text-[#717885]" />;
      default:
        return <Cloud size={12} className="text-[#717885]" />;
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

  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const [focusedLangIndex, setFocusedLangIndex] = useState(0);

  const langOptions: { code: AppLanguage; label: string; short: string }[] = [
    { code: 'pt-BR', label: 'Português (Brasil)', short: 'PT' },
    { code: 'en', label: 'English', short: 'EN' },
  ];

  useEffect(() => {
    if (!isLangMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLangMenuOpen]);

  const handleSelectLanguage = (code: AppLanguage) => {
    if (onChangeLanguage) {
      onChangeLanguage(code);
    } else if (code !== language) {
      onToggleLanguage();
    }
    setIsLangMenuOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b-2 transition-colors ${
        isDark
          ? 'bg-[#0B0C0E]/95 border-[#2E343D] text-[#F5F2EB]'
          : 'bg-[#F3EFE6]/95 border-[#000000] text-[#111317]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8 relative">
        {/* Decorative Tape on Header edge */}
        <div className="absolute -top-1 left-48 hidden lg:block">
          <MaskingTapeStrip width="w-20" rotation={-2} />
        </div>

        {/* Zone 1: Single text element wordmark with stencil attitude */}
        <a
          href="#"
          className="text-xl sm:text-2xl font-black tracking-wider font-stencil uppercase whitespace-nowrap shrink-0 flex items-center gap-2 group"
        >
          <div className="w-7 h-7 rounded-sm bg-[#DC2626] text-white flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_#000000] group-hover:rotate-6 transition-transform">
            <Zap size={16} fill="currentColor" />
          </div>
          <span className="group-hover:text-[#DC2626] transition-colors">{t('app.title')}</span>
        </a>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-bold uppercase tracking-wider font-stencil opacity-85">
          <a
            href="#pomodoro"
            className="hover:opacity-100 hover:text-[#DC2626] transition-colors whitespace-nowrap shrink-0"
          >
            {t('nav.pomodoro')}
          </a>
          <a
            href="#metas"
            className="hover:opacity-100 hover:text-[#DC2626] transition-colors whitespace-nowrap shrink-0"
          >
            {t('nav.goals')}
          </a>
          <a
            href="#constancia"
            className="hover:opacity-100 hover:text-[#DC2626] transition-colors whitespace-nowrap shrink-0"
          >
            {t('nav.analytics')}
          </a>
          <a
            href="#sessoes"
            className="hover:opacity-100 hover:text-[#DC2626] transition-colors whitespace-nowrap shrink-0"
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
              className={`flex items-center gap-1.5 p-1 sm:pr-2.5 border-2 text-xs font-bold font-stencil transition-colors ${
                isDark
                  ? 'bg-[#15181D] border-[#2E343D] text-[#F5F2EB] shadow-[2px_2px_0px_#000000]'
                  : 'bg-white border-[#000000] text-[#111317] shadow-[2px_2px_0px_#000000]'
              }`}
            >
              {/* User Avatar */}
              {userProfile.picture ? (
                <img
                  src={userProfile.picture}
                  alt={userProfile.name}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 border border-black object-cover shrink-0"
                />
              ) : (
                <div className="w-6 h-6 bg-[#DC2626] text-white flex items-center justify-center text-[11px] font-black shrink-0 border border-black">
                  {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}

              {/* User First Name */}
              <span className="hidden sm:inline text-xs tracking-wider max-w-[85px] truncate">
                {userProfile.name.split(' ')[0]}
              </span>

              {/* Sync Status Badge (click to trigger sync) */}
              <button
                onClick={onTriggerSync}
                title={getSyncLabel()}
                className={`flex items-center gap-1 px-2 py-0.5 border text-[11px] tracking-wide transition-colors ${
                  isDark
                    ? 'bg-[#0B0C0E] border-[#2E343D] hover:border-[#DC2626] text-[#A2A9B5]'
                    : 'bg-[#F3EFE6] border-[#000000] hover:border-[#DC2626] text-[#3C424C]'
                }`}
              >
                {getSyncIcon()}
                <span className="hidden md:inline">{getSyncLabel()}</span>
              </button>

              {/* Sign Out Button */}
              <button
                onClick={onSignOutGoogle}
                title={t('sync.signOut')}
                className="p-1 text-[#A2A9B5] hover:text-[#DC2626] transition-colors shrink-0"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : isClientIdConfigured ? (
            /* "Entrar com Google" Button with Punk Stamp Style */
            <button
              onClick={onSignInGoogle}
              className={`flex items-center gap-2 px-3 py-1.5 border-2 text-xs font-bold font-stencil tracking-wider transition-all punk-btn ${
                isDark
                  ? 'bg-[#15181D] text-[#F5F2EB] border-[#000000]'
                  : 'bg-white text-[#111317] border-[#000000]'
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
              className={`flex items-center gap-1.5 px-2.5 py-1 border text-[11px] font-semibold select-none ${
                isDark
                  ? 'bg-[#15181D] border-[#2E343D] text-[#A2A9B5]'
                  : 'bg-white border-[#000000] text-[#3C424C]'
              }`}
              title={t('sync.syncUnavailable')}
            >
              <Info size={12} className="text-[#DC2626]" />
              <span className="hidden sm:inline">{t('sync.localMode')}</span>
              <span className="sm:hidden text-[10px]">Local</span>
            </div>
          )}

          {/* Language Selector with Globe Icon & Dropdown Menu */}
          <div className="relative" ref={langMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsLangMenuOpen((prev) => !prev);
                setFocusedLangIndex(language === 'pt-BR' ? 0 : 1);
              }}
              aria-haspopup="menu"
              aria-expanded={isLangMenuOpen}
              aria-label={t('nav.language') || 'Idioma'}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold font-stencil tracking-wider border-2 transition-all punk-btn ${
                isDark
                  ? 'bg-[#15181D] border-[#000000] text-[#A2A9B5] hover:text-white'
                  : 'bg-white border-[#000000] text-[#3C424C] hover:text-[#111317]'
              }`}
            >
              <Globe size={14} className="text-[#DC2626] shrink-0" />
              <span>{language === 'pt-BR' ? 'PT' : 'EN'}</span>
            </button>

            {isLangMenuOpen && (
              <div
                role="menu"
                aria-orientation="vertical"
                className={`absolute right-0 mt-2 w-48 border-2 border-black z-50 p-1 shadow-[4px_4px_0px_#000000] ${
                  isDark ? 'bg-[#15181D] text-[#F5F2EB]' : 'bg-white text-[#111317]'
                }`}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setFocusedLangIndex((prev) => (prev + 1) % langOptions.length);
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setFocusedLangIndex((prev) => (prev - 1 + langOptions.length) % langOptions.length);
                  } else if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSelectLanguage(langOptions[focusedLangIndex].code);
                  }
                }}
              >
                {langOptions.map((opt, idx) => {
                  const isSelected = language === opt.code;
                  const isFocused = focusedLangIndex === idx;
                  return (
                    <button
                      key={opt.code}
                      role="menuitem"
                      onClick={() => handleSelectLanguage(opt.code)}
                      onMouseEnter={() => setFocusedLangIndex(idx)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-stencil uppercase tracking-wider text-left transition-colors border ${
                        isSelected
                          ? 'bg-[#DC2626] text-white border-black font-black shadow-[2px_2px_0px_#000000]'
                          : isFocused
                          ? isDark
                            ? 'bg-[#252A33] text-white border-transparent'
                            : 'bg-[#F4EFE6] text-black border-transparent'
                          : 'border-transparent ' + (isDark ? 'text-[#A2A9B5]' : 'text-[#3C424C]')
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check size={14} strokeWidth={3} className="shrink-0 text-white" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Theme Switcher: Dark vs Papel Xerox */}
          <button
            onClick={onToggleTheme}
            className={`p-2 border-2 transition-all punk-btn ${
              isDark
                ? 'bg-[#15181D] border-[#000000] text-[#A2A9B5] hover:text-white'
                : 'bg-white border-[#000000] text-[#3C424C] hover:text-[#111317]'
            }`}
            title={isDark ? 'Mudar para modo Papel Xerox' : 'Mudar para modo Preto-Tinta'}
          >
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className={`p-2 border-2 transition-all punk-btn ${
              isDark
                ? 'bg-[#15181D] border-[#000000] text-[#A2A9B5] hover:text-white'
                : 'bg-white border-[#000000] text-[#3C424C] hover:text-[#111317]'
            }`}
            title={t('nav.settings')}
          >
            <Settings size={15} />
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onOpenNewSession}
            className="px-4 py-1.5 bg-[#DC2626] text-white text-xs font-bold font-stencil tracking-wider uppercase border-2 border-black punk-btn whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Plus size={15} strokeWidth={3} />
            <span className="hidden sm:inline">{t('sessions.quickLog')}</span>
            <span className="sm:hidden">Sessão</span>
          </button>
        </div>
      </div>
    </header>
  );
};
