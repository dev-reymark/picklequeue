'use client';

import React from 'react';
import { PlayerLeaderboardEntry, SKILL_CONFIG } from '@/types';
import { Avatar, Badge, Card, Pagination } from '@/components/ui';
import { Trophy, Medal, Flame, ArrowUpRight, ChevronRight } from 'lucide-react';

interface LeaderboardTableProps {
  entries: PlayerLeaderboardEntry[];
  onSelectPlayer?: (player: any) => void;
  header?: React.ReactNode;
  className?: string;
  pageSize?: number;
  showPagination?: boolean;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  entries,
  onSelectPlayer,
  header,
  className = '',
  pageSize: initialPageSize = 10,
  showPagination = true,
}) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(initialPageSize);

  const totalPages = Math.ceil(entries.length / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [entries.length]);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedEntries = showPagination
    ? entries.slice(startIndex, startIndex + pageSize)
    : entries;
  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-7 h-7 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
          1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-7 h-7 rounded-full bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white font-black text-xs flex items-center justify-center shadow-xs">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-7 h-7 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow-xs">
          3
        </span>
      );
    }
    return (
      <span className="w-7 h-7 font-mono font-bold text-xs text-slate-400 dark:text-zinc-500 flex items-center justify-center">
        #{rank}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'playing':
        return (
          <Badge variant="sky" size="sm" className="rounded-full">
            Playing
          </Badge>
        );
      case 'queued':
        return (
          <Badge variant="purple" size="sm" className="rounded-full">
            Queued
          </Badge>
        );
      case 'resting':
        return (
          <Badge variant="amber" size="sm" className="rounded-full">
            Resting
          </Badge>
        );
      default:
        return (
          <Badge variant="emerald" size="sm" className="rounded-full">
            Waiting
          </Badge>
        );
    }
  };

  return (
    <Card className={`rounded-2xl border-slate-200 dark:border-zinc-800 shadow-2xs overflow-hidden ${className}`}>
      {header && (
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          {header}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-zinc-950/80 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3.5 px-4 w-14 text-center">Rank</th>
              <th className="py-3.5 px-4">Player</th>
              <th className="py-3.5 px-4 text-center">Matches</th>
              <th className="py-3.5 px-4 text-center">Record (W - L)</th>
              <th className="py-3.5 px-4">Win Rate %</th>
              <th className="py-3.5 px-4 text-center">Streak</th>
              <th className="py-3.5 px-4 text-center">Pt Diff</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-right">Profile</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                  No players match the selected filters.
                </td>
              </tr>
            ) : (
              paginatedEntries.map((entry) => {
                const cfg = SKILL_CONFIG[entry.player.skillLevel];

                return (
                  <tr
                    key={entry.player.id}
                    onClick={() => onSelectPlayer?.(entry.player)}
                    className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center">
                        {getRankBadge(entry.rank)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={entry.player.name} size="md" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                              {entry.player.name}
                            </span>
                            {entry.rank === 1 && (
                              <Trophy className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                            )}
                          </div>
                          <span
                            className={`text-[10px] px-2 py-0.2 rounded-full font-bold border inline-block mt-0.5 ${cfg?.bgBadge}`}
                          >
                            {cfg?.label}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-700 dark:text-zinc-300">
                      {entry.matchesPlayed}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {entry.wins}W
                      </span>{' '}
                      -{' '}
                      <span className="font-bold text-rose-500">
                        {entry.losses}L
                      </span>
                    </td>

                    <td className="py-3.5 px-4 min-w-[130px]">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono font-bold">
                          <span>{entry.winRate}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              entry.winRate >= 70
                                ? 'bg-emerald-500'
                                : entry.winRate >= 50
                                ? 'bg-sky-500'
                                : 'bg-slate-400'
                            }`}
                            style={{ width: `${entry.winRate}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {entry.streak > 1 ? (
                        <Badge variant="amber" size="sm" className="rounded-full font-mono gap-1">
                          <Flame className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{entry.streak}</span>
                        </Badge>
                      ) : (
                        <span className="text-slate-400 font-mono text-xs">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center font-mono text-xs">
                      {entry.pointDiff > 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          +{entry.pointDiff}
                        </span>
                      ) : entry.pointDiff < 0 ? (
                        <span className="text-rose-500 font-bold">{entry.pointDiff}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {getStatusBadge(entry.player.status)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPlayer?.(entry.player);
                        }}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {showPagination && entries.length > 0 && (
        <div className="p-3 sm:px-4 sm:py-3 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={entries.length}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            itemName="players"
          />
        </div>
      )}
    </Card>
  );
};
