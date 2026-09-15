import React, { useState } from "react";
import { Users, Search, Pencil, Trash2, Check } from "lucide-react";
import { Player, SkillLevel, SKILL_CONFIG } from "@/types";
import { usePickleballStore } from "@/store/pickleball-store";
import {
  Modal,
  Tabs,
  TabItem,
  Input,
  Select,
  Badge,
  Chip,
  Button,
  ConfirmAlert,
} from "@/components/ui";
import { PlayerBadge } from "./PlayerBadge";

interface PlayerListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SKILL_LEVELS: SkillLevel[] = [
  "beginner",
  "low-intermediate",
  "high-intermediate",
  "advanced",
];

type FilterType = "all" | "waiting" | "queued" | "playing" | "resting";

export const PlayerListModal: React.FC<PlayerListModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { players, editPlayer, deletePlayer } = usePickleballStore();
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSkill, setEditSkill] = useState<SkillLevel>("beginner");
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);

  const waitingCount = players.filter(
    (p) => p.status === "waiting" || (p.status as any) === "available",
  ).length;
  const queuedCount = players.filter((p) => p.status === "queued").length;
  const playingCount = players.filter((p) => p.status === "playing").length;
  const restingCount = players.filter((p) => p.status === "resting").length;

  const tabItems: TabItem[] = [
    {
      id: "all",
      label: "All",
      badge: (
        <Badge size="sm" variant={filter === "all" ? "neutral" : "outline"}>
          {players.length}
        </Badge>
      ),
    },
    {
      id: "waiting",
      label: "Waiting",
      badge: (
        <Badge size="sm" variant={filter === "waiting" ? "emerald" : "outline"}>
          {waitingCount}
        </Badge>
      ),
    },
    {
      id: "queued",
      label: "Queued",
      badge: (
        <Badge size="sm" variant={filter === "queued" ? "purple" : "outline"}>
          {queuedCount}
        </Badge>
      ),
    },
    {
      id: "playing",
      label: "Playing",
      badge: (
        <Badge size="sm" variant={filter === "playing" ? "sky" : "outline"}>
          {playingCount}
        </Badge>
      ),
    },
    {
      id: "resting",
      label: "Resting",
      badge: (
        <Badge size="sm" variant={filter === "resting" ? "amber" : "outline"}>
          {restingCount}
        </Badge>
      ),
    },
  ];

  const filteredPlayers = players.filter((p) => {
    // Status filter
    if (filter === "waiting") {
      if (p.status !== "waiting" && (p.status as any) !== "available")
        return false;
    } else if (filter !== "all") {
      if (p.status !== filter) return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      return p.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
    }

    return true;
  });

  const startEdit = (p: Player) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditSkill(p.skillLevel);
  };

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      editPlayer(editingId, { name: editName.trim(), skillLevel: editSkill });
      setEditingId(null);
    }
  };

  const skillOptions = SKILL_LEVELS.map((lvl) => ({
    value: lvl,
    label: SKILL_CONFIG[lvl].label,
  }));

  return (
    <>
      <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Player Directory (${players.length})`}
      description="Manage player skill ratings and session participation"
      maxWidth="2xl"
      fullWidthOnMobile
      footer={
        <Button variant="secondary" size="sm" onClick={onClose}>
          Close
        </Button>
      }
    >
      {/* Filter Tabs */}
      <Tabs
        items={tabItems}
        activeTab={filter}
        onChange={(id) => setFilter(id as FilterType)}
        orientation="horizontal"
        className="-mx-4 sm:-mx-6 px-4 sm:px-6 -mt-1 pb-2 border-b border-slate-100 dark:border-zinc-800"
      />

      {/* Search Input (shown when there are players) */}
      {players.length > 3 && (
        <div className="relative">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search players by name..."
            className="pl-9 py-1.5 text-xs"
          />
          <Search className="w-4 h-4 text-slate-400 dark:text-zinc-500 absolute left-3 top-2.5 pointer-events-none" />
        </div>
      )}

      {/* Players List */}
      <div className="space-y-2">
        {filteredPlayers.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50/50 dark:bg-zinc-950/40 p-4">
            <Users className="w-8 h-8 mx-auto text-slate-300 dark:text-zinc-600 mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1">
              No players found
            </p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-xs mx-auto">
              {searchQuery
                ? `No players matching "${searchQuery}" in this view.`
                : `No players currently with status "${filter}".`}
            </p>
          </div>
        ) : (
          filteredPlayers.map((player) => (
            <div
              key={player.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 sm:p-3.5 transition-colors"
            >
              {editingId === player.id ? (
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Player name"
                    containerClassName="flex-1 min-w-[140px]"
                    className="py-1.5 text-xs"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                  />
                  <Select
                    value={editSkill}
                    onChange={(e) => setEditSkill(e.target.value as SkillLevel)}
                    options={skillOptions}
                    containerClassName="w-full sm:w-44 shrink-0"
                    className="py-1.5 text-xs"
                  />
                  <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0 mt-1 sm:mt-0">
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={saveEdit}
                      disabled={!editName.trim()}
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Save
                    </Button>
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span
                      title={player.name}
                      className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate max-w-[140px] sm:max-w-[180px]"
                    >
                      {player.name}
                    </span>
                    <PlayerBadge skillLevel={player.skillLevel} />
                    <Badge
                      variant={
                        player.status === "playing"
                          ? "sky"
                          : player.status === "queued"
                            ? "purple"
                            : player.status === "resting"
                              ? "amber"
                              : player.status === "waiting" ||
                                  (player.status as any) === "available"
                                ? "emerald"
                                : "neutral"
                      }
                      size="sm"
                      className="capitalize"
                    >
                      {player.status === "available"
                        ? "waiting"
                        : player.status}
                    </Badge>
                    <Chip
                      variant="neutral"
                      size="sm"
                      className="text-[10px] font-mono"
                    >
                      {player.gamesPlayed}{" "}
                      {player.gamesPlayed === 1 ? "game" : "games"}
                    </Chip>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={() => startEdit(player)}
                      className="text-xs"
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setPlayerToDelete(player)}
                      className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </Modal>

    <ConfirmAlert
      isOpen={!!playerToDelete}
      onClose={() => setPlayerToDelete(null)}
      onConfirm={() => {
        if (playerToDelete) {
          deletePlayer(playerToDelete.id);
          setPlayerToDelete(null);
        }
      }}
      title="Delete Player?"
      message={
        <span>
          Are you sure you want to remove{' '}
          <strong className="text-slate-900 dark:text-zinc-100">
            {playerToDelete?.name}
          </strong>{' '}
          from the session? This will remove them from the active queue and session records.
        </span>
      }
      confirmText="Delete Player"
      variant="danger"
    />
  </>
);
};
