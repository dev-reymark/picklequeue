"use client";

import React, { useState, useEffect } from "react";
import { usePickleballStore } from "@/store/pickleball-store";
import { Header } from "@/components/layout/Header";
import { CourtGrid } from "@/components/courts/CourtGrid";
import { QueuePanel } from "@/components/queue/QueuePanel";
import { WaitingPool } from "@/components/players/WaitingPool";
import { PlayerListModal } from "@/components/players/PlayerListModal";
import { AddPlayerModal } from "@/components/players/AddPlayerModal";
import { TutorialSpotlight } from "@/components/tutorial/TutorialSpotlight";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { Logo, Drawer } from "@/components/ui";
import { Mascot } from "page-mascot";

export default function DashboardPage() {
  const { players, courts, queue, loadDemoData } = usePickleballStore();
  const [hasMounted, setHasMounted] = useState(false);
  const [isPlayerListOpen, setIsPlayerListOpen] = useState(false);
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [isWaitingDrawerOpen, setIsWaitingDrawerOpen] = useState(false);

  // Global Keyboard Shortcuts (N to add player, W for waiting drawer, Esc to close)
  useKeyboardShortcuts({
    onAddPlayer: () => setIsAddPlayerOpen(true),
    onToggleWaitingPool: () => setIsWaitingDrawerOpen((prev) => !prev),
    onEscape: () => {
      setIsPlayerListOpen(false);
      setIsAddPlayerOpen(false);
      setIsWaitingDrawerOpen(false);
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasMounted(true);
    }, 650);

    return () => clearTimeout(timer);
  }, []);

  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="relative">
            <div className="absolute -inset-2 bg-emerald-500/20 rounded-2xl blur-lg animate-pulse" />
            <Logo className="w-14 h-14 sm:w-16 sm:h-16 shadow-lg rounded-2xl relative" />
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-wider">
              PICKLEQUEUE
            </h1>
            <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">
              Queue &amp; Court Rotation System
            </p>
          </div>

          <div className="flex items-center gap-1.5 pt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
          </div>
        </div>
      </div>
    );
  }

  const isEmptyState =
    players.length === 0 &&
    queue.length === 0 &&
    courts.every((c) => c.status === "available");

  return (
    <div className="min-h-screen flex flex-col bg-dots text-slate-950 dark:text-zinc-100 animate-in fade-in duration-300">
      {/* Top Header with Waiting Pool trigger */}
      <Header onOpenWaitingPool={() => setIsWaitingDrawerOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Welcome banner if clean slate */}
        {isEmptyState && (
          <div className="relative overflow-hidden bg-white dark:bg-zinc-900 border border-emerald-500/40 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-5 sm:gap-6 shadow-xs">
            {/* Bunny Mascot */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <div className="relative flex items-center justify-center p-2 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/70 dark:border-zinc-800/70 shadow-inner">
                <Mascot
                  directions="/mascots/bunny-directions.webp"
                  reactions="/mascots/bunny-reactions.webp"
                  size={120}
                  label="PickleQueue Bunny Mascot"
                />
              </div>
              {/* <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 mt-1 select-none">
                Poke me! 👆
              </span> */}
            </div>

            {/* Content */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-zinc-100">
                Welcome to PickleQueue
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-xl leading-relaxed">
                The session is currently empty. You can register players by clicking{" "}
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  &ldquo;Add Player&rdquo;
                </span>{" "}
                (or press{" "}
                <kbd className="font-mono bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700 text-xs">
                  N
                </kbd>
                ), open the Waiting Pool (press{" "}
                <kbd className="font-mono bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700 text-xs">
                  W
                </kbd>
                ), or instantly load a sample tournament with 6 courts and active rotations.
              </p>

              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddPlayerOpen(true)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  Add Player{" "}
                  <kbd className="text-[10px] bg-emerald-700/80 px-1.5 py-0.5 rounded">
                    N
                  </kbd>
                </button>
                <button
                  type="button"
                  onClick={loadDemoData}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition cursor-pointer"
                >
                  Load Demo Tournament
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2-Column Responsive Layout: Courts + Queue side-by-side on tablet (md:) and desktop */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6 items-start">
          {/* Left Column: Court Grid (1x1 on tablet, 2x2 on lg, 3x3 on xl) */}
          <div
            id="courts-grid-section"
            className="md:col-span-7 lg:col-span-8 xl:col-span-9 space-y-3"
          >
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

          {/* Right Column: Queue Sidebar (sticky so queue stays visible while scrolling) */}
          <div
            id="queue-panel-section"
            className="md:col-span-5 lg:col-span-4 xl:col-span-3 h-full md:sticky md:top-20"
          >
            <QueuePanel />
          </div>
        </div>
      </main>

      {/* Footer info */}
      <footer className="border-t border-slate-200 dark:border-zinc-900 py-4 px-4 sm:px-8 text-center text-xs text-slate-400 dark:text-zinc-400 flex flex-wrap items-center justify-center gap-2">
        <span>PICKLEQUEUE</span>
        <span>&bull;</span>
        <span>Press <kbd className="font-mono bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700">W</kbd> for Waiting Pool</span>
        <span>&bull;</span>
        <span>Press <kbd className="font-mono bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700">N</kbd> to Add Player</span>
      </footer>

      {/* Waiting Players Pool Drawer */}
      <Drawer
        isOpen={isWaitingDrawerOpen}
        onClose={() => setIsWaitingDrawerOpen(false)}
        title="Waiting Players Pool"
        description="Select players to form queue groups, rest, or auto-balance matches"
        size="lg"
      >
        <WaitingPool
          inDrawer
          onOpenPlayerList={() => {
            setIsWaitingDrawerOpen(false);
            setIsPlayerListOpen(true);
          }}
        />
      </Drawer>

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
