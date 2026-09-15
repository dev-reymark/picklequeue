"use client";

import React, { useState, useEffect } from 'react';
import { usePickleballStore } from '@/store/pickleball-store';
import { Header } from '@/components/layout/Header';
import { CourtGrid } from '@/components/courts/CourtGrid';
import { QueuePanel } from '@/components/queue/QueuePanel';
import { WaitingPool } from '@/components/players/WaitingPool';
import { PlayerListModal } from '@/components/players/PlayerListModal';
import { AddPlayerModal } from '@/components/players/AddPlayerModal';
import { TutorialSpotlight } from '@/components/tutorial/TutorialSpotlight';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

export default function DashboardPage() {
  const { players, courts, queue, loadDemoData } = usePickleballStore();
  const [hasMounted, setHasMounted] = useState(false);
  const [isPlayerListOpen, setIsPlayerListOpen] = useState(false);
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);

  // Global Keyboard Shortcuts (N to add player, ? for shortcuts, Esc to close)
  useKeyboardShortcuts({
    onAddPlayer: () => setIsAddPlayerOpen(true),
    onEscape: () => {
      setIsPlayerListOpen(false);
      setIsAddPlayerOpen(false);
    },
  });

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 dark:text-zinc-400 text-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span>Loading PICKLEQUEUE...</span>
        </div>
      </div>
    );
  }

  const isEmptyState =
    players.length === 0 &&
    queue.length === 0 &&
    courts.every((c) => c.status === 'available');

  return (
    <div className="min-h-screen flex flex-col bg-dots text-slate-950 dark:text-zinc-100">
      {/* Top Header */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Welcome banner if clean slate */}
        {isEmptyState && (
          <div className="bg-white dark:bg-zinc-900 border border-emerald-500/40 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100 mb-1">
                Welcome to PICKLEQUEUE
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-xl">
                The session is currently empty. You can register players in the Waiting Pool below, or instantly load a realistic sample tournament with 6 courts, 2 active matches, and queued groups.
              </p>
            </div>
            <button
              type="button"
              onClick={loadDemoData}
              className="whitespace-nowrap px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
            >
              Load Demo Tournament
            </button>
          </div>
        )}

        {/* 2-Column Responsive Layout: Courts (70%) + Queue (30%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Court Grid */}
          <div id="courts-grid-section" className="lg:col-span-8 xl:col-span-9 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wide">
                  Courts
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-zinc-900 text-slate-700 dark:text-zinc-400 border border-slate-300 dark:border-zinc-800">
                  {courts.length} total
                </span>
              </div>
            </div>

            <CourtGrid />
          </div>

          {/* Right Column: Queue Sidebar */}
          <div id="queue-panel-section" className="lg:col-span-4 xl:col-span-3 h-full">
            <QueuePanel />
          </div>
        </div>

        {/* Bottom Section: Waiting Players Pool */}
        <div className="pt-2">
          <WaitingPool onOpenPlayerList={() => setIsPlayerListOpen(true)} />
        </div>
      </main>

      {/* Footer info */}
      <footer className="border-t border-slate-200 dark:border-zinc-900 py-4 px-4 sm:px-8 text-center text-xs text-slate-400 dark:text-zinc-400">
        PICKLEQUEUE &bull; Local Storage Session &bull; Tablet & Desktop Optimized &bull; Press &ldquo;N&rdquo; to Add Player
      </footer>

      {/* Player List Modal */}
      <PlayerListModal
        isOpen={isPlayerListOpen}
        onClose={() => setIsPlayerListOpen(false)}
      />

      {/* Quick Add Player Modal from shortcut */}
      <AddPlayerModal
        isOpen={isAddPlayerOpen}
        onClose={() => setIsAddPlayerOpen(false)}
      />

      {/* Interactive Spotlight Onboarding */}
      <TutorialSpotlight onOpenAddPlayer={() => setIsAddPlayerOpen(true)} />
    </div>
  );
}
