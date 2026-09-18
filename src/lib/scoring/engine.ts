import { Game, GameScore, ScoreHistoryEntry, Team, ScoringMode } from '@/types';
import { generateId } from '@/lib/utils';
import { ScoringAction, ScoringEngineResult } from './types';
import { processManualPoint } from './manual';
import { processSideOutRally, formatThreePartScore } from './side-out';
import { processRallyPoint } from './rally';
import { checkGameWinner } from './winner';

/**
 * Creates a clean snapshot of the game score to store in undo history.
 */
function createHistorySnapshot(
  score: GameScore,
  description?: string
): ScoreHistoryEntry {
  return {
    id: generateId(),
    teamA: score.teamA,
    teamB: score.teamB,
    servingTeam: score.servingTeam,
    serverNumber: score.serverNumber,
    winner: score.winner,
    timestamp: Date.now(),
    description,
  };
}

/**
 * Creates initial GameScore structure based on mode and settings.
 */
export function createInitialScore(
  mode: ScoringMode = 'manual',
  targetScore: number = 11,
  winBy: number = 2,
  servingTeam: Team = 'A'
): GameScore {
  return {
    teamA: 0,
    teamB: 0,
    scoringMode: mode,
    targetScore,
    winBy,
    servingTeam,
    serverNumber: mode === 'side-out' ? 2 : 1, // Side-out starts at 0-0-2
    winner: undefined,
  };
}

/**
 * Applies a scoring action to a Game, safely recording history for undo support.
 */
export function applyGameAction(
  game: Game,
  action: ScoringAction
): { game: Game; soundEvent?: 'point-scored' | 'side-out' | 'game-won' | 'score-undo' } {
  const currentScore = game.score;

  let result: ScoringEngineResult;

  switch (action.type) {
    case 'MANUAL_POINT': {
      result = processManualPoint(currentScore, action.team, action.delta);
      break;
    }

    case 'RALLY_WINNER': {
      if (currentScore.scoringMode === 'side-out') {
        result = processSideOutRally(currentScore, action.winningTeam);
      } else if (currentScore.scoringMode === 'rally') {
        result = processRallyPoint(currentScore, action.winningTeam);
      } else {
        // Fallback in manual mode: treating rally winner as +1 to that team
        result = processManualPoint(currentScore, action.winningTeam, 1);
      }
      break;
    }

    case 'SET_SERVER': {
      const updatedScore: GameScore = {
        ...currentScore,
        servingTeam: action.servingTeam,
        serverNumber: action.serverNumber ?? currentScore.serverNumber ?? 1,
      };
      result = {
        score: updatedScore,
        actionDescription: `Changed serve to Team ${action.servingTeam} (Server ${updatedScore.serverNumber})`,
        soundEvent: 'side-out',
      };
      break;
    }

    case 'SET_WINNER': {
      const updatedScore: GameScore = {
        ...currentScore,
        winner: action.winner,
      };
      result = {
        score: updatedScore,
        actionDescription: action.winner ? `Declared Team ${action.winner} Winner` : 'Cleared Winner',
        soundEvent: action.winner ? 'game-won' : undefined,
      };
      break;
    }

    case 'RESET_SCORE': {
      const freshScore = createInitialScore(
        currentScore.scoringMode,
        currentScore.targetScore,
        currentScore.winBy,
        currentScore.servingTeam || 'A'
      );
      result = {
        score: freshScore,
        actionDescription: 'Reset score to 0 - 0',
      };
      break;
    }
  }

  // Record prior state in history before applying mutation
  const historySnapshot = createHistorySnapshot(currentScore, result.actionDescription);
  const updatedHistory = [...game.history, historySnapshot];

  return {
    game: {
      ...game,
      score: result.score,
      history: updatedHistory,
    },
    soundEvent: result.soundEvent,
  };
}

/**
 * Restores the previous score and serving state from the game's history stack.
 */
export function undoGameAction(
  game: Game
): { game: Game; soundEvent?: 'score-undo' } {
  if (game.history.length === 0) {
    return { game };
  }

  const newHistory = [...game.history];
  const lastState = newHistory.pop()!;

  const restoredScore: GameScore = {
    ...game.score,
    teamA: lastState.teamA,
    teamB: lastState.teamB,
    servingTeam: lastState.servingTeam,
    serverNumber: lastState.serverNumber,
    winner: lastState.winner,
  };

  return {
    game: {
      ...game,
      score: restoredScore,
      history: newHistory,
    },
    soundEvent: 'score-undo',
  };
}

export { formatThreePartScore, checkGameWinner };
