'use client';

import { useEffect } from 'react';
import { usePickleballStore } from '@/store/pickleball-store';
import { tabSyncBus } from '@/lib/sync';

export function useTabSync() {
  useEffect(() => {
    const unsubscribe = tabSyncBus.subscribe((msg) => {
      if (msg.type === 'STATE_CHANGED') {
        // Rehydrate Zustand state from localStorage
        usePickleballStore.persist.rehydrate();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);
}
