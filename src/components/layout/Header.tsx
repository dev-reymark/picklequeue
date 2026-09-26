import React, { useState } from "react";
import Link from "next/link";
import { usePickleballStore } from "@/store/pickleball-store";
import { SettingsModal } from "../settings/SettingsModal";
import { EndSessionModal } from "../session/EndSessionModal";
import { QRCodeModal } from "../qr/QRCodeModal";
import { TierComparisonModal } from "../admin/TierComparisonModal";
import { PlayerListModal } from "../players/PlayerListModal";
import { ThemeToggle, Logo, Button } from "@/components/ui";
import {
  Settings,
  Volume2,
  VolumeX,
  Users,
  QrCode,
  Tv,
  Shield,
  Crown,
  Trophy,
  Zap,
  Star,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

interface HeaderProps {
  onOpenWaitingPool?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenWaitingPool }) => {
  const { currentUser, isAuthenticated, isHydrated, logout } = useAuthStore();
  const { courts, queue, players, settings, updateSettings, loadDemoData } =
    usePickleballStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEndSessionOpen, setIsEndSessionOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [isPlayerListOpen, setIsPlayerListOpen] = useState(false);
  const [settingsDefaultTab, setSettingsDefaultTab] =
    useState<string>("general");

  const activeCourtsCount = courts.filter((c) => c.status === "playing").length;
  const waitingCount = players.filter(
    (p) => p.status === "waiting" || (p.status as any) === "available",
  ).length;

  const toggleSound = () => {
    updateSettings({ soundEnabled: !settings.soundEnabled });
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-zinc-950/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-4 sm:px-6 lg:px-8 py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 hover:opacity-90 transition group"
              title="Home & Pricing"
            >
              <Logo className="w-7 h-7 sm:w-8 sm:h-8" />
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-zinc-100 tracking-wider">
                PICKLEQUEUE
              </h1>
            </Link>

            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 pl-2 border-l border-slate-200 dark:border-zinc-800">
              <span className="font-semibold text-slate-800 dark:text-zinc-200">
                {settings.venueName || "Venue"}
              </span>
              <span>&bull;</span>
              <span>{settings.sessionName || "Session"}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsTierModalOpen(true)}
              className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border transition cursor-pointer hover:opacity-85 ${
                settings.tier === "basic"
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                  : settings.tier === "standard"
                    ? "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30"
                    : "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30"
              }`}
              title="Click to view plan features or switch tier"
            >
              {settings.tier === "basic" ? (
                <Zap className="w-3 h-3 text-emerald-500" />
              ) : settings.tier === "standard" ? (
                <Star className="w-3 h-3 text-sky-500 fill-sky-400" />
              ) : (
                <Crown className="w-3 h-3 text-purple-500" />
              )}
              <span>{settings.tier || "standard"} Plan</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-zinc-900/90 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-sky-500" />
              <span className="text-slate-500 dark:text-zinc-400">Courts:</span>
              <span className="font-bold text-slate-900 dark:text-zinc-100 font-mono">
                {activeCourtsCount} / {courts.length}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-zinc-900/90 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-slate-500 dark:text-zinc-400">
                In Queue:
              </span>
              <span className="font-bold text-slate-900 dark:text-zinc-100 font-mono">
                {queue.length}
              </span>
            </div>

            <button
              type="button"
              onClick={onOpenWaitingPool}
              className="flex items-center gap-2 bg-slate-100/80 hover:bg-slate-200/80 dark:bg-zinc-900/90 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 transition cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-500 dark:text-zinc-400">
                Waiting:
              </span>
              <span className="font-bold text-slate-900 dark:text-zinc-100 font-mono">
                {waitingCount}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <button
              type="button"
              onClick={toggleSound}
              title={
                settings.soundEnabled
                  ? "Mute Alert Buzzer"
                  : "Enable Alert Buzzer"
              }
              className={`p-2 rounded-lg border text-xs font-medium transition flex items-center justify-center ${
                settings.soundEnabled
                  ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                  : "bg-white border-slate-200 text-slate-400 hover:bg-slate-100 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-500 dark:hover:bg-zinc-900"
              }`}
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsQROpen(true)}
              title="Player QR Code Check-In"
              className="px-2.5 py-1.5 rounded-lg border text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-800 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">QR Check-in</span>
            </button>

            <Link
              href="/leaderboard"
              title="View Leaderboard & Player Rankings"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800 transition shadow-2xs"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span className="hidden sm:inline">Leaderboard</span>
            </Link>

            <Link
              href="/display"
              target="_blank"
              title="Open Spectator & TV Kiosk Board"
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 transition"
            >
              <Tv className="w-3.5 h-3.5 text-sky-500" />
              <span>Live</span>
            </Link>

            <button
              type="button"
              onClick={() => setIsPlayerListOpen(true)}
              title="Manage Players, Skill Levels & Stats"
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 transition cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Players</span>
            </button>

            <Link
              href="/admin"
              title="Admin Dashboard & Reports"
              className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 transition flex items-center gap-1.5 shadow-2xs"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
              <span className="hidden sm:inline">Admin</span>
            </Link>

            <button
              type="button"
              onClick={loadDemoData}
              className="hidden sm:inline-block px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-800 transition cursor-pointer"
            >
              Demo
            </button>

            <button
              type="button"
              onClick={() => {
                setSettingsDefaultTab("general");
                setIsSettingsOpen(true);
              }}
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800 transition flex items-center gap-1 cursor-pointer"
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Settings</span>
            </button>

            {isHydrated && isAuthenticated && currentUser ? (
              <div className="flex items-center gap-1 pl-1 border-l border-slate-200 dark:border-zinc-800">
                <Link
                  href="/login"
                  title={`Signed in as ${currentUser.name} (${currentUser.role}). Click to view or switch account.`}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold transition"
                >
                  <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="hidden xl:inline max-w-[80px] truncate">
                    {currentUser.name}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 text-xs text-slate-400 hover:text-rose-600 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login?redirect=/console"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg text-slate-600 hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400 transition"
              >
                <span>Sign In</span>
              </Link>
            )}

            <Button
              id="waiting-pool-header-btn"
              variant="primary"
              size="sm"
              onClick={onOpenWaitingPool}
              startContent={<Users className="w-3.5 h-3.5" />}
              endContent={
                <span className="inline-flex items-center gap-1.5 ml-0.5">
                  <span className="px-1.5 py-0.2 rounded-md bg-emerald-700 text-emerald-100 font-mono text-[11px] font-bold">
                    {waitingCount}
                  </span>
                  <kbd className="hidden sm:inline-flex items-center justify-center text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-700/80 text-emerald-100 border border-emerald-500/50 shadow-2xs">
                    W
                  </kbd>
                </span>
              }
            >
              <span className="hidden sm:inline">Waiting Pool</span>
              <span className="sm:hidden">Pool</span>
            </Button>
          </div>
        </div>
      </header>

      <QRCodeModal isOpen={isQROpen} onClose={() => setIsQROpen(false)} />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        defaultTab={settingsDefaultTab}
      />

      <EndSessionModal
        isOpen={isEndSessionOpen}
        onClose={() => setIsEndSessionOpen(false)}
      />

      <TierComparisonModal
        isOpen={isTierModalOpen}
        onClose={() => setIsTierModalOpen(false)}
      />

      <PlayerListModal
        isOpen={isPlayerListOpen}
        onClose={() => setIsPlayerListOpen(false)}
      />
    </>
  );
};
