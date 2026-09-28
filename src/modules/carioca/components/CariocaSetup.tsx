'use client';

import React, { useState } from 'react';
import { GamePreset, Player, RoundDefinition } from '../types/carioca.types';
import PlayerAvatarModal from './PlayerAvatarModal';

interface CariocaSetupProps {
  players: Player[];
  selectedRounds: RoundDefinition[];
  allAvailablePresets: GamePreset[];
  allStandardRounds: RoundDefinition[];
  activePresetId: string;
  hasSavedGameToResume: boolean;
  onAddPlayer: (name: string, color?: string, emoji?: string) => void;
  onRemovePlayer: (id: string) => void;
  onUpdatePlayer: (id: string, updates: Partial<Player>) => void;
  onApplyPreset: (presetId: string) => void;
  onToggleRound: (roundId: string) => void;
  onMoveRound: (fromIndex: number, toIndex: number) => void;
  onRemoveRoundByIndex: (index: number) => void;
  onAddCustomRound: (round: Omit<RoundDefinition, 'id' | 'orderNumber'>) => void;
  onResetSetupToDefault: () => void;
  onStartGame: (gameTitle?: string) => void;
  onResumeSavedGame: () => void;
  onDiscardSavedGame: () => void;
}

export default function CariocaSetup({
  players,
  selectedRounds,
  allAvailablePresets,
  allStandardRounds,
  activePresetId,
  hasSavedGameToResume,
  onAddPlayer,
  onRemovePlayer,
  onUpdatePlayer,
  onApplyPreset,
  onToggleRound,
  onMoveRound,
  onRemoveRoundByIndex,
  onAddCustomRound,
  onResetSetupToDefault,
  onStartGame,
  onResumeSavedGame,
  onDiscardSavedGame,
}: CariocaSetupProps) {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [gameTitle, setGameTitle] = useState('');
  const [showCustomRoundForm, setShowCustomRoundForm] = useState(false);

  // Avatar Modal state
  const [editingAvatarPlayer, setEditingAvatarPlayer] = useState<Player | null>(null);

  // Custom round form state
  const [customName, setCustomName] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customCards, setCustomCards] = useState(8);
  const [customCategory, setCustomCategory] = useState<'trios' | 'escalas' | 'mixto' | 'especial'>('mixto');

  const handleAddPlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlayerName.trim()) {
      onAddPlayer(newPlayerName.trim());
      setNewPlayerName('');
    }
  };

  const handleAddCustomRoundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    onAddCustomRound({
      name: customName.trim(),
      description: customDescription.trim() || 'Ronda personalizada.',
      requiredCards: customCards,
      category: customCategory,
      isCustom: true,
    });
    setCustomName('');
    setCustomDescription('');
    setShowCustomRoundForm(false);
  };

  const canStart = players.length >= 2 && selectedRounds.length >= 1;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20 text-slate-100">
      {/* ========== CASINO HERO BANNER ========== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900/90 via-emerald-950 to-teal-950 border-2 border-amber-500/40 p-6 md:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
        {/* Subtle Watermark Suits */}
        <div className="absolute top-2 right-4 text-8xl font-black text-amber-500/5 select-none pointer-events-none">
          ♠ ♥ ♦ ♣
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black uppercase tracking-wider shadow-inner">
              <span>♠️ MESA DE POKER & CARIOCA ♠️</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Anotador de <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">Carioca</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/80 max-w-xl">
              Prepara a tus jugadores con sus fichas de casino, personaliza las 8 rondas de juego y lleva el control automático con diseño de paño verde y oro.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-900/60 border border-amber-500/30 flex items-center gap-3.5 backdrop-blur-md shrink-0 self-start md:self-center shadow-lg">
            <div className="text-4xl animate-pulse">👑</div>
            <div className="text-xs space-y-0.5">
              <p className="font-extrabold text-amber-300 uppercase tracking-wider">Regla de Oro</p>
              <p className="text-emerald-100/80">¡Gana quien tenga <b>menos</b> puntos!</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========== RESUME SAVED GAME BANNER ========== */}
      {hasSavedGameToResume && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/25 via-emerald-950 to-emerald-900 border-2 border-amber-400/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl animate-fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/30 border border-amber-400 text-amber-300 flex items-center justify-center text-2xl shrink-0 shadow-lg">
              ⏸️
            </div>
            <div>
              <h3 className="font-black text-amber-300 text-sm">Partida en Curso Detectada en la Mesa</h3>
              <p className="text-xs text-emerald-200/80">
                ¿Deseas reanudar la partida guardada con tus jugadores y puntajes intactos?
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onResumeSavedGame}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-emerald-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>▶️ Reanudar Partida</span>
            </button>
            <button
              onClick={onDiscardSavedGame}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-900/60 hover:bg-rose-900/40 text-emerald-300 hover:text-rose-300 border border-emerald-700/60 text-xs font-bold transition-all cursor-pointer"
            >
              Descartar
            </button>
          </div>
        </div>
      )}

      {/* ========== SECTION 1: PLAYERS CASINO SEATS ========== */}
      <section className="space-y-4 bg-emerald-950/70 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-xl backdrop-blur-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-800/80 pb-4">
          <div>
            <h2 className="text-lg font-black text-amber-300 flex items-center gap-2">
              <span>👥</span> Asientos en la Mesa ({players.length} Jugadores)
            </h2>
            <p className="text-xs text-emerald-200/70">
              Toca la ficha o el botón de avatar para elegir íconos y colores temáticos con 1 tap.
            </p>
          </div>
          {players.length < 2 && (
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
              ⚠️ Se requieren mínimo 2 jugadores
            </span>
          )}
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {players.map((player, index) => (
            <div
              key={player.id}
              className="p-3.5 rounded-2xl bg-emerald-900/50 border border-emerald-700/60 hover:border-amber-500/50 transition-all flex items-center justify-between gap-3 group shadow-md"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Interactive Poker Chip Avatar Button */}
                <button
                  type="button"
                  onClick={() => setEditingAvatarPlayer(player)}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg ring-2 ring-amber-400/40 hover:ring-amber-400 hover:scale-110 transition-all shrink-0 cursor-pointer group/chip"
                  style={{ backgroundColor: `${player.color}35`, border: `2px solid ${player.color}` }}
                  title="Toca para cambiar avatar y color"
                >
                  <span className="group-hover/chip:scale-125 transition-transform">{player.avatarEmoji || '🃏'}</span>
                </button>

                {/* Editable Player Name */}
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/80 block">
                    Jugador {index + 1}
                  </span>
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => onUpdatePlayer(player.id, { name: e.target.value })}
                    placeholder={`Jugador ${index + 1}`}
                    className="w-full bg-transparent font-black text-sm text-white focus:outline-none focus:border-b-2 focus:border-amber-400 py-0.5"
                  />
                </div>
              </div>

              {/* Edit Icon & Delete Action */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingAvatarPlayer(player)}
                  className="p-1.5 rounded-xl bg-emerald-950/70 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all cursor-pointer"
                  title="Cambiar avatar e icono"
                >
                  🎨
                </button>

                {players.length > 2 && (
                  <button
                    type="button"
                    onClick={() => onRemovePlayer(player.id)}
                    className="w-7 h-7 rounded-xl text-emerald-400 hover:text-rose-400 hover:bg-rose-900/40 flex items-center justify-center transition-colors text-xs cursor-pointer"
                    title="Eliminar asiento"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Add Player Form */}
        <form onSubmit={handleAddPlayerSubmit} className="flex gap-2.5 pt-2">
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            placeholder="Nombre del nuevo jugador (ej. María, Carlos...)"
            className="flex-1 px-4 py-3 rounded-2xl bg-emerald-900/40 border border-emerald-700/80 text-sm text-white placeholder:text-emerald-300/40 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          />
          <button
            type="submit"
            disabled={!newPlayerName.trim()}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 text-emerald-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <span>➕</span>
            <span>Agregar Asiento</span>
          </button>
        </form>
      </section>

      {/* ========== SECTION 2: ROUNDS NAIPES & PRESETS ========== */}
      <section className="space-y-6 bg-emerald-950/70 border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-xl backdrop-blur-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800/80 pb-4">
          <div>
            <h2 className="text-lg font-black text-amber-300 flex items-center gap-2">
              <span>🃏</span> Rondas de la Partida ({selectedRounds.length} Rondas)
            </h2>
            <p className="text-xs text-emerald-200/70">
              Usa presets de casino o toca las cartas para reordenar y personalizar.
            </p>
          </div>

          <button
            type="button"
            onClick={onResetSetupToDefault}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline self-start sm:self-auto cursor-pointer"
          >
            ↺ Restaurar las 8 Clásicas
          </button>
        </div>

        {/* Casino Presets Pills */}
        <div className="space-y-2.5">
          <p className="text-xs font-black uppercase tracking-wider text-amber-300/80 flex items-center gap-1">
            <span>🎲</span> Modos de Juego Rápidos:
          </p>
          <div className="flex flex-wrap gap-2">
            {allAvailablePresets.map((preset) => {
              const isActive = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onApplyPreset(preset.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-black border transition-all flex items-center gap-2 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-emerald-950 border-amber-400 shadow-lg shadow-amber-500/30 scale-105'
                      : 'bg-emerald-900/60 border-emerald-700/60 text-emerald-200 hover:text-white hover:border-amber-500/50'
                  }`}
                >
                  <span className="text-base">{preset.icon}</span>
                  <span>{preset.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Filter Standard Rounds Chips */}
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-wider text-amber-300/80 flex items-center gap-1">
            <span>🎯</span> Activar / Desactivar Rondas con 1 Tap:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {allStandardRounds.map((stdRound) => {
              const isSelected = selectedRounds.some((r) => r.id === stdRound.id);
              return (
                <button
                  key={stdRound.id}
                  type="button"
                  onClick={() => onToggleRound(stdRound.id)}
                  className={`p-3 rounded-2xl border text-left text-xs transition-all flex items-center justify-between gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-900/80 border-amber-500/60 text-white shadow-md'
                      : 'bg-emerald-950/40 opacity-40 border-emerald-800 text-emerald-300 hover:opacity-80'
                  }`}
                >
                  <div className="truncate">
                    <span className="font-black text-amber-400">{stdRound.orderNumber}. </span>
                    <span className="font-bold">{stdRound.name}</span>
                  </div>
                  <span className="text-xs shrink-0">{isSelected ? '✅' : '⚪'}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Rounds Playing Order */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-wider text-amber-300/80 flex items-center gap-1">
              <span>📋</span> Secuencia en Mesa para esta Partida:
            </p>
            <button
              type="button"
              onClick={() => setShowCustomRoundForm((prev) => !prev)}
              className="text-xs text-amber-400 hover:underline font-bold cursor-pointer"
            >
              {showCustomRoundForm ? '✕ Cancelar Personalizada' : '➕ Crear Ronda Custom'}
            </button>
          </div>

          {/* Custom round creation form */}
          {showCustomRoundForm && (
            <form
              onSubmit={handleAddCustomRoundSubmit}
              className="p-4 rounded-2xl bg-emerald-900/80 border border-amber-500/40 space-y-3 animate-fade-in"
            >
              <h4 className="text-xs font-black text-amber-300">Definir Ronda Personalizada</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-emerald-200/80 font-bold block mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 4 Tríos o Gran Escalera"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-emerald-950 border border-emerald-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-emerald-200/80 font-bold block mb-1">Cartas Requeridas</label>
                  <input
                    type="number"
                    min="3"
                    max="20"
                    value={customCards}
                    onChange={(e) => setCustomCards(parseInt(e.target.value) || 6)}
                    className="w-full px-3 py-2 rounded-xl bg-emerald-950 border border-emerald-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-emerald-200/80 font-bold block mb-1">Categoría</label>
                  <select
                    value={customCategory}
                    onChange={(e) =>
                      setCustomCategory(e.target.value as 'trios' | 'escalas' | 'mixto' | 'especial')
                    }
                    className="w-full px-3 py-2 rounded-xl bg-emerald-950 border border-emerald-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="trios">Tríos 🃏</option>
                    <option value="escalas">Escalas 📈</option>
                    <option value="mixto">Mixto 🔀</option>
                    <option value="especial">Especial 👑</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCustomRoundForm(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-emerald-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-xs"
                >
                  Guardar Ronda
                </button>
              </div>
            </form>
          )}

          {/* List of cards */}
          <div className="space-y-2">
            {selectedRounds.map((round, idx) => (
              <div
                key={`${round.id}_${idx}`}
                className="p-3.5 rounded-2xl bg-emerald-900/50 border border-emerald-700/60 hover:border-amber-500/40 flex items-center justify-between gap-3 text-xs transition-colors shadow-sm"
              >
                {/* Round Number & Details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-emerald-950 font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-black text-white text-sm truncate">{round.name}</p>
                      {round.isCustom && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/40">
                          Custom
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-emerald-200/70 truncate">{round.description}</p>
                  </div>
                </div>

                {/* Reorder and Card Count Chips */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-3 py-1 rounded-full bg-emerald-950 border border-amber-500/30 text-amber-300 text-[11px] font-extrabold">
                    🂠 {round.requiredCards} Cartas
                  </span>

                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => onMoveRound(idx, idx - 1)}
                    className="w-7 h-7 rounded-xl bg-emerald-950 hover:bg-amber-500/20 text-amber-300 disabled:opacity-20 flex items-center justify-center text-xs font-black border border-emerald-700 cursor-pointer"
                    title="Mover arriba"
                  >
                    ↑
                  </button>

                  <button
                    type="button"
                    disabled={idx === selectedRounds.length - 1}
                    onClick={() => onMoveRound(idx, idx + 1)}
                    className="w-7 h-7 rounded-xl bg-emerald-950 hover:bg-amber-500/20 text-amber-300 disabled:opacity-20 flex items-center justify-center text-xs font-black border border-emerald-700 cursor-pointer"
                    title="Mover abajo"
                  >
                    ↓
                  </button>

                  {selectedRounds.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onRemoveRoundByIndex(idx)}
                      className="w-7 h-7 rounded-xl text-emerald-400 hover:text-rose-400 hover:bg-rose-900/40 flex items-center justify-center text-xs cursor-pointer"
                      title="Quitar ronda"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SECTION 3: GAME START CTA ========== */}
      <div className="p-6 rounded-3xl bg-emerald-950/80 border-2 border-amber-500/40 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={gameTitle}
            onChange={(e) => setGameTitle(e.target.value)}
            placeholder="Título de la partida (ej. Torneo Casino Carioca)"
            className="flex-1 px-4 py-3.5 rounded-2xl bg-emerald-900/50 border border-emerald-700/80 text-sm text-white placeholder:text-emerald-300/40 focus:outline-none focus:border-amber-400"
          />

          <button
            type="button"
            disabled={!canStart}
            onClick={() => onStartGame(gameTitle)}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 text-emerald-950 font-black text-sm shadow-[0_0_30px_rgba(245,158,11,0.35)] transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <span>♠️ Abrir Mesa de Juego</span>
            <span>({players.length} Jugadores, {selectedRounds.length} Rondas)</span>
            <span>→</span>
          </button>
        </div>

        {!canStart && (
          <p className="text-xs text-rose-400 font-bold text-center">
            {players.length < 2
              ? 'Se requieren al menos 2 jugadores para comenzar.'
              : 'Debes tener al menos 1 ronda seleccionada.'}
          </p>
        )}
      </div>

      {/* Player Avatar Modal */}
      <PlayerAvatarModal
        player={editingAvatarPlayer}
        isOpen={Boolean(editingAvatarPlayer)}
        onClose={() => setEditingAvatarPlayer(null)}
        onSave={(playerId, updates) => onUpdatePlayer(playerId, updates)}
      />
    </div>
  );
}
