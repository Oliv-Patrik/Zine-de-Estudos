import React, { useRef } from 'react';
import {
  X,
  Volume2,
  Clock,
  Download,
  Upload,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { PomodoroSettings, AppStateData } from '../types';
import { useI18n } from '../i18n';
import { playGuitarPowerChord, playPunkSound } from '../lib/audio';
import { MaskingTapeStrip } from './illustrations/PunkStickers';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PomodoroSettings;
  onUpdateSettings: (settings: PomodoroSettings) => void;
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
  onExportJson,
  onImportJson,
  onLoadDemoData,
  onClearAllData,
  theme = 'dark',
}) => {
  const { t } = useI18n();
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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
          alert('Arquivo JSON inválido. Certifique-se de que é um backup do Zine de Estudos.');
        }
      } catch (err) {
        alert('Erro ao ler arquivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div
        className={`w-full max-w-xl p-6 sm:p-8 border-3 border-black shadow-[6px_6px_0px_#000000] relative max-h-[90vh] overflow-y-auto ${
          isDark
            ? 'bg-[#15181D] text-[#F5F2EB]'
            : 'bg-[#FFFFFF] text-[#111317]'
        }`}
      >
        <div className="absolute -top-3 left-10">
          <MaskingTapeStrip width="w-24" rotation={-4} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-black">
          <h3 className="text-2xl font-black font-stencil uppercase tracking-wider">
            {t('settings.title')}{' '}
            <span className="text-[#DC2626] font-marker lowercase tracking-normal">
              {t('settings.titleEmphasis')}
            </span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 border-2 border-black punk-btn bg-[#DC2626] text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-6">
          {/* Section 1: Pomodoro Durations */}
          <div className="p-5 border-2 border-black">
            <h4 className="text-xs font-black uppercase tracking-wider font-stencil text-[#DC2626] flex items-center gap-1.5 mb-3">
              <Clock size={15} />
              {t('settings.pomodoroCycles')}
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-sans-body">
              <div>
                <label className="block font-bold opacity-80 mb-1">{t('settings.focusDuration')}</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={settings.focusMinutes}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, focusMinutes: Number(e.target.value) })
                  }
                  className={`w-full px-3 py-2 border-2 border-black font-bold ${
                    isDark ? 'bg-[#0B0C0E]' : 'bg-[#F3EFE6]'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold opacity-80 mb-1">{t('settings.shortBreakDuration')}</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.shortBreakMinutes}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, shortBreakMinutes: Number(e.target.value) })
                  }
                  className={`w-full px-3 py-2 border-2 border-black font-bold ${
                    isDark ? 'bg-[#0B0C0E]' : 'bg-[#F3EFE6]'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold opacity-80 mb-1">{t('settings.longBreakDuration')}</label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={settings.longBreakMinutes}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, longBreakMinutes: Number(e.target.value) })
                  }
                  className={`w-full px-3 py-2 border-2 border-black font-bold ${
                    isDark ? 'bg-[#0B0C0E]' : 'bg-[#F3EFE6]'
                  }`}
                />
              </div>

              <div>
                <label className="block font-bold opacity-80 mb-1">{t('settings.cyclesCount')}</label>
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
                  className={`w-full px-3 py-2 border-2 border-black font-bold ${
                    isDark ? 'bg-[#0B0C0E]' : 'bg-[#F3EFE6]'
                  }`}
                />
              </div>
            </div>

            {/* Sound Toggle */}
            <div className="mt-4 pt-3 border-t-2 border-dashed border-black flex items-center justify-between">
              <label
                htmlFor="settings-enable-sound-checkbox"
                className="flex items-center gap-2 text-xs font-bold font-stencil uppercase tracking-wider cursor-pointer"
              >
                <input
                  id="settings-enable-sound-checkbox"
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, soundEnabled: e.target.checked })
                  }
                  className="rounded-none text-[#DC2626] focus:ring-0"
                />
                <span>{t('settings.enableSound')}</span>
              </label>

              <button
                type="button"
                onClick={() => playGuitarPowerChord('stageChange', 0.32)}
                className="text-xs px-2.5 py-1 border-2 border-black font-stencil uppercase tracking-wider font-bold punk-btn flex items-center gap-1.5"
              >
                <Volume2 size={13} />
                <span>{t('settings.testSound')}</span>
              </button>
            </div>
          </div>

          {/* Section 2: Backup & Data Management */}
          <div className="p-5 border-2 border-black">
            <h4 className="text-xs font-black uppercase tracking-wider font-stencil text-[#DC2626] mb-3">
              {t('settings.backupSection')}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-stencil uppercase tracking-wider">
              <button
                onClick={onExportJson}
                className={`px-4 py-2.5 border-2 border-black text-xs font-black flex items-center justify-center gap-2 transition-colors punk-btn ${
                  isDark ? 'bg-[#0B0C0E] text-white' : 'bg-white text-black'
                }`}
              >
                <Download size={14} />
                <span>{t('settings.exportJson')}</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className={`px-4 py-2.5 border-2 border-black text-xs font-black flex items-center justify-center gap-2 transition-colors punk-btn ${
                  isDark ? 'bg-[#0B0C0E] text-white' : 'bg-white text-black'
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
                className={`px-4 py-2.5 border-2 border-black text-xs font-black flex items-center justify-center gap-2 transition-colors punk-btn ${
                  isDark ? 'bg-[#0B0C0E] text-white' : 'bg-white text-black'
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
                className="px-4 py-2.5 border-2 border-black bg-black text-[#DC2626] hover:bg-neutral-900 text-xs font-black flex items-center justify-center gap-2 transition-colors punk-btn"
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
            className="px-6 py-2 bg-[#DC2626] text-white text-xs font-black font-stencil uppercase tracking-wider border-2 border-black punk-btn"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
