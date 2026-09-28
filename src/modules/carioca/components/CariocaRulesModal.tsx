'use client';

import React from 'react';
import { CARIOCA_CARD_VALUES, DEFAULT_CARIOCA_ROUNDS } from '../services/defaultRounds';

interface CariocaRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CariocaRulesModal({ isOpen, onClose }: CariocaRulesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in text-slate-100">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-emerald-950/95 border-2 border-amber-500/40 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-amber-500/30 bg-gradient-to-r from-amber-500/20 via-emerald-900 to-amber-500/10">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🃏</span>
            <div>
              <h2 className="text-lg font-black text-amber-300">Reglamento Oficial de Carioca Chileno</h2>
              <p className="text-xs text-emerald-200/70">Guía de puntuación de cartas y rondas oficiales</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-emerald-900 hover:bg-emerald-800 text-amber-300 flex items-center justify-center transition-colors text-sm font-bold border border-amber-500/30 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-emerald-100/90">
          {/* Objective */}
          <section className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <span>🎯</span> Objetivo de la Mesa
            </h3>
            <p className="text-xs sm:text-sm text-white leading-relaxed bg-emerald-900/60 p-4 rounded-2xl border border-amber-500/30">
              El objetivo en Carioca es acumular la <b>menor cantidad de puntos posibles</b> al finalizar todas las rondas. El jugador que completa la combinación requerida y se deshace de todas sus cartas <b>cierra la ronda con 0 puntos (corte limpio)</b>.
            </p>
          </section>

          {/* Card Scoring */}
          <section className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <span>🪙</span> Valor de las Cartas que Quedan en Mano
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CARIOCA_CARD_VALUES.map((cv, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-emerald-900/50 border border-emerald-700/60 flex items-start justify-between gap-2"
                >
                  <div>
                    <p className="font-black text-white text-xs">{cv.card}</p>
                    <p className="text-[11px] text-emerald-200/70 mt-0.5">{cv.note}</p>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-black text-xs border border-amber-500/40">
                    {cv.points} pts
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Official 8 Rounds breakdown */}
          <section className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <span>📋</span> Las 8 Rondas Tradicionales
            </h3>
            <div className="space-y-2">
              {DEFAULT_CARIOCA_ROUNDS.map((round) => (
                <div
                  key={round.id}
                  className="p-3 rounded-xl bg-emerald-900/40 border border-emerald-800/60 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 font-black flex items-center justify-center text-xs shrink-0 border border-amber-500/30">
                      {round.orderNumber}
                    </span>
                    <div className="min-w-0">
                      <p className="font-black text-white truncate">{round.name}</p>
                      <p className="text-[11px] text-emerald-200/70 truncate">{round.description}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-amber-300 text-[10px] font-black border border-amber-500/30 shrink-0">
                    🂠 {round.requiredCards} cartas
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Golden Rules */}
          <section className="space-y-2 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-200">
            <p className="font-black flex items-center gap-1.5 text-amber-300">
              <span>💡</span> Consejos y Notas Clave de Mesa:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-[11px]">
              <li><b>Trío:</b> 3 cartas del mismo número (diferente o igual pinta).</li>
              <li><b>Escala:</b> 4 cartas consecutivas de la misma pinta (ej. 4, 5, 6, 7 de Corazones).</li>
              <li><b>Escala Real:</b> Secuencia completa de 13 cartas de la misma pinta (As a Rey).</li>
              <li>Los comodines (Jokers) pueden reemplazar cualquier carta, pero si quedan atrapados en tu mano suman 20 puntos.</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-amber-500/30 flex justify-end bg-emerald-900/60">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-black text-xs shadow-lg transition-all cursor-pointer"
          >
            Entendido, Volver a la Mesa ♠️
          </button>
        </div>
      </div>
    </div>
  );
}
