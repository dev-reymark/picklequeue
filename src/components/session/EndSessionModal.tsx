import React, { useState } from "react";
import { usePickleballStore } from "@/store/pickleball-store";
import { useLockBodyScroll } from "@/hooks/use-lock-body-scroll";
import { formatDuration } from "@/lib/utils";
import { ConfirmAlert } from "@/components/ui";

interface EndSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EndSessionModal: React.FC<EndSessionModalProps> = ({
  isOpen,
  onClose,
}) => {
  useLockBodyScroll(isOpen);
  const [isConfirmFreshSessionOpen, setIsConfirmFreshSessionOpen] = useState(false);

  const {
    session,
    games,
    players,
    courts,
    settings,
    endCurrentSession,
    startNewSession,
    exportBackupJson,
  } = usePickleballStore();

  if (!isOpen) return null;

  const durationMs = (session.endedAt || Date.now()) - session.startedAt;
  const hours = Math.floor(durationMs / 3600000);
  const minutes = Math.floor((durationMs % 3600000) / 60000);
  const durationText = `${hours > 0 ? `${hours}h ` : ""}${minutes}m`;

  const handleExportBackup = () => {
    const json = exportBackupJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `picklequeue-session-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEndSession = () => {
    endCurrentSession();
    onClose();
  };

  const handleStartFreshSession = () => {
    setIsConfirmFreshSessionOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/75 backdrop-blur-xs p-4 overscroll-contain">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
              {session.venueName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {session.sessionName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 text-lg px-2 font-bold"
          >
            ✕
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-zinc-950 p-4 rounded-xl border border-slate-200 dark:border-zinc-800/80 text-center">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
              Duration
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-zinc-100 font-mono">
              {durationText}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
              Players
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-zinc-100 font-mono">
              {players.length}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
              Courts
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-zinc-100 font-mono">
              {courts.length}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block">
              Games
            </span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {games.length}
            </span>
          </div>
        </div>

        {/* Recent Completed Games */}
        <div>
          <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider block mb-2">
            Completed Games Log ({games.length})
          </span>
          <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
            {games.length === 0 ? (
              <div className="text-center py-4 text-slate-400 dark:text-zinc-500">
                No matches completed yet in this session.
              </div>
            ) : (
              games.map((g, idx) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800"
                >
                  <span className="font-medium text-slate-800 dark:text-zinc-200">
                    Match #{games.length - idx}: {g.courtName}
                  </span>
                  <span className="text-slate-500 dark:text-zinc-400 font-mono text-[11px]">
                    {g.durationMinutes} min
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={handleExportBackup}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 transition"
          >
            Download Backup JSON
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleStartFreshSession}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition shadow-xs"
            >
              Start Next Session
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <ConfirmAlert
        isOpen={isConfirmFreshSessionOpen}
        onClose={() => setIsConfirmFreshSessionOpen(false)}
        onConfirm={() => {
          startNewSession();
          onClose();
        }}
        variant="warning"
        title="Start Fresh Session?"
        confirmText="Start New Session"
        cancelText="Cancel"
        message={
          <div className="space-y-2 text-xs text-slate-600 dark:text-zinc-400">
            <p>
              Are you sure you want to end this session? All current matches, rotations, and queues will be archived to start fresh.
            </p>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-900/60 font-medium">
              Tip: You can download the session backup JSON first to keep match logs for your records.
            </p>
          </div>
        }
      />
    </div>
  );
};
