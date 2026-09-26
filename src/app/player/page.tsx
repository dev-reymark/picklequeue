"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { usePickleballStore } from "@/store/pickleball-store";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { computePlayerStats } from "@/lib/leaderboard";
import { SkillLevel, SKILL_CONFIG, Player } from "@/types";
import {
  Logo,
  ThemeToggle,
  Button,
  Card,
  Badge,
  Avatar,
  Select,
} from "@/components/ui";
import {
  Trophy,
  Flame,
  Users,
  Coffee,
  ChevronRight,
  Medal,
  Activity,
  Percent,
  Play,
  ArrowUpRight,
} from "lucide-react";

export default function PlayerDashboardPage() {
  return (
    <AuthGuard requiredRole="player">
      <PlayerDashboardContent />
    </AuthGuard>
  );
}

function PlayerDashboardContent() {
  const { currentUser, logout, users } = useAuthStore();
  const {
    players,
    courts,
    queue,
    games,
    settings,
    addPlayer,
    createQueueGroup,
    removeQueueGroup,
    joinQueueDirect,
    setPlayerStatus,
    editPlayer,
  } = usePickleballStore();

  const existingPlayer = useMemo(() => {
    if (!currentUser) return null;
    return (
      players.find(
        (p) =>
          p.name.trim().toLowerCase() === currentUser.name.trim().toLowerCase(),
      ) || null
    );
  }, [players, currentUser]);

  const activePlayer: Player = useMemo(() => {
    if (existingPlayer) return existingPlayer;
    return {
      id: currentUser?.id || "player-virtual",
      name: currentUser?.name || "Player",
      skillLevel: currentUser?.skillLevel || "low-intermediate",
      status: "waiting",
      createdAt: currentUser?.createdAt || Date.now(),
      gamesPlayed: 0,
      wins: 0,
      losses: 0,
      streak: 0,
      pointsScored: 0,
      pointsConceded: 0,
    };
  }, [existingPlayer, currentUser]);

  const stats = useMemo(() => {
    return computePlayerStats(activePlayer, games);
  }, [activePlayer, games]);

  const playerGames = useMemo(() => {
    return games
      .filter((g) => g.playerIds && g.playerIds.includes(activePlayer.id))
      .sort((a, b) => b.endedAt - a.endedAt);
  }, [games, activePlayer.id]);

  const queueIndex = queue.findIndex((q) =>
    q.playerIds.includes(activePlayer.id),
  );
  const queuePosition = queueIndex !== -1 ? queueIndex + 1 : null;
  const isQueued = queuePosition !== null;

  const currentCourt = courts.find(
    (c) => c.status === "playing" && c.playerIds?.includes(activePlayer.id),
  );

  const isResting = existingPlayer?.status === "resting";
  const isWaiting =
    !isQueued &&
    !currentCourt &&
    !isResting &&
    (existingPlayer !== null || activePlayer.status === "waiting");

  const activeCourtCount = Math.max(
    1,
    courts.filter((c) => c.status === "playing").length,
  );
  const estimatedWaitMinutes = queuePosition
    ? Math.round(
        (queuePosition * (settings.defaultGameDuration || 15)) /
          activeCourtCount,
      )
    : 15;

  const getPlayerName = (id: string) =>
    players.find((p) => p.id === id)?.name || id;

  const [selectedSkill, setSelectedSkill] = useState<SkillLevel>(
    activePlayer.skillLevel,
  );

  const handleUpdateSkill = (newSkill: SkillLevel) => {
    setSelectedSkill(newSkill);
    if (existingPlayer) {
      editPlayer(existingPlayer.id, { skillLevel: newSkill });
    }
  };

  const handleJoinQueue = () => {
    let playerObj = existingPlayer;
    if (!playerObj) {
      playerObj = addPlayer(activePlayer.name, selectedSkill);
    } else if (playerObj.status === 'resting') {
      setPlayerStatus(playerObj.id, 'waiting');
    }

    const alreadyInQueue = queue.some((q) => q.playerIds.includes(playerObj!.id));
    if (alreadyInQueue) return;

    const targetSize = settings.playersPerGroup || 4;
    const needed = targetSize - 1;

    const availablePlayers = players.filter(
      (p) =>
        p.id !== playerObj!.id &&
        p.status !== 'playing' &&
        !queue.some((q) => q.playerIds.includes(p.id))
    );

    if (availablePlayers.length >= needed) {
      const matchPartners = availablePlayers.slice(0, needed).map((p) => p.id);
      createQueueGroup([playerObj.id, ...matchPartners]);
    } else if (availablePlayers.length >= 1) {
      createQueueGroup([playerObj.id, availablePlayers[0].id]);
    } else {
      setPlayerStatus(playerObj.id, 'waiting');
    }
  };

  const handleLeaveQueue = () => {
    if (!existingPlayer) return;
    const group = queue.find((q) => q.playerIds.includes(existingPlayer.id));
    if (group) {
      removeQueueGroup(group.id);
    }
    setPlayerStatus(existingPlayer.id, 'waiting');
  };

  const handleToggleBreak = () => {
    if (!existingPlayer) return;
    if (existingPlayer.status === "resting") {
      setPlayerStatus(existingPlayer.id, "waiting");
    } else {
      const group = queue.find((q) => q.playerIds.includes(existingPlayer.id));
      if (group) {
        removeQueueGroup(group.id);
      }
      setPlayerStatus(existingPlayer.id, "resting");
    }
  };

  const skillOptions = [
    { value: "beginner", label: "Beginner (1.0 - 2.5)" },
    { value: "low-intermediate", label: "Low Intermediate (3.0)" },
    { value: "high-intermediate", label: "High Intermediate (3.5)" },
    { value: "advanced", label: "Advanced (4.0+)" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo className="w-8 h-8 group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <span className="text-base font-black tracking-wider text-slate-900 dark:text-zinc-100 uppercase leading-none">
                PICKLEQUEUE
              </span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest leading-none mt-1">
                Player Portal
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/leaderboard"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:text-emerald-600 transition"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Leaderboard</span>
            </Link>

            <Link
              href="/join"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-zinc-300 hover:text-emerald-600 transition"
            >
              <Users className="w-3.5 h-3.5 text-sky-500" />
              <span>Live Queue</span>
            </Link>

            <ThemeToggle />

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-zinc-800">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                {currentUser?.name.charAt(0)}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-xs text-slate-500 hover:text-rose-600"
                endContent={<ArrowUpRight className="w-3.5 h-3.5" />}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          <Card className="lg:col-span-2 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm flex flex-col justify-between space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar
                    name={activePlayer.name}
                    size="xl"
                    className="shadow-md ring-2 ring-emerald-500/20"
                  />
                  <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      {activePlayer.name}
                    </h1>
                    <Badge
                      variant="emerald"
                      size="sm"
                      className="uppercase font-mono text-[10px]"
                    >
                      Verified Player
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    {currentUser?.email || "player@picklequeue.com"}
                  </p>
                </div>
              </div>

              <div className="inline-flex sm:flex-col items-start sm:items-end gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  Current Status
                </span>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border ${
                    currentCourt
                      ? "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30"
                      : isQueued
                        ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30"
                        : isResting
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                          : isWaiting
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                            : "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30"
                  }`}
                >
                  {currentCourt
                    ? `Playing on ${currentCourt.name}`
                    : isQueued
                      ? `Queued (#${queuePosition})`
                      : isResting
                        ? "Resting"
                        : isWaiting
                          ? "Waiting Pool"
                          : "Available"}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 block">
                  Skill Level Rating
                </span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold border ${
                      SKILL_CONFIG[selectedSkill]?.bgBadge ||
                      "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {SKILL_CONFIG[selectedSkill]?.label}
                  </span>
                  <span className="text-xs text-slate-400">
                    Auto-matches with compatible queue tiers
                  </span>
                </div>
              </div>

              <div className="w-56">
                <Select
                  size="sm"
                  value={selectedSkill}
                  onValueChange={(val) =>
                    handleUpdateSkill(val as SkillLevel)
                  }
                  options={skillOptions}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent flex flex-col justify-between space-y-4 shadow-sm">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <Activity className="w-3.5 h-3.5" />
                <span>Court Queue Status</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100">
                {currentCourt
                  ? "Match In Progress"
                  : isQueued
                    ? `In Queue • Position #${queuePosition}`
                    : isResting
                      ? "Taking a Break"
                      : isWaiting
                        ? "Checked In • Waiting Pool"
                        : "Ready to Play?"}
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                {currentCourt
                  ? `You are playing on ${currentCourt.name}. Play fair and give it your all!`
                  : isQueued
                    ? `Your queue position is #${queuePosition}. Estimated wait: ~${estimatedWaitMinutes} mins. Keep an eye out for court callout!`
                    : isResting
                      ? "You are currently resting. Click below when you are ready to jump back into match rotation."
                      : isWaiting
                        ? "You are checked into the facility rotation. A match group will form as soon as courts rotate, or click below to join the active queue now."
                        : "Check into the automated venue queue to be scheduled for the next available rotation."}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {currentCourt ? (
                <Link href="/join" className="block">
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    className="shadow-md shadow-emerald-600/25"
                  >
                    View Live Scoreboard
                  </Button>
                </Link>
              ) : isQueued ? (
                <div className="space-y-2">
                  <Link href="/join" className="block">
                    <Button
                      variant="primary"
                      size="md"
                      fullWidth
                      className="shadow-md shadow-emerald-600/25"
                    >
                      Open Mobile Live Pass
                    </Button>
                  </Link>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleToggleBreak}
                      className="text-xs"
                      startContent={
                        <Coffee className="w-3.5 h-3.5 text-amber-500" />
                      }
                    >
                      Take a Break
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLeaveQueue}
                      className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      Leave Queue
                    </Button>
                  </div>
                </div>
              ) : isResting ? (
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={handleToggleBreak}
                  className="shadow-md shadow-emerald-600/25"
                  startContent={<Play className="w-4 h-4 fill-white" />}
                >
                  I&apos;m Ready to Play
                </Button>
              ) : isWaiting ? (
                <div className="space-y-2">
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    onClick={handleJoinQueue}
                    className="shadow-md shadow-emerald-600/25"
                    startContent={<Play className="w-4 h-4 fill-white" />}
                  >
                    Join Active Court Queue Now
                  </Button>
                  <Link href="/join" className="block">
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      className="text-xs"
                    >
                      Open Mobile Live Pass
                    </Button>
                  </Link>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={handleJoinQueue}
                  className="shadow-md shadow-emerald-600/25"
                  startContent={<Play className="w-4 h-4 fill-white" />}
                >
                  Join Facility Queue
                </Button>
              )}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Win Rate
              </span>
              <Percent className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                {stats.winRate}%
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.winRate}%` }}
              />
            </div>
          </Card>

          <Card className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Match Record
              </span>
              <Trophy className="w-4 h-4 text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                {stats.wins}W
              </span>
              <span className="text-xl font-bold font-mono text-slate-400">
                -
              </span>
              <span className="text-3xl font-black font-mono text-rose-500">
                {stats.losses}L
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Total {stats.matchesPlayed} matches played
            </p>
          </Card>

          <Card className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Win Streak
              </span>
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
                {stats.streak}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                in a row
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {stats.streak >= 3
                ? "🔥 On a hot winning streak!"
                : "Consistency builder"}
            </p>
          </Card>

          <Card className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                Point Differential
              </span>
              <Medal className="w-4 h-4 text-sky-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span
                className={`text-3xl font-black font-mono ${
                  stats.pointDiff > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : stats.pointDiff < 0
                      ? "text-rose-500"
                      : "text-slate-900 dark:text-white"
                }`}
              >
                {stats.pointDiff > 0 ? `+${stats.pointDiff}` : stats.pointDiff}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              {stats.pointsScored} pts scored &bull; {stats.pointsConceded}{" "}
              allowed
            </p>
          </Card>
        </div>

        <Card className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Match History &amp; Game Logs
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Verified historical games, partner rotations, and final match
                scores
              </p>
            </div>

            <Link href="/leaderboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs"
                endContent={<ChevronRight className="w-3.5 h-3.5" />}
              >
                View Full Leaderboard
              </Button>
            </Link>
          </div>

          {playerGames.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-slate-400">
                <Trophy className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-200">
                {isQueued
                  ? `Currently Queued (Position #${queuePosition})`
                  : "No recorded games yet"}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {isQueued
                  ? "You are scheduled for the next match rotation. Once completed, your scores and verified partner stats will appear here automatically."
                  : "Once you complete your first match on court, your detailed score history and partner rankings will appear here automatically."}
              </p>
              {isQueued ? (
                <Link href="/join" className="inline-block mt-2">
                  <Button variant="primary" size="sm" className="shadow-sm">
                    Open Mobile Live Pass
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleJoinQueue}
                  className="mt-2 shadow-sm"
                >
                  Join Queue to Play
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-zinc-950/60 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider border-b border-slate-200/60 dark:border-zinc-800">
                  <tr>
                    <th className="py-3 px-4 sm:px-6">Outcome</th>
                    <th className="py-3 px-4">Court</th>
                    <th className="py-3 px-4">Teams &amp; Partners</th>
                    <th className="py-3 px-4">Final Score</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4 sm:px-6">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                  {playerGames.map((game) => {
                    const isTeamA =
                      game.teamAIds && game.teamAIds.includes(activePlayer.id);
                    const isWinner =
                      (isTeamA && game.winner === "A") ||
                      (!isTeamA && game.winner === "B");

                    return (
                      <tr
                        key={game.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 sm:px-6">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isWinner
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                                : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {isWinner ? "Victory" : "Defeat"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-zinc-100">
                          {game.courtName}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5 max-w-xs">
                            <div className="font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1 truncate">
                              <span className="text-[10px] text-slate-400">
                                Team A:
                              </span>
                              <span>
                                {game.teamAIds?.map(getPlayerName).join(", ") ||
                                  "Team A"}
                              </span>
                            </div>
                            <div className="font-semibold text-slate-600 dark:text-zinc-400 flex items-center gap-1 truncate">
                              <span className="text-[10px] text-slate-400">
                                Team B:
                              </span>
                              <span>
                                {game.teamBIds?.map(getPlayerName).join(", ") ||
                                  "Team B"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-sm">
                          {game.score ? (
                            <span className="text-slate-900 dark:text-white">
                              {game.score.teamA} - {game.score.teamB}
                            </span>
                          ) : (
                            <span className="text-slate-400">&mdash;</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400 font-mono">
                          {game.durationMinutes || 15} mins
                        </td>

                        <td className="py-3.5 px-4 sm:px-6 text-slate-400 dark:text-zinc-500 whitespace-nowrap">
                          {new Date(game.endedAt).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
