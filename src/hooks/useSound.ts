"use client";

import { useCallback } from 'react';
import { playSoundEvent } from '@/lib/sound';
import { SoundEvent } from '@/types';

export function useSound() {
  const playSound = useCallback((event: SoundEvent) => {
    playSoundEvent(event);
  }, []);

  return { playSound };
}
