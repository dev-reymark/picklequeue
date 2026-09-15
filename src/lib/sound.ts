/**
 * Centralized, latency-free audio engine and haptic system for PickleQueue.
 * Procedurally synthesized via Web Audio API - zero external audio assets required.
 */
import { usePickleballStore } from '@/store/pickleball-store';
import { SoundEvent } from '@/types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playSoundEvent(event: SoundEvent): void {
  if (typeof window === 'undefined') return;

  const settings = usePickleballStore.getState().settings;
  const masterEnabled = settings.soundEnabled ?? true;
  const profile = settings.soundProfile ?? 'minimal';
  const volume = settings.soundVolume ?? 0.8;

  if (!masterEnabled || profile === 'silent') return;

  // Sound filtering according to profile & category
  const isUiSound = event === 'click';
  const isQueueSound =
    event === 'player-added' ||
    event === 'queue-created' ||
    event === 'court-assigned' ||
    event === 'court-available' ||
    event === 'error';
  const isTimerSound =
    event === 'warning-2m' || event === 'warning-30s' || event === 'time-up';

  if (profile === 'minimal') {
    // Minimal profile only allows timer alerts and court assignments
    if (isUiSound) return;
    if (event === 'player-added' || event === 'queue-created') return;
  } else if (profile === 'standard') {
    if (isUiSound && settings.uiSounds === false) return;
    if (isQueueSound && settings.queueSounds === false) return;
    if (isTimerSound && settings.timerSounds === false) return;
  }

  // Trigger optional mobile haptic vibration
  if (settings.vibrationEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
    if (event === 'time-up') {
      navigator.vibrate([200, 100, 200]);
    } else if (event === 'warning-2m' || event === 'warning-30s') {
      navigator.vibrate(120);
    } else if (event === 'court-assigned') {
      navigator.vibrate(80);
    }
  }

  const ctx = getAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;

  try {
    switch (event) {
      case 'click': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(160, now + 0.035);
        gain.gain.setValueAtTime(0.06 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.035);
        break;
      }

      case 'player-added': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
        gain.gain.setValueAtTime(0.1 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      }

      case 'queue-created': {
        const freqs = [440, 554.37, 659.25]; // A major triad
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const delay = idx * 0.05;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + delay);
          gain.gain.setValueAtTime(0.09 * volume, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.22);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + delay);
          osc.stop(now + delay + 0.22);
        });
        break;
      }

      case 'court-assigned': {
        const notes = [523.25, 659.25, 783.99]; // C5 -> E5 -> G5
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = now + i * 0.07;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.12 * volume, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.22);
        });
        break;
      }

      case 'court-available': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, now); // E5
        osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.15); // C5
        gain.gain.setValueAtTime(0.1 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);
        break;
      }

      case 'warning-2m': {
        // Two-tone amber warning chime
        [523.25, 659.25].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = now + i * 0.18;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.12 * volume, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.25);
        });
        break;
      }

      case 'warning-30s': {
        // Urgent short double beep
        [880, 880].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = now + i * 0.12;
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0.06 * volume, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.08);
        });
        break;
      }

      case 'time-up': {
        // Distinctive tournament game finished chime / buzzer
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(260, now);
        gain1.gain.setValueAtTime(0.18 * volume, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.22);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(330, now + 0.26);
        gain2.gain.setValueAtTime(0.22 * volume, now + 0.26);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.26);
        osc2.stop(now + 0.7);
        break;
      }

      case 'error': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(130, now + 0.15);
        gain.gain.setValueAtTime(0.08 * volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
    }
  } catch {}
}

// Global hook & object helpers
export const playSound = {
  click: () => playSoundEvent('click'),
  assignCourt: () => playSoundEvent('court-assigned'),
  groupCreated: () => playSoundEvent('queue-created'),
  timeAdded: () => playSoundEvent('click'),
  playerAdded: () => playSoundEvent('player-added'),
  warning2m: () => playSoundEvent('warning-2m'),
  warning30s: () => playSoundEvent('warning-30s'),
  timeUp: () => playSoundEvent('time-up'),
  courtAvailable: () => playSoundEvent('court-available'),
  error: () => playSoundEvent('error'),
  // Legacy aliases
  warningChime: () => playSoundEvent('warning-2m'),
  buzzer: () => playSoundEvent('time-up'),
};

export const playCourtEndBuzzer = playSound.timeUp;
export const playActionPing = playSound.assignCourt;
