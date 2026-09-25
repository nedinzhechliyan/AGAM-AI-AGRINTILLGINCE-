/**
 * Sound Kit Audio Feedback Engine for AGAM
 * Uses original UI sound assets from full-volume-5db and low-volume-20db
 */

export type VolumeTier = 'full-volume-5db' | 'low-volume-20db';

export type SoundCue =
  | 'buttonTap'
  | 'tabChange'
  | 'expand'
  | 'collapse'
  | 'success'
  | 'complete'
  | 'error'
  | 'cancel'
  | 'alert'
  | 'notification'
  | 'voiceStart'
  | 'voiceEnd';

const SOUND_PATHS: Record<SoundCue, string> = {
  buttonTap: 'buttons-and-navigation/button-1.m4a',
  tabChange: 'buttons-and-navigation/tab-1.m4a',
  expand: 'buttons-and-navigation/expand.m4a',
  collapse: 'buttons-and-navigation/collapse.m4a',
  success: 'complete-and-success/success-1.m4a',
  complete: 'complete-and-success/complete-1.m4a',
  error: 'errors-and-cancel/error-1.m4a',
  cancel: 'errors-and-cancel/cancel-1.m4a',
  alert: 'notifications-and-alerts/alert-1.m4a',
  notification: 'notifications-and-alerts/notification-1.m4a',
  voiceStart: 'buttons-and-navigation/button-3.m4a',
  voiceEnd: 'complete-and-success/success-2.m4a',
};

class SoundKitService {
  private volumeTier: VolumeTier = 'full-volume-5db';
  private isMuted: boolean = false;
  private audioCache: Map<string, HTMLAudioElement> = new Map();

  constructor() {
    // Load preference from storage
    if (typeof window !== 'undefined') {
      const savedTier = localStorage.getItem('agam_sound_tier') as VolumeTier;
      const savedMute = localStorage.getItem('agam_sound_muted');
      if (savedTier && (savedTier === 'full-volume-5db' || savedTier === 'low-volume-20db')) {
        this.volumeTier = savedTier;
      }
      if (savedMute === 'true') {
        this.isMuted = true;
      }
    }
  }

  public setVolumeTier(tier: VolumeTier) {
    this.volumeTier = tier;
    if (typeof window !== 'undefined') {
      localStorage.setItem('agam_sound_tier', tier);
    }
  }

  public getVolumeTier(): VolumeTier {
    return this.volumeTier;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('agam_sound_muted', String(this.isMuted));
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public play(cue: SoundCue) {
    if (this.isMuted || typeof window === 'undefined') return;

    try {
      const relativePath = SOUND_PATHS[cue];
      const audioUrl = `/${this.volumeTier}/${relativePath}`;

      let audio = this.audioCache.get(audioUrl);
      if (!audio) {
        audio = new Audio(audioUrl);
        this.audioCache.set(audioUrl, audio);
      } else {
        audio.currentTime = 0;
      }

      audio.play().catch((err) => {
        // Autoplay restrictions or missing audio file fallback
        console.debug('SoundKit playback notice:', err?.message || err);
      });
    } catch (e) {
      console.debug('SoundKit error:', e);
    }
  }
}

export const soundkit = new SoundKitService();
