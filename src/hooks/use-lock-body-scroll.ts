import { useEffect } from 'react';

let activeLockCount = 0;
let originalOverflowStyle = '';

/**
 * Hook to lock background body scrolling when a modal or overlay is open.
 * Uses reference counting so nested/sequential modals don't prematurely unlock the body.
 */
export function useLockBodyScroll(isLocked: boolean = true) {
  useEffect(() => {
    if (!isLocked || typeof document === 'undefined') return;

    if (activeLockCount === 0) {
      originalOverflowStyle = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    activeLockCount++;

    return () => {
      activeLockCount--;
      if (activeLockCount <= 0) {
        activeLockCount = 0;
        document.body.style.overflow = originalOverflowStyle;
      }
    };
  }, [isLocked]);
}
