'use client';

import React, { useState } from 'react';
import { CariocaGame, GameRound, Player, PlayerStats } from '../types/carioca.types';
import CardScoreCalculatorModal from './CardScoreCalculatorModal';

interface CariocaScoreboardProps {
  game: CariocaGame;
  leaderboard: PlayerStats[];
  leader: PlayerStats | null;
  currentRoundIndex: number;
  activeRound: GameRound | null;
  allRoundsCompleted: boolean;
  onSetPlayerScore: (roundIndex: number, playerId: string, value: number | null) => void;
  onSetQuickZero: (roundIndex: number, playerId: string) => void;
  onSetCurrentRoundIndex: (index: number) => void;
  onNextRound: () => void;
  onPrevRound: () => void;
  onFinishGame: () => void;
  onNewGame: () => void;
}

export default function CariocaScoreboard({
  game,
  leaderboard,
  leader,
  currentRoundIndex,
  activeRound,
  allRoundsCompleted,
  onSetPlayerScore,
  onSetQuickZero,
  onSetCurrentRoundIndex,
  onNextRound,
  onPrevRound,
  onFinishGame,
  onNewGame,
}: CariocaScoreboardProps) {
  // Mobile tab view mode: 'matrix' or 'active-round'
  const [viewMode, setViewMode] = useState<'matrix' | 'active-round'>('matrix');

  // Calculator modal state
  const [calcTarget, setCalcTarget] = useState<{
    player: Player;
    round: GameRound;
    roundIndex: number;
  } | null>(null);

  // Map of player stats by id for quick lookup
  const statsMap = React.useMemo(() => {
    const map = new Map<string, PlayerStats>();
    leaderboard.forEach((s) => map.set(s.playerId, s));
    return map;
  }, [leaderboard]);

  const isLastRound = currentRoundIndex === game.rounds.length - 1;

  const handleOpenCalculator = (player: Player, round: GameRound, roundIndex: number) => {
    setCalcTarget({ player, round, roundIndex });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in pb-20 text-slate-100">
      {/* ========== TOP CASINO BANNER: ACTIVE ROUND + LEADER CAPSULE ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Active Round Card */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-emerald-950/80 border-2 border-amber-500/40 shadow-xl flex flex-col justify-between gap-4 backdrop-blur-md relative overflow-hidden">
          {/* Subtle Watermark Suits */}
          <div className="absolute -right-4 -bottom-6 text-7xl font-black text-amber-500/5 select-none pointer-events-none">
            ♠ ♥ ♦ ♣
          </div>

          <div className="relative z-10 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider">
                <span>♠️ Ronda {currentRoundIndex + 1} de {game.rounds.length}</span>
                {activeRound?.isCompleted && (
                  <span className="text-emerald-400 font-bold">• Completa ✅</span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {activeRound?.definition.name}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-200/80">
                {activeRound?.definition.description}
              </p>
            </div>

            <span className="px-3.5 py-1.5 rounded-2xl bg-emerald-900/90 border border-amber-400/40 text-xs font-black text-amber-300 shrink-0 shadow-md">
              🂠 {activeRound?.definition.requiredCards} Cartas
            </span>
          </div>

          {/* Quick Round Navigation Bar */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-emerald-800/80">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
              {game.rounds.map((r, idx) => {
                const isActive = idx === currentRoundIndex;
                const isComplete = r.isCompleted;

                return (
                  <button
                    key={r.id}
                    onClick={() => onSetCurrentRoundIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-emerald-950 shadow-lg shadow-amber-500/30 scale-105 border border-amber-300'
                        : isComplete
                        ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-600/50'
                        : 'bg-emerald-950/60 text-emerald-400/60 hover:text-white border border-emerald-800'
                    }`}
                  >
                    R{idx + 1} {isComplete && '✓'}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onPrevRound}
                disabled={currentRoundIndex === 0}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 disabled:opacity-30 border border-emerald-700/60 text-xs font-bold text-amber-300 transition-colors cursor-pointer"
              >
                ← Anterior
              </button>
              <button
                onClick={onNextRound}
                disabled={isLastRound}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 disabled:opacity-30 border border-emerald-700/60 text-xs font-bold text-amber-300 transition-colors cursor-pointer"
              >
                Siguiente →
              </button>
            </div>
          </div>
        </div>

        {/* Live Leader Capsule */}
        <div className="p-5 rounded-3xl bg-emerald-950/80 border-2 border-amber-500/40 shadow-xl flex flex-col justify-between gap-3 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <span>👑</span> Rey de la Mesa
            </h3>
            <span className="text-[11px] text-emerald-300/70 font-semibold">
              (Menor Puntaje = Mejor)
            </span>
          </div>

          {leader ? (
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-amber-500/15 border-2 border-amber-400/50 shadow-lg">
              <div
                className="w-13 h-13 rounded-2xl flex items-center justify-center text-3xl shadow-md shrink-0 ring-2 ring-amber-300"
                style={{ backgroundColor: `${leader.playerColor}35`, border: `2px solid ${leader.playerColor}` }}
              >
                {leader.playerEmoji || '👑'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold text-sm">🥇 1°</span>
                  <p className="font-black text-white text-base truncate">
                    {leader.playerName}
                  </p>
                </div>
                <p className="text-[11px] text-emerald-200/80 font-bold">
                  {leader.roundsWon} {leader.roundsWon === 1 ? 'corte limpio' : 'cortes limpios'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl sm:text-3xl font-black text-amber-300 leading-none">
                  {leader.totalScore}
                </p>
                <p className="text-[10px] uppercase font-black text-amber-400/80 mt-0.5">
                  Puntos
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-emerald-200/70">Ingresa puntos para ver al líder.</p>
          )}

          {/* Quick ranking chips preview */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {leaderboard.slice(0, 4).map((item) => (
              <div
                key={item.playerId}
                className="px-2.5 py-1 rounded-xl bg-emerald-900/60 border border-emerald-700/60 text-[11px] flex items-center gap-1.5"
              >
                <span className="font-bold text-amber-400">{item.rank}°</span>
                <span className="font-bold text-white truncate max-w-[70px]">{item.playerName}:</span>
                <span className="font-black text-amber-300">{item.totalScore}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========== VIEW TOGGLE (MOBILE HELPER) ========== */}
      <div className="flex sm:hidden items-center justify-center gap-2 p-1 bg-emerald-950/80 rounded-2xl border border-amber-500/30 max-w-xs mx-auto shadow-md">
        <button
          onClick={() => setViewMode('matrix')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
            viewMode === 'matrix'
              ? 'bg-amber-500 text-emerald-950 shadow-md'
              : 'text-emerald-200/70'
          }`}
        >
          📊 Mesa Completa
        </button>
        <button
          onClick={() => setViewMode('active-round')}
          className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
            viewMode === 'active-round'
              ? 'bg-amber-500 text-emerald-950 shadow-md'
              : 'text-emerald-200/70'
          }`}
        >
          ✍️ Ingreso Rápido
        </button>
      </div>

      {/* ========== MOBILE FAST SCORER VIEW (WHEN ACTIVE) ========== */}
      {viewMode === 'active-round' && activeRound && (
        <div className="sm:hidden space-y-4 bg-emerald-950/80 border-2 border-amber-500/40 rounded-3xl p-5 shadow-xl animate-fade-in">
          <div className="border-b border-emerald-800/80 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-black text-amber-300 text-sm">
                Puntajes: {activeRound.definition.name}
              </h3>
              <p className="text-xs text-emerald-200/70">
                Toca &quot;0 (Corte)&quot;, usa la calculadora 🧮 o escribe los puntos.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {game.players.map((player) => {
              const currentVal = activeRound.scores[player.id];
              const isZero = currentVal === 0;

              return (
                <div
                  key={player.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isZero
                      ? 'bg-emerald-800/60 border-emerald-400 shadow-md'
                      : 'bg-emerald-900/50 border-emerald-700/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 shadow-md"
                      style={{ backgroundColor: `${player.color}35`, border: `2px solid ${player.color}` }}
                    >
                      {player.avatarEmoji || '🃏'}
                    </span>
                    <div className="min-w-0">
                      <p className="font-black text-white text-sm truncate">{player.name}</p>
                      <p className="text-[11px] text-amber-300/80 font-bold">
                        Acumulado: {statsMap.get(player.id)?.totalScore ?? 0} pts
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Calculator Modal Trigger */}
                    <button
                      type="button"
                      onClick={() => handleOpenCalculator(player, activeRound, currentRoundIndex)}
                      className="p-2 rounded-xl bg-emerald-950 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
                      title="Calculadora de cartas en mano"
                    >
                      🧮
                    </button>

                    {/* Quick Zero */}
                    <button
                      type="button"
                      onClick={() => onSetQuickZero(currentRoundIndex, player.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        isZero
                          ? 'bg-emerald-500 text-white shadow-md'
                          : 'bg-emerald-950 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-800'
                      }`}
                    >
                      0 (Corte)
                    </button>

                    <input
                      type="number"
                      min="0"
                      value={currentVal === null || currentVal === undefined ? '' : currentVal}
                      onChange={(e) => {
                        const val = e.target.value === '' ? null : parseInt(e.target.value, 10);
                        onSetPlayerScore(currentRoundIndex, player.id, isNaN(val as number) ? null : val);
                      }}
                      placeholder="Pts"
                      className="w-16 px-2.5 py-1.5 rounded-xl bg-emerald-950 border border-amber-500/40 text-sm font-black text-center text-amber-300 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========== MAIN SCOREBOARD MATRIX (DESKTOP / DEFAULT CASINO TABLE) ========== */}
      {(viewMode === 'matrix' || typeof window === 'undefined') && (
        <div className="bg-emerald-950/80 border-2 border-amber-500/40 rounded-3xl shadow-[0_10px_50px_rgba(0,0,0,0.7)] overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              {/* TABLE HEADER: CASINO SEATS */}
              <thead>
                <tr className="border-b-2 border-amber-500/40 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950">
                  <th className="p-4 text-xs font-black uppercase tracking-widest text-amber-300 min-w-[220px] sticky left-0 bg-emerald-950 z-10 border-r border-amber-500/30">
                    ♠️ Rondas Carioca
                  </th>
                  {game.players.map((player) => {
                    const stats = statsMap.get(player.id);
                    const isFirstPlace = stats?.rank === 1;

                    return (
                      <th
                        key={player.id}
                        className={`p-4 text-center min-w-[140px] border-l border-emerald-800/80 transition-colors ${
                          isFirstPlace ? 'bg-amber-500/10' : ''
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          {/* Rank Ribbon */}
                          <div>
                            {isFirstPlace ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-emerald-950 font-black text-[10px] shadow-md flex items-center gap-1">
                                👑 1° Líder
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-900/80 border border-amber-500/30 text-amber-300 font-bold text-[10px]">
                                {stats?.rank}° Puesto
                              </span>
                            )}
                          </div>

                          {/* Player Chip & Name */}
                          <div className="flex items-center gap-1.5 mt-1">
                            <span
                              className="w-7 h-7 rounded-xl flex items-center justify-center text-xs shrink-0 shadow-md ring-1 ring-amber-400/40"
                              style={{ backgroundColor: `${player.color}35`, border: `1.5px solid ${player.color}` }}
                            >
                              {player.avatarEmoji || '🃏'}
                            </span>
                            <span className="font-black text-white text-sm truncate max-w-[110px]">
                              {player.name}
                            </span>
                          </div>

                          {/* Cumulative Live Points */}
                          <div className="mt-1 flex items-baseline gap-1">
                            <span className="text-2xl font-black text-amber-300">
                              {stats?.totalScore ?? 0}
                            </span>
                            <span className="text-[10px] text-amber-300/70 font-black uppercase">
                              pts
                            </span>
                          </div>

                          {/* Diff from leader */}
                          {stats && stats.diffFromLeader > 0 && (
                            <span className="text-[10px] font-black text-rose-400">
                              +{stats.diffFromLeader}
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* TABLE BODY: ROUNDS ROWS */}
              <tbody className="divide-y divide-emerald-800/60 text-sm">
                {game.rounds.map((round, rIdx) => {
                  const isActive = rIdx === currentRoundIndex;
                  const isCompleted = round.isCompleted;

                  return (
                    <tr
                      key={round.id}
                      className={`transition-colors ${
                        isActive
                          ? 'bg-amber-500/15 font-bold'
                          : isCompleted
                          ? 'hover:bg-emerald-900/40'
                          : 'opacity-75 hover:opacity-100'
                      }`}
                    >
                      {/* Round Name Cell */}
                      <td
                        onClick={() => onSetCurrentRoundIndex(rIdx)}
                        className={`p-3.5 sticky left-0 z-10 cursor-pointer border-r border-amber-500/30 transition-colors ${
                          isActive
                            ? 'bg-emerald-900 text-white'
                            : 'bg-emerald-950 hover:bg-emerald-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                              isActive
                                ? 'bg-amber-500 text-emerald-950 shadow-md'
                                : isCompleted
                                ? 'bg-emerald-800 text-emerald-300 border border-emerald-600/50'
                                : 'bg-emerald-900/60 text-emerald-400/60'
                            }`}
                          >
                            {rIdx + 1}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-white text-xs truncate">
                                {round.definition.name}
                              </span>
                              {isActive && (
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                              )}
                            </div>
                            <span className="text-[11px] text-emerald-300/70 font-semibold block">
                              🂠 {round.definition.requiredCards} cartas
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Player Score Cells */}
                      {game.players.map((player) => {
                        const scoreVal = round.scores[player.id];
                        const isWinner = scoreVal === 0;

                        return (
                          <td
                            key={player.id}
                            className={`p-2.5 text-center border-l border-emerald-800/60 ${
                              isWinner ? 'bg-emerald-800/40' : ''
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Direct Number Input */}
                              <input
                                type="number"
                                min="0"
                                value={scoreVal === null || scoreVal === undefined ? '' : scoreVal}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? null : parseInt(e.target.value, 10);
                                  onSetPlayerScore(rIdx, player.id, isNaN(val as number) ? null : val);
                                }}
                                placeholder="-"
                                className={`w-14 px-2 py-1.5 rounded-xl border text-center font-black text-sm focus:outline-none transition-all ${
                                  isWinner
                                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                                    : typeof scoreVal === 'number'
                                    ? 'bg-emerald-950 text-amber-300 border-amber-500/50'
                                    : 'bg-emerald-900/40 text-emerald-200/50 border-emerald-700/60 focus:border-amber-400'
                                }`}
                              />

                              {/* Card Calculator Modal Trigger */}
                              <button
                                type="button"
                                onClick={() => handleOpenCalculator(player, round, rIdx)}
                                className="p-1.5 rounded-lg bg-emerald-900 hover:bg-amber-500/20 text-amber-300 border border-emerald-700 hover:border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
                                title="Abrir calculadora de cartas en mano"
                              >
                                🧮
                              </button>

                              {/* Quick 0 / Corte Chip */}
                              <button
                                type="button"
                                onClick={() => onSetQuickZero(rIdx, player.id)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer ${
                                  isWinner
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-emerald-950 hover:bg-emerald-800 text-emerald-300 border border-emerald-700/60'
                                }`}
                                title="Marcar 0 puntos (Ganó la ronda / Corte limpio)"
                              >
                                0
                              </button>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>

              {/* TABLE FOOTER: FINAL TOTALS */}
              <tfoot>
                <tr className="border-t-2 border-amber-500/50 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 font-black">
                  <td className="p-4 text-xs font-black uppercase tracking-widest text-amber-300 sticky left-0 bg-emerald-950 z-10 border-r border-amber-500/30">
                    🏆 Puntaje Total
                  </td>
                  {game.players.map((player) => {
                    const stats = statsMap.get(player.id);
                    const isWinner = leader?.playerId === player.id;

                    return (
                      <td key={player.id} className="p-4 text-center border-l border-emerald-800/80">
                        <div className="flex flex-col items-center">
                          <span
                            className={`text-2xl font-black ${
                              isWinner ? 'text-amber-300 scale-110' : 'text-white'
                            }`}
                          >
                            {stats?.totalScore ?? 0}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-300/80">
                            {stats?.roundsWon ?? 0} cortes
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ========== BOTTOM ACTION BAR ========== */}
      <div className="p-5 rounded-3xl bg-emerald-950/80 border-2 border-amber-500/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNewGame}
            className="px-4 py-3 rounded-2xl bg-emerald-900/80 hover:bg-emerald-800 text-amber-300 text-xs font-black border border-emerald-700/60 transition-colors cursor-pointer shadow-md"
          >
            ← Ajustar Partida
          </button>
          <span className="text-xs text-emerald-300/70 font-semibold hidden md:inline">
            Todos los puntajes se guardan automáticamente en la mesa.
          </span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Next Round CTA */}
          {!isLastRound && (
            <button
              type="button"
              onClick={onNextRound}
              className="flex-1 sm:flex-none px-6 py-3.5 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-black text-xs border border-amber-500/40 shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Avanzar a Ronda {currentRoundIndex + 2}</span>
              <span>→</span>
            </button>
          )}

          {/* Finish Game CTA */}
          <button
            type="button"
            onClick={onFinishGame}
            className={`flex-1 sm:flex-none px-7 py-3.5 rounded-2xl font-black text-xs shadow-2xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              allRoundsCompleted
                ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 shadow-[0_0_30px_rgba(245,158,11,0.5)] scale-105 animate-pulse'
                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
            }`}
          >
            <span>🏆 Finalizar y Ver Podio</span>
          </button>
        </div>
      </div>

      {/* Card Score Calculator Modal */}
      {calcTarget && (
        <CardScoreCalculatorModal
          isOpen={Boolean(calcTarget)}
          player={calcTarget.player}
          round={calcTarget.round}
          currentScore={calcTarget.round.scores[calcTarget.player.id]}
          onClose={() => setCalcTarget(null)}
          onApplyScore={(pts) => {
            onSetPlayerScore(calcTarget.roundIndex, calcTarget.player.id, pts);
            setCalcTarget(null);
          }}
        />
      )}
    </div>
  );
}
