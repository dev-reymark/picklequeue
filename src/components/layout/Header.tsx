import React, { useState } from 'react';
import { usePickleballStore } from '@/store/pickleball-store';
import { SettingsModal } from '../settings/SettingsModal';
import { EndSessionModal } from '../session/EndSessionModal';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Logo } from '../ui/Logo';
import { Button } from '../ui/Button';
import { Settings, Volume2, VolumeX, Users } from 'lucide-react';

interface HeaderProps {
  onOpenWaitingPool?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenWaitingPool }) => {
  const {
    courts,
    queue,
    players,
    settings,
    session,
    updateSettings,
    loadDemoData,
    startTutorial,
  } = usePickleballStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEndSessionOpen, setIsEndSessionOpen] = useState(false);
  const [settingsDefaultTab, setSettingsDefaultTab] = useState<string>('general');

  const activeCourtsCount = courts.filter((c) => c.status === 'playing').length;
  const waitingCount = players.filter((p) => p.status === 'waiting' || (p.status as any) === 'available').length;

  const toggleSound = () => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-950/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-4 sm:px-6 lg:px-8 py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Logo, Venue & Session */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <Logo className="w-7 h-7 sm:w-8 sm:h-8" />
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-zinc-100 tracking-wider">
                PICKLEQUEUE
              </h1>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 pl-2 border-l border-slate-200 dark:border-zinc-800">
              <span className="font-semibold text-slate-800 dark:text-zinc-200">
                {settings.venueName || 'Venue'}
              </span>
              <span>&bull;</span>
              <span>{settings.sessionName || 'Session'}</span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="hidden lg:flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-zinc-900/90 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span className="text-slate-500 dark:text-zinc-400">Courts:</span>
              <span className="font-bold text-slate-900 dark:text-zinc-100 font-mono">
                {activeCourtsCount} / {courts.length}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-zinc-900/90 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-slate-500 dark:text-zinc-400">In Queue:</span>
              <span className="font-bold text-slate-900 dark:text-zinc-100 font-mono">
                {queue.length}
              </span>
            </div>

            <button
              type="button"
              onClick={onOpenWaitingPool}
              className="flex items-center gap-2 bg-slate-100/80 hover:bg-slate-200/80 dark:bg-zinc-900/90 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 transition cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-500 dark:text-zinc-400">Waiting:</span>
              <span className="font-bold text-slate-900 dark:text-zinc-100 font-mono">
                {waitingCount}
              </span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            <button
              type="button"
              onClick={toggleSound}
              title={settings.soundEnabled ? 'Mute Alert Buzzer' : 'Enable Alert Buzzer'}
              className={`p-2 rounded-lg border text-xs font-medium transition flex items-center justify-center ${
                settings.soundEnabled
                  ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800'
                  : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-100 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-500 dark:hover:bg-zinc-900'
              }`}
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={loadDemoData}
              className="hidden sm:inline-block px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-800 transition cursor-pointer"
            >
              Demo
            </button>

            <button
              type="button"
              onClick={() => setIsEndSessionOpen(true)}
              className="hidden md:inline-block px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-800 transition cursor-pointer"
            >
              Session
            </button>

            <button
              type="button"
              onClick={() => {
                setSettingsDefaultTab('general');
                setIsSettingsOpen(true);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 border border-slate-900 dark:border-zinc-700 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>

            {/* Waiting Pool Drawer Button at justify end */}
            <Button
              id="waiting-pool-header-btn"
              variant="primary"
              size="sm"
              onClick={onOpenWaitingPool}
              startContent={<Users className="w-3.5 h-3.5" />}
              endContent={
                <span className="inline-flex items-center gap-1.5 ml-0.5">
                  <span className="px-1.5 py-0.2 rounded-md bg-emerald-700 text-emerald-100 font-mono text-[11px] font-bold">
                    {waitingCount}
                  </span>
                  <kbd className="hidden sm:inline-flex items-center justify-center text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-700/80 text-emerald-100 border border-emerald-500/50 shadow-2xs">
                    W
                  </kbd>
                </span>
              }
            >
              <span className="hidden sm:inline">Waiting Pool</span>
              <span className="sm:hidden">Pool</span>
            </Button>
          </div>
        </div>
      </header>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        defaultTab={settingsDefaultTab}
      />

      <EndSessionModal
        isOpen={isEndSessionOpen}
        onClose={() => setIsEndSessionOpen(false)}
      />
    </>
  );
};
