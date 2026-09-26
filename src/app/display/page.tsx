"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { usePickleballStore } from "@/store/pickleball-store";
import { useTabSync } from "@/hooks/use-tab-sync";
import { useGameTimer } from "@/hooks/use-game-timer";
import { Logo } from "@/components/ui";
import { Maximize, Minimize, Users, Trophy, Radio } from "lucide-react";
import Link from "next/link";

function DisplayCourtCard({ court }: { court: any }) {
  const { players, activeGames } = usePickleballStore();

  const isPlaying = court.status === "playing";
  const game = court.currentGameId ? activeGames[court.currentGameId] : null;

  const timer = useGameTimer({
    endsAt: isPlaying ? court.endsAt : undefined,
    startedAt: isPlaying ? court.startedAt : undefined,
    durationMinutes: court.durationMinutes || 15,
  });

  const getPlayerNames = (ids?: string[]) => {
    if (!ids || ids.length === 0) return [];
    return ids.map((id) => players.find((p) => p.id === id)?.name || "Player");
  };

  const teamANames = getPlayerNames(
    court.teamAIds || court.playerIds?.slice(0, 2),
  );
  const teamBNames = getPlayerNames(
    court.teamBIds || court.playerIds?.slice(2, 4),
  );

  return (
    <div
      className={`rounded-3xl border-2 transition-all p-5 sm:p-6 flex flex-col justify-between shadow-lg relative overflow-hidden ${
        isPlaying
          ? timer.isEndingSoon
            ? "bg-amber-950/20 border-amber-500/80 shadow-amber-500/10"
            : timer.isOvertime
              ? "bg-rose-950/20 border-rose-500/80 shadow-rose-500/10 animate-pulse"
              : "bg-zinc-900/90 border-sky-500/40 shadow-sky-500/5"
          : "bg-zinc-900/60 border-zinc-800"
      }`}
    >
      {/* Top Bar: Court Name & Status Pill */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            {court.name}
          </h3>
          <span className="text-[11px] font-semibold text-zinc-400">
            {isPlaying ? "Match in Rotation" : "Court Available"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isPlaying ? (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                timer.isOvertime
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                  : timer.isEndingSoon
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    : "bg-sky-500/20 text-sky-400 border border-sky-500/40"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-ping" />
              <span>
                {timer.isOvertime
                  ? "Overtime"
                  : timer.isEndingSoon
                    ? "Ending Soon"
                    : "Live"}
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Available</span>
            </span>
          )}
        </div>
      </div>

      {/* Middle: Timer & Score Display */}
      {isPlaying ? (
        <div className="py-4 sm:py-6 flex items-center justify-between gap-4">
          {/* Big Digital Countdown */}
          <div className="flex flex-col">
            <span className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">
              Time Remaining
            </span>
            <span
              className={`text-4xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight ${
                timer.isOvertime
                  ? "text-rose-400"
                  : timer.isEndingSoon
                    ? "text-amber-400"
                    : "text-white"
              }`}
            >
              {timer.formattedTime}
            </span>
          </div>

          {/* Live Score if Active */}
          {game?.score && (
            <div className="flex flex-col items-end">
              <span className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider">
                Live Score
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-black font-mono text-sky-400">
                  {game.score.teamA}
                </span>
                <span className="text-xl font-bold text-zinc-600">-</span>
                <span className="text-3xl sm:text-4xl font-black font-mono text-purple-400">
                  {game.score.teamB}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
          <span className="text-sm font-semibold text-zinc-400">
            Ready for Next Queue Group
          </span>
        </div>
      )}

      {/* Bottom: Team Rosters */}
      {isPlaying && (
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-800/80">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
              Team 1
            </span>
            <div className="space-y-0.5">
              {teamANames.map((name, i) => (
                <span
                  key={i}
                  className="text-xs sm:text-sm font-semibold text-zinc-200 block truncate"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1 text-right">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
              Team 2
            </span>
            <div className="space-y-0.5">
              {teamBNames.map((name, i) => (
                <span
                  key={i}
                  className="text-xs sm:text-sm font-semibold text-zinc-200 block truncate"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SpectatorDisplayPage() {
  useTabSync();
  const { courts, queue, players, settings } = usePickleballStore();

  const [currentTime, setCurrentTime] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const joinUrl = `${window.location.origin}/join`;
      QRCode.toDataURL(joinUrl, {
        width: 200,
        margin: 1,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      }).then((url) => setQrDataUrl(url));
    }
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const activeCourtsCount = courts.filter((c) => c.status === "playing").length;
  const waitingCount = players.filter(
    (p) => p.status === "waiting" || (p.status as any) === "available",
  ).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Header Bar for TV Display */}
      <header className="bg-zinc-900/90 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo className="w-9 h-9" />
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wider uppercase">
              {settings.venueName || "PICKLEQUEUE FACILITY"}
            </h1>
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Court Rotation &amp; Queue Board</span>
            </p>
          </div>
        </div>

        {/* Real-time stats & clock */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-2 bg-zinc-800/80 px-3.5 py-2 rounded-xl border border-zinc-700">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span className="text-zinc-400">Active Courts:</span>
              <span className="text-white font-mono font-bold text-sm">
                {activeCourtsCount} / {courts.length}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-zinc-800/80 px-3.5 py-2 rounded-xl border border-zinc-700">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span className="text-zinc-400">Queued Groups:</span>
              <span className="text-white font-mono font-bold text-sm">
                {queue.length}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-zinc-800/80 px-3.5 py-2 rounded-xl border border-zinc-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-zinc-400">Waiting Players:</span>
              <span className="text-white font-mono font-bold text-sm">
                {waitingCount}
              </span>
            </div>
          </div>

          {/* Clock */}
          <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 tracking-tight">
            {currentTime}
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-2">
            <Link
              href="/leaderboard"
              className="text-xs px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold transition border border-amber-500/40 flex items-center gap-1.5"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Leaderboard</span>
            </Link>
            <button
              type="button"
              onClick={toggleFullscreen}
              title="Toggle Fullscreen"
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
            <Link
              href="/console"
              className="text-xs px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold transition"
            >
              Exit Display
            </Link>
          </div>
        </div>
      </header>

      {/* Main Split Body: Courts Grid (Left) + Queue / QR Panel (Right) */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start overflow-hidden">
        {/* Courts Grid Section (8 Cols) */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {courts.map((court) => (
              <DisplayCourtCard key={court.id} court={court} />
            ))}
          </div>
        </div>

        {/* Right Sidebar: Up Next Queue & On-Screen QR Code (4 Cols) */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          {/* Upcoming Queue Groups */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
                <h3 className="text-base font-bold text-white tracking-wide uppercase">
                  Up Next In Queue
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-lg border border-purple-500/20">
                {queue.length} Total
              </span>
            </div>

            {queue.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500 space-y-1">
                <p className="font-semibold text-zinc-400">
                  Queue is currently clear
                </p>
                <p>Scan the QR code below to be the first in line!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {queue.slice(0, 5).map((q, idx) => {
                  const qPlayerNames = q.playerIds
                    .map((pid) => players.find((p) => p.id === pid)?.name)
                    .filter(Boolean);

                  return (
                    <div
                      key={q.id}
                      className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                          Position #{idx + 1}
                        </span>
                        <span className="text-[11px] text-zinc-400 font-mono">
                          ~
                          {Math.round(
                            ((idx + 1) * (settings.defaultGameDuration || 15)) /
                              Math.max(1, activeCourtsCount),
                          )}
                          m wait
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-1 text-xs font-medium text-zinc-200">
                        {qPlayerNames.map((name, i) => (
                          <span key={i} className="truncate">
                            &bull; {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* On-Screen QR Code Box */}
          <div className="bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-zinc-900 border border-emerald-500/30 rounded-3xl p-5 shadow-lg flex flex-col items-center text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Scan with your Phone
            </span>
            <h4 className="text-base font-black text-white">
              Join the Player Queue
            </h4>

            <div className="p-3 bg-white rounded-2xl shadow-md border-2 border-slate-900">
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt="Scan to join queue"
                  className="w-40 h-40 object-contain"
                />
              ) : null}
            </div>

            <p className="text-[11px] text-zinc-400 max-w-xs leading-relaxed">
              Scan with camera to check in, track queue position, and receive
              your court assignment!
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Announcement Marquee Ticker */}
      <footer className="bg-zinc-900/90 border-t border-zinc-800 px-6 py-2.5 flex items-center gap-4 text-xs overflow-hidden">
        <div className="flex items-center gap-2 shrink-0 bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider text-[11px] border border-emerald-500/30">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Notice</span>
        </div>

        <div className="relative overflow-hidden whitespace-nowrap flex-1">
          <div className="inline-block animate-marquee font-medium text-zinc-300">
            {settings.marqueeMessage ||
              "Welcome to Smash Point Pickleball • Games are 15 minutes • Please check your assigned court when called • Respect court rotation rules & good luck!"}
          </div>
        </div>
      </footer>
    </div>
  );
}
