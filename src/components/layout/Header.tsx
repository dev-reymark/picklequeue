import React, { useState } from 'react';
import { usePickleballStore } from '@/store/pickleball-store';
import { SettingsModal } from '../settings/SettingsModal';
import { EndSessionModal } from '../session/EndSessionModal';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Settings, Volume2, VolumeX, HelpCircle } from 'lucide-react';

export const Header: React.FC = () => {
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

  const openShortcutsTab = () => {
    setSettingsDefaultTab('help');
    setIsSettingsOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-950/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-4 sm:px-6 lg:px-8 py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Logo, Venue & Session */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 inline-block" />
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

            <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-zinc-900/90 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-500 dark:text-zinc-400">Waiting:</span>
              <span className="font-bold text-slate-900 dark:text-zinc-100 font-mono">
                {waitingCount}
              </span>
            </div>
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
              onClick={openShortcutsTab}
              title="Keyboard Shortcuts & Help (?)"
              className="p-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white hover:bg-slate-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={loadDemoData}
              className="hidden sm:inline-block px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-800 transition"
              title="Load realistic sample tournament with players, matches and queue"
            >
              Demo
            </button>

            <button
              type="button"
              onClick={() => setIsEndSessionOpen(true)}
              className="hidden md:inline-block px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-800 transition"
            >
              Session
            </button>

            <button
              type="button"
              onClick={() => {
                setSettingsDefaultTab('general');
                setIsSettingsOpen(true);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 border border-slate-900 dark:border-zinc-700 transition flex items-center gap-1.5 shadow-xs"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
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
