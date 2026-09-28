'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CariocaGame,
  ICariocaStorageAdapter,
  Player,
  SavedGameSummary,
  StorageMode,
} from '../types/carioca.types';
import { createStorageAdapter } from '../services/storageAdapter';

interface UseCariocaStorageProps {
  initialMode?: StorageMode;
  userEmail?: string | null;
}

export function useCariocaStorage({ initialMode = 'guest', userEmail }: UseCariocaStorageProps = {}) {
  const mode: StorageMode = userEmail ? 'authenticated' : initialMode;
  const adapter: ICariocaStorageAdapter = useMemo(() => createStorageAdapter(mode), [mode]);

  const [history, setHistory] = useState<SavedGameSummary[]>([]);
  const [savedPlayers, setSavedPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial history and saved players
  const refreshStorageData = useCallback(async () => {
    try {
      const [historyList, playersList] = await Promise.all([
        adapter.getGameHistory(),
        adapter.loadSavedPlayers(),
      ]);
      setHistory(historyList);
      setSavedPlayers(playersList);
    } catch (err) {
      console.error('[useCariocaStorage] Error loading storage data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [adapter]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [historyList, playersList] = await Promise.all([
          adapter.getGameHistory(),
          adapter.loadSavedPlayers(),
        ]);
        if (isMounted) {
          setHistory(historyList);
          setSavedPlayers(playersList);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('[useCariocaStorage] Error loading storage data:', err);
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [adapter]);

  const saveActiveGame = useCallback(
    async (game: CariocaGame) => {
      await adapter.saveCurrentGame(game);
    },
    [adapter]
  );

  const loadActiveGame = useCallback(async (): Promise<CariocaGame | null> => {
    return adapter.loadCurrentGame();
  }, [adapter]);

  const clearActiveGame = useCallback(async () => {
    await adapter.clearCurrentGame();
  }, [adapter]);

  const archiveGame = useCallback(
    async (game: CariocaGame) => {
      await adapter.saveGameToHistory(game);
      await refreshStorageData();
    },
    [adapter, refreshStorageData]
  );

  const deleteHistoryGame = useCallback(
    async (id: string) => {
      await adapter.deleteGameFromHistory(id);
      await refreshStorageData();
    },
    [adapter, refreshStorageData]
  );

  const persistPlayers = useCallback(
    async (players: Player[]) => {
      await adapter.saveSavedPlayers(players);
      setSavedPlayers(players);
    },
    [adapter]
  );

  return {
    mode,
    adapter,
    history,
    savedPlayers,
    isLoading,
    saveActiveGame,
    loadActiveGame,
    clearActiveGame,
    archiveGame,
    deleteHistoryGame,
    persistPlayers,
    refreshStorageData,
  };
}
