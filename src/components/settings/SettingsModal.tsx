import React, { useState, useEffect } from "react";
import { usePickleballStore } from "@/store/pickleball-store";
import { QueueMode, SoundProfile, TimerDirection } from "@/types";
import { playCourtEndBuzzer } from "@/lib/sound";
import { Modal, Tabs, TabItem, Checkbox, Input, Select, Button, ConfirmAlert } from "@/components/ui";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: string;
}

type SettingsTab =
  | "general"
  | "game"
  | "queue"
  | "courts"
  | "notifications"
  | "data"
  | "help";

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  defaultTab = "general",
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

  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    variant: 'danger' | 'warning';
    action: () => void;
  } | null>(null);

  // Form state with defensive fallbacks
  const [venueName, setVenueName] = useState(
    settings?.venueName || "Smash Point Pickleball",
  );
  const [sessionName, setSessionName] = useState(
    settings?.sessionName || "Open Rotation Session",
  );
  const [courtCount, setCourtCount] = useState(settings?.courtCount || 6);
  const [defaultGameDuration, setDefaultGameDuration] = useState(
    settings?.defaultGameDuration || 15,
  );
  const [playersPerGroup, setPlayersPerGroup] = useState(
    settings?.playersPerGroup || 4,
  );
  const [queueMode, setQueueMode] = useState<QueueMode>(
    settings?.queueMode || "fifo",
  );
  const [warningTimeSeconds, setWarningTimeSeconds] = useState(
    settings?.warningTimeSeconds || 120,
  );
  const [allowOvertime, setAllowOvertime] = useState(
    settings?.allowOvertime ?? true,
  );
  const [timerDirection, setTimerDirection] = useState<TimerDirection>(
    settings?.timerDirection || "countdown",
  );
  const [defaultPostGameAction, setDefaultPostGameAction] = useState(
    settings?.defaultPostGameAction || "waiting-pool",
  );
  const [autoAssignNextGroup, setAutoAssignNextGroup] = useState(
    settings?.autoAssignNextGroup ?? false,
  );
  const [minimumRestGames, setMinimumRestGames] = useState(
    settings?.minimumRestGames ?? 0,
  );
  const [soundEnabled, setSoundEnabled] = useState(
    settings?.soundEnabled ?? true,
  );
  const [soundVolume, setSoundVolume] = useState(settings?.soundVolume ?? 0.8);
  const [soundProfile, setSoundProfile] = useState<SoundProfile>(
    settings?.soundProfile ?? "minimal",
  );
  const [uiSounds, setUiSounds] = useState(settings?.uiSounds ?? false);
  const [queueSounds, setQueueSounds] = useState(settings?.queueSounds ?? true);
  const [timerSounds, setTimerSounds] = useState(settings?.timerSounds ?? true);
  const [vibrationEnabled, setVibrationEnabled] = useState(
    settings?.vibrationEnabled ?? false,
  );

  // Sync state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setVenueName(settings?.venueName || "Smash Point Pickleball");
      setSessionName(settings?.sessionName || "Open Rotation Session");
      setCourtCount(settings?.courtCount || 6);
      setDefaultGameDuration(settings?.defaultGameDuration || 15);
      setPlayersPerGroup(settings?.playersPerGroup || 4);
      setQueueMode(settings?.queueMode || "fifo");
      setWarningTimeSeconds(settings?.warningTimeSeconds || 120);
      setAllowOvertime(settings?.allowOvertime ?? true);
      setTimerDirection(settings?.timerDirection || "countdown");
      setDefaultPostGameAction(
        settings?.defaultPostGameAction || "waiting-pool",
      );
      setAutoAssignNextGroup(settings?.autoAssignNextGroup ?? false);
      setMinimumRestGames(settings?.minimumRestGames ?? 0);
      setSoundEnabled(settings?.soundEnabled ?? true);
      setSoundVolume(settings?.soundVolume ?? 0.8);
      setSoundProfile(settings?.soundProfile ?? "minimal");
      setUiSounds(settings?.uiSounds ?? false);
      setQueueSounds(settings?.queueSounds ?? true);
      setTimerSounds(settings?.timerSounds ?? true);
      setVibrationEnabled(settings?.vibrationEnabled ?? false);
    }
  }, [isOpen, settings]);

  // Court editing state
  const [editingCourtId, setEditingCourtId] = useState<string | null>(null);
  const [tempCourtName, setTempCourtName] = useState("");
  const [newCourtNameInput, setNewCourtNameInput] = useState("");

  // Import error state
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    updateSettings({
      venueName: (venueName || "").trim() || "Smash Point Pickleball",
      sessionName: (sessionName || "").trim() || "Open Rotation Session",
      courtCount: courtCount || 6,
      defaultGameDuration: defaultGameDuration || 15,
      playersPerGroup: playersPerGroup || 4,
      queueMode: queueMode || "fifo",
      warningTimeSeconds: warningTimeSeconds || 120,
      allowOvertime: allowOvertime ?? true,
      timerDirection: timerDirection || "countdown",
      defaultPostGameAction: defaultPostGameAction || "waiting-pool",
      autoAssignNextGroup: autoAssignNextGroup ?? false,
      minimumRestGames: minimumRestGames ?? 0,
      soundEnabled: soundEnabled ?? true,
      soundVolume: soundVolume ?? 0.8,
      soundProfile: soundProfile || "minimal",
      uiSounds: uiSounds ?? false,
      queueSounds: queueSounds ?? true,
      timerSounds: timerSounds ?? true,
      vibrationEnabled: vibrationEnabled ?? false,
    });
    onClose();
  };

  const handleExport = () => {
    const json = exportBackupJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
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
        setImportStatus("Backup restored successfully!");
        setTimeout(() => {
          setImportStatus(null);
          onClose();
        }, 1200);
      } else {
        setImportStatus("Invalid backup file format.");
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
    setNewCourtNameInput("");
  };

  const handleReplayTutorial = () => {
    onClose();
    startTutorial();
  };

  const tabs: TabItem[] = [
    {
      id: "general",
      label: "General",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      id: "game",
      label: "Game Rules",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: "queue",
      label: "Queue & Rotation",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ),
    },
    {
      id: "courts",
      label: "Courts",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
    },
    {
      id: "data",
      label: "Data & Backup",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
          />
        </svg>
      ),
    },
    {
      id: "help",
      label: "Help & Shortcuts",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <>
      <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="System Settings"
      description="Configure venue operations, match rules, and queuing policies"
      maxWidth="3xl"
      fullPageOnMobile
      dialogClassName="sm:h-[650px]"
      showCloseButton={false}
      bodyClassName="p-0 flex flex-col md:flex-row overflow-hidden min-h-0"
      footer={
        <>
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
        </>
      }
    >
      <Tabs
        items={tabs}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as SettingsTab)}
        orientation="responsive"
      />

      {/* Right Pane */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
        {/* Tab 1: General */}
        {activeTab === "general" && (
          <div className="space-y-4">
            <Input
              label="Venue Name"
              type="text"
              value={venueName || ""}
              onChange={(e) => setVenueName(e.target.value)}
              placeholder="e.g. Smash Point Pickleball"
            />

            <Input
              label="Session Title"
              type="text"
              value={sessionName || ""}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="e.g. Tuesday Evening Session"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-2.5 border-t border-slate-100 dark:border-zinc-800">
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

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-2.5 border-t border-slate-100 dark:border-zinc-800">
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
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  4 (Doubles)
                </button>
                <button
                  type="button"
                  onClick={() => setPlayersPerGroup(2)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    playersPerGroup === 2
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  2 (Singles)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Game Rules */}
        {activeTab === "game" && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-2.5 border-b border-slate-100 dark:border-zinc-800">
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
                  onClick={() =>
                    setDefaultGameDuration((d) => Math.max(5, d - 5))
                  }
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-zinc-800 dark:text-zinc-200 font-bold cursor-pointer"
                >
                  -
                </button>
                <span className="w-16 text-center font-bold text-sm text-slate-900 dark:text-zinc-100 font-mono">
                  {defaultGameDuration} min
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setDefaultGameDuration((d) => Math.min(60, d + 5))
                  }
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-zinc-800 dark:text-zinc-200 font-bold cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-2.5 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block">
                  Warning Before End
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                  When timer turns amber and pulses &ldquo;Ending Soon&rdquo;
                </span>
              </div>
              <Select
                value={warningTimeSeconds}
                onChange={(e) => setWarningTimeSeconds(Number(e.target.value))}
                containerClassName="w-full sm:w-48"
                options={[
                  { value: 60, label: "1 minute" },
                  { value: 120, label: "2 minutes (Default)" },
                  { value: 180, label: "3 minutes" },
                ]}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-2.5 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block">
                  Timer Direction
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Countdown (Remaining) or Count-up (Elapsed time)
                </span>
              </div>
              <Select
                value={timerDirection}
                onChange={(e) =>
                  setTimerDirection(e.target.value as TimerDirection)
                }
                containerClassName="w-full sm:w-56"
                options={[
                  { value: "countdown", label: "Countdown (15:00 → 00:00)" },
                  { value: "countup", label: "Count-up (00:00 → 15:00)" },
                ]}
              />
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
                    <strong>Allow Overtime (Recommended)</strong> &bull; Shows
                    +MM:SS elapsed until organizer ends game
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
                    <strong>Auto-Prompt Game End</strong> &bull; Triggers
                    end-game dialog immediately at 00:00
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Queue & Rotation */}
        {activeTab === "queue" && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block mb-1.5 uppercase tracking-wider">
                Queue Mode
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setQueueMode("fifo")}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    queueMode === "fifo"
                      ? "bg-slate-100 dark:bg-zinc-800 border-emerald-500 text-slate-900 dark:text-zinc-100"
                      : "bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400"
                  }`}
                >
                  <span className="text-xs font-bold block mb-0.5">
                    First-Come, First-Served
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Normal FIFO rotation in order of queue entry
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setQueueMode("skill-balanced")}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    queueMode === "skill-balanced"
                      ? "bg-slate-100 dark:bg-zinc-800 border-emerald-500 text-slate-900 dark:text-zinc-100"
                      : "bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400"
                  }`}
                >
                  <span className="text-xs font-bold block mb-0.5">
                    Skill Balanced Mode
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Optimizes group selection to match similar skill ratings
                  </span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-2.5 border-t border-slate-100 dark:border-zinc-800">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block">
                  Default Post-Match Action
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Standard workflow when a match completes
                </span>
              </div>
              <Select
                value={defaultPostGameAction}
                onChange={(e) =>
                  setDefaultPostGameAction(e.target.value as any)
                }
                containerClassName="w-full sm:w-56"
                options={[
                  { value: "waiting-pool", label: "Return to Waiting Pool" },
                  { value: "requeue", label: "Automatically Requeue" },
                  { value: "resting", label: "Mark as Resting" },
                ]}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-2.5 border-t border-slate-100 dark:border-zinc-800">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block">
                  Minimum Rest Between Games
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Prevents player from being auto-queued right after finishing
                </span>
              </div>
              <Select
                value={minimumRestGames}
                onChange={(e) => setMinimumRestGames(Number(e.target.value))}
                containerClassName="w-full sm:w-56"
                options={[
                  { value: 0, label: "None (Continuous play)" },
                  { value: 1, label: "1 game rest" },
                  { value: 2, label: "2 games rest" },
                ]}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-2.5 border-t border-slate-100 dark:border-zinc-800">
              <div>
                <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block">
                  Auto-Assign Next Group
                </span>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Automatically start Queue #1 when a court becomes open
                </span>
              </div>
              <Checkbox
                checked={autoAssignNextGroup}
                onCheckedChange={setAutoAssignNextGroup}
              />
            </div>
          </div>
        )}

        {/* Tab 4: Courts */}
        {activeTab === "courts" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                Courts List ({courts.length})
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Input
                  value={newCourtNameInput}
                  onChange={(e) => setNewCourtNameInput(e.target.value)}
                  placeholder="e.g. Center Court"
                  containerClassName="flex-1 sm:w-44"
                  className="!py-1 text-base sm:text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddNewCourt}
                  className="px-3 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition cursor-pointer shrink-0"
                >
                  + Add Court
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {courts.map((court) => (
                <div
                  key={court.id}
                  className="flex flex-col justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 gap-2.5 transition hover:border-slate-300 dark:hover:border-zinc-700"
                >
                  {editingCourtId === court.id ? (
                    <div className="flex flex-col gap-2 flex-1">
                      <Input
                        value={tempCourtName}
                        onChange={(e) => setTempCourtName(e.target.value)}
                        containerClassName="w-full"
                        className="!py-1 text-base sm:text-xs bg-white dark:bg-zinc-900 border-slate-300 dark:border-zinc-700"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSaveCourtName(court.id);
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            setEditingCourtId(null);
                          }
                        }}
                      />
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingCourtId(null)}
                          className="px-2.5 py-1 text-xs bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-lg font-medium cursor-pointer hover:bg-slate-300 dark:hover:bg-zinc-700 transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveCourtName(court.id)}
                          className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium cursor-pointer transition"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        <span
                          className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate"
                          title={court.name}
                        >
                          {court.name}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded capitalize border shrink-0 ${
                            court.status === "playing"
                              ? "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30"
                          }`}
                        >
                          {court.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-200/60 dark:border-zinc-800/60">
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
                        {court.status === "available" && courts.length > 1 && (
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
        {activeTab === "notifications" && (
          <div className="space-y-4">
            {/* Sound Profile Selector */}
            <div>
              <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 block mb-1.5 uppercase tracking-wider">
                Sound Profile
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSoundProfile("minimal")}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    soundProfile === "minimal"
                      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-slate-900 dark:text-zinc-100 ring-1 ring-emerald-500"
                      : "bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400"
                  }`}
                >
                  <span className="text-xs font-bold block mb-0.5">
                    Minimal
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Venue Recommended: Timers &amp; assignments only
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSoundProfile("standard")}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    soundProfile === "standard"
                      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-slate-900 dark:text-zinc-100 ring-1 ring-emerald-500"
                      : "bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400"
                  }`}
                >
                  <span className="text-xs font-bold block mb-0.5">
                    Standard
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Full audio: UI clicks, queue events, &amp; timer alerts
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSoundProfile("silent")}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                    soundProfile === "silent"
                      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-slate-900 dark:text-zinc-100 ring-1 ring-emerald-500"
                      : "bg-slate-50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400"
                  }`}
                >
                  <span className="text-xs font-bold block mb-0.5">Silent</span>
                  <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Completely quiet: All audio alerts muted
                  </span>
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
              <Checkbox
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>

            {/* Granular Toggles */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 dark:text-zinc-300">
                  UI Micro-Interactions (Button &amp; card taps)
                </span>
                <Checkbox
                  disabled={
                    soundProfile === "minimal" || soundProfile === "silent"
                  }
                  checked={uiSounds && soundProfile === "standard"}
                  onCheckedChange={setUiSounds}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 dark:text-zinc-300">
                  Queue &amp; Court Notifications (Assignment success, group
                  ready)
                </span>
                <Checkbox
                  disabled={soundProfile === "silent"}
                  checked={queueSounds && soundProfile !== "silent"}
                  onCheckedChange={setQueueSounds}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 dark:text-zinc-300">
                  Timer Warnings (2m chime, 30s beep, &amp; Time&apos;s Up
                  buzzer)
                </span>
                <Checkbox
                  disabled={soundProfile === "silent"}
                  checked={timerSounds && soundProfile !== "silent"}
                  onCheckedChange={setTimerSounds}
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
                  Haptic pulse on mobile/tablet during 2m warning and game
                  finish
                </span>
              </div>
              <Checkbox
                checked={vibrationEnabled}
                onCheckedChange={setVibrationEnabled}
              />
            </div>
          </div>
        )}

        {/* Tab 6: Data & Backup */}
        {activeTab === "data" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Save a snapshot of all players, courts, queues, and game history
              to your computer.
            </p>

            {importStatus && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-medium">
                {importStatus}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setConfirmAction({
                      isOpen: true,
                      title: "Reset Current Session?",
                      message:
                        "Active matches and queue groups will be cleared, and all players will return to the waiting pool. Session history will be preserved.",
                      confirmText: "Reset Session",
                      variant: "warning",
                      action: () => {
                        resetSession();
                        onClose();
                      },
                    });
                  }}
                  className="text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs"
                >
                  Reset Current Session
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setConfirmAction({
                      isOpen: true,
                      title: "Clear All Data?",
                      message:
                        "WARNING: This will permanently delete ALL players, matches, queues, and session statistics. This action cannot be undone.",
                      confirmText: "Clear Everything",
                      variant: "danger",
                      action: () => {
                        clearAllData();
                        onClose();
                      },
                    });
                  }}
                  className="text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs"
                >
                  Clear All Data
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Help & Shortcuts */}
        {activeTab === "help" && (
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
                    <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">
                      N
                    </span>
                    <span className="text-slate-600 dark:text-zinc-300">
                      Open Add Player modal
                    </span>
                  </div>
                  <div className="grid grid-cols-2 p-2.5">
                    <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">
                      ?
                    </span>
                    <span className="text-slate-600 dark:text-zinc-300">
                      Open Settings &amp; Shortcuts
                    </span>
                  </div>
                  <div className="grid grid-cols-2 p-2.5">
                    <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">
                      Esc
                    </span>
                    <span className="text-slate-600 dark:text-zinc-300">
                      Close open modal / dialog
                    </span>
                  </div>
                  <div className="grid grid-cols-2 p-2.5">
                    <span className="font-mono font-bold text-slate-900 dark:text-zinc-100">
                      Enter
                    </span>
                    <span className="text-slate-600 dark:text-zinc-300">
                      Submit new player name
                    </span>
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
              PickleQueue v1.1.0 &bull; LocalStorage Prototype &bull; Zero
              Backend Needed
            </div>
          </div>
        )}
      </div>
    </Modal>

    {confirmAction && (
      <ConfirmAlert
        isOpen={confirmAction.isOpen}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          confirmAction.action();
          setConfirmAction(null);
        }}
        title={confirmAction.title}
        message={confirmAction.message}
        confirmText={confirmAction.confirmText}
        variant={confirmAction.variant}
      />
    )}
  </>
  );
};
