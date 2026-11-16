'use client';

class SoundManager {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('bs_sound_enabled');
      this.isMuted = stored !== 'true'; // Muted by default
    }
  }

  public getSoundEnabled(): boolean {
    return !this.isMuted;
  }

  public setSoundEnabled(enabled: boolean): void {
    this.isMuted = !enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('bs_sound_enabled', enabled ? 'true' : 'false');
    }
    if (enabled) {
      this.initContext();
      this.playTap();
    }
  }

  private initContext(): void {
    if (typeof window === 'undefined') return;
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  private haptic(pattern: number | number[] = 15): void {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore haptic errors on unsupported devices
      }
    }
  }

  /**
   * Snappy button pop
   */
  public playTap(): void {
    this.haptic(10);
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const now = this.audioCtx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(750, now + 0.06);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Audio error ignored
    }
  }

  /**
   * Cheerful success jingle
   */
  public playSuccess(): void {
    this.haptic([15, 30, 20]);
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

      notes.forEach((freq, i) => {
        if (!this.audioCtx) return;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const noteTime = now + i * 0.07;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.1, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.12);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.12);
      });
    } catch {
      // Audio error ignored
    }
  }

  /**
   * Tilt alert sound
   */
  public playAlert(): void {
    this.haptic([30, 40, 30]);
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const now = this.audioCtx.currentTime;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(220, now + 0.18);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // Audio error ignored
    }
  }
}

export const soundManager = new SoundManager();
