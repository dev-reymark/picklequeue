'use client';

import React from 'react';
import { VenueLeaderboardHighlights, SKILL_CONFIG } from '@/types';
import { Trophy, Flame, Zap, Target, TrendingUp } from 'lucide-react';
import { Avatar, Card } from '@/components/ui';

interface LeaderboardHighlightsProps {
  highlights: VenueLeaderboardHighlights;
  onSelectPlayer?: (player: any) => void;
}

export const LeaderboardHighlights: React.FC<LeaderboardHighlightsProps> = ({
  highlights,
  onSelectPlayer,
}) => {
  const cards = [
    {
      title: 'Current Champion',
      badge: 'Rank #1',
      icon: Trophy,
      color: 'from-amber-500/20 to-amber-600/5 text-amber-600 dark:text-amber-400 border-amber-500/30',
      iconColor: 'text-amber-500',
      entry: highlights.topWinner,
      detail: (e: any) => `${e.wins} Wins (${e.winRate}%)`,
    },
    {
      title: 'Hottest Win Streak',
      badge: 'On Fire',
      icon: Flame,
      color: 'from-orange-500/20 to-orange-600/5 text-orange-600 dark:text-orange-400 border-orange-500/30',
      iconColor: 'text-orange-500',
      entry: highlights.longestStreak,
      detail: (e: any) => `${e.streak} Consecutive Wins`,
    },
    {
      title: 'Iron Paddle',
      badge: 'Most Matches',
      icon: Zap,
      color: 'from-sky-500/20 to-sky-600/5 text-sky-600 dark:text-sky-400 border-sky-500/30',
      iconColor: 'text-sky-500',
      entry: highlights.mostActive,
      detail: (e: any) => `${e.matchesPlayed} Matches Played`,
    },
    {
      title: 'Sharpshooter',
      badge: 'Top Win Rate',
      icon: Target,
      color: 'from-emerald-500/20 to-emerald-600/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      iconColor: 'text-emerald-500',
      entry: highlights.highestWinRate,
      detail: (e: any) => `${e.winRate}% Win Percentage`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {cards.map((c, i) => {
        const Icon = c.icon;
        const entry = c.entry;

        if (!entry) return null;

        return (
          <Card
            key={i}
            onClick={() => onSelectPlayer?.(entry.player)}
            className={`p-4 rounded-2xl bg-gradient-to-br ${c.color} border shadow-2xs cursor-pointer hover:shadow-xs hover:border-slate-400/50 dark:hover:border-zinc-600 transition-all flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between pb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                {c.title}
              </span>
              <span className="p-1.5 rounded-lg bg-white/70 dark:bg-zinc-800/80 shadow-2xs">
                <Icon className={`w-4 h-4 ${c.iconColor}`} />
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Avatar name={entry.player.name} size="md" />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">
                  {entry.player.name}
                </h4>
                <p className="text-xs font-mono font-bold text-slate-700 dark:text-zinc-300">
                  {c.detail(entry)}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
