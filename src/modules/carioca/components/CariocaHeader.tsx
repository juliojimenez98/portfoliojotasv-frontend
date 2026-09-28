'use client';

import React from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { GameStatus, StorageMode } from '../types/carioca.types';

interface CariocaHeaderProps {
  status: GameStatus;
  storageMode: StorageMode;
  userEmail?: string | null;
  onOpenRules: () => void;
  onOpenHistory: () => void;
  onNewGame: () => void;
}

export default function CariocaHeader({
  status,
  storageMode,
  userEmail,
  onOpenRules,
  onOpenHistory,
  onNewGame,
}: CariocaHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-emerald-950/90 backdrop-blur-md border-b border-amber-500/30 text-white shadow-[0_4px_25px_rgba(0,0,0,0.5)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Casino Title */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 group hover:opacity-90 transition-opacity"
            >
              {/* Poker Chip Emblem */}
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center text-emerald-950 text-xl font-black shadow-lg shadow-amber-500/20 border-2 border-amber-300 group-hover:scale-105 transition-transform">
                ♠️
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg tracking-tight bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-200 bg-clip-text text-transparent">
                    Carioca Poker Club
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Mesa Oficial
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/70 leading-none">
                  Anotador Profesional de Carioca Chileno
                </p>
              </div>
            </Link>
          </div>

          {/* Center: Mode Badge */}
          <div className="hidden md:flex items-center gap-2">
            {storageMode === 'authenticated' && userEmail ? (
              <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-900/80 text-emerald-300 border border-amber-500/40 text-xs font-bold shadow-inner">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Mesa Sincronizada ({userEmail.split('@')[0]})</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-900/80 text-amber-300/90 border border-amber-500/30 text-xs font-bold shadow-inner">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Mesa Invitado (Local)</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenRules}
              className="px-3 py-1.5 rounded-xl bg-emerald-900/70 hover:bg-emerald-800/90 text-amber-300 hover:text-amber-200 text-xs font-bold border border-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Reglas del juego y valor de cartas"
            >
              <span>📖</span>
              <span className="hidden sm:inline">Reglas</span>
            </button>

            <button
              onClick={onOpenHistory}
              className="px-3 py-1.5 rounded-xl bg-emerald-900/70 hover:bg-emerald-800/90 text-amber-300 hover:text-amber-200 text-xs font-bold border border-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Ver partidas anteriores"
            >
              <span>🕒</span>
              <span className="hidden sm:inline">Historial</span>
            </button>

            {status !== 'setup' && (
              <button
                onClick={onNewGame}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold border border-amber-500/40 transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>🔄</span>
                <span className="hidden sm:inline">Reiniciar</span>
              </button>
            )}

            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
