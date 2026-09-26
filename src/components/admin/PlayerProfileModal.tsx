"use client";

import React, { useState } from "react";
import { usePickleballStore } from "@/store/pickleball-store";
import { useAuthStore } from "@/store/auth-store";
import { Player, SKILL_CONFIG } from "@/types";
import { Modal, Button, Avatar } from "@/components/ui";
import {
  Trophy,
  Clock,
  Phone,
  QrCode,
  Coffee,
  Trash2,
  Share2,
  Check,
  Flame,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

interface PlayerProfileModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  rank?: number;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  player,
  isOpen,
  onClose,
  rank,
}) => {
  const { games, settings, setPlayerStatus, deletePlayer } =
    usePickleballStore();
  const { currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === "admin";
  const [copied, setCopied] = useState(false);

  if (!player) return null;

  const playerGames = games.filter(
    (g) => g.playerIds && g.playerIds.includes(player.id),
  );

  const wins = player.wins ?? 0;
  const losses = player.losses ?? 0;
  const totalCompleted = wins + losses;
  const winRate =
    totalCompleted > 0 ? Math.round((wins / totalCompleted) * 100) : 0;
  const streak = player.streak ?? 0;

  const handleToggleRest = () => {
    if (player.status === "resting") {
      setPlayerStatus(player.id, "waiting");
    } else {
      setPlayerStatus(player.id, "resting");
    }
  };

  const handleDelete = () => {
    deletePlayer(player.id);
    onClose();
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;

    const venue = settings.venueName || "PickleQueue";
    const shareUrl = `${window.location.origin}/player/${player.id}`;
    const rankText = rank
      ? rank === 1
        ? "🏆 #1 Champion"
        : rank <= 3
          ? `🎖️ Top 3 Podium (Rank #${rank})`
          : `Rank #${rank}`
      : "";
    const streakText = streak > 1 ? ` • 🔥 ${streak} Win Streak` : "";
    const shareText = `${rankText ? rankText + " " : ""}${player.name} at ${venue}!\n📊 ${wins}W - ${losses}L (${winRate}% Win Rate)${streakText}\nView player stats and live leaderboard:`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${player.name} - ${venue} Leaderboard`,
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Player Profile &amp; Stats"
      description="Detailed historical match logs and rotation status"
      maxWidth="md"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
          <div className="relative">
            <Avatar name={player.name} size="lg" />
            {rank === 1 && (
              <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                <Trophy className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 truncate">
                {player.name}
              </h3>
              {rank && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    rank === 1
                      ? "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                      : rank <= 3
                        ? "bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border-slate-300 dark:border-zinc-700"
                        : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                  }`}
                >
                  Rank #{rank}
                </span>
              )}
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                  SKILL_CONFIG[player.skillLevel]?.bgBadge ||
                  "bg-slate-100 text-slate-700"
                }`}
              >
                {SKILL_CONFIG[player.skillLevel]?.label}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Joined{" "}
                  {new Date(player.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </span>
              {player.checkInMethod === "qr" && (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>QR Check-in</span>
                </span>
              )}
              {streak > 1 && (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                  <Flame className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{streak} Streak</span>
                </span>
              )}
            </div>

            {player.phone && (
              <div className="text-xs text-slate-600 dark:text-zinc-400 flex items-center gap-1.5 pt-0.5">
                <Phone className="w-3 h-3 text-slate-400" />
                <span className="font-mono">{player.phone}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2.5 text-center">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">
              Games
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-zinc-100 font-mono">
              {player.gamesPlayed || playerGames.length}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold block">
              Wins
            </span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
              {wins}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
            <span className="text-[10px] text-rose-500 uppercase font-bold block">
              Losses
            </span>
            <span className="text-lg font-black text-rose-500 font-mono">
              {losses}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
            <span className="text-[10px] text-sky-500 uppercase font-bold block">
              Win Rate
            </span>
            <span className="text-lg font-black text-sky-500 font-mono">
              {winRate}%
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
            Recent Match History
          </h4>

          {playerGames.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800">
              No completed matches recorded yet for this session.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {playerGames.map((g) => (
                <div
                  key={g.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-800 dark:text-zinc-200 block">
                      {g.courtName}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {new Date(g.endedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      &bull; {g.durationMinutes} mins
                    </span>
                  </div>

                  {g.score && (
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-zinc-100 bg-slate-200 dark:bg-zinc-800 px-2 py-0.5 rounded">
                        {g.score.teamA} - {g.score.teamB}
                      </span>
                      {g.winner && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                          Winner {g.winner}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
          {isAdmin ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-rose-600 hover:text-rose-700 dark:text-rose-400"
              startContent={<Trash2 className="w-4 h-4" />}
            >
              Remove Player
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          )}

          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleToggleRest}
                startContent={<Coffee className="w-4 h-4" />}
              >
                {player.status === "resting"
                  ? "Set as Ready"
                  : "Mark as Resting"}
              </Button>
            )}

            <Link href={`/player/${player.id}`}>
              <Button
                variant="secondary"
                size="sm"
                startContent={<ArrowUpRight className="w-4 h-4" />}
              >
                Full Profile
              </Button>
            </Link>

            <Button
              variant="primary"
              size="sm"
              onClick={handleShare}
              className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs"
              startContent={
                copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )
              }
            >
              {copied ? "Copied Link!" : "Share Player Card"}
            </Button>

            {isAdmin && (
              <Button variant="secondary" size="sm" onClick={onClose}>
                Done
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
