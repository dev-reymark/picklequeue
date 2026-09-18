import { Team, ScoringMode, GameScore, ScoreHistoryEntry, Game } from '@/types';

export type ScoringActionType =
  | 'MANUAL_POINT'
  | 'RALLY_WINNER'
  | 'SET_SERVER'
  | 'RESET_SCORE'
  | 'SET_WINNER';

export interface ManualPointAction {
  type: 'MANUAL_POINT';
  team: Team;
  delta: 1 | -1;
}

export interface RallyWinnerAction {
  type: 'RALLY_WINNER';
  winningTeam: Team;
}

export interface SetServerAction {
  type: 'SET_SERVER';
  servingTeam: Team;
  serverNumber?: 1 | 2;
}

export interface ResetScoreAction {
  type: 'RESET_SCORE';
}

export interface SetWinnerAction {
  type: 'SET_WINNER';
  winner?: Team;
}

export type ScoringAction =
  | ManualPointAction
  | RallyWinnerAction
  | SetServerAction
  | ResetScoreAction
  | SetWinnerAction;

export interface ScoringEngineResult {
  score: GameScore;
  actionDescription: string;
  soundEvent?: 'point-scored' | 'side-out' | 'game-won';
}
