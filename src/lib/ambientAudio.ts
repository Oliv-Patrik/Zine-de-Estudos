/**
 * Web Audio API procedural & local audio sound engine - "Rádio de Garagem"
 * 
 * 6 Official Lo-Fi Tracks (100% royalty-free, study & focus):
 * 1. Afternoon in the Driveway (Tarde na Garagem)
 * 2. Midnight Coffee Cup (Café da Meia-Noite)
 * 3. Seven AM Coffee (Café das 7 da Manhã)
 * 4. Rain on the Roll-Up Door (Chuva no Portão da Garagem)
 * 5. Rain Against The Glass (Chuva na Vidraça)
 * 6. The Long Midnight (A Longa Madrugada)
 * 
 * Plus procedural ambient soundscapes:
 * 7. Fita & Vinil
 * 8. Ruído Marrom / Amp
 * 9. Rádio Pirata FM
 */

import { getAudioContext } from './audio';

export type AmbientTrackId = string;

export interface AmbientTrackInfo {
  id: AmbientTrackId;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  color: string;
  isCustom?: boolean;
  audioUrl?: string;
  category?: 'music' | 'ambient';
}

const BASE = import.meta.env.BASE_URL || '/';
const getAudioPath = (filename: string) => `${BASE.endsWith('/') ? BASE : BASE + '/'}audio/${filename}`;

export const AMBIENT_TRACKS: AmbientTrackInfo[] = [
  // 6 Official Royalty-Free Lo-Fi Tracks
  {
    id: 'afternoon_driveway',
    name: 'Tarde na Garagem',
    nameEn: 'Afternoon in the Driveway',
    description: 'Guitarra lo-fi quente e batida relaxante para tarde de estudos',
    descriptionEn: 'Warm driveway lo-fi guitar vibes and relaxed study beat',
    icon: '🚗',
    color: '#DC2626',
    audioUrl: getAudioPath('Afternoon_in_the_Driveway.mp3'),
    category: 'music',
  },
  {
    id: 'midnight_coffee',
    name: 'Café da Meia-Noite',
    nameEn: 'Midnight Coffee Cup',
    description: 'Rhodes aveludado e batida lenta para sessões de foco na madrugada',
    descriptionEn: 'Mellow midnight lo-fi with gentle keys and study rhythm',
    icon: '☕',
    color: '#D97706',
    audioUrl: getAudioPath('Midnight_Coffee_Cup.mp3'),
    category: 'music',
  },
  {
    id: 'seven_am_coffee',
    name: 'Café das 7 da Manhã',
    nameEn: 'Seven AM Coffee',
    description: 'Acordes luminosos para despertar o cérebro e engatar o foco',
    descriptionEn: 'Bright morning coffee keys to kickstart deep focus',
    icon: '☀️',
    color: '#EAB308',
    audioUrl: getAudioPath('Seven_AM_Coffee.mp3'),
    category: 'music',
  },
  {
    id: 'rain_roll_up_door',
    name: 'Chuva no Portão da Garagem',
    nameEn: 'Rain on the Roll-Up Door',
    description: 'Gotas no portão de aço com graves relaxantes e foco imersivo',
    descriptionEn: 'Rain drumming on the steel garage door with deep lo-fi pulse',
    icon: '🌧️',
    color: '#2563EB',
    audioUrl: getAudioPath('Rain_on_the_Roll_Up_Door.mp3'),
    category: 'music',
  },
  {
    id: 'rain_against_glass',
    name: 'Chuva na Vidraça',
    nameEn: 'Rain Against The Glass',
    description: 'Chuva suave na janela com piano nostálgico e estalos de vinil',
    descriptionEn: 'Gentle rain tapping the glass with nostalgic lo-fi chords',
    icon: '🪟',
    color: '#0284C7',
    audioUrl: getAudioPath('Rain_Against_The_Glass.mp3'),
    category: 'music',
  },
  {
    id: 'the_long_midnight',
    name: 'A Longa Madrugada',
    nameEn: 'The Long Midnight',
    description: 'Ambiência noturna profunda para sessões intensas até o amanhecer',
    descriptionEn: 'Nocturnal atmospheric soundscape for late-night grind',
    icon: '🌙',
    color: '#7C3AED',
    audioUrl: getAudioPath('The_Long_Midnight.mp3'),
    category: 'music',
  },

  // Ambient Texture Soundscapes
  {
    id: 'tape_vinyl',
    name: 'Fita & Vinil (Ruído)',
    nameEn: 'Tape & Vinyl (Noise)',
    description: 'Chiado de fita cassete analógica e estalos de vinil vintage',
    descriptionEn: 'Raw cassette tape hiss, vinyl dust clicks and transformer hum',
    icon: '📼',
    color: '#4B5563',
    category: 'ambient',
  },
  {
    id: 'brown_noise',
    name: 'Ruído Marrom / Amp',
    nameEn: 'Brown Noise / Amp',
    description: 'Grave profundo contínuo de amplificador valvulado em repouso',
    descriptionEn: 'Deep soothing rumble of an idling tube guitar amp',
    icon: '🎸',
    color: '#4B5563',
    category: 'ambient',
  },
  {
    id: 'radio_static',
    name: 'Rádio Pirata FM',
    nameEn: 'Pirate Radio FM',
    description: 'Estática suave e ruído branco analógico de rádio sintonizado',
    descriptionEn: 'Atmospheric FM radio white noise & tuner static',
    icon: '📻',
    color: '#4B5563',
    category: 'ambient',
  },
];

