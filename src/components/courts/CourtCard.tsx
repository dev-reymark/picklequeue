import { playSound } from "@/lib/sound";
import React, { useState } from "react";
import { Court, Player } from "@/types";
import { usePickleballStore } from "@/store/pickleball-store";
import { GameTimer } from "./GameTimer";
import { PlayerBadge } from "../players/PlayerBadge";
import { EndGameModal } from "./EndGameModal";
import { Chip, Badge, Button, Select } from "@/components/ui";

interface CourtCardProps {
  court: Court;
}

export const CourtCard: React.FC<CourtCardProps> = ({ court }) => {
  const {
    players,
    queue,
    settings,
    assignNextQueueToCourt,
    assignGroupToCourt,
    addCourtTime,
  } = usePickleballStore();

  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  const isPlaying = court.status === "playing";

  // Retrieve players on this court
  const courtPlayers = court.playerIds
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean) as Player[];

  const teamAPlayers = (court.teamAIds || [])
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean) as Player[];

  const teamBPlayers = (court.teamBIds || [])
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean) as Player[];

  const displayTeamA =
    teamAPlayers.length > 0
      ? teamAPlayers
      : courtPlayers.slice(0, Math.ceil(courtPlayers.length / 2));
  const displayTeamB =
    teamBPlayers.length > 0
      ? teamBPlayers
      : courtPlayers.slice(Math.ceil(courtPlayers.length / 2));

  // Determine card style based on state
  let cardBorderClass =
    "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs";
  let chipVariant: "rose" | "amber" | "sky" | "emerald" = "emerald";
  let statusText = "Available";

  if (isPlaying) {
    const now = Date.now();
    const remainingMs = (court.endsAt || now) - now;
    if (remainingMs <= 0) {
      cardBorderClass =
        "border-rose-300 dark:border-rose-500/60 shadow-[0_0_20px_rgba(244,63,94,0.12)] bg-white dark:bg-zinc-900";
      chipVariant = "rose";
      statusText = "Overtime";
    } else if (remainingMs <= settings.warningTimeSeconds * 1000) {
      cardBorderClass =
        "border-amber-300 dark:border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.12)] bg-white dark:bg-zinc-900";
      chipVariant = "amber";
      statusText = "Ending Soon";
    } else {
      cardBorderClass =
        "border-sky-200 dark:border-sky-500/30 bg-white dark:bg-zinc-900 shadow-xs";
      chipVariant = "sky";
      statusText = "In Play";
    }
  } else {
    cardBorderClass =
      "border-emerald-200/80 dark:border-emerald-500/20 bg-white dark:bg-zinc-900 shadow-xs";
    chipVariant = "emerald";
    statusText = "Available";
  }

  const handleManualAssign = () => {
    if (!selectedGroupId) return;
    playSound.assignCourt();
    assignGroupToCourt(selectedGroupId, court.id);
    setSelectedGroupId("");
  };

  return (
    <>
      <div
        className={`relative flex flex-col justify-between rounded-xl border p-4 sm:p-5 transition-all duration-200 ${cardBorderClass}`}
      >
        {/* Court Header */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 tracking-wide">
              {court.name}
            </h3>
            {isPlaying && court.balance && (
              <Badge
                variant={
                  court.balance.status === "balanced"
                    ? "emerald"
                    : court.balance.status === "slightly-unbalanced"
                      ? "amber"
                      : "rose"
                }
                size="sm"
              >
                {court.balance.statusLabel}
              </Badge>
            )}
          </div>

          <Chip
            variant={chipVariant}
            size="sm"
            className="uppercase tracking-wider"
          >
            {statusText}
          </Chip>
        </div>

        {/* Court Body */}
        <div className="py-4 flex-1 flex flex-col justify-center">
          {isPlaying ? (
            <div className="space-y-4">
              {/* Central Timer */}
              <GameTimer
                startedAt={court.startedAt}
                endsAt={court.endsAt}
                durationMinutes={
                  court.durationMinutes || settings.defaultGameDuration
                }
                warningSeconds={settings.warningTimeSeconds}
                soundEnabled={settings.soundEnabled}
                timerDirection={settings.timerDirection}
              />

              {/* Matchup: Team A vs Team B */}
              <div className="bg-slate-50 dark:bg-zinc-950/60 rounded-lg p-3 border border-slate-200 dark:border-zinc-800/80">
                <div className="grid grid-cols-2 gap-3 divide-x divide-slate-200 dark:divide-zinc-800">
                  {/* Team A */}
                  <div className="pr-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      <span>Team A</span>
                      {court.balance && (
                        <span className="text-slate-600 dark:text-zinc-400 font-mono">
                          Rating: {court.balance.teamARating}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {displayTeamA.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between text-xs text-slate-800 dark:text-zinc-200"
                        >
                          <span className="truncate pr-1 font-medium">
                            {p.name}
                          </span>
                          <PlayerBadge skillLevel={p.skillLevel} compact />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Team B */}
                  <div className="pl-3">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5">
                      <span>Team B</span>
                      {court.balance && (
                        <span className="text-slate-600 dark:text-zinc-400 font-mono">
                          Rating: {court.balance.teamBRating}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {displayTeamB.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between text-xs text-slate-800 dark:text-zinc-200"
                        >
                          <span className="truncate pr-1 font-medium">
                            {p.name}
                          </span>
                          <PlayerBadge skillLevel={p.skillLevel} compact />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Available State */
            <div className="text-center py-6 px-3">
              <p className="text-sm text-slate-600 dark:text-zinc-400 font-medium mb-1">
                Court is Ready
              </p>
              <p className="text-xs text-slate-400 dark:text-zinc-400">
                No active match assigned
              </p>

              {/* Quick queue peek */}
              {queue.length > 0 && (
                <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800/80 text-left">
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium uppercase tracking-wider mb-1">
                    Next in Queue: Group #1
                  </div>
                  <div className="text-xs text-slate-800 dark:text-zinc-200 truncate">
                    {queue[0].playerIds
                      .map((id) => players.find((p) => p.id === id)?.name)
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Court Footer Controls */}
        <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80">
          {isPlaying ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    playSound.timeAdded();
                    addCourtTime(court.id, 2);
                  }}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 dark:border-zinc-700 transition"
                  title="Add 2 minutes"
                >
                  +2m
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSound.timeAdded();
                    addCourtTime(court.id, 5);
                  }}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 dark:border-zinc-700 transition"
                  title="Add 5 minutes"
                >
                  +5m
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  playSound.click();
                  setIsEndModalOpen(true);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition shadow-xs"
              >
                End Game
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  playSound.assignCourt();
                  assignNextQueueToCourt(court.id);
                }}
                disabled={queue.length === 0}
                className={`w-full py-2 px-3 text-xs font-semibold rounded-lg transition tracking-wide ${
                  queue.length > 0
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-zinc-800/70 text-slate-400 dark:text-zinc-400 cursor-not-allowed border border-slate-200 dark:border-zinc-800"
                }`}
              >
                {queue.length > 0 ? "Start Next Group" : "Queue Empty"}
              </button>

              {queue.length > 1 && (
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    size="sm"
                    containerClassName="flex-1 min-w-0"
                    options={[
                      { value: "", label: "Or select specific group..." },
                      ...queue.map((g, idx) => ({
                        value: g.id,
                        label: `Group #${idx + 1} (${g.playerIds
                          .map((id) => players.find((p) => p.id === id)?.name)
                          .filter(Boolean)
                          .slice(0, 2)
                          .join(", ")}...)`,
                      })),
                    ]}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleManualAssign}
                    disabled={!selectedGroupId}
                    className="shrink-0 text-xs"
                  >
                    Assign
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* End Game Modal */}
      {isEndModalOpen && (
        <EndGameModal court={court} onClose={() => setIsEndModalOpen(false)} />
      )}
    </>
  );
};
