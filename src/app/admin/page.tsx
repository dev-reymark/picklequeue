'use client';

import React, { useState, useMemo } from 'react';
import { usePickleballStore } from '@/store/pickleball-store';
import { useTabSync } from '@/hooks/use-tab-sync';
import { Player, Court, SkillLevel, SKILL_CONFIG, PlanTier } from '@/types';
import { Logo, ThemeToggle, Button, Modal, ConfirmAlert } from '@/components/ui';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { TierComparisonModal } from '@/components/admin/TierComparisonModal';
import { PlayerProfileModal } from '@/components/admin/PlayerProfileModal';
import { ReservationModal } from '@/components/admin/ReservationModal';
import { QRCodeModal } from '@/components/qr/QRCodeModal';
import { getLeaderboard } from '@/lib/leaderboard';
import { LeaderboardPodium } from '@/components/leaderboard/LeaderboardPodium';
import { LeaderboardHighlights } from '@/components/leaderboard/LeaderboardHighlights';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import {
  LayoutDashboard,
  Users,
  Trophy,
  Medal,
  BarChart3,
  Calendar,
  Bell,
  Sliders,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  Star,
  Crown,
  Zap,
  Coffee,
  AlertTriangle,
  QrCode,
  Tv,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  Search,
  ArrowUpDown,
  Send,
  Radio,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  useTabSync();
  const {
    courts,
    players,
    queue,
    games,
    reservations,
    notifications,
    settings,
    setPlanTier,
    updateSettings,
    addCourtTime,
    endGame,
    assignNextQueueToCourt,
    checkInReservation,
    cancelReservation,
    addNotification,
    clearNotifications,
    setPlayerStatus,
    loadDemoData,
    exportBackupJson,
    importBackupJson,
    resetSession,
  } = usePickleballStore();

  const [activeTab, setActiveTab] = useState<
    'courts' | 'players' | 'leaderboard' | 'history' | 'reports' | 'reservations' | 'notifications' | 'branding'
  >('courts');

  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const [playerSearch, setPlayerSearch] = useState('');
  const [playerSkillFilter, setPlayerSkillFilter] = useState<string>('all');
  const [historySearch, setHistorySearch] = useState('');

  const [announcementText, setAnnouncementText] = useState('');

  const handleExportCSV = () => {
    if (games.length === 0) {
      alert('No completed games to export.');
      return;
    }

    const headers = ['Game ID', 'Court Name', 'Date', 'Duration (mins)', 'Team A Score', 'Team B Score', 'Winner'];
    const rows = games.map((g) => [
      g.id,
      `"${g.courtName}"`,
      new Date(g.endedAt).toLocaleDateString(),
      g.durationMinutes,
      g.score?.teamA ?? '',
      g.score?.teamB ?? '',
      g.winner ?? '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `picklequeue_match_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBroadcastAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;

    addNotification({
      playerName: 'All Players',
      type: 'game_warning',
      title: 'Facility Announcement',
      message: announcementText.trim(),
    });

    setAnnouncementText('');
  };

  const activeCourtsCount = courts.filter((c) => c.status === 'playing').length;
  const occupancyRate = courts.length > 0 ? Math.round((activeCourtsCount / courts.length) * 100) : 0;
  const totalCompletedGames = games.length;
  const avgGameDuration =
    totalCompletedGames > 0
      ? Math.round(games.reduce((acc, g) => acc + (g.durationMinutes || 15), 0) / totalCompletedGames)
      : settings.defaultGameDuration || 15;

  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(playerSearch.toLowerCase());
      const matchesSkill = playerSkillFilter === 'all' || p.skillLevel === playerSkillFilter;
      return matchesSearch && matchesSkill;
    });
  }, [players, playerSearch, playerSkillFilter]);

  const filteredHistory = useMemo(() => {
    return games.filter((g) => {
      return g.courtName.toLowerCase().includes(historySearch.toLowerCase());
    });
  }, [games, historySearch]);

  const leaderboardData = useMemo(() => {
    return getLeaderboard(players, games, { sortBy: 'wins' });
  }, [players, games]);

  const tierColors = {
    basic: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    standard: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30',
    premium: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
  };

  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 flex flex-col">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo className="w-8 h-8" />
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-wider text-slate-900 dark:text-zinc-100 uppercase">
                  PICKLEQUEUE ADMIN
                </h1>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                  Operations &amp; Venue Command Suite
                </p>
              </div>
            </Link>

            {/* Plan Tier Badge */}
            <button
              type="button"
              onClick={() => setIsTierModalOpen(true)}
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border transition cursor-pointer hover:shadow-2xs ${
                tierColors[settings.tier || 'premium']
              }`}
            >
              {settings.tier === 'basic' ? (
                <Zap className="w-3.5 h-3.5" />
              ) : settings.tier === 'standard' ? (
                <Star className="w-3.5 h-3.5" />
              ) : (
                <Crown className="w-3.5 h-3.5" />
              )}
              <span>{settings.tier || 'premium'} Plan</span>
            </button>
          </div>

          {/* Quick Access Actions */}
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

            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800 transition"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span className="hidden sm:inline">Leaderboard</span>
            </Link>

            <Link
              href="/display"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 transition"
            >
              <Tv className="w-3.5 h-3.5 text-sky-500" />
              <span className="hidden sm:inline">Live</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
            </Link>

            <Link
              href="/console"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 transition"
            >
              Console View
            </Link>

            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Tier Upgrade / Status Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                ACTIVE SYSTEM: {settings.tier?.toUpperCase() || 'PREMIUM'}
              </span>
              <span className="text-xs text-slate-400">
                {settings.venueName || 'Facility'} &bull; {settings.sessionName}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold">
              Facility Court &amp; Queue Management Hub
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Switch operational tiers anytime to test feature sets: Basic (digital queue &amp; courts), Standard (QR codes, player profiles, reports), or Premium (reservations, SMS alerts, cloud sync).
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsTierModalOpen(true)}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <span>Change Tier</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={loadDemoData}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              Reload Demo Data
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-zinc-800 text-xs font-semibold">
          {[
            { id: 'courts', label: 'Court Activity', icon: LayoutDashboard },
            { id: 'players', label: `Players (${players.length})`, icon: Users },
            { id: 'leaderboard', label: 'Leaderboard', icon: Medal },
            { id: 'history', label: `Game History (${games.length})`, icon: Trophy },
            { id: 'reports', label: 'Utilization Reports', icon: BarChart3 },
            { id: 'reservations', label: `Reservations (${reservations.length})`, icon: Calendar },
            { id: 'notifications', label: `Alerts (${notifications.length})`, icon: Bell },
            { id: 'branding', label: 'Branding & Backup', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: COURT ACTIVITY MONITOR */}
        {activeTab === 'courts' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Occupancy Rate</span>
                <span className="text-2xl font-black text-slate-900 dark:text-zinc-100 font-mono mt-1 block">
                  {occupancyRate}%
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                  {activeCourtsCount} of {courts.length} courts active
                </span>
              </div>

              <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Queued Groups</span>
                <span className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono mt-1 block">
                  {queue.length}
                </span>
                <span className="text-[11px] text-slate-400">
                  ~{queue.length * (settings.defaultGameDuration || 15)}m total wait
                </span>
              </div>

              <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Waiting Pool</span>
                <span className="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono mt-1 block">
                  {players.filter((p) => p.status === 'waiting').length}
                </span>
                <span className="text-[11px] text-slate-400">Available to group</span>
              </div>

              <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Matches Today</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
                  {totalCompletedGames}
                </span>
                <span className="text-[11px] text-slate-400">Completed rotations</span>
              </div>
            </div>

            {/* Court Command Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courts.map((court) => {
                const isPlaying = court.status === 'playing';
                const courtPlayers = court.playerIds
                  .map((pid) => players.find((p) => p.id === pid)?.name)
                  .filter(Boolean);

                return (
                  <div
                    key={court.id}
                    className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                          {court.name}
                        </h3>
                        <span className="text-xs text-slate-500">
                          {isPlaying ? 'Match in Progress' : 'Available for Rotation'}
                        </span>
                      </div>

                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isPlaying
                            ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {court.status}
                      </span>
                    </div>

                    {/* Players on Court */}
                    <div className="min-h-[44px]">
                      {isPlaying ? (
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            Current Players:
                          </span>
                          <div className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex flex-wrap gap-1.5">
                            {courtPlayers.map((name, i) => (
                              <span
                                key={i}
                                className="bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md"
                              >
                                {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No match currently active</span>
                      )}
                    </div>

                    {/* Control Actions */}
                    <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                      {isPlaying ? (
                        <>
                          <button
                            type="button"
                            onClick={() => addCourtTime(court.id, 5)}
                            className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 cursor-pointer"
                          >
                            +5 Mins
                          </button>
                          <button
                            type="button"
                            onClick={() => endGame(court.id, 'waiting-pool')}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-500 text-white cursor-pointer transition shadow-2xs"
                          >
                            End Game
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          disabled={queue.length === 0}
                          onClick={() => assignNextQueueToCourt(court.id)}
                          className="w-full py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white cursor-pointer transition shadow-2xs flex items-center justify-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Assign Next Queue Group</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: PLAYER DIRECTORY & PROFILES */}
        {activeTab === 'players' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={playerSearch}
                  onChange={(e) => setPlayerSearch(e.target.value)}
                  placeholder="Search players by name..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 focus:outline-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={playerSkillFilter}
                  onChange={(e) => setPlayerSkillFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-700 dark:text-zinc-300"
                >
                  <option value="all">All Skill Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="low-intermediate">Low Intermediate</option>
                  <option value="high-intermediate">High Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Players Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-zinc-950/80 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Player</th>
                      <th className="py-3 px-4">Skill Level</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Games</th>
                      <th className="py-3 px-4">Check-in Method</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                    {filteredPlayers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No players found matching current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredPlayers.map((player) => (
                        <tr
                          key={player.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition cursor-pointer"
                          onClick={() => setSelectedPlayer(player)}
                        >
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 dark:text-zinc-100 block">
                              {player.name}
                            </span>
                            {player.phone && (
                              <span className="text-[11px] text-slate-400 font-mono">
                                {player.phone}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                                SKILL_CONFIG[player.skillLevel]?.bgBadge
                              }`}
                            >
                              {SKILL_CONFIG[player.skillLevel]?.label}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                                player.status === 'playing'
                                  ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                                  : player.status === 'queued'
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                                  : player.status === 'resting'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              }`}
                            >
                              {player.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold">
                            {player.gamesPlayed || 0}
                          </td>
                          <td className="py-3 px-4">
                            {player.checkInMethod === 'qr' ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                                <QrCode className="w-3.5 h-3.5" />
                                <span>QR Code</span>
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">Admin Desk</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPlayer(player);
                              }}
                              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                              View Profile &rarr;
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: LEADERBOARD & RANKINGS */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                  <span>Tournament &amp; Session Leaderboard</span>
                  <Trophy className="w-4 h-4 text-amber-500 fill-amber-400" />
                </h3>
                <p className="text-xs text-slate-500">
                  Player rankings update automatically as matches conclude on courts
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/leaderboard"
                  target="_blank"
                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1.5 shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Public Standings View</span>
                </Link>
              </div>
            </div>

            {/* Highlights */}
            <LeaderboardHighlights
              highlights={leaderboardData.highlights}
              onSelectPlayer={(p) => setSelectedPlayer(p)}
            />

            {/* Podium */}
            {leaderboardData.entries.length >= 2 && (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs">
                <LeaderboardPodium
                  entries={leaderboardData.entries}
                  onSelectPlayer={(p) => setSelectedPlayer(p)}
                />
              </div>
            )}

            {/* Full Table */}
            <LeaderboardTable
              entries={leaderboardData.entries}
              onSelectPlayer={(p) => setSelectedPlayer(p)}
            />
          </div>
        )}

        {/* TAB 3: GAME HISTORY & CSV EXPORT */}
        {activeTab === 'history' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Filter by court name..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 focus:outline-emerald-500"
                />
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleExportCSV}
                startContent={<Download className="w-4 h-4" />}
                className="bg-emerald-600 hover:bg-emerald-500"
              >
                Export Match History to CSV
              </Button>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-zinc-950/80 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Court</th>
                      <th className="py-3 px-4">Time Completed</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Final Score</th>
                      <th className="py-3 px-4">Winner</th>
                      <th className="py-3 px-4">Match ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
                    {filteredHistory.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No match history recorded yet. Matches will appear here automatically when courts finish.
                        </td>
                      </tr>
                    ) : (
                      filteredHistory.map((rec) => (
                        <tr key={rec.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-zinc-100">
                            {rec.courtName}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {new Date(rec.endedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-3 px-4 font-mono">
                            {rec.durationMinutes} mins
                          </td>
                          <td className="py-3 px-4 font-mono font-bold">
                            {rec.score ? (
                              <span className="bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                                {rec.score.teamA} - {rec.score.teamB}
                              </span>
                            ) : (
                              'N/A'
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {rec.winner ? (
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                                Team {rec.winner}
                              </span>
                            ) : (
                              <span className="text-slate-400">Rotation End</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                            {rec.id.slice(0, 8)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: COURT UTILIZATION & ANALYTICS REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Top Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Court Occupancy</span>
                <span className="text-3xl font-black text-slate-900 dark:text-zinc-100 font-mono block">
                  {occupancyRate}%
                </span>
                <p className="text-xs text-slate-500">Live facility utilization rate across all courts</p>
              </div>

              <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Average Match Length</span>
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono block">
                  {avgGameDuration} mins
                </span>
                <p className="text-xs text-slate-500">Based on configured time and completed rotations</p>
              </div>

              <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase">Total Player Registry</span>
                <span className="text-3xl font-black text-sky-600 dark:text-sky-400 font-mono block">
                  {players.length}
                </span>
                <p className="text-xs text-slate-500">Registered across waiting pool, queue, and courts</p>
              </div>
            </div>

            {/* Court Utilization Breakdown */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                    Court Utilization Breakdown
                  </h3>
                  <p className="text-xs text-slate-500">
                    Rotations hosted and activity status per court
                  </p>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.print()}
                  startContent={<Printer className="w-4 h-4" />}
                >
                  Print Report
                </Button>
              </div>

              <div className="space-y-3">
                {courts.map((c) => {
                  const gamesOnCourt = games.filter((g) => g.courtId === c.id).length;
                  const percent = Math.min(100, Math.round(((gamesOnCourt * 15 + (c.status === 'playing' ? 15 : 0)) / 120) * 100));

                  return (
                    <div key={c.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-800 dark:text-zinc-200">{c.name}</span>
                        <span className="text-slate-500 font-mono">{gamesOnCourt} matches ({c.status})</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(10, percent)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Skill Level Distribution */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Player Skill Level Distribution
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(['beginner', 'low-intermediate', 'high-intermediate', 'advanced'] as SkillLevel[]).map((lvl) => {
                  const count = players.filter((p) => p.skillLevel === lvl).length;
                  const ratio = players.length > 0 ? Math.round((count / players.length) * 100) : 0;
                  const cfg = SKILL_CONFIG[lvl];

                  return (
                    <div key={lvl} className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-center">
                      <span className="text-xs font-bold block">{cfg.label}</span>
                      <span className="text-2xl font-black font-mono mt-1 block">{count}</span>
                      <span className="text-[11px] text-slate-400">{ratio}% of players</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ONLINE COURT RESERVATIONS */}
        {activeTab === 'reservations' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                  Facility Court Reservations (Premium)
                </h3>
                <p className="text-xs text-slate-500">
                  Manage private tournament courts, league time slots, and party bookings
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsReservationModalOpen(true)}
                startContent={<Plus className="w-4 h-4" />}
                className="bg-emerald-600 hover:bg-emerald-500"
              >
                New Reservation
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reservations.length === 0 ? (
                <div className="col-span-2 py-12 text-center text-xs text-slate-400 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
                  No reservations currently booked. Click &quot;New Reservation&quot; to reserve a court slot.
                </div>
              ) : (
                reservations.map((res) => (
                  <div
                    key={res.id}
                    className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        {res.courtName}
                      </span>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                        {res.startTime} - {res.endTime}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                        {res.reservedFor}
                      </h4>
                      <p className="text-xs text-slate-500">
                        Players: {res.playerNames.join(', ')}
                      </p>
                      {res.contactPhone && (
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Phone: {res.contactPhone}
                        </p>
                      )}
                    </div>

                    {res.notes && (
                      <p className="text-xs italic text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-950 p-2 rounded-lg">
                        &ldquo;{res.notes}&rdquo;
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800 text-xs">
                      <span className="text-[11px] text-slate-400">Status: {res.status}</span>
                      <div className="flex items-center gap-2">
                        {res.status === 'confirmed' && (
                          <button
                            type="button"
                            onClick={() => checkInReservation(res.id)}
                            className="px-3 py-1 font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg cursor-pointer"
                          >
                            Check In to Court Now
                          </button>
                        )}
                        {res.status !== 'cancelled' && (
                          <button
                            type="button"
                            onClick={() => cancelReservation(res.id)}
                            className="text-rose-600 hover:underline cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 6: NOTIFICATIONS & ALERTS */}
        {activeTab === 'notifications' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Broadcast Form */}
            <form
              onSubmit={handleBroadcastAnnouncement}
              className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-3"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-zinc-300">
                <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
                <span>Broadcast Live Facility Announcement</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="e.g. Court 3 is ready for next group! Or: Free clinics starting at 3 PM."
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 focus:outline-emerald-500"
                />
                <Button variant="primary" size="sm" type="submit" startContent={<Send className="w-3.5 h-3.5" />}>
                  Broadcast
                </Button>
              </div>
            </form>

            {/* Notification Log */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                  Player Notification Feed
                </h3>
                <button
                  type="button"
                  onClick={clearNotifications}
                  className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  Clear Feed
                </button>
              </div>

              {notifications.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No notifications currently logged. Alerts trigger when players check in, courts are assigned, or announcements are broadcast.
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-zinc-100">
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-zinc-400">{notif.message}</p>
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                        {notif.type.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: BRANDING & DATABASE BACKUP */}
        {activeTab === 'branding' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Branding Settings */}
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Facility Identity &amp; Marquee Ticker
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Venue Facility Name
                  </label>
                  <input
                    type="text"
                    value={settings.venueName}
                    onChange={(e) => updateSettings({ venueName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Session Title
                  </label>
                  <input
                    type="text"
                    value={settings.sessionName}
                    onChange={(e) => updateSettings({ sessionName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Spectator Display Marquee Announcement Ticker
                </label>
                <input
                  type="text"
                  value={settings.marqueeMessage || ''}
                  onChange={(e) => updateSettings({ marqueeMessage: e.target.value })}
                  placeholder="Ticker message displayed on the bottom of wall-mounted TV screens..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Poster Guest Wi-Fi Name
                  </label>
                  <input
                    type="text"
                    value={settings.wifiName || ''}
                    onChange={(e) => updateSettings({ wifiName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Poster Wi-Fi Password
                  </label>
                  <input
                    type="text"
                    value={settings.wifiPassword || ''}
                    onChange={(e) => updateSettings({ wifiPassword: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100"
                  />
                </div>
              </div>
            </div>

            {/* Database Backup & Restore */}
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                Database Backup &amp; Offline Sync (Standard &amp; Premium)
              </h3>
              <p className="text-xs text-slate-500">
                Download a complete JSON snapshot of all registered players, active courts, completed game history, and settings.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const json = exportBackupJson();
                    const blob = new Blob([json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `picklequeue_backup_${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-100 dark:text-zinc-900 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Download JSON Database Backup</span>
                </button>

                <label className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 transition flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-zinc-700">
                  <Upload className="w-4 h-4" />
                  <span>Restore from Backup</span>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const content = event.target?.result as string;
                        if (content && importBackupJson(content)) {
                          alert('Database successfully restored!');
                        } else {
                          alert('Failed to parse backup JSON.');
                        }
                      };
                      reader.readAsText(file);
                    }}
                  />
                </label>

                <button
                  type="button"
                  onClick={resetSession}
                  className="px-3.5 py-2 text-xs font-semibold rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                >
                  Reset Current Session
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <TierComparisonModal
        isOpen={isTierModalOpen}
        onClose={() => setIsTierModalOpen(false)}
      />

      <PlayerProfileModal
        player={selectedPlayer}
        isOpen={!!selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
      />

      <ReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
      />

      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />
    </div>
    </AuthGuard>
  );
}
