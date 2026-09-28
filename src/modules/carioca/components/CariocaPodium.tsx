'use client';

import React from 'react';
import { CariocaGame, PlayerStats } from '../types/carioca.types';

interface CariocaPodiumProps {
  game: CariocaGame;
  leaderboard: PlayerStats[];
  onRematch: () => void;
  onEditSetup: () => void;
  onNewGame: () => void;
  onViewScoreboard: () => void;
}

export default function CariocaPodium({
  game,
  leaderboard,
  onRematch,
  onEditSetup,
  onNewGame,
  onViewScoreboard,
}: CariocaPodiumProps) {
  const firstPlace = leaderboard[0];
  const secondPlace = leaderboard[1];
  const thirdPlace = leaderboard[2];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20 text-slate-100">
      {/* ========== HERO WINNER CASINO BANNER ========== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-amber-500/25 via-emerald-950 to-teal-950 border-2 border-amber-400/60 p-8 md:p-12 text-center shadow-[0_0_60px_rgba(245,158,11,0.25)] space-y-6">
        {/* Subtle Watermark Suits */}
        <div className="absolute -top-6 -right-6 text-9xl font-black text-amber-500/5 select-none pointer-events-none">
          ♠ ♥ ♦ ♣
        </div>

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/30 border border-amber-400/50 text-amber-300 font-black text-xs uppercase tracking-widest shadow-lg animate-bounce">
            <span>👑 ¡GRAN CAMPEÓN DEL CARIOCA POKER CLUB! 👑</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white">
            ¡Felicitaciones, <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">{firstPlace?.playerName}</span>!
          </h1>

          <p className="text-sm sm:text-base text-emerald-200/90 max-w-lg mx-auto">
            Ha conquistado la mesa de Carioca con <b>{firstPlace?.totalScore} puntos en contra</b> y {firstPlace?.roundsWon} cortes limpios (0 pts).
          </p>
        </div>

        {/* ========== PODIUM STEPS (TOP 3 CASINO CHIPS) ========== */}
        <div className="relative z-10 pt-8 pb-4 flex items-end justify-center gap-3 sm:gap-6 max-w-2xl mx-auto">
          {/* 2nd Place (Silver) */}
          {secondPlace && (
            <div className="flex-1 flex flex-col items-center space-y-2 order-1 animate-slide-up">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-xl ring-2 ring-slate-300"
                style={{ backgroundColor: `${secondPlace.playerColor}35`, border: `2px solid ${secondPlace.playerColor}` }}
              >
                {secondPlace.playerEmoji || '🥈'}
              </div>
              <p className="font-black text-white text-xs sm:text-sm truncate max-w-[100px]">
                {secondPlace.playerName}
              </p>
              <div className="w-full h-28 sm:h-36 rounded-t-2xl bg-gradient-to-t from-slate-400/30 to-slate-400/10 border-t-2 border-x-2 border-slate-400/50 flex flex-col items-center justify-center p-2 shadow-inner">
                <span className="text-2xl sm:text-3xl">🥈</span>
                <span className="font-black text-slate-200 text-xs sm:text-sm uppercase tracking-wider">2° Lugar</span>
                <span className="text-sm sm:text-base font-black text-white mt-1">{secondPlace.totalScore} pts</span>
                <span className="text-[10px] text-rose-400 font-black">+{secondPlace.diffFromLeader} pts</span>
              </div>
            </div>
          )}

          {/* 1st Place (Gold) - Elevated in center */}
          {firstPlace && (
            <div className="flex-1 flex flex-col items-center space-y-2 order-2 -mt-8 animate-slide-up">
              <div className="relative">
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-4xl animate-pulse">👑</span>
                <div
                  className="w-18 h-18 sm:w-22 sm:h-22 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl shadow-2xl ring-4 ring-amber-400/60"
                  style={{ backgroundColor: `${firstPlace.playerColor}45`, border: `3px solid ${firstPlace.playerColor}` }}
                >
                  {firstPlace.playerEmoji || '🥇'}
                </div>
              </div>
              <p className="font-black text-amber-300 text-sm sm:text-base truncate max-w-[120px]">
                {firstPlace.playerName}
              </p>
              <div className="w-full h-36 sm:h-48 rounded-t-2xl bg-gradient-to-t from-amber-500/40 via-amber-500/20 to-amber-500/10 border-t-2 border-x-2 border-amber-400/70 flex flex-col items-center justify-center p-2 shadow-2xl">
                <span className="text-3xl sm:text-4xl">🥇</span>
                <span className="font-black text-amber-300 text-xs sm:text-sm uppercase tracking-wider">1° Campeón</span>
                <span className="text-lg sm:text-2xl font-black text-amber-300 mt-1">{firstPlace.totalScore} pts</span>
                <span className="text-[10px] text-emerald-300 font-black uppercase tracking-wider">Ganador</span>
              </div>
            </div>
          )}

          {/* 3rd Place (Bronze) */}
          {thirdPlace && (
            <div className="flex-1 flex flex-col items-center space-y-2 order-3 animate-slide-up">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-xl ring-2 ring-amber-700"
                style={{ backgroundColor: `${thirdPlace.playerColor}35`, border: `2px solid ${thirdPlace.playerColor}` }}
              >
                {thirdPlace.playerEmoji || '🥉'}
              </div>
              <p className="font-black text-white text-xs sm:text-sm truncate max-w-[100px]">
                {thirdPlace.playerName}
              </p>
              <div className="w-full h-24 sm:h-28 rounded-t-2xl bg-gradient-to-t from-amber-700/30 to-amber-700/10 border-t-2 border-x-2 border-amber-700/50 flex flex-col items-center justify-center p-2 shadow-inner">
                <span className="text-2xl sm:text-3xl">🥉</span>
                <span className="font-black text-amber-500 text-xs sm:text-sm uppercase tracking-wider">3° Lugar</span>
                <span className="text-sm sm:text-base font-black text-white mt-1">{thirdPlace.totalScore} pts</span>
                <span className="text-[10px] text-rose-400 font-black">+{thirdPlace.diffFromLeader} pts</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========== FINAL CASINO TABLE RANKINGS ========== */}
      <section className="bg-emerald-950/80 border-2 border-amber-500/40 rounded-3xl p-6 md:p-8 shadow-2xl space-y-4 backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-emerald-800/80 pb-4">
          <div>
            <h2 className="text-lg font-black text-amber-300 flex items-center gap-2">
              <span>📊</span> Clasificación Oficial ({leaderboard.length} Jugadores)
            </h2>
            <p className="text-xs text-emerald-200/70">
              Estadísticas finales tras {game.rounds.length} rondas de Carioca disputadas.
            </p>
          </div>

          <button
            onClick={onViewScoreboard}
            className="px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 text-xs font-bold border border-amber-500/40 transition-colors cursor-pointer"
          >
            📋 Ver Mesa Completa
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b-2 border-emerald-800 text-xs font-black uppercase tracking-wider text-amber-300/80 bg-emerald-900/60">
                <th className="p-3 text-center w-16">Puesto</th>
                <th className="p-3">Jugador</th>
                <th className="p-3 text-center">Puntaje Total</th>
                <th className="p-3 text-center">Diferencia</th>
                <th className="p-3 text-center">Rondas Ganadas (0 pts)</th>
                <th className="p-3 text-center">Promedio / Ronda</th>
                <th className="p-3 text-center">Mejor Ronda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-800/60 text-xs">
              {leaderboard.map((item) => {
                const isWinner = item.rank === 1;

                return (
                  <tr
                    key={item.playerId}
                    className={`transition-colors ${
                      isWinner ? 'bg-amber-500/15 font-black' : 'hover:bg-emerald-900/40'
                    }`}
                  >
                    {/* Rank */}
                    <td className="p-3 text-center font-black">
                      {item.rank === 1 ? '🥇 1°' : item.rank === 2 ? '🥈 2°' : item.rank === 3 ? '🥉 3°' : `${item.rank}°`}
                    </td>

                    {/* Player Info */}
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 shadow-xs ring-1 ring-amber-400/40"
                          style={{ backgroundColor: `${item.playerColor}35`, border: `1px solid ${item.playerColor}` }}
                        >
                          {item.playerEmoji || '🃏'}
                        </span>
                        <div>
                          <p className="font-black text-white text-sm">{item.playerName}</p>
                        </div>
                      </div>
                    </td>

                    {/* Total Score */}
                    <td className="p-3 text-center">
                      <span className={`text-base font-black ${isWinner ? 'text-amber-300' : 'text-white'}`}>
                        {item.totalScore}
                      </span>
                    </td>

                    {/* Diff */}
                    <td className="p-3 text-center">
                      {item.diffFromLeader === 0 ? (
                        <span className="text-emerald-400 font-black">Líder (0)</span>
                      ) : (
                        <span className="text-rose-400 font-bold">+{item.diffFromLeader}</span>
                      )}
                    </td>

                    {/* Rounds Won */}
                    <td className="p-3 text-center">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-black text-[11px]">
                        {item.roundsWon} {item.roundsWon === 1 ? 'corte' : 'cortes'}
                      </span>
                    </td>

                    {/* Average */}
                    <td className="p-3 text-center text-emerald-200/80 font-bold">
                      {item.averageScore} pts
                    </td>

                    {/* Best Round */}
                    <td className="p-3 text-center text-white font-bold">
                      {item.bestScore} pts
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ========== ACTION BUTTONS FOOTER ========== */}
      <div className="p-6 rounded-3xl bg-emerald-950/80 border-2 border-amber-500/40 shadow-2xl flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEditSetup}
            className="px-4 py-3 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-bold text-xs border border-emerald-700/60 transition-colors cursor-pointer shadow-md"
          >
            ✏️ Editar Jugadores / Rondas
          </button>
          <button
            type="button"
            onClick={onNewGame}
            className="px-4 py-3 rounded-2xl bg-emerald-900 hover:bg-emerald-800 text-amber-300 font-bold text-xs border border-emerald-700/60 transition-colors cursor-pointer shadow-md"
          >
            🏠 Inicio / Reset
          </button>
        </div>

        <button
          type="button"
          onClick={onRematch}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black text-sm shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <span>🔄 Revancha Inmediata en Mesa</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
