'use client';

import React, { useState, useEffect } from 'react';
import { Player } from '../types/carioca.types';
import { CASINO_AVATAR_CATEGORIES, PLAYER_PALETTES } from '../services/defaultRounds';

interface PlayerAvatarModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (playerId: string, updates: { color: string; avatarEmoji: string }) => void;
}

export default function PlayerAvatarModal({
  player,
  isOpen,
  onClose,
  onSave,
}: PlayerAvatarModalProps) {
  const [selectedColor, setSelectedColor] = useState<string>(PLAYER_PALETTES[0].color);
  const [selectedEmoji, setSelectedEmoji] = useState<string>(PLAYER_PALETTES[0].emoji);
  const [activeTab, setActiveTab] = useState<string>('cards');

  useEffect(() => {
    if (player) {
      setSelectedColor(player.color || PLAYER_PALETTES[0].color);
      setSelectedEmoji(player.avatarEmoji || PLAYER_PALETTES[0].emoji);
    }
  }, [player]);

  if (!isOpen || !player) return null;

  const handleSave = () => {
    onSave(player.id, {
      color: selectedColor,
      avatarEmoji: selectedEmoji,
    });
    onClose();
  };

  const activeCategory =
    CASINO_AVATAR_CATEGORIES.find((c) => c.id === activeTab) || CASINO_AVATAR_CATEGORIES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg flex flex-col bg-emerald-950/95 border-2 border-amber-500/40 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] text-slate-100 overflow-hidden">
        {/* Decorative Gold Header */}
        <div className="p-5 border-b border-amber-500/30 bg-gradient-to-r from-amber-500/20 via-emerald-900 to-amber-500/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎩</span>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-amber-300">
                Personalizar Jugador VIP
              </h2>
              <p className="text-xs text-emerald-200/70">
                Elige tu avatar y color para la mesa de Carioca
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
        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Live Player Chip Preview */}
          <div className="p-4 rounded-2xl bg-emerald-900/60 border border-amber-500/30 flex items-center justify-between gap-4 shadow-inner">
            <div className="flex items-center gap-3.5">
              {/* Poker chip avatar */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg ring-4 ring-amber-400/30 transition-all duration-300 scale-105"
                style={{
                  backgroundColor: `${selectedColor}35`,
                  border: `3px solid ${selectedColor}`,
                }}
              >
                {selectedEmoji}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Vista Previa en Mesa
                </span>
                <p className="text-lg font-black text-white">{player.name}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Ficha VIP
              </span>
            </div>
          </div>

          {/* Color Palette Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <span>🎨</span> Color de la Ficha:
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {PLAYER_PALETTES.map((pal) => {
                const isSelected = selectedColor === pal.color;
                return (
                  <button
                    key={pal.color}
                    type="button"
                    onClick={() => setSelectedColor(pal.color)}
                    className={`h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'scale-110 ring-4 ring-amber-300 shadow-lg'
                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                    style={{ backgroundColor: pal.color }}
                    title={pal.name}
                  >
                    {isSelected && <span className="text-white text-xs font-black">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Emoji Avatar Tabs */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <span>🃏</span> Selecciona tu Ícono:
            </label>

            {/* Category tabs */}
            <div className="flex gap-1.5 p-1 rounded-xl bg-emerald-900/80 border border-emerald-700/50">
              {CASINO_AVATAR_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveTab(cat.id)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer truncate ${
                    activeTab === cat.id
                      ? 'bg-amber-500 text-emerald-950 shadow-xs'
                      : 'text-emerald-200/70 hover:text-white'
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>

            {/* Emoji Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-3 rounded-2xl bg-emerald-900/40 border border-emerald-800/60 max-h-44 overflow-y-auto">
              {activeCategory.emojis.map((emoji, idx) => {
                const isSelected = selectedEmoji === emoji;
                return (
                  <button
                    key={`${emoji}_${idx}`}
                    type="button"
                    onClick={() => setSelectedEmoji(emoji)}
                    className={`h-11 rounded-xl flex items-center justify-center text-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/30 border-2 border-amber-400 scale-110 shadow-md'
                        : 'bg-emerald-950/60 border border-emerald-800/40 hover:bg-emerald-800 hover:scale-105'
                    }`}
                  >
                    {emoji}
                  </button>
                );
              })}
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
            Aplicar Cambios 👑
          </button>
        </div>
      </div>
    </div>
  );
}
