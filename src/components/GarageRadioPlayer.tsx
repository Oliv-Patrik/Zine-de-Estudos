import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  Radio,
  Disc,
  Sliders,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Plus,
  Trash2,
  Upload,
  Link as LinkIcon,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  ambientEngine,
  AMBIENT_TRACKS,
  AmbientTrackId,
  CustomTrack,
} from '../lib/ambientAudio';
import { useI18n } from '../i18n';
import { MaskingTapeStrip } from './illustrations/PunkStickers';

interface GarageRadioPlayerProps {
  theme?: 'dark' | 'light';
  isPomodoroRunning?: boolean;
}

export const GarageRadioPlayer: React.FC<GarageRadioPlayerProps> = ({
  theme = 'dark',
  isPomodoroRunning = false,
}) => {
  const { t, language } = useI18n();
  const isDark = theme === 'dark';

  const [isPlaying, setIsPlaying] = useState<boolean>(() => ambientEngine.isPlaying());
  const [currentTrackId, setCurrentTrackId] = useState<AmbientTrackId>(() => ambientEngine.getTrackId());
  const [volume, setVolumeState] = useState<number>(() => ambientEngine.getVolume());
  const [isMuted, setIsMuted] = useState(false);
  const [tapeWarmth, setTapeWarmthState] = useState<boolean>(() => ambientEngine.getTapeWarmth());
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [syncWithPomodoro, setSyncWithPomodoro] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('garage_radio_sync_pomodoro') === 'true';
    }
    return false;
  });

  const [customTracks, setCustomTracks] = useState<CustomTrack[]>(() => ambientEngine.getCustomTracks());
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTrackName, setNewTrackName] = useState<string>('');
  const [newTrackUrl, setNewTrackUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [vuLevels, setVuLevels] = useState<number[]>([15, 25, 40, 20, 10]);
  const animationFrameRef = useRef<number | null>(null);

  // Sync with Pomodoro if option is enabled
  const prevPomodoroRunningRef = useRef(isPomodoroRunning);
  useEffect(() => {
    if (!syncWithPomodoro) return;

    if (isPomodoroRunning && !prevPomodoroRunningRef.current) {
      // Pomodoro started
      if (!ambientEngine.isPlaying()) {
        ambientEngine.start(currentTrackId);
        setIsPlaying(true);
      }
    } else if (!isPomodoroRunning && prevPomodoroRunningRef.current) {
      // Pomodoro paused/stopped
      if (ambientEngine.isPlaying()) {
        ambientEngine.stop();
        setIsPlaying(false);
      }
    }
    prevPomodoroRunningRef.current = isPomodoroRunning;
  }, [isPomodoroRunning, syncWithPomodoro, currentTrackId]);

  // Real-time VU meter audio visualizer loop
  useEffect(() => {
    if (!isPlaying) {
      setVuLevels([10, 12, 10, 8, 6]);
      return;
    }

    const updateVu = () => {
      const data = ambientEngine.getVisualizerData();
      if (data && data.length >= 8) {
        // Sample 5 frequency points
        const l0 = Math.min(100, (data[1] / 255) * 100);
        const l1 = Math.min(100, (data[2] / 255) * 100);
        const l2 = Math.min(100, (data[4] / 255) * 100);
        const l3 = Math.min(100, (data[6] / 255) * 100);
        const l4 = Math.min(100, (data[8] / 255) * 100);
        setVuLevels([l0, l1, l2, l3, l4]);
      }
      animationFrameRef.current = requestAnimationFrame(updateVu);
    };

    animationFrameRef.current = requestAnimationFrame(updateVu);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      ambientEngine.stop();
      setIsPlaying(false);
    } else {
      ambientEngine.start(currentTrackId);
      setIsPlaying(true);
    }
  };

  const handleSelectTrack = (trackId: AmbientTrackId) => {
    setCurrentTrackId(trackId);
    if (isPlaying) {
      ambientEngine.start(trackId);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolumeState(val);
    if (isMuted && val > 0) setIsMuted(false);
    ambientEngine.setVolume(val);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      ambientEngine.setVolume(volume || 0.5);
    } else {
      setIsMuted(true);
      ambientEngine.setVolume(0);
    }
  };

  const handleToggleWarmth = () => {
    const next = !tapeWarmth;
    setTapeWarmthState(next);
    ambientEngine.setTapeWarmth(next);
  };

  const handleToggleSyncPomodoro = () => {
    const next = !syncWithPomodoro;
    setSyncWithPomodoro(next);
    try {
      localStorage.setItem('garage_radio_sync_pomodoro', String(next));
    } catch {}
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const rawName = file.name.replace(/\.[^/.]+$/, '');
    const trackId = 'custom_' + Date.now();
    const track: CustomTrack = {
      id: trackId,
      name: rawName,
      nameEn: rawName,
      url,
      icon: '🎵',
      color: '#DC2626',
    };
    ambientEngine.addCustomTrack(track);
    setCustomTracks(ambientEngine.getCustomTracks());
    handleSelectTrack(trackId);
    setShowAddModal(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddUrlTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrackUrl.trim()) return;
    const trackName = newTrackName.trim() || `Faixa ${customTracks.length + 1}`;
    const trackId = 'custom_' + Date.now();
    const track: CustomTrack = {
      id: trackId,
      name: trackName,
      nameEn: trackName,
      url: newTrackUrl.trim(),
      icon: '🌐',
      color: '#2563EB',
    };
    ambientEngine.addCustomTrack(track);
    setCustomTracks(ambientEngine.getCustomTracks());
    setNewTrackName('');
    setNewTrackUrl('');
    setShowAddModal(false);
    handleSelectTrack(trackId);
  };

  const handleRemoveCustomTrack = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    ambientEngine.removeCustomTrack(trackId);
    setCustomTracks(ambientEngine.getCustomTracks());
    if (currentTrackId === trackId) {
      setCurrentTrackId('tape_vinyl');
      if (isPlaying) {
        ambientEngine.start('tape_vinyl');
      }
    }
  };

  // Find currently active track info
  const customMatch = customTracks.find((t) => t.id === currentTrackId);
  const builtinMatch = AMBIENT_TRACKS.find((t) => t.id === currentTrackId);
  const currentTrack = customMatch
    ? {
        id: customMatch.id,
        name: customMatch.name,
        nameEn: customMatch.nameEn || customMatch.name,
        description: 'Faixa personalizada (Livre de Direitos)',
        descriptionEn: 'Custom audio track (Royalty-Free)',
        icon: customMatch.icon || '🎵',
        color: customMatch.color || '#DC2626',
        isCustom: true,
      }
    : builtinMatch || AMBIENT_TRACKS[0];

  return (
    <div
      className={`border-2 border-black p-5 sm:p-6 relative punk-shadow transition-all ${
        isDark ? 'bg-[#15181D] text-[#F5F2EB]' : 'bg-white text-[#111317]'
      }`}
    >
      {/* Hidden file input for custom audio uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac"
        className="hidden"
      />

      {/* Masking tape on top edge */}
      <div className="absolute -top-3 left-10">
        <MaskingTapeStrip width="w-28" rotation={2} />
      </div>

      {/* Header bar of Garage Radio */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-black">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-black text-[#DC2626] border border-black flex items-center justify-center font-black">
            <Radio size={18} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-stencil font-black uppercase text-base sm:text-lg tracking-wider">
                {t('radio.title')}
              </h4>
              {/* On-Air LED Indicator lamp */}
              <div
                className={`flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-black font-stencil uppercase tracking-widest border border-black transition-colors ${
                  isPlaying
                    ? 'bg-[#DC2626] text-white shadow-[0_0_8px_#DC2626]'
                    : isDark
                    ? 'bg-[#252A33] text-[#717885]'
                    : 'bg-[#E5E0D5] text-[#717885]'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isPlaying ? 'bg-white animate-ping' : 'bg-transparent border border-current'
                  }`}
                />
                <span>{isPlaying ? t('radio.onAir') : t('radio.standby')}</span>
              </div>
            </div>
            <p className="text-[11px] font-stencil uppercase tracking-wide opacity-75">
              {t('radio.subtitle')}
            </p>
          </div>
        </div>

        {/* Right Header Controls: Expand / Minimize */}
        <div className="flex items-center gap-2">
          {/* Quick Play/Stop button in header when collapsed */}
          {!isExpanded && (
            <button
              onClick={handleTogglePlay}
              className={`px-3 py-1 font-stencil text-xs font-bold uppercase tracking-wider border-2 border-black punk-btn flex items-center gap-1.5 ${
                isPlaying ? 'bg-[#DC2626] text-white' : 'bg-black text-white'
              }`}
            >
              {isPlaying ? <Square size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
              <span>{isPlaying ? t('radio.pauseRadio') : t('radio.startRadio')}</span>
            </button>
          )}

          <button
            onClick={() => setIsExpanded((e) => !e)}
            className="p-1.5 border-2 border-black punk-btn hover:text-[#DC2626] transition-colors"
            title={isExpanded ? 'Recolher player' : 'Expandir player'}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 flex flex-col lg:flex-row items-stretch gap-6">
          {/* Left Zone: Retro Cassette Tape Graphic & VU Meter */}
          <div className="flex-1 flex flex-col justify-between p-4 border-2 border-black bg-black text-white shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] relative overflow-hidden">
            {/* Cassette Shell Header */}
            <div className="flex items-center justify-between text-[10px] font-stencil uppercase tracking-widest text-[#A2A9B5] border-b border-neutral-800 pb-2">
              <span className="flex items-center gap-1.5 text-[#DC2626] font-bold">
                <Disc size={12} className={isPlaying ? 'animate-spin' : ''} />
                <span>CASSETTE C-90 · DIY FOCUS</span>
              </span>
              <span className="tabular-nums">CH-{currentTrack.id.toUpperCase().slice(0, 10)}</span>
            </div>

            {/* Cassette Center Window with Spools */}
            <div className="my-3 py-3 px-4 bg-[#111317] border-2 border-neutral-700 flex items-center justify-between relative rounded-sm">
              {/* Left Spool */}
              <div
                className={`w-10 h-10 rounded-full border-2 border-white/80 bg-neutral-900 flex items-center justify-center transition-transform ${
                  isPlaying ? 'rotate-animation' : ''
                }`}
                style={{
                  animation: isPlaying ? 'spin 3s linear infinite' : 'none',
                }}
              >
                <div className="w-5 h-5 rounded-full border border-dashed border-white/60 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>

              {/* Tape Window Label */}
              <div className="flex-1 mx-3 text-center px-2 py-1 bg-[#F5EBCB] text-black border border-black shadow-[2px_2px_0px_#000000]">
                <div className="text-xs font-black font-marker truncate text-[#DC2626]">
                  {language === 'pt-BR' ? currentTrack.name : currentTrack.nameEn}
                </div>
                <div className="text-[10px] font-stencil uppercase tracking-wider opacity-85 truncate">
                  {isPlaying ? t('radio.tapeRunning') : t('radio.tapeStopped')}
                </div>
              </div>

              {/* Right Spool */}
              <div
                className={`w-10 h-10 rounded-full border-2 border-white/80 bg-neutral-900 flex items-center justify-center transition-transform ${
                  isPlaying ? 'rotate-animation' : ''
                }`}
                style={{
                  animation: isPlaying ? 'spin 3s linear infinite' : 'none',
                }}
              >
                <div className="w-5 h-5 rounded-full border border-dashed border-white/60 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>
            </div>

            {/* Analog VU Meter Sound Bar Display */}
            <div className="pt-2 border-t border-neutral-800 flex items-center justify-between gap-3 text-[10px] font-stencil uppercase tracking-wider text-[#A2A9B5]">
              <span className="shrink-0 font-bold">VU METER:</span>
              <div className="flex-1 flex items-center gap-1.5 h-3">
                {vuLevels.map((lvl, idx) => (
                  <div key={idx} className="flex-1 bg-neutral-800 h-full overflow-hidden border border-neutral-700">
                    <div
                      className={`h-full transition-all duration-75 ${
                        idx >= 3 ? 'bg-[#DC2626]' : idx >= 2 ? 'bg-[#F59E0B]' : 'bg-[#10B981]'
                      }`}
                      style={{ width: `${isPlaying ? Math.max(8, lvl) : 4}%` }}
                    />
                  </div>
                ))}
              </div>
              <span className="shrink-0 font-mono text-[11px] text-[#DC2626] font-bold">
                {isPlaying ? `${Math.round(volume * 100)}%` : 'MUTED'}
              </span>
            </div>
          </div>

          {/* Right Zone: Controls, Stations, Volume, Knobs */}
          <div className="flex-1 flex flex-col justify-between gap-4">
            {/* Stations Selection Grid (Punk Tape Tabs) */}
            <div>
              <div className="text-xs font-black font-stencil uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span>{t('radio.selectChannel')}:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="text-[11px] font-stencil uppercase font-bold text-[#DC2626] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={12} />
                  <span>{t('radio.addCustomTrack')}</span>
                </button>
              </div>

              {/* 1. Official Lo-Fi Tracks */}
              <div className="mb-3">
                <div className="text-[11px] font-black font-stencil uppercase tracking-wider mb-1.5 flex items-center justify-between text-[#DC2626]">
                  <span className="flex items-center gap-1.5">
                    <span>🔥 {t('radio.lofiSection')}</span>
                    <span className="text-[9px] px-1.5 py-0.5 border border-[#DC2626] font-bold">6 FAIXAS</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AMBIENT_TRACKS.filter((t) => t.category === 'music').map((t) => {
                    const isSelected = t.id === currentTrackId;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleSelectTrack(t.id)}
                        className={`p-2.5 text-left border-2 border-black transition-all punk-btn flex flex-col justify-between relative ${
                          isSelected
                            ? 'bg-[#DC2626] text-white shadow-[3px_3px_0px_#000000]'
                            : isDark
                            ? 'bg-[#0B0C0E] text-[#F5F2EB] hover:border-[#DC2626]'
                            : 'bg-[#F3EFE6] text-[#111317] hover:border-[#DC2626]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-black font-stencil uppercase tracking-wider">
                          <span className="truncate">{language === 'pt-BR' ? t.name : t.nameEn}</span>
                          <span className="text-sm shrink-0">{t.icon}</span>
                        </div>
                        <div className="text-[10px] mt-1 opacity-80 line-clamp-1 font-sans-body">
                          {language === 'pt-BR' ? t.description : t.descriptionEn}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Analog Ambient Noise Textures */}
              <div className="mb-2">
                <div className="text-[11px] font-black font-stencil uppercase tracking-wider mb-1.5 opacity-75 flex items-center justify-between">
                  <span>📼 {t('radio.ambientSection')}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AMBIENT_TRACKS.filter((t) => t.category === 'ambient').map((t) => {
                    const isSelected = t.id === currentTrackId;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleSelectTrack(t.id)}
                        className={`p-2 text-left border-2 border-black transition-all punk-btn flex flex-col justify-between relative ${
                          isSelected
                            ? 'bg-[#DC2626] text-white shadow-[3px_3px_0px_#000000]'
                            : isDark
                            ? 'bg-[#0B0C0E] text-[#F5F2EB] hover:border-[#DC2626]'
                            : 'bg-[#F3EFE6] text-[#111317] hover:border-[#DC2626]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-black font-stencil uppercase tracking-wider">
                          <span className="truncate">{language === 'pt-BR' ? t.name : t.nameEn}</span>
                          <span className="text-sm shrink-0">{t.icon}</span>
                        </div>
                        <div className="text-[10px] mt-0.5 opacity-70 line-clamp-1 font-sans-body">
                          {language === 'pt-BR' ? t.description : t.descriptionEn}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Custom User Tracks (if any) */}
              {customTracks.length > 0 && (
                <div className="mb-2">
                  <div className="text-[11px] font-black font-stencil uppercase tracking-wider mb-1.5 text-[#0284C7] flex items-center justify-between">
                    <span>🌐 {t('radio.customTracks')}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {customTracks.map((ct) => {
                      const isSelected = ct.id === currentTrackId;
                      return (
                        <div
                          key={ct.id}
                          onClick={() => handleSelectTrack(ct.id)}
                          className={`p-2 text-left border-2 border-black transition-all punk-btn flex flex-col justify-between relative cursor-pointer group ${
                            isSelected
                              ? 'bg-[#DC2626] text-white shadow-[3px_3px_0px_#000000]'
                              : isDark
                              ? 'bg-[#0B0C0E] text-[#F5F2EB] hover:border-[#DC2626]'
                              : 'bg-[#F3EFE6] text-[#111317] hover:border-[#DC2626]'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-black font-stencil uppercase tracking-wider">
                            <span className="truncate">{ct.name}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-sm">{ct.icon || '🎵'}</span>
                              <button
                                type="button"
                                onClick={(e) => handleRemoveCustomTrack(ct.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-black hover:bg-white rounded transition-opacity"
                                title={t('radio.removeCustomTrack')}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                          <div className="text-[10px] mt-0.5 opacity-80 line-clamp-1 font-sans-body">
                            {t('radio.copyrightFreeBadge')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Controls: Play/Pause Big Button + Volume Slider + Toggles */}
            <div className="pt-3 border-t-2 border-black flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {/* Play / Stop Master Power Button */}
              <button
                onClick={handleTogglePlay}
                className={`px-5 py-2.5 border-2 border-black font-stencil font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all punk-btn shrink-0 ${
                  isPlaying
                    ? 'bg-[#DC2626] text-white shadow-[3px_3px_0px_#000000]'
                    : 'bg-black text-white hover:bg-neutral-900 shadow-[3px_3px_0px_#000000]'
                }`}
              >
                {isPlaying ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                <span>{isPlaying ? t('radio.pauseRadio') : t('radio.startRadio')}</span>
              </button>

              {/* Volume Slider & Mute */}
              <div className="flex items-center gap-2.5 flex-1 min-w-[150px]">
                <button
                  onClick={handleToggleMute}
                  className="p-1.5 border-2 border-black punk-btn text-xs shrink-0"
                  title={isMuted ? 'Desmutar' : 'Mutar'}
                >
                  {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.02"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full h-2 bg-neutral-300 dark:bg-neutral-700 accent-[#DC2626] cursor-pointer"
                  title={`Volume: ${Math.round(volume * 100)}%`}
                />
              </div>

              {/* Toggles: Tape Warmth & Sync with Pomodoro */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Tape Warmth Filter Button */}
                <button
                  onClick={handleToggleWarmth}
                  className={`px-2.5 py-1.5 border-2 border-black font-stencil text-[11px] font-bold uppercase tracking-wider punk-btn flex items-center gap-1.5 ${
                    tapeWarmth
                      ? 'bg-[#D97706] text-white shadow-[2px_2px_0px_#000000]'
                      : isDark
                      ? 'bg-[#0B0C0E] text-[#A2A9B5]'
                      : 'bg-[#F3EFE6] text-[#3C424C]'
                  }`}
                  title={t('radio.tapeWarmthTooltip')}
                >
                  <Sparkles size={12} />
                  <span>{t('radio.tapeWarmth')}</span>
                </button>

                {/* Sync with Pomodoro Button */}
                <button
                  onClick={handleToggleSyncPomodoro}
                  className={`px-2.5 py-1.5 border-2 border-black font-stencil text-[11px] font-bold uppercase tracking-wider punk-btn flex items-center gap-1.5 ${
                    syncWithPomodoro
                      ? 'bg-[#16A34A] text-white shadow-[2px_2px_0px_#000000]'
                      : isDark
                      ? 'bg-[#0B0C0E] text-[#A2A9B5]'
                      : 'bg-[#F3EFE6] text-[#3C424C]'
                  }`}
                  title={t('radio.syncFocusTooltip')}
                >
                  <Sliders size={12} />
                  <span>{t('radio.syncFocus')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal to Add Custom Track or Upload Audio */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div
            className={`w-full max-w-md border-4 border-black p-6 relative punk-shadow ${
              isDark ? 'bg-[#15181D] text-[#F5F2EB]' : 'bg-white text-[#111317]'
            }`}
          >
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-1 hover:text-[#DC2626] border-2 border-black"
            >
              <X size={18} />
            </button>

            <h3 className="text-xl font-black font-stencil uppercase tracking-wider mb-2 flex items-center gap-2">
              <ShieldCheck size={20} className="text-[#16A34A]" />
              <span>{t('radio.addCustomTrack')}</span>
            </h3>

            <p className="text-xs mb-4 opacity-80 font-sans-body">
              {t('radio.copyrightFreeTooltip')}
            </p>

            {/* Option A: Upload local audio file */}
            <div className="mb-5 p-4 border-2 border-dashed border-black/40 bg-black/5 dark:bg-white/5 text-center">
              <Upload size={24} className="mx-auto mb-2 text-[#DC2626]" />
              <div className="text-xs font-bold font-stencil uppercase mb-2">
                {t('radio.uploadAudioFile')}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 border-2 border-black font-stencil font-bold text-xs uppercase bg-[#DC2626] text-white punk-btn shadow-[2px_2px_0px_#000000]"
              >
                Escolher Arquivo do PC
              </button>
            </div>

            {/* Option B: Audio URL / stream */}
            <form onSubmit={handleAddUrlTrack} className="space-y-3">
              <div className="text-xs font-bold font-stencil uppercase flex items-center gap-1.5 opacity-90">
                <LinkIcon size={14} />
                <span>{t('radio.orAudioUrl')}</span>
              </div>

              <div>
                <input
                  type="text"
                  placeholder={t('radio.trackName')}
                  value={newTrackName}
                  onChange={(e) => setNewTrackName(e.target.value)}
                  className={`w-full p-2 text-xs border-2 border-black outline-none font-stencil uppercase ${
                    isDark ? 'bg-[#0B0C0E] text-[#F5F2EB]' : 'bg-[#F3EFE6] text-[#111317]'
                  }`}
                />
              </div>

              <div>
                <input
                  type="url"
                  placeholder={t('radio.trackUrl')}
                  value={newTrackUrl}
                  onChange={(e) => setNewTrackUrl(e.target.value)}
                  className={`w-full p-2 text-xs border-2 border-black outline-none font-mono ${
                    isDark ? 'bg-[#0B0C0E] text-[#F5F2EB]' : 'bg-[#F3EFE6] text-[#111317]'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border-2 border-black text-xs font-stencil uppercase font-bold punk-btn"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={!newTrackUrl.trim()}
                  className="px-4 py-1.5 border-2 border-black text-xs font-stencil uppercase font-bold bg-[#DC2626] text-white punk-btn shadow-[2px_2px_0px_#000000] disabled:opacity-40"
                >
                  {t('radio.addTrackConfirm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
