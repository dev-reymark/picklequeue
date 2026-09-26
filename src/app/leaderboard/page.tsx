"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePickleballStore } from "@/store/pickleball-store";
import { useAuthStore } from "@/store/auth-store";
import { useTabSync } from "@/hooks/use-tab-sync";
import { SkillLevel, SKILL_CONFIG, Player } from "@/types";
import { getLeaderboard, LeaderboardSortOption } from "@/lib/leaderboard";
import { LeaderboardPodium } from "@/components/leaderboard/LeaderboardPodium";
import { LeaderboardHighlights } from "@/components/leaderboard/LeaderboardHighlights";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { PlayerProfileModal } from "@/components/admin/PlayerProfileModal";
import { QRCodeModal } from "@/components/qr/QRCodeModal";
import {
  Logo,
  ThemeToggle,
  Button,
  SearchInput,
  Select,
  Badge,
  Card,
  Tooltip,
} from "@/components/ui";
import {
  Trophy,
  ArrowUpDown,
  Download,
  Maximize,
  Minimize,
  QrCode,
  BarChart2,
  LogOut,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

export default function LeaderboardPage() {
  useTabSync();
  const { players, games, settings } = usePickleballStore();
  const { currentUser, isAuthenticated, isHydrated, logout } = useAuthStore();

  const [sortBy, setSortBy] = useState<LeaderboardSortOption>("wins");
  const [skillLevel, setSkillLevel] = useState<SkillLevel | "all">("all");
  const [search, setSearch] = useState("");
  const [minGames, setMinGames] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const { entries, highlights } = useMemo(() => {
    return getLeaderboard(players, games, {
      sortBy,
      skillLevel,
      minGames,
      search,
    });
  }, [players, games, sortBy, skillLevel, minGames, search]);

  const selectedPlayerRank = useMemo(() => {
    if (!selectedPlayer) return undefined;
    const found = entries.find((e) => e.player.id === selectedPlayer.id);
    return found?.rank;
  }, [selectedPlayer, entries]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const playerParam = params.get("player");
      const searchParam = params.get("search");
      if (playerParam) {
        setSearch(playerParam);
        const match = players.find(
          (p) => p.name.toLowerCase() === playerParam.toLowerCase()
        );
        if (match) {
          setSelectedPlayer(match);
        }
      } else if (searchParam) {
        setSearch(searchParam);
      }
    }
  }, [players]);

  const handleExportCSV = () => {
    if (entries.length === 0) {
      alert("No leaderboard data to export.");
      return;
    }

    const headers = [
      "Rank",
      "Player Name",
      "Skill Level",
      "Matches Played",
      "Wins",
      "Losses",
      "Win Rate %",
      "Win Streak",
      "Points Scored",
      "Points Conceded",
      "Point Diff",
    ];

    const rows = entries.map((e) => [
      e.rank,
      `"${e.player.name}"`,
      e.player.skillLevel,
      e.matchesPlayed,
      e.wins,
      e.losses,
      `${e.winRate}%`,
      e.streak,
      e.pointsScored,
      e.pointsConceded,
      e.pointDiff,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `picklequeue_leaderboard_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col">
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo className="w-8 h-8" />
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-wider text-slate-900 dark:text-zinc-100 uppercase flex items-center gap-2">
                  <span>PICKLEQUEUE LEADERBOARD</span>
                  <Trophy className="w-4 h-4 text-amber-500 fill-amber-400" />
                </h1>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  {settings.venueName || "Facility"} &bull; Rankings &amp;
                  Player Standings
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsQRModalOpen(true)}
              startContent={<QrCode className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">QR Check-in</span>
              <span className="sm:hidden">QR</span>
            </Button>

            {isHydrated && isAuthenticated && currentUser ? (
              <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200 dark:border-zinc-800">
                <Link
                  href={currentUser.role === "admin" ? "/console" : "/player"}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold transition"
                  title={`Signed in as ${currentUser.name} (${currentUser.role}). Click to open ${currentUser.role === "admin" ? "Console" : "Portal"}.`}
                >
                  <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline max-w-[90px] truncate">
                    {currentUser.name}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-rose-500 transition rounded-md cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link href="/login?redirect=/leaderboard">
                <Button
                  variant="primary"
                  size="sm"
                  startContent={<ArrowUpRight className="w-3.5 h-3.5" />}
                >
                  Sign In
                </Button>
              </Link>
            )}

            <Tooltip
              content={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              position="bottom"
            >
              <Button
                variant="secondary"
                size="sm"
                onClick={toggleFullscreen}
                aria-label="Toggle Fullscreen"
                className="px-2.5"
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4" />
                ) : (
                  <Maximize className="w-4 h-4" />
                )}
              </Button>
            </Tooltip>

            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge
              variant="amber"
              size="sm"
              className="rounded-full flex items-center gap-1"
            >
              <BarChart2 className="w-3 h-3" />
              <span>Session Standings</span>
            </Badge>
            <span className="text-xs text-slate-500 dark:text-zinc-400">
              {entries.length} Active Ranked Players &bull; {games.length}{" "}
              Matches Recorded
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-wide text-slate-900 dark:text-zinc-100">
            Tournament &amp; Open Play Leaderboard
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-xl">
            Player rankings update live as matches conclude. Filter by skill
            tier, sort by win rate or win streaks, and export reports for
            tournament ceremonies.
          </p>
        </div>

        {entries.length >= 2 && (
          <Card className="rounded-3xl pt-6 px-6 pb-0 overflow-hidden shadow-2xs border-slate-200 dark:border-zinc-800">
            <div className="text-center space-y-1 mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-500">
                Top Performers
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-zinc-100">
                Victory Podium
              </h3>
            </div>

            <LeaderboardPodium
              entries={entries}
              onSelectPlayer={(p) => setSelectedPlayer(p)}
            />
          </Card>
        )}

        <LeaderboardHighlights
          highlights={highlights}
          onSelectPlayer={(p) => setSelectedPlayer(p)}
        />

        <LeaderboardTable
          entries={entries}
          onSelectPlayer={(p) => setSelectedPlayer(p)}
          header={
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
              <div className="flex-1 max-w-md">
                <SearchInput
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Search player name..."
                  size="sm"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="w-48">
                  <Select
                    size="sm"
                    value={sortBy}
                    onValueChange={(val) =>
                      setSortBy(val as LeaderboardSortOption)
                    }
                    options={[
                      { value: "wins", label: "Most Wins" },
                      { value: "winRate", label: "Highest Win Rate %" },
                      { value: "streak", label: "Longest Win Streak" },
                      { value: "matches", label: "Most Matches" },
                      { value: "pointDiff", label: "Point Differential" },
                    ]}
                    icon={<ArrowUpDown className="w-3.5 h-3.5" />}
                  />
                </div>

                <div className="w-44">
                  <Select
                    size="sm"
                    value={skillLevel}
                    onValueChange={(val) =>
                      setSkillLevel(val as SkillLevel | "all")
                    }
                    options={[
                      { value: "all", label: "All Skill Levels" },
                      { value: "beginner", label: "Beginner" },
                      { value: "low-intermediate", label: "Low Intermediate" },
                      {
                        value: "high-intermediate",
                        label: "High Intermediate",
                      },
                      { value: "advanced", label: "Advanced" },
                    ]}
                  />
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant={minGames > 0 ? "primary" : "secondary"}
                  onClick={() => setMinGames((prev) => (prev === 0 ? 1 : 0))}
                >
                  {minGames > 0 ? "Min 1+ Matches" : "All Players"}
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExportCSV}
                  startContent={<Download className="w-4 h-4" />}
                >
                  Export CSV
                </Button>
              </div>
            </div>
          }
        />
      </main>

      <PlayerProfileModal
        player={selectedPlayer}
        rank={selectedPlayerRank}
        isOpen={!!selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
      />

      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />
    </div>
  );
}