export interface CustomTrack {
  id: string;
  name: string;
  nameEn?: string;
  url: string;
  icon?: string;
  color?: string;
}

class AmbientSoundEngine {
  private activeTrackId: AmbientTrackId = 'afternoon_driveway';
  private isPlayingState = false;
  private volumeLevel = 0.5;
  private tapeWarmth = true;
  private customTracks: CustomTrack[] = [];

  // Web Audio nodes
  private masterGain: GainNode | null = null;
  private warmthFilter: BiquadFilterNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private cleanupFns: Array<() => void> = [];
  private lofiInterval: any = null;

  // Custom/MP3 audio playback node
  private audioElement: HTMLAudioElement | null = null;
  private audioSourceNode: MediaElementAudioSourceNode | null = null;

  constructor() {
    // Restore persisted settings
    if (typeof window !== 'undefined') {
      try {
        const savedVol = localStorage.getItem('garage_radio_volume');
        if (savedVol !== null) {
          const parsed = parseFloat(savedVol);
          if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
            this.volumeLevel = parsed;
          }
        }
        const savedWarmth = localStorage.getItem('garage_radio_warmth');
        if (savedWarmth !== null) {
          this.tapeWarmth = savedWarmth === 'true';
        }
        const savedCustom = localStorage.getItem('garage_radio_custom_tracks');
        if (savedCustom) {
          this.customTracks = JSON.parse(savedCustom);
        }
        const savedTrack = localStorage.getItem('garage_radio_track') as AmbientTrackId;
        if (
          savedTrack &&
          (AMBIENT_TRACKS.some((t) => t.id === savedTrack) || this.customTracks.some((t) => t.id === savedTrack))
        ) {
          this.activeTrackId = savedTrack;
        } else {
          this.activeTrackId = 'afternoon_driveway';
        }
      } catch {
        this.activeTrackId = 'afternoon_driveway';
      }
    }
  }

  private initMasterChain(): boolean {
    const ctx = getAudioContext();
    if (!ctx) return false;

    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, ctx.currentTime);

      this.warmthFilter = ctx.createBiquadFilter();
      this.warmthFilter.type = 'lowpass';
      this.warmthFilter.frequency.setValueAtTime(this.tapeWarmth ? 4500 : 16000, ctx.currentTime);
      this.warmthFilter.Q.setValueAtTime(0.7, ctx.currentTime);

      this.analyserNode = ctx.createAnalyser();
      this.analyserNode.fftSize = 64;
      this.analyserNode.smoothingTimeConstant = 0.8;

      this.masterGain.connect(this.warmthFilter);
      this.warmthFilter.connect(this.analyserNode);
      this.analyserNode.connect(ctx.destination);
    }
    return true;
  }

  public getTrackId(): AmbientTrackId {
    return this.activeTrackId || 'afternoon_driveway';
  }

  public isPlaying(): boolean {
    return this.isPlayingState;
  }

  public getVolume(): number {
    return this.volumeLevel;
  }

  public getTapeWarmth(): boolean {
    return this.tapeWarmth;
  }

  public getCustomTracks(): CustomTrack[] {
    return this.customTracks;
  }

  public addCustomTrack(track: CustomTrack): void {
    this.customTracks = this.customTracks.filter((t) => t.id !== track.id).concat(track);
    try {
      const persistable = this.customTracks.filter((t) => !t.url.startsWith('blob:'));
      localStorage.setItem('garage_radio_custom_tracks', JSON.stringify(persistable));
    } catch {}
  }

  public removeCustomTrack(trackId: string): void {
    if (this.activeTrackId === trackId && this.isPlayingState) {
      this.stop();
      this.activeTrackId = 'afternoon_driveway';
    }
    this.customTracks = this.customTracks.filter((t) => t.id !== trackId);
    try {
      const persistable = this.customTracks.filter((t) => !t.url.startsWith('blob:'));
      localStorage.setItem('garage_radio_custom_tracks', JSON.stringify(persistable));
    } catch {}
  }

  public setTapeWarmth(enabled: boolean): void {
    this.tapeWarmth = enabled;
    try {
      localStorage.setItem('garage_radio_warmth', String(enabled));
    } catch {}

    const ctx = getAudioContext();
    if (ctx && this.warmthFilter) {
      const targetFreq = enabled ? 4500 : 16000;
      this.warmthFilter.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.1);
    }
  }

  public setVolume(vol: number): void {
    const clamped = Math.max(0, Math.min(1, vol));
    this.volumeLevel = clamped;
    try {
      localStorage.setItem('garage_radio_volume', String(clamped));
    } catch {}

    const ctx = getAudioContext();
    if (ctx && this.masterGain && this.isPlayingState) {
      this.masterGain.gain.setTargetAtTime(clamped * 0.55, ctx.currentTime, 0.08);
    }

    if (this.audioElement) {
      if (this.audioSourceNode) {
        this.audioElement.volume = 1;
      } else {
        this.audioElement.volume = clamped;
      }
    }
  }

  public getVisualizerData(): Uint8Array {
    if (!this.isPlayingState) {
      return new Uint8Array(16);
    }
    if (this.analyserNode) {
      const data = new Uint8Array(this.analyserNode.frequencyBinCount);
      this.analyserNode.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i];
      if (sum > 0) return data;
    }
    // Rhythmic bounce fallback if direct element playback bypasses Web Audio
    const fallback = new Uint8Array(16);
    const time = Date.now() / 140;
    for (let i = 0; i < 16; i++) {
      fallback[i] = Math.floor(Math.abs(Math.sin(time + i * 0.6)) * 160 + 40);
    }
    return fallback;
  }

  public start(trackId?: AmbientTrackId): void {
    const targetTrack = trackId || this.activeTrackId || 'afternoon_driveway';
    this.activeTrackId = targetTrack;
    try {
      localStorage.setItem('garage_radio_track', targetTrack);
    } catch {}

    if (!this.initMasterChain()) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    this.stopInternal(false);

    const builtinTrack = AMBIENT_TRACKS.find((t) => t.id === targetTrack);
    const customTrack = this.customTracks.find((t) => t.id === targetTrack);

    if (builtinTrack?.audioUrl) {
      // Play official MP3 track
      this.playCustomAudio(builtinTrack.audioUrl, ctx);
    } else if (customTrack?.url) {
      // Play user custom track
      this.playCustomAudio(customTrack.url, ctx);
    } else {
        // Procedural ambient synthesizer tracks
        switch (targetTrack) {
          case 'tape_vinyl':
            this.buildTapeVinyl(ctx);
            break;
          case 'brown_noise':
            this.buildBrownNoise(ctx);
            break;
          case 'radio_static':
            this.buildRadioStatic(ctx);
            break;
          default:
            this.buildTapeVinyl(ctx);
            break;
        }
      }

    this.isPlayingState = true;
    if (this.masterGain) {
      const now = ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(this.volumeLevel * 0.55, now + 0.35);
    }
  }

  private playCustomAudio(url: string, ctx: AudioContext): void {
    try {
      if (!this.audioElement) {
        this.audioElement = new Audio();
        this.audioElement.crossOrigin = 'anonymous';
        this.audioElement.loop = true;
      }

      if (this.audioElement.src !== url && !this.audioElement.src.endsWith(url)) {
        this.audioElement.src = url;
      }
      this.audioElement.currentTime = 0;

      // Connect to master audio graph
      if (!this.audioSourceNode && this.masterGain) {
        try {
          this.audioSourceNode = ctx.createMediaElementSource(this.audioElement);
          this.audioSourceNode.connect(this.masterGain);
        } catch {
          // If cross-origin or local restriction, direct element plays
        }
      }

      if (this.audioSourceNode) {
        this.audioElement.volume = 1;
      } else {
        this.audioElement.volume = this.volumeLevel;
      }

      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio playback waiting for interaction or error:', err);
        });
      }

      this.cleanupFns.push(() => {
        if (this.audioElement) {
          this.audioElement.pause();
        }
      });
    } catch (e) {
      console.error('Error starting audio track:', e);
    }
  }

  public stop(): void {
    this.stopInternal(true);
  }

  private stopInternal(fade = true): void {
    const ctx = getAudioContext();
    if (fade && ctx && this.masterGain && this.isPlayingState) {
      const now = ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0, now + 0.25);

      setTimeout(() => {
        this.cleanupAudioNodes();
      }, 260);
    } else {
      this.cleanupAudioNodes();
    }
    this.isPlayingState = false;
  }

  private cleanupAudioNodes(): void {
    if (this.audioElement) {
      try {
        this.audioElement.pause();
      } catch {}
    }
    if (this.lofiInterval) {
      clearInterval(this.lofiInterval);
      this.lofiInterval = null;
    }
    this.cleanupFns.forEach((fn) => {
      try {
        fn();
      } catch {}
    });
    this.cleanupFns = [];
  }

  // Procedural Tape Hiss, Vinyl Crackles & 60Hz Electrical Hum
  private buildTapeVinyl(ctx: AudioContext): void {
    if (!this.masterGain) return;

    const bufferSize = ctx.sampleRate * 3;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.153852;
      data[i] = (b0 + b1 + b2) * 0.15;
    }

    const noiseSrc = ctx.createBufferSource();
    noiseSrc.buffer = noiseBuffer;
    noiseSrc.loop = true;

    const hissFilter = ctx.createBiquadFilter();
    hissFilter.type = 'bandpass';
    hissFilter.frequency.value = 2400;
    hissFilter.Q.value = 0.6;

    const hissGain = ctx.createGain();
    hissGain.gain.value = 0.28;

    noiseSrc.connect(hissFilter);
    hissFilter.connect(hissGain);
    hissGain.connect(this.masterGain);
    noiseSrc.start();

    const crackleBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const crackleData = crackleBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      if (Math.random() < 0.0006) {
        crackleData[i] = (Math.random() * 2 - 1) * 0.7;
      } else {
        crackleData[i] = 0;
      }
    }

    const crackleSrc = ctx.createBufferSource();
    crackleSrc.buffer = crackleBuffer;
    crackleSrc.loop = true;

    const crackleFilter = ctx.createBiquadFilter();
    crackleFilter.type = 'highpass';
    crackleFilter.frequency.value = 1800;

    const crackleGain = ctx.createGain();
    crackleGain.gain.value = 0.5;

    crackleSrc.connect(crackleFilter);
    crackleFilter.connect(crackleGain);
    crackleGain.connect(this.masterGain);
    crackleSrc.start();

    const humOsc = ctx.createOscillator();
    humOsc.type = 'sine';
    humOsc.frequency.value = 60;

    const humHarmonic = ctx.createOscillator();
    humHarmonic.type = 'sine';
    humHarmonic.frequency.value = 120;

    const humGain = ctx.createGain();
    humGain.gain.value = 0.045;

    humOsc.connect(humGain);
    humHarmonic.connect(humGain);
    humGain.connect(this.masterGain);
    humOsc.start();
    humHarmonic.start();

    this.cleanupFns.push(() => {
      noiseSrc.stop();
      crackleSrc.stop();
      humOsc.stop();
      humHarmonic.stop();
      noiseSrc.disconnect();
      crackleSrc.disconnect();
      humOsc.disconnect();
      humHarmonic.disconnect();
    });
  }

  // Deep Analog Brown Noise / Tube Amp Idle
  private buildBrownNoise(ctx: AudioContext): void {
    if (!this.masterGain) return;

    const bufferSize = ctx.sampleRate * 4;
    const brownBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = brownBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.2;
    }

    const brownSrc = ctx.createBufferSource();
    brownSrc.buffer = brownBuffer;
    brownSrc.loop = true;

    const ampFilter = ctx.createBiquadFilter();
    ampFilter.type = 'lowpass';
    ampFilter.frequency.value = 450;
    ampFilter.Q.value = 0.8;

    const bassBoost = ctx.createBiquadFilter();
    bassBoost.type = 'lowshelf';
    bassBoost.frequency.value = 120;
    bassBoost.gain.value = 6;

    const ampGain = ctx.createGain();
    ampGain.gain.value = 0.7;

    brownSrc.connect(ampFilter);
    ampFilter.connect(bassBoost);
    bassBoost.connect(ampGain);
    ampGain.connect(this.masterGain);
    brownSrc.start();

    this.cleanupFns.push(() => {
      brownSrc.stop();
      brownSrc.disconnect();
      ampFilter.disconnect();
      bassBoost.disconnect();
    });
  }

  // Pirate Garage Radio Static & Tuner White Noise
  private buildRadioStatic(ctx: AudioContext): void {
    if (!this.masterGain) return;

    const bufferSize = ctx.sampleRate * 3;
    const staticBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = staticBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.22;
    }

    const staticSrc = ctx.createBufferSource();
    staticSrc.buffer = staticBuffer;
    staticSrc.loop = true;

    const tunerBand = ctx.createBiquadFilter();
    tunerBand.type = 'bandpass';
    tunerBand.frequency.value = 3200;
    tunerBand.Q.value = 1.2;

    const carrierOsc = ctx.createOscillator();
    carrierOsc.type = 'sine';
    carrierOsc.frequency.value = 1850;

    const carrierGain = ctx.createGain();
    carrierGain.gain.value = 0.008;

    const staticGain = ctx.createGain();
    staticGain.gain.value = 0.45;

    staticSrc.connect(tunerBand);
    tunerBand.connect(staticGain);
    carrierOsc.connect(carrierGain);
    carrierGain.connect(staticGain);
    staticGain.connect(this.masterGain);

    staticSrc.start();
    carrierOsc.start();

    this.cleanupFns.push(() => {
      staticSrc.stop();
      carrierOsc.stop();
      staticSrc.disconnect();
      carrierOsc.disconnect();
    });
  }
}

// Global Singleton
export const ambientEngine = new AmbientSoundEngine();
