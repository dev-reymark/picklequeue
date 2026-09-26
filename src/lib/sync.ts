// Cross-tab real-time sync bus for PickleQueue
// Enables instantaneous sync between Admin Dashboard, Spectator Live Display, and Mobile Player Check-In

const CHANNEL_NAME = 'picklequeue_tab_sync';

export interface SyncMessage {
  type: 'STATE_CHANGED' | 'NOTIFICATION_DISPATCHED';
  timestamp: number;
  payload?: any;
}

class TabSyncBus {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(msg: SyncMessage) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event: MessageEvent<SyncMessage>) => {
          this.listeners.forEach((listener) => listener(event.data));
        };
      } catch (err) {
        console.warn('BroadcastChannel initialization failed, falling back to storage events', err);
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === 'picklequeue-state') {
          const syncMsg: SyncMessage = {
            type: 'STATE_CHANGED',
            timestamp: Date.now(),
          };
          this.listeners.forEach((listener) => listener(syncMsg));
        }
      });
    }
  }

  public notifyStateChanged(payload?: any) {
    const msg: SyncMessage = {
      type: 'STATE_CHANGED',
      timestamp: Date.now(),
      payload,
    };

    if (this.channel) {
      try {
        this.channel.postMessage(msg);
      } catch {
        // Silently continue
      }
    }
  }

  public subscribe(callback: (msg: SyncMessage) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }
}

export const tabSyncBus = new TabSyncBus();
