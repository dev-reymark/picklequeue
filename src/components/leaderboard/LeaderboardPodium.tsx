'use client';

import React from 'react';
import { PlayerLeaderboardEntry } from '@/types';
import { Trophy, Crown, Flame, Award } from 'lucide-react';
import { Avatar, Badge } from '@/components/ui';

interface LeaderboardPodiumProps {
  entries: PlayerLeaderboardEntry[];
  onSelectPlayer?: (player: any) => void;
}

export const LeaderboardPodium: React.FC<LeaderboardPodiumProps> = ({
  entries,
  onSelectPlayer,
}) => {
  if (entries.length < 1) return null;

  const first = entries[0];
  const second = entries[1] || null;
  const third = entries[2] || null;

  return (
    <div className="relative pt-6 pb-0">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-44 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto grid grid-cols-3 gap-2 sm:gap-4 items-end justify-center">
        {second ? (
          <div
            onClick={() => onSelectPlayer?.(second.player)}
            className="flex flex-col items-center text-center group cursor-pointer transition-transform hover:-translate-y-1"
          >
            <div className="mb-2 flex flex-col items-center space-y-1 relative">
              <div className="relative">
                <Avatar name={second.player.name} size="lg" className="border-2 border-slate-300 dark:border-slate-600 shadow-md" />
                <span className="absolute -top-2 -right-1 w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-2 border-white dark:border-zinc-900 font-black text-xs flex items-center justify-center shadow-xs">
                  2
                </span>
              </div>

              <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-zinc-200 truncate max-w-[100px] sm:max-w-[140px] block">
                {second.player.name}
              </span>

              <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-500 dark:text-zinc-400">
                {second.wins}W - {second.losses}L &bull; {second.winRate}%
              </span>

              {second.streak > 1 && (
                <Badge variant="amber" size="sm" className="rounded-full font-mono gap-1">
                  <Flame className="w-3 h-3 fill-amber-500" />
                  <span>{second.streak} streak</span>
                </Badge>
              )}
            </div>

            <div className="w-full h-28 sm:h-36 rounded-t-2xl bg-gradient-to-t from-slate-200 via-slate-100 to-slate-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-700 border-t-2 border-x-2 border-slate-300 dark:border-zinc-600 flex flex-col items-center justify-start pt-3 shadow-md">
              <Award className="w-6 h-6 text-slate-400 dark:text-slate-300 mb-1" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 font-mono">
                2nd Place
              </span>
              <span className="text-lg sm:text-2xl font-black font-mono text-slate-700 dark:text-slate-200 mt-1">
                {second.wins} <span className="text-xs font-normal text-slate-400">Wins</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="h-28" />
        )}

        <div
          onClick={() => onSelectPlayer?.(first.player)}
          className="flex flex-col items-center text-center z-10 group cursor-pointer transition-transform hover:-translate-y-1.5"
        >
          <div className="mb-2 flex flex-col items-center space-y-1 relative">
            <div className="relative">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 animate-bounce">
                <Crown className="w-6 h-6 text-amber-500 fill-amber-400 drop-shadow-md" />
              </div>
              <Avatar
                name={first.player.name}
                size="xl"
                className="border-4 border-amber-400 shadow-xl ring-4 ring-amber-400/20"
              />
              <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center border-2 border-white dark:border-zinc-900 shadow-sm">
                1
              </span>
            </div>

            <span className="font-black text-sm sm:text-base text-slate-900 dark:text-zinc-100 truncate max-w-[120px] sm:max-w-[180px] block mt-1">
              {first.player.name}
            </span>

            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
              {first.wins}W - {first.losses}L &bull; {first.winRate}% Win Rate
            </span>

            {first.streak > 1 ? (
              <Badge variant="amber" size="sm" className="rounded-full font-mono gap-1">
                <Flame className="w-3.5 h-3.5 fill-amber-500" />
                <span>{first.streak} Match Streak</span>
              </Badge>
            ) : (
              <Badge variant="emerald" size="sm" className="rounded-full uppercase tracking-wider">
                Rank #1 Champion
              </Badge>
            )}
          </div>

          <div className="w-full h-36 sm:h-48 rounded-t-2xl bg-gradient-to-t from-amber-200 via-amber-100 to-amber-50 dark:from-amber-950/80 dark:via-zinc-800 dark:to-zinc-700 border-t-4 border-x-2 border-amber-400 shadow-xl flex flex-col items-center justify-start pt-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-400/10 to-transparent pointer-events-none" />
            <Trophy className="w-8 h-8 text-amber-500 fill-amber-400/20 mb-1 drop-shadow" />
            <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-300 font-mono">
              1st Place
            </span>
            <span className="text-2xl sm:text-4xl font-black font-mono text-slate-900 dark:text-amber-300 mt-1">
              {first.wins} <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Wins</span>
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-zinc-400 mt-1 font-mono">
              {first.pointsScored > 0 ? `+${first.pointDiff} Pt Diff` : `${first.matchesPlayed} Matches`}
            </span>
          </div>
        </div>

        {third ? (
          <div
            onClick={() => onSelectPlayer?.(third.player)}
            className="flex flex-col items-center text-center group cursor-pointer transition-transform hover:-translate-y-1"
          >
            <div className="mb-2 flex flex-col items-center space-y-1 relative">
              <div className="relative">
                <Avatar name={third.player.name} size="lg" className="border-2 border-amber-700/50 shadow-md" />
                <span className="absolute -top-2 -right-1 w-6 h-6 rounded-full bg-amber-700 text-white border-2 border-white dark:border-zinc-900 font-black text-xs flex items-center justify-center shadow-xs">
                  3
                </span>
              </div>

              <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-zinc-200 truncate max-w-[100px] sm:max-w-[140px] block">
                {third.player.name}
              </span>

              <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-500 dark:text-zinc-400">
                {third.wins}W - {third.losses}L &bull; {third.winRate}%
              </span>

              {third.streak > 1 && (
                <Badge variant="amber" size="sm" className="rounded-full font-mono gap-1">
                  <Flame className="w-3 h-3 fill-amber-600" />
                  <span>{third.streak} streak</span>
                </Badge>
              )}
            </div>

            <div className="w-full h-24 sm:h-32 rounded-t-2xl bg-gradient-to-t from-orange-200 via-orange-100 to-orange-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-700 border-t-2 border-x-2 border-orange-300 dark:border-orange-900/60 flex flex-col items-center justify-start pt-3 shadow-md">
              <Award className="w-6 h-6 text-amber-700 dark:text-amber-500 mb-1" />
              <span className="text-xs font-black uppercase tracking-wider text-orange-800 dark:text-orange-300 font-mono">
                3rd Place
              </span>
              <span className="text-lg sm:text-2xl font-black font-mono text-slate-700 dark:text-slate-200 mt-1">
                {third.wins} <span className="text-xs font-normal text-slate-400">Wins</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="h-24" />
        )}
      </div>
    </div>
  );
};
