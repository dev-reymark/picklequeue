"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { usePickleballStore } from "@/store/pickleball-store";
import { getLeaderboard } from "@/lib/leaderboard";
import { SKILL_CONFIG } from "@/types";
import {
  Logo,
  ThemeToggle,
  Button,
  Card,
  Avatar,
  Badge,
} from "@/components/ui";
import {
  Trophy,
  Flame,
  Clock,
  QrCode,
  Share2,
  Check,
  ArrowLeft,
  ArrowUpRight,
  TrendingUp,
  Award,
  Zap,
  Swords,
} from "lucide-react";

export default function DedicatedPlayerProfilePage() {
  const params = useParams();
  const rawId = params?.id as string | undefined;

  const { players, games, settings } = usePickleballStore();
  const [copied, setCopied] = useState(false);

  const player = useMemo(() => {
    if (!rawId) return null;
    const decoded = decodeURIComponent(rawId).toLowerCase();
    return (
      players.find(
        (p) =>
          p.id.toLowerCase() === decoded ||
          p.name.toLowerCase() === decoded ||
          p.name.toLowerCase().replace(/\s+/g, "-") === decoded
      ) || null
    );
  }, [players, rawId]);

  const { entries } = useMemo(() => {
    return getLeaderboard(players, games, { sortBy: "wins" });
  }, [players, games]);

  const entry = useMemo(() => {
    if (!player) return null;
    return entries.find((e) => e.player.id === player.id) || null;
  }, [player, entries]);

  const playerGames = useMemo(() => {
    if (!player) return [];
    return games.filter(
      (g) => g.playerIds && g.playerIds.includes(player.id)
    );
  }, [games, player]);

  const wins = player?.wins ?? 0;
  const losses = player?.losses ?? 0;
  const totalCompleted = wins + losses;
  const winRate =
    totalCompleted > 0 ? Math.round((wins / totalCompleted) * 100) : 0;
  const streak = player?.streak ?? 0;
  const rank = entry?.rank;
  const pointDiff = entry?.pointDiff ?? 0;

  const handleShare = async () => {
    if (typeof window === "undefined" || !player) return;

    const venue = settings.venueName || "PickleQueue";
    const shareUrl = window.location.href;
    const rankText = rank
      ? rank === 1
        ? "🏆 #1 Champion"
        : rank <= 3
        ? `🎖️ Top 3 Podium (Rank #${rank})`
        : `Rank #${rank}`
      : "";
    const streakText = streak > 1 ? ` • 🔥 ${streak} Win Streak` : "";
    const shareText = `${rankText ? rankText + " " : ""}${player.name} at ${venue}!\n📊 ${wins}W - ${losses}L (${winRate}% Win Rate)${streakText}\nView verified player card:`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${player.name} - Player Profile`,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  if (!player) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col">
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/" className="hover:opacity-90 transition">
              <Logo />
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/leaderboard">
                <Button variant="secondary" size="sm">
                  View Leaderboard
                </Button>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-md mx-auto p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-400">
            <Award className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-lg font-black text-slate-900 dark:text-zinc-100">
              Player Not Found
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              This player profile may have been removed or does not exist on this facility&apos;s roster.
            </p>
          </div>
          <Link href="/leaderboard">
            <Button variant="primary" size="sm" startContent={<ArrowLeft className="w-4 h-4" />}>
              Return to Leaderboard
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  const skillConfig = SKILL_CONFIG[player.skillLevel];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 flex flex-col text-slate-900 dark:text-zinc-100">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 transition p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </Link>
            <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800" />
            <Link href="/" className="hover:opacity-90 transition">
              <Logo />
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleShare}
              className="border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              startContent={
                copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )
              }
            >
              <span className="hidden sm:inline">
                {copied ? "Copied Link!" : "Share Profile"}
              </span>
              <span className="sm:hidden">{copied ? "Copied" : "Share"}</span>
            </Button>

            <Link href="/join">
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
                startContent={<Swords className="w-3.5 h-3.5" />}
              >
                Join Queue
              </Button>
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xl">
          <div
            className={`h-36 sm:h-44 w-full relative overflow-hidden ${
              rank === 1
                ? "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600"
                : rank && rank <= 3
                ? "bg-gradient-to-r from-slate-600 via-slate-500 to-zinc-700"
                : "bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700"
            }`}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-black/30 pointer-events-none" />

            <div className="absolute top-4 left-4 sm:left-6 flex items-center gap-2">
              {rank === 1 && (
                <div className="flex items-center gap-1.5 text-slate-950 font-black text-xs bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-md border border-amber-300">
                  <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>#1 Session Champion</span>
                </div>
              )}
              {rank && rank > 1 && rank <= 3 && (
                <div className="flex items-center gap-1.5 text-white font-bold text-xs bg-black/40 backdrop-blur-md px-3 py-1 rounded-full shadow-md border border-white/20">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Victory Podium (Rank #{rank})</span>
                </div>
              )}
            </div>

            <div className="absolute top-4 right-4 flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-black/30 text-white backdrop-blur-md border border-white/20">
                {settings.venueName || "Venue"} Official Roster
              </span>
            </div>
          </div>

          <div className="px-6 pb-6 pt-0">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
                <div className="relative shrink-0">
                  <Avatar
                    name={player.name}
                    size="xl"
                    className="w-24 h-24 sm:w-28 sm:h-28 text-2xl border-4 border-white dark:border-zinc-900 shadow-xl ring-4 ring-slate-100 dark:ring-zinc-800"
                  />
                  {rank && (
                    <span
                      className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full font-black text-xs sm:text-sm flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-md ${
                        rank === 1
                          ? "bg-amber-400 text-slate-950"
                          : rank <= 3
                          ? "bg-slate-300 dark:bg-zinc-700 text-slate-900 dark:text-white"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      #{rank}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 pt-2 sm:pt-4">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-zinc-100">
                      {player.name}
                    </h1>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                        skillConfig?.bgBadge || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {skillConfig?.label}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        Joined{" "}
                        {new Date(player.createdAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </span>

                    {player.checkInMethod === "qr" && (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Verified QR Check-in</span>
                      </span>
                    )}

                    {streak > 1 && (
                      <Badge
                        variant="amber"
                        size="sm"
                        className="rounded-full font-mono gap-1"
                      >
                        <Flame className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{streak} Match Streak</span>
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleShare}
                  className="flex-1 sm:flex-initial"
                  startContent={
                    copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )
                  }
                >
                  {copied ? "Link Copied!" : "Share Player Card"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 text-center space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Matches Recorded
                </span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-zinc-100">
                  {player.gamesPlayed || playerGames.length}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block font-mono">
                  {wins}W &bull; {losses}L
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 text-center space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Win Rate
                </span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {winRate}%
                </div>
                <div className="w-full bg-slate-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full"
                    style={{ width: `${winRate}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 text-center space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">
                  Active Streak
                </span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
                  {streak > 1 && <Flame className="w-5 h-5 fill-amber-500" />}
                  <span>{streak}</span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                  {streak > 1 ? "Consecutive Wins" : "Standard"}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800 text-center space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-500">
                  Point Differential
                </span>
                <div
                  className={`text-2xl sm:text-3xl font-black font-mono ${
                    pointDiff > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : pointDiff < 0
                      ? "text-rose-500"
                      : "text-slate-600 dark:text-zinc-400"
                  }`}
                >
                  {pointDiff > 0 ? `+${pointDiff}` : pointDiff}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400 block">
                  Cumulative Points
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-zinc-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>Recent Match Breakdown</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              {playerGames.length} session games
            </span>
          </div>

          {playerGames.length === 0 ? (
            <Card className="p-8 text-center rounded-2xl border-slate-200 dark:border-zinc-800">
              <Zap className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                No Match History Recorded Yet
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                Completed matches for {player.name} will automatically display here with court logs and final scorelines.
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {playerGames.map((game) => (
                <Card
                  key={game.id}
                  className="p-4 rounded-2xl border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                          {game.courtName}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          &bull; {new Date(game.endedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <span className="text-slate-500 dark:text-zinc-400 text-[11px] block">
                        Duration: {game.durationMinutes} minutes &bull; Mode: {game.score?.scoringMode || "standard"}
                      </span>
                    </div>

                    {game.score && (
                      <div className="flex items-center gap-3">
                        <div className="font-mono font-bold text-sm px-3 py-1 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100">
                          {game.score.teamA} - {game.score.teamB}
                        </div>
                        {game.winner && (
                          <Badge
                            variant={game.winner === "A" ? "emerald" : "sky"}
                            size="sm"
                            className="rounded-full uppercase font-bold text-[10px]"
                          >
                            Team {game.winner} Won
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Card className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/20 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
            <Swords className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100">
              Want to Play at {settings.venueName || "PickleQueue"}?
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400">
              Join the open play queue, compete against players like {player.name}, and climb the live session leaderboard!
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/join">
              <Button
                variant="primary"
                size="md"
                className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20"
                startContent={<ArrowUpRight className="w-4 h-4" />}
              >
                Join Open Play Queue
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="secondary" size="md">
                View Full Standings
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
}
