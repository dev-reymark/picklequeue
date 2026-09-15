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
    if (tutorialStep === null) {
      setHighlightRect(null);
      return;
    }

    // Determine target selector for current step
    let targetSelector = '';
    if (tutorialStep === 1) targetSelector = '#waiting-players-section';
    if (tutorialStep === 2) targetSelector = '#queue-panel-section';
    if (tutorialStep === 3) targetSelector = '#courts-grid-section';
    if (tutorialStep === 4) targetSelector = '#courts-grid-section';

    if (targetSelector) {
      const el = document.querySelector(targetSelector);
      if (el) {
        setHighlightRect(el.getBoundingClientRect());
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setHighlightRect(null);
      }
    } else {
      setHighlightRect(null);
    }
  }, [tutorialStep]);

  if (tutorialStep === null) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
      {/* Dark backdrop with smooth cutout highlight */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-all duration-300"
        onClick={skipTutorial}
      />

      {/* Target element spotlight frame */}
      {highlightRect && (
        <div
          className="fixed rounded-2xl border-2 border-emerald-400 ring-4 ring-emerald-500/30 pointer-events-none transition-all duration-300 z-50"
          style={{
            top: Math.max(8, highlightRect.top - 8),
            left: Math.max(8, highlightRect.left - 8),
            width: highlightRect.width + 16,
            height: highlightRect.height + 16,
          }}
        />
      )}

      {/* Floating Guidance Card */}
      <div className="relative z-50 w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 mx-4">
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
                Add Players
              </h3>
              <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Add a player&apos;s name and skill level here. Players can be marked as Waiting, Resting, or Inactive.
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
