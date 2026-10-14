import React, { useState, useRef } from 'react';
import {
  X,
  Volume2,
  Clock,
  Cloud,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { PomodoroSettings, AppStateData } from '../types';
import { useI18n } from '../i18n';
import { playSoftChime } from '../lib/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PomodoroSettings;
  onUpdateSettings: (settings: PomodoroSettings) => void;
  googleClientId?: string;
  onUpdateGoogleClientId: (clientId: string) => void;
  onExportJson: () => void;
  onImportJson: (data: AppStateData) => void;
  onLoadDemoData: () => void;
  onClearAllData: () => void;
  theme?: 'dark' | 'light';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  googleClientId = '',
  onUpdateGoogleClientId,
  onExportJson,
  onImportJson,
  onLoadDemoData,
  onClearAllData,
  theme = 'dark',
}) => {
  const { t } = useI18n();
  const isDark = theme === 'dark';

  const [tempClientId, setTempClientId] = useState(googleClientId);
  const [clientIdSaved, setClientIdSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateGoogleClientId(tempClientId.trim());
    setClientIdSaved(true);
    setTimeout(() => setClientIdSaved(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.subjects && parsed.sessions) {
          onImportJson(parsed);
          onClose();
        } else {
          alert('Arquivo JSON inválido. Certifique-se de que é um backup do Caderno de Estudos.');
        }
      } catch (err) {
        alert('Erro ao ler arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div
        className={`w-full max-w-2xl rounded-3xl p-6 sm:p-8 border shadow-2xl relative max-h-[90vh] overflow-y-auto ${
          isDark
            ? 'bg-[#181F26] text-[#F4F6F8] border-[#2A3744]'
            : 'bg-white text-[#0F172A] border-[#D6E0EA]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2A3744]/40">
          <h3 className="text-xl font-bold font-display uppercase tracking-tight">
            {t('settings.title')}{' '}
            <span className="font-serif-italic font-normal lowercase tracking-normal text-[#0E7490]">
              {t('settings.titleEmphasis')}
            </span>
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-700/20 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-6">
          {/* Section 1: Pomodoro Durations */}
          <div className="p-5 rounded-2xl border border-[#2A3744]/60">
            <h4 className="text-xs font-bold uppercase tracking-wider font-display text-[#0E7490] flex items-center gap-1.5 mb-3">
              <Clock size={15} />
              {t('settings.pomodoroCycles')}
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block opacity-70 mb-1">{t('settings.focusDuration')}</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={settings.focusMinutes}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, focusMinutes: Number(e.target.value) })
                  }
                  className={`w-full px-3 py-2 rounded-xl border ${
                    isDark ? 'bg-[#12161B] border-[#2A3744]' : 'bg-[#F8FAFC] border-[#CBD5E1]'
                  }`}
                />
              </div>

              <div>
                <label className="block opacity-70 mb-1">{t('settings.shortBreakDuration')}</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.shortBreakMinutes}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, shortBreakMinutes: Number(e.target.value) })
                  }
                  className={`w-full px-3 py-2 rounded-xl border ${
                    isDark ? 'bg-[#12161B] border-[#2A3744]' : 'bg-[#F8FAFC] border-[#CBD5E1]'
                  }`}
                />
              </div>

              <div>
                <label className="block opacity-70 mb-1">{t('settings.longBreakDuration')}</label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={settings.longBreakMinutes}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, longBreakMinutes: Number(e.target.value) })
                  }
                  className={`w-full px-3 py-2 rounded-xl border ${
                    isDark ? 'bg-[#12161B] border-[#2A3744]' : 'bg-[#F8FAFC] border-[#CBD5E1]'
                  }`}
                />
              </div>

              <div>
                <label className="block opacity-70 mb-1">{t('settings.cyclesCount')}</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={settings.cyclesBeforeLongBreak}
                  onChange={(e) =>
                    onUpdateSettings({
                      ...settings,
                      cyclesBeforeLongBreak: Number(e.target.value),
                    })
                  }
                  className={`w-full px-3 py-2 rounded-xl border ${
                    isDark ? 'bg-[#12161B] border-[#2A3744]' : 'bg-[#F8FAFC] border-[#CBD5E1]'
                  }`}
                />
              </div>
            </div>

            {/* Sound Toggle */}
            <div className="mt-4 pt-3 border-t border-dashed border-[#2A3744]/40 flex items-center justify-between">
              <label
                htmlFor="settings-enable-sound-checkbox"
                className="flex items-center gap-2 text-xs font-semibold cursor-pointer"
              >
                <input
                  id="settings-enable-sound-checkbox"
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, soundEnabled: e.target.checked })
                  }
                  className="rounded text-[#0E7490] focus:ring-0"
                />
                <span>{t('settings.enableSound')}</span>
              </label>

              <button
                type="button"
                onClick={() => playSoftChime('phaseComplete')}
                className="text-xs px-2.5 py-1 rounded-lg border border-slate-600/30 hover:bg-slate-700/20 flex items-center gap-1.5"
              >
                <Volume2 size={13} />
                <span>{t('settings.testSound')}</span>
              </button>
            </div>
          </div>

          {/* Section 2: Google Drive OAuth Configuration */}
          <div className="p-5 rounded-2xl border border-[#2A3744]/60">
            <h4 className="text-xs font-bold uppercase tracking-wider font-display text-[#0E7490] flex items-center gap-1.5 mb-1.5">
              <Cloud size={15} />
              {t('settings.googleDriveSection')}
            </h4>
            <p className="text-xs opacity-75 mb-3 leading-relaxed">
              {t('settings.googleClientIdHelp')}
            </p>

            <form onSubmit={handleSaveClientId} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={tempClientId}
                onChange={(e) => setTempClientId(e.target.value)}
                placeholder="Ex.: 123456789-xxxx.apps.googleusercontent.com"
                className={`flex-1 text-xs rounded-xl px-3.5 py-2.5 border font-mono ${
                  isDark ? 'bg-[#12161B] border-[#2A3744]' : 'bg-[#F8FAFC] border-[#CBD5E1]'
                }`}
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#0E7490] text-white text-xs font-bold hover:bg-[#0891B2] flex items-center justify-center gap-1.5 shrink-0"
              >
                {clientIdSaved ? <CheckCircle2 size={14} /> : null}
                <span>{t('settings.saveClientId')}</span>
              </button>
            </form>

            {/* Cloud Console Setup Instructions Collapsible / Box */}
            <div
              className={`mt-4 p-4 rounded-xl text-xs flex flex-col gap-2 ${
                isDark ? 'bg-[#12161B]/70 text-[#94A3B8]' : 'bg-[#F1F5F9] text-[#475569]'
              }`}
            >
              <span className="font-bold uppercase tracking-wider font-display text-[#F4F6F8] dark:text-[#F4F6F8] text-[#0F172A]">
                {t('settings.cloudSetupGuide')}:
              </span>
              <p>{t('settings.cloudStep1')}</p>
              <p>{t('settings.cloudStep2')}</p>
              <p>{t('settings.cloudStep3')}</p>
              <p>{t('settings.cloudStep4')}</p>
              <p>{t('settings.cloudStep5')}</p>
              <p>{t('settings.cloudStep6')}</p>
            </div>
          </div>

          {/* Section 3: Backup & Data Management */}
          <div className="p-5 rounded-2xl border border-[#2A3744]/60">
            <h4 className="text-xs font-bold uppercase tracking-wider font-display text-[#0E7490] mb-3">
              {t('settings.backupSection')}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={onExportJson}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                  isDark
                    ? 'bg-[#1A222B] border-[#2E3C4B] hover:bg-[#253240]'
                    : 'bg-[#F8FAFC] border-[#CBD5E1] hover:bg-[#E2E8F0]'
                }`}
              >
                <Download size={14} />
                <span>{t('settings.exportJson')}</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                  isDark
                    ? 'bg-[#1A222B] border-[#2E3C4B] hover:bg-[#253240]'
                    : 'bg-[#F8FAFC] border-[#CBD5E1] hover:bg-[#E2E8F0]'
                }`}
              >
                <Upload size={14} />
                <span>{t('settings.importJson')}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                onClick={onLoadDemoData}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                  isDark
                    ? 'bg-[#1A222B] border-[#2E3C4B] hover:bg-[#253240]'
                    : 'bg-[#F8FAFC] border-[#CBD5E1] hover:bg-[#E2E8F0]'
                }`}
              >
                <RefreshCw size={14} />
                <span>{t('settings.loadDemo')}</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm(t('settings.clearAllConfirm'))) {
                    onClearAllData();
                    onClose();
                  }
                }}
                className="px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 size={14} />
                <span>{t('settings.clearAll')}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-[#0E7490] text-white text-xs font-bold hover:bg-[#0891B2]"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
