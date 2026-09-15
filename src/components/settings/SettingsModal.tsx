import React, { useState, useEffect } from 'react';
import { usePickleballStore } from '@/store/pickleball-store';
import { QueueMode, SoundProfile } from '@/types';
import { playCourtEndBuzzer } from '@/lib/sound';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
}

type SettingsTab =
  | 'general'
  | 'game'
  | 'queue'
  | 'courts'
  | 'notifications'
  | 'data'
  | 'help';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'general',
}) => {
  const {
    settings,
    courts,
    updateSettings,
    renameCourt,
    addCourt,
    removeCourt,
    resetSession,
    clearAllData,
    exportBackupJson,
    importBackupJson,
    startTutorial,
  } = usePickleballStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>(defaultTab as SettingsTab);

  // Form state with defensive fallbacks
  const [venueName, setVenueName] = useState(settings?.venueName || 'Smash Point Pickleball');
  const [sessionName, setSessionName] = useState(settings?.sessionName || 'Open Rotation Session');
  const [courtCount, setCourtCount] = useState(settings?.courtCount || 6);
  const [defaultGameDuration, setDefaultGameDuration] = useState(settings?.defaultGameDuration || 15);
  const [playersPerGroup, setPlayersPerGroup] = useState(settings?.playersPerGroup || 4);
  const [queueMode, setQueueMode] = useState<QueueMode>(settings?.queueMode || 'fifo');
  const [warningTimeSeconds, setWarningTimeSeconds] = useState(settings?.warningTimeSeconds || 120);
  const [allowOvertime, setAllowOvertime] = useState(settings?.allowOvertime ?? true);
  const [defaultPostGameAction, setDefaultPostGameAction] = useState(settings?.defaultPostGameAction || 'waiting-pool');
  const [autoAssignNextGroup, setAutoAssignNextGroup] = useState(settings?.autoAssignNextGroup ?? false);
  const [minimumRestGames, setMinimumRestGames] = useState(settings?.minimumRestGames ?? 0);
  const [soundEnabled, setSoundEnabled] = useState(settings?.soundEnabled ?? true);
  const [soundVolume, setSoundVolume] = useState(settings?.soundVolume ?? 0.8);
  const [soundProfile, setSoundProfile] = useState<SoundProfile>(settings?.soundProfile ?? 'minimal');
  const [uiSounds, setUiSounds] = useState(settings?.uiSounds ?? false);
  const [queueSounds, setQueueSounds] = useState(settings?.queueSounds ?? true);
  const [timerSounds, setTimerSounds] = useState(settings?.timerSounds ?? true);
  const [vibrationEnabled, setVibrationEnabled] = useState(settings?.vibrationEnabled ?? false);

  // Sync state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setVenueName(settings?.venueName || 'Smash Point Pickleball');
      setSessionName(settings?.sessionName || 'Open Rotation Session');
      setCourtCount(settings?.courtCount || 6);
      setDefaultGameDuration(settings?.defaultGameDuration || 15);
      setPlayersPerGroup(settings?.playersPerGroup || 4);
      setQueueMode(settings?.queueMode || 'fifo');
      setWarningTimeSeconds(settings?.warningTimeSeconds || 120);
      setAllowOvertime(settings?.allowOvertime ?? true);
      setDefaultPostGameAction(settings?.defaultPostGameAction || 'waiting-pool');
      setAutoAssignNextGroup(settings?.autoAssignNextGroup ?? false);
      setMinimumRestGames(settings?.minimumRestGames ?? 0);
      setSoundEnabled(settings?.soundEnabled ?? true);
      setSoundVolume(settings?.soundVolume ?? 0.8);
      setSoundProfile(settings?.soundProfile ?? 'minimal');
      setUiSounds(settings?.uiSounds ?? false);
      setQueueSounds(settings?.queueSounds ?? true);
      setTimerSounds(settings?.timerSounds ?? true);
      setVibrationEnabled(settings?.vibrationEnabled ?? false);
    }
  }, [isOpen, settings]);

  // Court editing state
  const [editingCourtId, setEditingCourtId] = useState<string | null>(null);
  const [tempCourtName, setTempCourtName] = useState('');
  const [newCourtNameInput, setNewCourtNameInput] = useState('');

  // Import error state
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    updateSettings({
      venueName: (venueName || '').trim() || 'Smash Point Pickleball',
      sessionName: (sessionName || '').trim() || 'Open Rotation Session',
      courtCount: courtCount || 6,
      defaultGameDuration: defaultGameDuration || 15,
      playersPerGroup: playersPerGroup || 4,
      queueMode: queueMode || 'fifo',
      warningTimeSeconds: warningTimeSeconds || 120,
      allowOvertime: allowOvertime ?? true,
      defaultPostGameAction: defaultPostGameAction || 'waiting-pool',
      autoAssignNextGroup: autoAssignNextGroup ?? false,
      minimumRestGames: minimumRestGames ?? 0,
      soundEnabled: soundEnabled ?? true,
      soundVolume: soundVolume ?? 0.8,
      soundProfile: soundProfile || 'minimal',
      uiSounds: uiSounds ?? false,
      queueSounds: queueSounds ?? true,
      timerSounds: timerSounds ?? true,
      vibrationEnabled: vibrationEnabled ?? false,
    });
    onClose();
  };

  const handleExport = () => {
    const json = exportBackupJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `picklequeue-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importBackupJson(content);
      if (success) {
        setImportStatus('Backup restored successfully!');
        setTimeout(() => {
          setImportStatus(null);
          onClose();
        }, 1200);
      } else {
        setImportStatus('Invalid backup file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleSaveCourtName = (id: string) => {
    if (tempCourtName.trim()) {
      renameCourt(id, tempCourtName.trim());
    }
    setEditingCourtId(null);
  };

  const handleAddNewCourt = () => {
    addCourt(newCourtNameInput.trim() || undefined);
    setNewCourtNameInput('');
  };

  const handleReplayTutorial = () => {
    onClose();
    startTutorial();
  };

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'game', label: 'Game Rules' },
    { id: 'queue', label: 'Queue & Rotation' },
    { id: 'courts', label: 'Courts' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'data', label: 'Data & Backup' },
    { id: 'help', label: 'Help & Shortcuts' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
              System Settings
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Configure venue operations, match rules, and queuing policies
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 text-lg px-2 font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body: Sidebar Tabs + Pane */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-48 bg-slate-50 dark:bg-zinc-950/70 border-r border-slate-200 dark:border-zinc-800 p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 shadow-xs border border-slate-200 dark:border-zinc-700'
                    : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Pane */}
          <div className="flex-1 p-6 overflow-y-auto space-y-5">
            {/* Tab 1: General */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5 cursor-pointer">
                    Venue Name
                  </label>
                  <input
                    type="text"
                    value={venueName || ''}
                    onChange={(e) => setVenueName(e.target.value)}
                    placeholder="e.g. Smash Point Pickleball"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm text-slate-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5 cursor-pointer">
                    Session Title
                  </label>
                  <input
                    type="text"
                    value={sessionName || ''}
                    onChange={(e) => setSessionName(e.target.value)}
                    placeholder="e.g. Tuesday Evening Session"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm text-slate-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-zinc-800">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block">
                      Number of Courts
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Total courts available in this venue (1–12)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCourtCount((c) => Math.max(1, c - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-zinc-800 dark:text-zinc-200 font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-sm text-slate-900 dark:text-zinc-100 font-mono">
                      {courtCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCourtCount((c) => Math.min(12, c + 1))}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-zinc-800 dark:text-zinc-200 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-zinc-800">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block">
                      Players Per Match
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Doubles (4 players) or Singles (2 players)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPlayersPerGroup(4)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        playersPerGroup === 4
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      4 (Doubles)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlayersPerGroup(2)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        playersPerGroup === 2
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      2 (Singles)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Game Rules */}
            {activeTab === 'game' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block">
                      Default Match Duration
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Countdown timer length per match
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDefaultGameDuration((d) => Math.max(5, d - 5))}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-zinc-800 dark:text-zinc-200 font-bold cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-16 text-center font-bold text-sm text-slate-900 dark:text-zinc-100 font-mono">
                      {defaultGameDuration} min
                    </span>
                    <button
                      type="button"
                      onClick={() => setDefaultGameDuration((d) => Math.min(60, d + 5))}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-zinc-800 dark:text-zinc-200 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-zinc-800">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block">
                      Warning Before End
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      When timer turns amber and pulses &ldquo;Ending Soon&rdquo;
                    </span>
                  </div>
                  <select
                    value={warningTimeSeconds}
                    onChange={(e) => setWarningTimeSeconds(Number(e.target.value))}
                    className="text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 rounded-lg px-3 py-1.5 cursor-pointer"
                  >
                    <option value={60}>1 minute</option>
                    <option value={120}>2 minutes (Default)</option>
                    <option value={180}>3 minutes</option>
                  </select>
                </div>

                <div className="py-2 space-y-2">
                  <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block">
                    Overtime Behavior
                  </span>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-zinc-300">
                      <input
                        type="radio"
                        name="overtime"
                        checked={allowOvertime}
                        onChange={() => setAllowOvertime(true)}
                        className="text-emerald-500 cursor-pointer"
                      />
                      <span>
                        <strong>Allow Overtime (Recommended)</strong> &bull; Shows +MM:SS elapsed until organizer ends game
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-zinc-300">
                      <input
                        type="radio"
                        name="overtime"
                        checked={!allowOvertime}
                        onChange={() => setAllowOvertime(false)}
                        className="text-emerald-500 cursor-pointer"
                      />
                      <span>
                        <strong>Auto-Prompt Game End</strong> &bull; Triggers end-game dialog immediately at 00:00
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Queue & Rotation */}
            {activeTab === 'queue' && (
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block mb-1.5 uppercase tracking-wider">
                    Queue Mode
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setQueueMode('fifo')}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        queueMode === 'fifo'
                          ? 'bg-slate-100 dark:bg-zinc-800 border-emerald-500 text-slate-900 dark:text-zinc-100'
                          : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      <span className="text-xs font-bold block mb-0.5">First-Come, First-Served</span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">Normal FIFO rotation in order of queue entry</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQueueMode('skill-balanced')}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        queueMode === 'skill-balanced'
                          ? 'bg-slate-100 dark:bg-zinc-800 border-emerald-500 text-slate-900 dark:text-zinc-100'
                          : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      <span className="text-xs font-bold block mb-0.5">Skill Balanced Mode</span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">Optimizes group selection to match similar skill ratings</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-zinc-800">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block">
                      Default Post-Game Action
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Standard workflow when a match completes
                    </span>
                  </div>
                  <select
                    value={defaultPostGameAction}
                    onChange={(e) => setDefaultPostGameAction(e.target.value as any)}
                    className="text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 rounded-lg px-3 py-1.5 cursor-pointer"
                  >
                    <option value="waiting-pool">Return to Waiting Pool</option>
                    <option value="requeue">Automatically Requeue</option>
                    <option value="resting">Mark as Resting</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-zinc-800">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block">
                      Minimum Rest Between Games
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Prevents player from being auto-queued right after finishing
                    </span>
                  </div>
                  <select
                    value={minimumRestGames}
                    onChange={(e) => setMinimumRestGames(Number(e.target.value))}
                    className="text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 rounded-lg px-3 py-1.5 cursor-pointer"
                  >
                    <option value={0}>None (Continuous play)</option>
                    <option value={1}>1 game rest</option>
                    <option value={2}>2 games rest</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-zinc-800">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block">
                      Auto-Assign Next Group
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Automatically start Queue #1 when a court becomes open
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoAssignNextGroup}
                    onChange={(e) => setAutoAssignNextGroup(e.target.checked)}
                    className="rounded bg-white dark:bg-zinc-950 border-slate-300 dark:border-zinc-700 text-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Tab 4: Courts */}
            {activeTab === 'courts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                    Courts List ({courts.length})
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newCourtNameInput}
                      onChange={(e) => setNewCourtNameInput(e.target.value)}
                      placeholder="e.g. Center Court"
                      className="px-2.5 py-1 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-800 dark:text-zinc-200"
                    />
                    <button
                      type="button"
                      onClick={handleAddNewCourt}
                      className="px-3 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition cursor-pointer"
                    >
                      + Add Court
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {courts.map((court) => (
                    <div
                      key={court.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800"
                    >
                      {editingCourtId === court.id ? (
                        <div className="flex items-center gap-2 flex-1 mr-2">
                          <input
                            type="text"
                            value={tempCourtName}
                            onChange={(e) => setTempCourtName(e.target.value)}
                            className="px-2.5 py-1 text-xs bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-lg text-slate-900 dark:text-zinc-100 flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveCourtName(court.id)}
                            className="px-2.5 py-1 text-xs bg-emerald-600 text-white rounded-lg font-medium cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCourtId(null)}
                            className="px-2.5 py-1 text-xs bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg font-medium cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                              {court.name}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize border ${
                                court.status === 'playing'
                                  ? 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30'
                              }`}
                            >
                              {court.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCourtId(court.id);
                                setTempCourtName(court.name);
                              }}
                              className="px-2.5 py-1 text-xs font-medium bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 rounded-lg transition cursor-pointer"
                            >
                              Rename
                            </button>
                            {court.status === 'available' && courts.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeCourt(court.id)}
                                className="px-2.5 py-1 text-xs font-medium bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-zinc-800 dark:hover:bg-rose-950/60 dark:text-rose-400 rounded-lg transition cursor-pointer"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 5: Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                {/* Sound Profile Selector */}
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block mb-1.5 uppercase tracking-wider">
                    Sound Profile
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSoundProfile('minimal')}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        soundProfile === 'minimal'
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-slate-900 dark:text-zinc-100 ring-1 ring-emerald-500'
                          : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      <span className="text-xs font-bold block mb-0.5">Minimal</span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">Venue Recommended: Timers &amp; assignments only</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSoundProfile('standard')}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        soundProfile === 'standard'
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-slate-900 dark:text-zinc-100 ring-1 ring-emerald-500'
                          : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      <span className="text-xs font-bold block mb-0.5">Standard</span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">Full audio: UI clicks, queue events, &amp; timer alerts</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSoundProfile('silent')}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        soundProfile === 'silent'
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-slate-900 dark:text-zinc-100 ring-1 ring-emerald-500'
                          : 'bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400'
                      }`}
                    >
                      <span className="text-xs font-bold block mb-0.5">Silent</span>
                      <span className="text-[11px] text-slate-500 dark:text-zinc-400">Completely quiet: All audio alerts muted</span>
                    </button>
                  </div>
                </div>

                {/* Master Audio Toggle */}
                <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-zinc-800">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block">
                      Master Sound
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Enable or disable all procedural sound effects
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="rounded bg-white dark:bg-zinc-950 border-slate-300 dark:border-zinc-700 text-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </div>

                {/* Granular Toggles */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 dark:text-zinc-300">
                      UI Micro-Interactions (Button &amp; card taps)
                    </span>
                    <input
                      type="checkbox"
                      disabled={soundProfile === 'minimal' || soundProfile === 'silent'}
                      checked={uiSounds && soundProfile === 'standard'}
                      onChange={(e) => setUiSounds(e.target.checked)}
                      className="rounded bg-white dark:bg-zinc-950 border-slate-300 dark:border-zinc-700 text-emerald-500 w-4 h-4 cursor-pointer disabled:opacity-40"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 dark:text-zinc-300">
                      Queue &amp; Court Notifications (Assignment success, group ready)
                    </span>
                    <input
                      type="checkbox"
                      disabled={soundProfile === 'silent'}
                      checked={queueSounds && soundProfile !== 'silent'}
                      onChange={(e) => setQueueSounds(e.target.checked)}
                      className="rounded bg-white dark:bg-zinc-950 border-slate-300 dark:border-zinc-700 text-emerald-500 w-4 h-4 cursor-pointer disabled:opacity-40"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 dark:text-zinc-300">
                      Timer Warnings (2m chime, 30s beep, &amp; Time&apos;s Up buzzer)
                    </span>
                    <input
                      type="checkbox"
                      disabled={soundProfile === 'silent'}
                      checked={timerSounds && soundProfile !== 'silent'}
                      onChange={(e) => setTimerSounds(e.target.checked)}
                      className="rounded bg-white dark:bg-zinc-950 border-slate-300 dark:border-zinc-700 text-emerald-500 w-4 h-4 cursor-pointer disabled:opacity-40"
                    />
                  </div>
                </div>

                {/* Volume Slider & Test Button */}
                <div className="py-3 border-t border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                      Alert Volume ({Math.round(soundVolume * 100)}%)
                    </span>
                    <button
                      type="button"
                      onClick={() => playCourtEndBuzzer()}
                      className="px-3 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 transition cursor-pointer"
                    >
                      Test Sound
                    </button>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={soundVolume}
                    onChange={(e) => setSoundVolume(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Device Vibration Toggle */}
                <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-zinc-800">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block">
                      Device Vibration
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Haptic pulse on mobile/tablet during 2m warning and game finish
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={vibrationEnabled}
                    onChange={(e) => setVibrationEnabled(e.target.checked)}
                    className="rounded bg-white dark:bg-zinc-950 border-slate-300 dark:border-zinc-700 text-emerald-500 w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Tab 6: Data & Backup */}
            {activeTab === 'data' && (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Save a snapshot of all players, courts, queues, and game history to your computer.
                </p>

                {importStatus && (
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-medium">
                    {importStatus}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleExport}
                    className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-900 text-left transition cursor-pointer"
                  >
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block mb-0.5">
                      Export Backup JSON
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Download session data as a .json file
                    </span>
                  </button>

                  <label className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-900 text-left transition cursor-pointer block">
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100 block mb-0.5">
                      Import Backup JSON
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      Upload and restore a previous backup
                    </span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportFile}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-zinc-800">
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider block mb-2">
                    Danger Zone
                  </span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Reset current session? Matches and queue will be cleared, players will return to waiting pool.')) {
                          resetSession();
                          onClose();
                        }
                      }}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-amber-700 border border-slate-200 dark:bg-zinc-800 dark:text-amber-300 dark:border-zinc-700 transition cursor-pointer"
                    >
                      Reset Current Session
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('WARNING: Clear ALL players, matches, and queues? This cannot be undone.')) {
                          clearAllData();
                          onClose();
                        }
                      }}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60 transition cursor-pointer"
                    >
                      Clear All Data
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 7: Help & Shortcuts */}
            {activeTab === 'help' && (
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block mb-2 uppercase tracking-wider">
                    Keyboard Shortcuts
                  </span>
                  <div className="border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden text-xs">
                    <div className="grid grid-cols-2 p-2.5 bg-slate-50 dark:bg-zinc-950 font-semibold text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800">
                      <span>Key</span>
                      <span>Action</span>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                      <div className="grid grid-cols-2 p-2.5">
                        <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">N</span>
                        <span className="text-slate-600 dark:text-zinc-300">Open Add Player modal</span>
                      </div>
                      <div className="grid grid-cols-2 p-2.5">
                        <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">?</span>
                        <span className="text-slate-600 dark:text-zinc-300">Open Settings &amp; Shortcuts</span>
                      </div>
                      <div className="grid grid-cols-2 p-2.5">
                        <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">Esc</span>
                        <span className="text-slate-600 dark:text-zinc-300">Close open modal / dialog</span>
                      </div>
                      <div className="grid grid-cols-2 p-2.5">
                        <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">Enter</span>
                        <span className="text-slate-600 dark:text-zinc-300">Submit new player name</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block mb-2 uppercase tracking-wider">
                    Interactive Walkthrough
                  </span>
                  <button
                    type="button"
                    onClick={handleReplayTutorial}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs cursor-pointer"
                  >
                    Replay Tutorial Tour
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-400 dark:text-zinc-500">
                  PickleQueue v1.1.0 &bull; LocalStorage Prototype &bull; Zero Backend Needed
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-3.5 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs cursor-pointer"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
