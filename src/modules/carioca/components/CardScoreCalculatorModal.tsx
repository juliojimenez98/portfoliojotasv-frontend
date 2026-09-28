'use client';

import React, { useState, useEffect } from 'react';
import { Player, GameRound } from '../types/carioca.types';

interface CardScoreCalculatorModalProps {
  isOpen: boolean;
  player: Player | null;
  round: GameRound | null;
  currentScore: number | null;
  onClose: () => void;
  onApplyScore: (score: number) => void;
}

interface SelectedCardItem {
  id: string;
  name: string;
  points: number;
}

const CARDS_KEYPAD = [
  { label: 'As (A)', points: 20, type: 'special' },
  { label: 'K', points: 10, type: 'face' },
  { label: 'Q', points: 10, type: 'face' },
  { label: 'J', points: 10, type: 'face' },
  { label: '10', points: 10, type: 'number' },
  { label: '9', points: 9, type: 'number' },
  { label: '8', points: 8, type: 'number' },
  { label: '7', points: 7, type: 'number' },
  { label: '6', points: 6, type: 'number' },
  { label: '5', points: 5, type: 'number' },
  { label: '4', points: 4, type: 'number' },
  { label: '3', points: 3, type: 'number' },
  { label: '2', points: 2, type: 'number' },
  { label: 'Joker 🃏', points: 20, type: 'joker' },
];

export default function CardScoreCalculatorModal({
  isOpen,
  player,
  round,
  currentScore,
  onClose,
  onApplyScore,
}: CardScoreCalculatorModalProps) {
  const [selectedCards, setSelectedCards] = useState<SelectedCardItem[]>([]);
  const [manualAdjustment, setManualAdjustment] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setSelectedCards([]);
      setManualAdjustment(typeof currentScore === 'number' ? currentScore : 0);
    }
  }, [isOpen, currentScore]);

  if (!isOpen || !player || !round) return null;

  const cardsTotal = selectedCards.reduce((acc, c) => acc + c.points, 0);
  const totalScore = selectedCards.length > 0 ? cardsTotal : manualAdjustment;

  const handleAddCard = (name: string, points: number) => {
    setSelectedCards((prev) => [
      ...prev,
      { id: `${name}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`, name, points },
    ]);
  };

  const handleRemoveCard = (cardId: string) => {
    setSelectedCards((prev) => prev.filter((c) => c.id !== cardId));
  };

  const handleClearAll = () => {
    setSelectedCards([]);
    setManualAdjustment(0);
  };

  const handleSetZero = () => {
    setSelectedCards([]);
    setManualAdjustment(0);
    onApplyScore(0);
    onClose();
  };

  const handleSave = () => {
    onApplyScore(Math.max(0, totalScore));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg flex flex-col bg-emerald-950/95 border-2 border-amber-500/40 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-amber-500/30 bg-gradient-to-r from-amber-500/20 via-emerald-900 to-amber-500/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🧮</span>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-amber-300">
                Calculadora de Cartas en Mano
              </h2>
              <p className="text-xs text-emerald-200/70">
                {player.name} • {round.definition.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-emerald-900/80 hover:bg-emerald-800 text-amber-300/80 hover:text-amber-300 flex items-center justify-center text-sm font-bold border border-amber-500/30 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Quick Zero CTA banner */}
          <button
            type="button"
            onClick={handleSetZero}
            className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm border border-emerald-400/40 shadow-lg shadow-emerald-600/25 flex items-center justify-between transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">✂️</span>
              <span className="text-left">
                <span className="block leading-none">¡Cerró la Ronda! (Corte Limpio)</span>
                <span className="text-[11px] text-emerald-100 font-normal">
                  Bajo todas sus cartas sin dejar puntos
                </span>
              </span>
            </div>
            <span className="px-3 py-1 rounded-xl bg-black/30 text-emerald-200 font-black text-sm">
              0 pts
            </span>
          </button>

          {/* Hand Cards Selected Box */}
          <div className="p-4 rounded-2xl bg-emerald-900/60 border border-amber-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Cartas en Mano ({selectedCards.length}):
              </span>
              {selectedCards.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[11px] font-bold text-rose-400 hover:text-rose-300 cursor-pointer"
                >
                  Limpiar Todo ✕
                </button>
              )}
            </div>

            {selectedCards.length === 0 ? (
              <p className="text-xs text-emerald-200/50 italic py-2 text-center">
                Toca las cartas abajo para sumarlas a la mano...
              </p>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-1">
                {selectedCards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => handleRemoveCard(card.id)}
                    className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-rose-500/30 text-amber-300 hover:text-rose-200 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer group"
                    title="Quitar carta"
                  >
                    <span>{card.name}</span>
                    <span className="text-[10px] text-amber-200/80">({card.points})</span>
                    <span className="text-rose-400 font-bold group-hover:inline hidden">✕</span>
                  </button>
                ))}
              </div>
            )}

            {/* Sum Display */}
            <div className="pt-2 border-t border-emerald-800/80 flex items-center justify-between">
              <span className="text-xs text-emerald-200/70 font-semibold">Total Calculado:</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-amber-400">{totalScore}</span>
                <span className="text-xs font-bold text-amber-400/70 uppercase">pts</span>
              </div>
            </div>
          </div>

          {/* Cards Keypad */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <span>🃏</span> Toca las Cartas para Sumar:
            </span>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {CARDS_KEYPAD.map((card, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddCard(card.label, card.points)}
                  className={`h-14 rounded-2xl flex flex-col items-center justify-center p-1 border font-bold transition-all active:scale-95 cursor-pointer ${
                    card.type === 'special' || card.type === 'joker'
                      ? 'bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/50 text-amber-300'
                      : card.type === 'face'
                      ? 'bg-purple-900/40 hover:bg-purple-900/60 border-purple-500/40 text-purple-200'
                      : 'bg-emerald-900/80 hover:bg-emerald-800 border-emerald-700/60 text-white'
                  }`}
                >
                  <span className="text-xs leading-none">{card.label}</span>
                  <span className="text-[10px] text-amber-300/80 mt-1">{card.points} pts</span>
                </button>
              ))}
            </div>
          </div>

          {/* Direct Numerical Increment Chips */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/70">
              Ajuste Directo con Fichas:
            </span>
            <div className="flex gap-2">
              {[1, 5, 10, 20].map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => setManualAdjustment((prev) => prev + step)}
                  className="flex-1 py-1.5 rounded-xl bg-emerald-900/60 hover:bg-amber-500/20 text-amber-300 border border-emerald-700 text-xs font-black transition-colors cursor-pointer"
                >
                  +{step}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-amber-500/30 bg-emerald-900/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-bold text-xs border border-emerald-700/60 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            Guardar {totalScore} pts 🎯
          </button>
        </div>
      </div>
    </div>
  );
}
