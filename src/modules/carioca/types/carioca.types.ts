/**
 * Types & Interfaces for Carioca Scorekeeper Module
 */

export type RoundCategory = 'trios' | 'escalas' | 'mixto' | 'especial';

export interface Player {
  id: string;
  name: string;
  color: string;
  avatarEmoji: string;
  createdAt: number;
}

export interface RoundDefinition {
  id: string;
  orderNumber: number;
  name: string;
  description: string;
  requiredCards: number;
  category: RoundCategory;
  isCustom?: boolean;
}

export interface GameRound {
  id: string;
  roundIndex: number;
  definition: RoundDefinition;
  scores: Record<string, number | null>; // playerId -> points (null = not entered yet)
  isCompleted: boolean;
  completedAt?: string;
  winnerPlayerId?: string | null;
}

export type GameStatus = 'setup' | 'playing' | 'finished';

export type StorageMode = 'guest' | 'authenticated';

export interface PlayerStats {
  playerId: string;
  playerName: string;
  playerColor: string;
  playerEmoji: string;
  totalScore: number;
  rank: number;
  diffFromLeader: number;
  roundsWon: number; // times scored 0 (cut)
  averageScore: number;
  bestScore: number;
  worstScore: number;
  scoreProgression: number[]; // cumulative score after each completed round
}

export interface CariocaGame {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  status: GameStatus;
  players: Player[];
  rounds: GameRound[];
  currentRoundIndex: number;
  winnerId?: string | null;
  storageMode: StorageMode;
  notes?: string;
}

export interface GamePreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  badge: string;
  roundIds: string[];
}

export interface SavedGameSummary {
  id: string;
  name: string;
  createdAt: string;
  completedAt?: string;
  status: GameStatus;
  playerCount: number;
  roundCount: number;
  winnerName?: string;
  winnerScore?: number;
  players: {
    id: string;
    name: string;
    totalScore: number;
    color: string;
  }[];
}

export interface ICariocaStorageAdapter {
  saveCurrentGame(game: CariocaGame): Promise<void>;
  loadCurrentGame(): Promise<CariocaGame | null>;
  clearCurrentGame(): Promise<void>;
  saveGameToHistory(game: CariocaGame): Promise<void>;
  getGameHistory(): Promise<SavedGameSummary[]>;
  deleteGameFromHistory(id: string): Promise<void>;
  saveSavedPlayers(players: Player[]): Promise<void>;
  loadSavedPlayers(): Promise<Player[]>;
}
