import {
  CariocaGame,
  ICariocaStorageAdapter,
  Player,
  SavedGameSummary,
  StorageMode,
} from '../types/carioca.types';

const STORAGE_KEYS = {
  ACTIVE_GAME: 'carioca_active_game_v1',
  GAME_HISTORY: 'carioca_game_history_v1',
  SAVED_PLAYERS: 'carioca_saved_players_v1',
};

/**
 * LocalStorage Adapter for Guest & Offline Play
 */
export class LocalStorageCariocaAdapter implements ICariocaStorageAdapter {
  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  async saveCurrentGame(game: CariocaGame): Promise<void> {
    if (!this.isClient()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_GAME, JSON.stringify(game));
    } catch (e) {
      console.error('[LocalStorageCariocaAdapter] Error saving active game:', e);
    }
  }

  async loadCurrentGame(): Promise<CariocaGame | null> {
    if (!this.isClient()) return null;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_GAME);
      return data ? (JSON.parse(data) as CariocaGame) : null;
    } catch (e) {
      console.error('[LocalStorageCariocaAdapter] Error loading active game:', e);
      return null;
    }
  }

  async clearCurrentGame(): Promise<void> {
    if (!this.isClient()) return;
    try {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_GAME);
    } catch (e) {
      console.error('[LocalStorageCariocaAdapter] Error clearing active game:', e);
    }
  }

  async saveGameToHistory(game: CariocaGame): Promise<void> {
    if (!this.isClient()) return;
    try {
      const history = await this.getGameHistory();
      
      // Calculate winner & scores summary
      const playerScores = game.players.map((p) => {
        const totalScore = game.rounds.reduce((sum, r) => {
          const pt = r.scores[p.id];
          return sum + (typeof pt === 'number' ? pt : 0);
        }, 0);
        return {
          id: p.id,
          name: p.name,
          totalScore,
          color: p.color,
        };
      });

      const sortedPlayers = [...playerScores].sort((a, b) => a.totalScore - b.totalScore);
      const winner = sortedPlayers[0];

      const summary: SavedGameSummary = {
        id: game.id,
        name: game.name || `Partida ${new Date(game.createdAt).toLocaleDateString()}`,
        createdAt: game.createdAt,
        completedAt: new Date().toISOString(),
        status: game.status,
        playerCount: game.players.length,
        roundCount: game.rounds.length,
        winnerName: winner?.name,
        winnerScore: winner?.totalScore,
        players: sortedPlayers,
      };

      // Filter out if existing entry with same id
      const updated = [summary, ...history.filter((h) => h.id !== game.id)].slice(0, 30);
      localStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(updated));
    } catch (e) {
      console.error('[LocalStorageCariocaAdapter] Error saving to history:', e);
    }
  }

  async getGameHistory(): Promise<SavedGameSummary[]> {
    if (!this.isClient()) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
      return data ? (JSON.parse(data) as SavedGameSummary[]) : [];
    } catch (e) {
      console.error('[LocalStorageCariocaAdapter] Error reading history:', e);
      return [];
    }
  }

  async deleteGameFromHistory(id: string): Promise<void> {
    if (!this.isClient()) return;
    try {
      const history = await this.getGameHistory();
      const updated = history.filter((g) => g.id !== id);
      localStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(updated));
    } catch (e) {
      console.error('[LocalStorageCariocaAdapter] Error deleting from history:', e);
    }
  }

  async saveSavedPlayers(players: Player[]): Promise<void> {
    if (!this.isClient()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.SAVED_PLAYERS, JSON.stringify(players));
    } catch (e) {
      console.error('[LocalStorageCariocaAdapter] Error saving players:', e);
    }
  }

  async loadSavedPlayers(): Promise<Player[]> {
    if (!this.isClient()) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED_PLAYERS);
      return data ? (JSON.parse(data) as Player[]) : [];
    } catch (e) {
      console.error('[LocalStorageCariocaAdapter] Error loading players:', e);
      return [];
    }
  }
}

/**
 * Api Adapter for Authenticated Cloud Play
 * Ready to be connected to MongoDB / Next.js Server Actions.
 * Fallbacks cleanly to LocalStorage when offline or during transitional state.
 */
export class ApiCariocaAdapter implements ICariocaStorageAdapter {
  private localFallback = new LocalStorageCariocaAdapter();

  async saveCurrentGame(game: CariocaGame): Promise<void> {
    // Save to local cache first for zero-latency UI
    await this.localFallback.saveCurrentGame(game);
    // Ready for API sync:
    // await fetch('/api/carioca/current', { method: 'POST', body: JSON.stringify(game) });
  }

  async loadCurrentGame(): Promise<CariocaGame | null> {
    // Attempt local first, or fetch from cloud
    return this.localFallback.loadCurrentGame();
  }

  async clearCurrentGame(): Promise<void> {
    await this.localFallback.clearCurrentGame();
    // await fetch('/api/carioca/current', { method: 'DELETE' });
  }

  async saveGameToHistory(game: CariocaGame): Promise<void> {
    await this.localFallback.saveGameToHistory(game);
    // await fetch('/api/carioca/history', { method: 'POST', body: JSON.stringify(game) });
  }

  async getGameHistory(): Promise<SavedGameSummary[]> {
    return this.localFallback.getGameHistory();
  }

  async deleteGameFromHistory(id: string): Promise<void> {
    await this.localFallback.deleteGameFromHistory(id);
    // await fetch(`/api/carioca/history/${id}`, { method: 'DELETE' });
  }

  async saveSavedPlayers(players: Player[]): Promise<void> {
    await this.localFallback.saveSavedPlayers(players);
  }

  async loadSavedPlayers(): Promise<Player[]> {
    return this.localFallback.loadSavedPlayers();
  }
}

/**
 * Storage adapter factory
 */
export function createStorageAdapter(mode: StorageMode): ICariocaStorageAdapter {
  if (mode === 'authenticated') {
    return new ApiCariocaAdapter();
  }
  return new LocalStorageCariocaAdapter();
}
