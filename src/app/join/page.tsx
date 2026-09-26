"use client";

import React, { useState, useEffect } from "react";
import { usePickleballStore } from "@/store/pickleball-store";
import { useAuthStore } from "@/store/auth-store";
import { useTabSync } from "@/hooks/use-tab-sync";
import { SkillLevel, SKILL_CONFIG } from "@/types";
import { Logo, ThemeToggle } from "@/components/ui";
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  Coffee,
  Flame,
  Volume2,
  VolumeX,
  Trophy,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

export default function PlayerJoinPage() {
  useTabSync();
  const {
    players,
    courts,
    queue,
    settings,
    joinQueueDirect,
    setPlayerStatus,
    deletePlayer,
  } = usePickleballStore();
  const { currentUser, isAuthenticated, isHydrated } = useAuthStore();

  const [hasMounted, setHasMounted] = useState(false);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("low-intermediate");
  const [phone, setPhone] = useState("");
  const [autoQueue, setAutoQueue] = useState(true);
  const [notes, setNotes] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    setHasMounted(true);
    const savedId = localStorage.getItem("picklequeue_player_id");
    if (savedId) {
      setCurrentPlayerId(savedId);
    }

    if (currentUser?.role === "player") {
      setName(currentUser.name);
      if (currentUser.skillLevel) {
        setSkillLevel(currentUser.skillLevel);
      }
    }
  }, [currentUser]);

  const currentPlayer = players.find((p) => p.id === currentPlayerId);

  useEffect(() => {
    if (
      currentPlayer?.status === "playing" &&
      soundEnabled &&
      typeof window !== "undefined"
    ) {
      try {
        const ctx = new (
          window.AudioContext || (window as any).webkitAudioContext
        )();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } catch {}
    }
  }, [currentPlayer?.status, soundEnabled]);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const { player } = joinQueueDirect({
      name: name.trim(),
      skillLevel,
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
      autoQueue,
    });

    setCurrentPlayerId(player.id);
    localStorage.setItem("picklequeue_player_id", player.id);
  };

  const handleLeave = () => {
    if (currentPlayerId) {
      deletePlayer(currentPlayerId);
      localStorage.removeItem("picklequeue_player_id");
      setCurrentPlayerId(null);
      setName("");
    }
  };

  const handleToggleBreak = () => {
    if (!currentPlayer) return;
    if (currentPlayer.status === "resting") {
      setPlayerStatus(currentPlayer.id, "waiting");
    } else {
      setPlayerStatus(currentPlayer.id, "resting");
    }
  };

  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Connecting to Court Queue...</span>
        </div>
      </div>
    );
  }

  const currentCourt = courts.find((c) =>
    c.playerIds.includes(currentPlayerId || ""),
  );

  let queuePosition = -1;
  let estimatedWaitMinutes = 0;
  if (currentPlayer?.status === "queued") {
    const groupIdx = queue.findIndex((q) =>
      q.playerIds.includes(currentPlayerId || ""),
    );
    if (groupIdx !== -1) {
      queuePosition = groupIdx + 1;
      const activeCourtCount = Math.max(
        1,
        courts.filter((c) => c.status === "playing").length,
      );
      estimatedWaitMinutes = Math.round(
        (queuePosition * (settings.defaultGameDuration || 15)) /
          activeCourtCount,
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col justify-between">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo className="w-7 h-7" />
            <div>
              <h1 className="text-sm font-black tracking-wide text-slate-900 dark:text-zinc-100">
                {settings.venueName || "PICKLEQUEUE"}
              </h1>
              <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Player Self Check-in
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled((prev) => !prev)}
              title="Toggle Alert Sounds"
              className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* If Player is checked in: Show Live Pass */}
        {currentPlayer ? (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Status Alert Card */}
            {currentPlayer.status === "playing" ? (
              <div className="bg-emerald-600 text-white rounded-3xl p-6 shadow-xl border-4 border-emerald-400 animate-pulse text-center space-y-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto">
                  <Flame className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span className="text-xs font-bold tracking-widest uppercase bg-white/30 px-3 py-1 rounded-full">
                    Court Ready!
                  </span>
                  <h2 className="text-2xl font-black mt-2">
                    {currentCourt ? currentCourt.name : "Report to Court"}
                  </h2>
                  <p className="text-xs text-emerald-100 mt-1">
                    Your match is live! Grab your paddle and head onto the court
                    now.
                  </p>
                </div>
              </div>
            ) : currentPlayer.status === "queued" ? (
              <div className="bg-gradient-to-br from-indigo-600 to-sky-600 text-white rounded-3xl p-6 shadow-lg text-center space-y-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xs font-bold tracking-widest uppercase bg-white/30 px-3 py-1 rounded-full">
                    In Queue &bull; Position #{queuePosition}
                  </span>
                  <h2 className="text-3xl font-black mt-2">
                    ~{estimatedWaitMinutes} mins
                  </h2>
                  <p className="text-xs text-indigo-100 mt-1">
                    Estimated wait time until your court assignment.
                  </p>
                </div>
              </div>
            ) : currentPlayer.status === "resting" ? (
              <div className="bg-amber-500 text-white rounded-3xl p-6 shadow-lg text-center space-y-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mx-auto">
                  <Coffee className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xs font-bold tracking-widest uppercase bg-white/30 px-3 py-1 rounded-full">
                    Taking a Break
                  </span>
                  <h2 className="text-xl font-black mt-2">Resting</h2>
                  <p className="text-xs text-amber-100 mt-1">
                    You won&apos;t be placed into match rotations until you
                    click &quot;Ready to Play&quot;.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 dark:bg-zinc-800 text-white rounded-3xl p-6 shadow-lg text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold tracking-widest uppercase bg-slate-800 px-3 py-1 rounded-full text-emerald-400 border border-emerald-500/30">
                    Checked In &bull; Waiting Pool
                  </span>
                  <h2 className="text-xl font-black mt-2">
                    Ready for Rotation
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    The court director will balance and assign you to an
                    upcoming queue group.
                  </p>
                </div>
              </div>
            )}

            {/* Digital Player Pass Card */}
            <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-sm">
                    {currentPlayer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                      {currentPlayer.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Matches played: {currentPlayer.gamesPlayed || 0}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                    SKILL_CONFIG[currentPlayer.skillLevel]?.bgBadge ||
                    "bg-slate-100 text-slate-700"
                  }`}
                >
                  {SKILL_CONFIG[currentPlayer.skillLevel]?.label}
                </span>
              </div>

              {/* Status details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/60 dark:border-zinc-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Active Courts
                  </span>
                  <span className="text-base font-bold text-slate-900 dark:text-zinc-100 font-mono">
                    {courts.filter((c) => c.status === "playing").length} /{" "}
                    {courts.length}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/60 dark:border-zinc-800">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">
                    Groups in Queue
                  </span>
                  <span className="text-base font-bold text-slate-900 dark:text-zinc-100 font-mono">
                    {queue.length}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/player"
                  className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>View My Stats &amp; Match History</span>
                </Link>

                <button
                  type="button"
                  onClick={handleToggleBreak}
                  className={`w-full py-2.5 px-4 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer ${
                    currentPlayer.status === "resting"
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                      : "bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300"
                  }`}
                >
                  <Coffee className="w-4 h-4" />
                  <span>
                    {currentPlayer.status === "resting"
                      ? "Ready to Play Again"
                      : "Take a 10-Min Break"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleLeave}
                  className="w-full py-2 px-4 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Leave Queue / Check Out</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
            {isHydrated && isAuthenticated && currentUser?.role === "player" ? (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-emerald-900 dark:text-emerald-200">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block">
                      Player Account Verified
                    </span>
                  </div>
                </div>
                <Link
                  href="/login"
                  className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Switch
                </Link>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/80 dark:border-zinc-700 flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-zinc-400">
                  Have a player account?
                </span>
                <Link
                  href="/login?role=player&redirect=/join"
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                Join the Pickleball Queue
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Enter your details to check in. You will receive real-time queue
                position updates on this screen.
              </p>
            </div>

            <form onSubmit={handleJoinSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Your Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Smith"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-sm focus:outline-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Skill Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      "beginner",
                      "low-intermediate",
                      "high-intermediate",
                      "advanced",
                    ] as SkillLevel[]
                  ).map((level) => {
                    const cfg = SKILL_CONFIG[level];
                    const isSelected = skillLevel === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setSkillLevel(level)}
                        className={`p-2.5 text-left rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 shadow-2xs"
                            : "border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-700 dark:text-zinc-300 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{cfg.label}</span>
                          <span
                            className={`w-2 h-2 rounded-full ${cfg.colorDot}`}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
                          Rating {cfg.rating}.0
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Mobile Phone (Optional)
                  </label>
                  <span className="text-[10px] text-slate-400">
                    For SMS court alerts
                  </span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. (555) 123-4567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-sm focus:outline-emerald-500"
                />
              </div>

              {/* Direct Queue Join Option */}
              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoQueue}
                  onChange={(e) => setAutoQueue(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 dark:text-zinc-200 block">
                    Join Queue Automatically
                  </span>
                  <span className="text-slate-500 dark:text-zinc-400 text-[11px]">
                    Auto-matches you with upcoming 2v2 rotation groups
                  </span>
                </div>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Check In to Queue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Live Venue Status Snapshot */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-zinc-300">
            <span>Facility Courts Live</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {courts.filter((c) => c.status === "playing").length} Courts
              Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {courts.slice(0, 4).map((c) => (
              <div
                key={c.id}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800 dark:text-zinc-200 truncate">
                    {c.name}
                  </span>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      c.status === "playing"
                        ? "bg-sky-500 animate-pulse"
                        : "bg-emerald-500"
                    }`}
                  />
                </div>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {c.status === "playing" ? "Match in progress" : "Available"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-400 dark:text-zinc-500 border-t border-slate-200 dark:border-zinc-800">
        <span>PICKLEQUEUE &bull; Player Mobile Self-Service</span>
      </footer>
    </div>
  );
}
