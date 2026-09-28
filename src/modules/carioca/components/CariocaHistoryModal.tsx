'use client';

import React from 'react';
import { SavedGameSummary } from '../types/carioca.types';

interface CariocaHistoryModalProps {
  isOpen: boolean;
  history: SavedGameSummary[];
  onClose: () => void;
  onDeleteGame: (id: string) => void;
}

export default function CariocaHistoryModal({
  isOpen,
  history,
  onClose,
  onDeleteGame,
}: CariocaHistoryModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in text-slate-100">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-emerald-950/95 border-2 border-amber-500/40 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-amber-500/30 bg-gradient-to-r from-amber-500/20 via-emerald-900 to-amber-500/10">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🏆</span>
            <div>
              <h2 className="text-lg font-black text-amber-300">Historial del Club de Carioca</h2>
              <p className="text-xs text-emerald-200/70">Partidas finalizadas guardadas en este dispositivo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-emerald-900 hover:bg-emerald-800 text-amber-300 flex items-center justify-center transition-colors text-sm font-bold border border-amber-500/30 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="text-5xl opacity-40">🂠</div>
              <p className="text-sm font-black text-white">No hay partidas registradas en la mesa aún</p>
              <p className="text-xs text-emerald-200/70 max-w-xs mx-auto">
                Completa tu primera partida de Carioca y el resumen quedará guardado automáticamente aquí.
              </p>
            </div>
          ) : (
            history.map((game) => (
              <div
                key={game.id}
                className="p-4 rounded-2xl bg-emerald-900/50 border border-emerald-700/60 hover:border-amber-500/50 transition-all space-y-3 shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black text-white text-sm flex items-center gap-2">
                      <span>{game.name}</span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                        Finalizada
                      </span>
                    </h3>
                    <p className="text-[11px] text-emerald-200/70 mt-0.5">
                      {new Date(game.createdAt).toLocaleDateString('es-CL', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' • '}
                      {game.playerCount} Jugadores • {game.roundCount} Rondas
                    </p>
                  </div>

                  <button
                    onClick={() => onDeleteGame(game.id)}
                    className="p-1.5 rounded-lg text-emerald-400 hover:text-rose-400 hover:bg-rose-900/40 transition-colors text-xs cursor-pointer"
                    title="Eliminar partida"
                  >
                    🗑️
                  </button>
                </div>

                {/* Winner Callout */}
                {game.winnerName && (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-xs">
                    <span className="text-xl">👑</span>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] uppercase font-black text-amber-400 block leading-none">
                        Campeón
                      </span>
                      <span className="font-black text-white truncate">
                        {game.winnerName}
                      </span>
                    </div>
                    <span className="font-black text-amber-300 text-sm">
                      {game.winnerScore} pts
                    </span>
                  </div>
                )}

                {/* Score Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {game.players.map((p, idx) => (
                    <div
                      key={p.id || idx}
                      className="px-2.5 py-1 rounded-xl bg-emerald-950 border border-emerald-700/60 text-[11px] flex items-center gap-1.5 font-bold"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-white/20"
                        style={{ backgroundColor: p.color || '#f59e0b' }}
                      />
                      <span className="text-emerald-200 font-semibold">{p.name}:</span>
                      <span className="font-black text-white">{p.totalScore} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-amber-500/30 flex justify-end bg-emerald-900/60">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-bold text-xs border border-emerald-700/60 transition-colors cursor-pointer"
          >
            Cerrar Historial
          </button>
        </div>
      </div>
    </div>
  );
}
