'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CariocaGame,
  GameRound,
  GameStatus,
  Player,
  PlayerStats,
  RoundDefinition,
  StorageMode,
} from '../types/carioca.types';
import {
  DEFAULT_CARIOCA_ROUNDS,
  CARIOCA_PRESETS,
  PLAYER_PALETTES,
} from '../services/defaultRounds';
import { useCariocaStorage } from './useCariocaStorage';

interface UseCariocaGameOptions {
  userEmail?: string | null;
  storageMode?: StorageMode;
}

const INITIAL_PLAYERS: Player[] = [
  { id: 'p1', name: 'Jugador 1', color: PLAYER_PALETTES[0].color, avatarEmoji: PLAYER_PALETTES[0].emoji, createdAt: 1 },
  { id: 'p2', name: 'Jugador 2', color: PLAYER_PALETTES[1].color, avatarEmoji: PLAYER_PALETTES[1].emoji, createdAt: 2 },
];

export function useCariocaGame({ userEmail, storageMode = 'guest' }: UseCariocaGameOptions = {}) {
  const {
    mode,
    history,
    savedPlayers,
    isLoading: isStorageLoading,
    saveActiveGame,
    loadActiveGame,
    clearActiveGame,
    archiveGame,
    deleteHistoryGame,
    persistPlayers,
  } = useCariocaStorage({ initialMode: storageMode, userEmail });

  // Default setup state
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);

  const [selectedRounds, setSelectedRounds] = useState<RoundDefinition[]>(DEFAULT_CARIOCA_ROUNDS);
  const [activePresetId, setActivePresetId] = useState<string>('classic-8');

  // Active Game State
  const [game, setGame] = useState<CariocaGame | null>(null);
  const [hasSavedGameToResume, setHasSavedGameToResume] = useState(false);
  const [savedGameDraft, setSavedGameDraft] = useState<CariocaGame | null>(null);

  // Check storage on mount for active game and saved players
  useEffect(() => {
    let isMounted = true;
    async function checkSavedData() {
      const saved = await loadActiveGame();
      if (isMounted) {
        if (saved && saved.status !== 'finished' && saved.players.length >= 2) {
          setHasSavedGameToResume(true);
          setSavedGameDraft(saved);
        }
        if (savedPlayers.length >= 2 && !saved) {
          setPlayers(savedPlayers);
        }
      }
    }
    if (!isStorageLoading) {
      checkSavedData();
    }
    return () => {
      isMounted = false;
    };
  }, [isStorageLoading, loadActiveGame, savedPlayers]);

  // Persist game state whenever game object changes
  useEffect(() => {
    if (game) {
      saveActiveGame(game);
    }
  }, [game, saveActiveGame]);

  /* =========================================================
     SETUP ACTIONS
     ========================================================= */

  const addPlayer = useCallback((name: string, color?: string, emoji?: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;

    setPlayers((prev) => {
      const index = prev.length % PLAYER_PALETTES.length;
      const defaultPalette = PLAYER_PALETTES[index];
      const newPlayer: Player = {
        id: `player_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: trimmed,
        color: color || defaultPalette.color,
        avatarEmoji: emoji || defaultPalette.emoji,
        createdAt: Date.now(),
      };
      const updated = [...prev, newPlayer];
      persistPlayers(updated);
      return updated;
    });
  }, [persistPlayers]);

  const removePlayer = useCallback((playerId: string) => {
    setPlayers((prev) => {
      if (prev.length <= 2) return prev; // Keep minimum 2
      const updated = prev.filter((p) => p.id !== playerId);
      persistPlayers(updated);
      return updated;
    });
  }, [persistPlayers]);

  const updatePlayer = useCallback((playerId: string, updates: Partial<Player>) => {
    setPlayers((prev) => {
      const updated = prev.map((p) => (p.id === playerId ? { ...p, ...updates } : p));
      persistPlayers(updated);
      return updated;
    });
  }, [persistPlayers]);

  const applyPreset = useCallback((presetId: string) => {
    const preset = CARIOCA_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setActivePresetId(presetId);
    const filtered = DEFAULT_CARIOCA_ROUNDS.filter((r) => preset.roundIds.includes(r.id));
    setSelectedRounds(filtered);
  }, []);

  const toggleRound = useCallback((roundId: string) => {
    setActivePresetId('custom');
    setSelectedRounds((prev) => {
      const exists = prev.some((r) => r.id === roundId);
      if (exists) {
        if (prev.length <= 1) return prev; // keep at least 1 round
        return prev.filter((r) => r.id !== roundId);
      } else {
        const original = DEFAULT_CARIOCA_ROUNDS.find((r) => r.id === roundId);
        if (!original) return prev;
        // insert back maintaining order
        const updated = [...prev, original].sort((a, b) => a.orderNumber - b.orderNumber);
        return updated;
      }
    });
  }, []);

  const moveRound = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex < 0 || toIndex < 0) return;
    setActivePresetId('custom');
    setSelectedRounds((prev) => {
      if (toIndex >= prev.length) return prev;
      const list = [...prev];
      const [moved] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, moved);
      return list;
    });
  }, []);

  const removeRoundByIndex = useCallback((index: number) => {
    setActivePresetId('custom');
    setSelectedRounds((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const addCustomRound = useCallback((round: Omit<RoundDefinition, 'id' | 'orderNumber'>) => {
    setActivePresetId('custom');
    const newRound: RoundDefinition = {
      ...round,
      id: `custom_round_${Date.now()}`,
      orderNumber: 99,
      isCustom: true,
    };
    setSelectedRounds((prev) => [...prev, newRound]);
  }, []);

  const resetSetupToDefault = useCallback(() => {
    setSelectedRounds(DEFAULT_CARIOCA_ROUNDS);
    setActivePresetId('classic-8');
  }, []);

  /* =========================================================
     GAME LIFECYCLE ACTIONS
     ========================================================= */

  const startGame = useCallback((gameTitle?: string) => {
    if (players.length < 2 || selectedRounds.length === 0) return;

    const gameRounds: GameRound[] = selectedRounds.map((def, idx) => {
      const initialScores: Record<string, number | null> = {};
      players.forEach((p) => {
        initialScores[p.id] = null;
      });

      return {
        id: `gameround_${idx + 1}_${def.id}`,
        roundIndex: idx,
        definition: {
          ...def,
          orderNumber: idx + 1,
        },
        scores: initialScores,
        isCompleted: false,
        winnerPlayerId: null,
      };
    });

    const newGame: CariocaGame = {
      id: `game_${Date.now()}`,
      name: gameTitle?.trim() || `Partida Carioca (${players.length} jugadores)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'playing',
      players: [...players],
      rounds: gameRounds,
      currentRoundIndex: 0,
      winnerId: null,
      storageMode: mode,
    };

    setGame(newGame);
    setHasSavedGameToResume(false);
    setSavedGameDraft(null);
    saveActiveGame(newGame);
  }, [players, selectedRounds, mode, saveActiveGame]);

  const resumeSavedGame = useCallback(() => {
    if (savedGameDraft) {
      setGame(savedGameDraft);
      setHasSavedGameToResume(false);
    }
  }, [savedGameDraft]);

  const discardSavedGame = useCallback(async () => {
    await clearActiveGame();
    setHasSavedGameToResume(false);
    setSavedGameDraft(null);
  }, [clearActiveGame]);

  /* =========================================================
     SCOREBOARD ACTIONS
     ========================================================= */

  const setPlayerScore = useCallback((roundIndex: number, playerId: string, value: number | null) => {
    setGame((prev) => {
      if (!prev) return null;
      if (roundIndex < 0 || roundIndex >= prev.rounds.length) return prev;

      const targetRound = prev.rounds[roundIndex];
      const validValue = value !== null ? Math.max(0, Math.floor(value)) : null;

      const updatedScores = {
        ...targetRound.scores,
        [playerId]: validValue,
      };

      // Auto detect winner in round if score is 0
      let winnerPlayerId = targetRound.winnerPlayerId;
      if (validValue === 0) {
        winnerPlayerId = playerId;
      } else if (winnerPlayerId === playerId && validValue !== 0) {
        // Find if someone else has 0
        const zeroPlayer = Object.entries(updatedScores).find(([, pts]) => pts === 0);
        winnerPlayerId = zeroPlayer ? zeroPlayer[0] : null;
      }

      // Check if all players have a score
      const isComplete = prev.players.every((p) => typeof updatedScores[p.id] === 'number');

      const updatedRounds = prev.rounds.map((r, idx) =>
        idx === roundIndex
          ? {
              ...r,
              scores: updatedScores,
              isCompleted: isComplete,
              completedAt: isComplete ? new Date().toISOString() : r.completedAt,
              winnerPlayerId,
            }
          : r
      );

      return {
        ...prev,
        rounds: updatedRounds,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const setQuickZero = useCallback((roundIndex: number, playerId: string) => {
    setPlayerScore(roundIndex, playerId, 0);
  }, [setPlayerScore]);

  const setCurrentRoundIndex = useCallback((index: number) => {
    setGame((prev) => {
      if (!prev) return null;
      if (index < 0 || index >= prev.rounds.length) return prev;
      return { ...prev, currentRoundIndex: index };
    });
  }, []);

  const nextRound = useCallback(() => {
    setGame((prev) => {
      if (!prev) return null;
      const nextIdx = prev.currentRoundIndex + 1;
      if (nextIdx < prev.rounds.length) {
        return { ...prev, currentRoundIndex: nextIdx };
      }
      return prev;
    });
  }, []);

  const prevRound = useCallback(() => {
    setGame((prev) => {
      if (!prev) return null;
      const prevIdx = prev.currentRoundIndex - 1;
      if (prevIdx >= 0) {
        return { ...prev, currentRoundIndex: prevIdx };
      }
      return prev;
    });
  }, []);

  const finishGame = useCallback(() => {
    setGame((prev) => {
      if (!prev) return null;

      // Calculate totals to find winner (lowest score)
      const playerTotals = prev.players.map((p) => {
        const total = prev.rounds.reduce((sum, r) => {
          const pt = r.scores[p.id];
          return sum + (typeof pt === 'number' ? pt : 0);
        }, 0);
        return { playerId: p.id, total };
      });

      playerTotals.sort((a, b) => a.total - b.total);
      const winnerId = playerTotals[0]?.playerId || null;

      const finishedGame: CariocaGame = {
        ...prev,
        status: 'finished',
        winnerId,
        updatedAt: new Date().toISOString(),
      };

      // Archive in history
      archiveGame(finishedGame);
      return finishedGame;
    });
  }, [archiveGame]);

  const rematchGame = useCallback(() => {
    if (!game) return;
    // Start game with same players and rounds
    const currentRoundsDefs = game.rounds.map((r) => r.definition);
    setSelectedRounds(currentRoundsDefs);
    setPlayers(game.players);
    startGame(`${game.name} (Revancha)`);
  }, [game, startGame]);

  const newGameFromScratch = useCallback(async () => {
    await clearActiveGame();
    setGame(null);
    setHasSavedGameToResume(false);
  }, [clearActiveGame]);

  /* =========================================================
     COMPUTED STATS & REALTIME LEADERBOARD
     ========================================================= */

  const leaderboard: PlayerStats[] = useMemo(() => {
    if (!game) {
      // Fallback for setup view
      return players.map((p, idx) => ({
        playerId: p.id,
        playerName: p.name,
        playerColor: p.color,
        playerEmoji: p.avatarEmoji,
        totalScore: 0,
        rank: idx + 1,
        diffFromLeader: 0,
        roundsWon: 0,
        averageScore: 0,
        bestScore: 0,
        worstScore: 0,
        scoreProgression: [],
      }));
    }

    const stats: PlayerStats[] = game.players.map((p) => {
      let totalScore = 0;
      let roundsWon = 0;
      let validRoundCount = 0;
      let bestScore = Infinity;
      let worstScore = -Infinity;
      const progression: number[] = [];

      let runningTotal = 0;
      game.rounds.forEach((round) => {
        const score = round.scores[p.id];
        if (typeof score === 'number') {
          totalScore += score;
          runningTotal += score;
          progression.push(runningTotal);
          validRoundCount += 1;
          if (score === 0) roundsWon += 1;
          if (score < bestScore) bestScore = score;
          if (score > worstScore) worstScore = score;
        }
      });

      return {
        playerId: p.id,
        playerName: p.name,
        playerColor: p.color,
        playerEmoji: p.avatarEmoji,
        totalScore,
        rank: 1,
        diffFromLeader: 0,
        roundsWon,
        averageScore: validRoundCount > 0 ? Math.round((totalScore / validRoundCount) * 10) / 10 : 0,
        bestScore: bestScore === Infinity ? 0 : bestScore,
        worstScore: worstScore === -Infinity ? 0 : worstScore,
        scoreProgression: progression,
      };
    });

    // Sort ascending by totalScore (lowest score wins in Carioca)
    stats.sort((a, b) => {
      if (a.totalScore !== b.totalScore) {
        return a.totalScore - b.totalScore;
      }
      // Tie breaker: more rounds won
      return b.roundsWon - a.roundsWon;
    });

    const leaderScore = stats[0]?.totalScore ?? 0;

    // Assign rank and diffFromLeader
    return stats.map((s, idx) => ({
      ...s,
      rank: idx + 1,
      diffFromLeader: s.totalScore - leaderScore,
    }));
  }, [game, players]);

  const leader = leaderboard.length > 0 ? leaderboard[0] : null;

  const activeRound: GameRound | null = useMemo(() => {
    if (!game || game.currentRoundIndex < 0 || game.currentRoundIndex >= game.rounds.length) {
      return null;
    }
    return game.rounds[game.currentRoundIndex];
  }, [game]);

  const isCurrentRoundComplete = useMemo(() => {
    if (!activeRound || !game) return false;
    return game.players.every((p) => typeof activeRound.scores[p.id] === 'number');
  }, [activeRound, game]);

  const allRoundsCompleted = useMemo(() => {
    if (!game) return false;
    return game.rounds.every((r) => r.isCompleted);
  }, [game]);

  return {
    // Mode & Storage
    storageMode: mode,
    history,
    savedPlayers,
    isStorageLoading,
    deleteHistoryGame,

    // Setup State
    players,
    selectedRounds,
    activePresetId,
    allAvailablePresets: CARIOCA_PRESETS,
    allStandardRounds: DEFAULT_CARIOCA_ROUNDS,
    hasSavedGameToResume,
    savedGameDraft,

    // Setup Modifiers
    addPlayer,
    removePlayer,
    updatePlayer,
    applyPreset,
    toggleRound,
    moveRound,
    removeRoundByIndex,
    addCustomRound,
    resetSetupToDefault,

    // Game State
    game,
    status: game ? game.status : ('setup' as GameStatus),
    currentRoundIndex: game ? game.currentRoundIndex : 0,
    activeRound,
    isCurrentRoundComplete,
    allRoundsCompleted,
    leaderboard,
    leader,

    // Game Operations
    startGame,
    resumeSavedGame,
    discardSavedGame,
    setPlayerScore,
    setQuickZero,
    setCurrentRoundIndex,
    nextRound,
    prevRound,
    finishGame,
    rematchGame,
    newGameFromScratch,
  };
}
