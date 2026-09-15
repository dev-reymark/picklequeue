"use client";

import React, { useEffect, useState } from 'react';
import { usePickleballStore } from '@/store/pickleball-store';

interface TutorialSpotlightProps {
  onOpenAddPlayer: () => void;
}

export const TutorialSpotlight: React.FC<TutorialSpotlightProps> = ({
  onOpenAddPlayer,
}) => {
  const {
    tutorialStep,
    nextTutorialStep,
    prevTutorialStep,
    skipTutorial,
    finishTutorial,
  } = usePickleballStore();

  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (tutorialStep === null || tutorialStep === 0) {
      setHighlightRect(null);
      return;
    }

    // Determine target selector for current step
    let targetSelector = '';
    if (tutorialStep === 1) targetSelector = '#waiting-pool-header-btn';
    if (tutorialStep === 2) targetSelector = '#queue-panel-section';
    if (tutorialStep === 3) targetSelector = '#courts-grid-section';
    if (tutorialStep === 4) targetSelector = '#courts-grid-section';

    const updateRect = () => {
      if (!targetSelector) return;
      const el = document.querySelector(targetSelector);
      if (el) {
        setHighlightRect(el.getBoundingClientRect());
      } else {
        setHighlightRect(null);
      }
    };

    // Immediate calculation
    updateRect();

    // Scroll into view
    const el = document.querySelector(targetSelector);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Continuously sync coordinates while smooth scroll settles
    const intervalId = setInterval(updateRect, 30);
    const stopTimer = setTimeout(() => clearInterval(intervalId), 600);

    // Listen to manual scroll and window resize
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, { capture: true, passive: true });

    return () => {
      clearInterval(intervalId);
      clearTimeout(stopTimer);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, { capture: true });
    };
  }, [tutorialStep]);

  if (tutorialStep === null) return null;

  // Calculate smart position for the floating guidance card so it never blocks the spotlighted target
  const getCardPlacement = () => {
    if (!highlightRect || typeof window === 'undefined') {
      return {
        style: {} as React.CSSProperties,
        className: 'relative mx-auto my-auto',
      };
    }

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const isMobile = windowWidth < 768;

    if (isMobile) {
      if (highlightRect.top > windowHeight / 2) {
        return {
          style: { top: 16, left: 16, right: 16, maxWidth: 'calc(100% - 32px)' } as React.CSSProperties,
          className: 'fixed',
        };
      }
      return {
        style: { bottom: 16, left: 16, right: 16, maxWidth: 'calc(100% - 32px)' } as React.CSSProperties,
        className: 'fixed',
      };
    }

    const cardWidth = 420;
    const cardHeight = 240;
    const margin = 20;

    const spaceOnLeft = highlightRect.left;
    const spaceOnRight = windowWidth - (highlightRect.left + highlightRect.width);
    const spaceAbove = highlightRect.top;
    const spaceBelow = windowHeight - (highlightRect.top + highlightRect.height);

    // If target is in the right column (e.g., Step 2 Queue panel), place to its left
    if (spaceOnLeft >= cardWidth + margin && highlightRect.left > windowWidth * 0.45) {
      const top = Math.max(margin, Math.min(highlightRect.top, windowHeight - cardHeight - margin));
      const left = highlightRect.left - cardWidth - margin;
      return {
        style: { top, left, width: cardWidth } as React.CSSProperties,
        className: 'fixed',
      };
    }

    // If target is at the bottom (e.g., Step 1 Waiting Pool), place above it
    if (spaceAbove >= cardHeight + margin && highlightRect.top > windowHeight * 0.45) {
      const top = highlightRect.top - cardHeight - margin;
      const left = Math.max(margin, Math.min(highlightRect.left + 24, windowWidth - cardWidth - margin));
      return {
        style: { top, left, width: cardWidth } as React.CSSProperties,
        className: 'fixed',
      };
    }

    // If target is in the left column (e.g., Step 3 & 4 Courts grid), place to its right
    if (spaceOnRight >= cardWidth + margin) {
      const top = Math.max(margin, Math.min(highlightRect.top + 16, windowHeight - cardHeight - margin));
      const left = highlightRect.left + highlightRect.width + margin;
      return {
        style: { top, left, width: cardWidth } as React.CSSProperties,
        className: 'fixed',
      };
    }

    // If target is at the top with space below
    if (spaceBelow >= cardHeight + margin) {
      const top = highlightRect.top + highlightRect.height + margin;
      const left = Math.max(margin, Math.min(highlightRect.left + 24, windowWidth - cardWidth - margin));
      return {
        style: { top, left, width: cardWidth } as React.CSSProperties,
        className: 'fixed',
      };
    }

    return {
      style: {
        top: margin,
        right: margin,
        width: cardWidth,
      } as React.CSSProperties,
      className: 'fixed',
    };
  };

  const cardPlacement = getCardPlacement();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
      {highlightRect ? (
        <>
          {/* Backdrop click catcher outside the guidance card */}
          <div
            className="fixed inset-0 z-40 pointer-events-auto cursor-pointer"
            onClick={skipTutorial}
            title="Click outside to exit tutorial"
          />

          {/* True Cutout Frame: 100% transparent interior + 9999px blackout perimeter with emerald glow */}
          <div
            className="fixed rounded-2xl border-2 border-emerald-400 pointer-events-none transition-all duration-300 ease-out z-40"
            style={{
              top: Math.max(8, highlightRect.top - 8),
              left: Math.max(8, highlightRect.left - 8),
              width: highlightRect.width + 16,
              height: highlightRect.height + 16,
              boxShadow:
                '0 0 0 9999px rgba(0, 0, 0, 0.78), 0 0 35px rgba(16, 185, 129, 0.45), inset 0 0 12px rgba(16, 185, 129, 0.15)',
            }}
          />
        </>
      ) : (
        /* Step 0: Welcome backdrop */
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-300 z-40 pointer-events-auto cursor-pointer"
          onClick={skipTutorial}
        />
      )}

      {/* Floating Guidance Card */}
      <div
        className={`z-50 w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4 transition-all duration-300 ease-out ${cardPlacement.className}`}
        style={cardPlacement.style}
      >
        {/* Step 0: Welcome */}
        {tutorialStep === 0 && (
          <>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 uppercase tracking-wider">
                Getting Started
              </span>
              <button
                type="button"
                onClick={skipTutorial}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 font-medium"
              >
                Skip
              </button>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 mb-1.5">
                Welcome to PickleQueue
              </h3>
              <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Manage players, courts, and rotations in one place with drift-free timers and skill-balanced matchmaking.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={skipTutorial}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 transition"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={nextTutorialStep}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
              >
                Start Tutorial
              </button>
            </div>
          </>
        )}

        {/* Step 1: Add Players */}
        {tutorialStep === 1 && (
          <>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 uppercase tracking-wider">
                Step 1 of 4
              </span>
              <button
                type="button"
                onClick={skipTutorial}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 font-medium"
              >
                Skip
              </button>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-1">
                Waiting Players Pool
              </h3>
              <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Click here or press <kbd className="font-mono bg-slate-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-xs">W</kbd> to open the slide-out Waiting Pool drawer. Add players, mark resting status, and form balanced matches.
              </p>
            </div>
            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={prevTutorialStep}
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={nextTutorialStep}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Step 2: Create a Queue */}
        {tutorialStep === 2 && (
          <>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 uppercase tracking-wider">
                Step 2 of 4
              </span>
              <button
                type="button"
                onClick={skipTutorial}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 font-medium"
              >
                Skip
              </button>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-1">
                Create a Queue
              </h3>
              <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Select waiting players or click &ldquo;Auto-Balance Group&rdquo; to form balanced 2v2 doubles teams in FIFO order.
              </p>
            </div>
            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={prevTutorialStep}
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={nextTutorialStep}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Step 3: Assign a Court */}
        {tutorialStep === 3 && (
          <>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 uppercase tracking-wider">
                Step 3 of 4
              </span>
              <button
                type="button"
                onClick={skipTutorial}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 font-medium"
              >
                Skip
              </button>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-1">
                Assign a Court
              </h3>
              <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                When a court becomes available, click &ldquo;Start Next Group&rdquo; or assign a group directly from the queue.
              </p>
            </div>
            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={prevTutorialStep}
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={nextTutorialStep}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Step 4: Game Timer */}
        {tutorialStep === 4 && (
          <>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 uppercase tracking-wider">
                Step 4 of 4
              </span>
              <button
                type="button"
                onClick={skipTutorial}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 font-medium"
              >
                Skip
              </button>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-1">
                Game Timer &amp; Overtime
              </h3>
              <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Each court tracks exact remaining time with ending-soon warnings and optional overtime tracking so organizers stay in total control.
              </p>
            </div>
            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={prevTutorialStep}
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  finishTutorial();
                  onOpenAddPlayer();
                }}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
              >
                Add First Player
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
