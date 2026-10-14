/**
 * Web Audio API synthesized electric guitar power chords & punchy UI sounds.
 * Synthesizes an authentic overdriven punk rock power chord using:
 * - Multi-string voicings (Root, 5th, Octave, High 5th)
 * - Dual detuned sawtooth oscillators per string for double-tracked chorus thickness
 * - Physical pick attack transient (filtered noise burst)
 * - Overdrive / distortion waveshaping with analog-style soft clipping
 * - 4x12 Guitar speaker cabinet emulation (lowpass + resonance + low-end thump)
 * - 100% standalone, zero external audio assets required.
 */

let audioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Creates an asymmetric overdrive curve for warm, crunchy tube amp distortion
 */
function createOverdriveCurve(k = 30): Float32Array {
  const n_samples = 44100;
  const curve = new Float32Array(n_samples);
  const deg = Math.PI / 180;

  for (let i = 0; i < n_samples; ++i) {
    const x = (i * 2) / n_samples - 1;
    // Asymmetric wave shaper simulating vacuum tube saturation
    if (x < 0) {
      curve[i] = -Math.abs(((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x))) * 0.95;
    } else {
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
  }
  return curve;
}

export type PowerChordType = 'stageChange' | 'focusEnd' | 'breakEnd' | 'powerChord' | 'click' | 'celebration';

/**
 * Synthesizes a high-energy guitar power chord.
 */
export function playGuitarPowerChord(
  type: 'stageChange' | 'focusEnd' | 'breakEnd' | 'punchy' = 'stageChange',
  volume = 0.28
): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Voicings:
    // focusEnd: Roaring E5 power chord (Low E2 82.4Hz, B2 123.5Hz, E3 164.8Hz, B3 246.9Hz)
    // breakEnd: Punchy A5 power chord (A2 110Hz, E3 164.8Hz, A3 220Hz, E4 329.6Hz)
    // stageChange: Crisp D5 power chord (D3 146.8Hz, A3 220Hz, D4 293.7Hz, A4 440Hz)
    let stringFrequencies: number[];
    let duration: number;

    switch (type) {
      case 'focusEnd':
        stringFrequencies = [82.41, 123.47, 164.81, 246.94];
        duration = 1.25;
        break;
      case 'breakEnd':
        stringFrequencies = [110.0, 164.81, 220.0, 329.63];
        duration = 1.1;
        break;
      case 'punchy':
        stringFrequencies = [146.83, 220.0, 293.66];
        duration = 0.7;
        break;
      case 'stageChange':
      default:
        stringFrequencies = [110.0, 164.81, 220.0, 293.66];
        duration = 1.05;
        break;
    }

    // 1. Master Output Gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(volume * 0.5, now + 0.015);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // 2. Tube Overdrive Distortion Node
    const distortion = ctx.createWaveShaper();
    distortion.curve = createOverdriveCurve(28) as any;
    distortion.oversample = '4x';

    // 3. 4x12 Guitar Cabinet Simulation:
    // Low-end body resonance around 110Hz
    const lowEndThump = ctx.createBiquadFilter();
    lowEndThump.type = 'peaking';
    lowEndThump.frequency.setValueAtTime(115, now);
    lowEndThump.Q.setValueAtTime(1.4, now);
    lowEndThump.gain.setValueAtTime(4.5, now);

    // Speaker High-End Rolloff (guitar speakers sharply roll off above 3.5kHz)
    const cabinetFilter = ctx.createBiquadFilter();
    cabinetFilter.type = 'lowpass';
    cabinetFilter.frequency.setValueAtTime(3200, now);
    cabinetFilter.Q.setValueAtTime(2.2, now);

    // Connect processing chain
    distortion.connect(lowEndThump);
    lowEndThump.connect(cabinetFilter);
    cabinetFilter.connect(masterGain);
    masterGain.connect(ctx.destination);

    // 4. Physical Pick Attack Transient (12ms noise scrape burst)
    const noiseBufferSize = Math.floor(ctx.sampleRate * 0.02);
    const noiseBuffer = ctx.createBuffer(1, noiseBufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const pickNoise = ctx.createBufferSource();
    pickNoise.buffer = noiseBuffer;

    const pickFilter = ctx.createBiquadFilter();
    pickFilter.type = 'bandpass';
    pickFilter.frequency.setValueAtTime(2400, now);
    pickFilter.Q.setValueAtTime(3.0, now);

    const pickGain = ctx.createGain();
    pickGain.gain.setValueAtTime(volume * 0.35, now);
    pickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

    pickNoise.connect(pickFilter);
    pickFilter.connect(pickGain);
    pickGain.connect(distortion);

    pickNoise.start(now);
    pickNoise.stop(now + 0.025);

    // 5. String Oscillators (Downstroke Strum with slight delay between strings)
    stringFrequencies.forEach((freq, stringIndex) => {
      const strumOffset = stringIndex * 0.012; // Natural downstroke rake timing
      const stringStartTime = now + strumOffset;

      // Primary String Oscillator (Sawtooth)
      const oscPrimary = ctx.createOscillator();
      oscPrimary.type = 'sawtooth';
      oscPrimary.frequency.setValueAtTime(freq, stringStartTime);

      // Secondary Detuned Oscillator (for authentic double-tracked chorus bloom)
      const oscSecondary = ctx.createOscillator();
      oscSecondary.type = 'sawtooth';
      oscSecondary.frequency.setValueAtTime(freq * 1.004, stringStartTime);

      const stringGain = ctx.createGain();
      // Lower strings are slightly louder to drive the distortion harder
      const relativeWeight = 1.0 - stringIndex * 0.12;
      stringGain.gain.setValueAtTime(0.3 * relativeWeight, stringStartTime);

      oscPrimary.connect(stringGain);
      oscSecondary.connect(stringGain);
      stringGain.connect(distortion);

      oscPrimary.start(stringStartTime);
      oscSecondary.start(stringStartTime);

      oscPrimary.stop(now + duration + 0.05);
      oscSecondary.stop(now + duration + 0.05);
    });
  } catch (err) {
    console.warn('Guitar audio synthesis error:', err);
  }
}

/**
 * Universal sound dispatcher with support for power chord, click, celebration.
 */
export function playPunkSound(type: PowerChordType = 'powerChord', volume = 0.28): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (type === 'click') {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.04);

      gain.gain.setValueAtTime(volume * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } else if (type === 'celebration') {
      // Double punk power chord riff
      playGuitarPowerChord('focusEnd', volume);
      setTimeout(() => {
        playGuitarPowerChord('breakEnd', volume * 1.05);
      }, 160);
    } else if (type === 'focusEnd') {
      playGuitarPowerChord('focusEnd', volume);
    } else if (type === 'breakEnd') {
      playGuitarPowerChord('breakEnd', volume);
    } else {
      // default 'powerChord' or 'stageChange'
      playGuitarPowerChord('stageChange', volume);
    }
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}
