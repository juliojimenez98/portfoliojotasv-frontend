import { RoundDefinition, GamePreset } from '../types/carioca.types';

/**
 * Official Chilean Carioca Classic Rounds (1 to 8)
 */
export const DEFAULT_CARIOCA_ROUNDS: RoundDefinition[] = [
  {
    id: 'round-1-2-trios',
    orderNumber: 1,
    name: '2 Tríos',
    description: 'Dos tríos de cartas del mismo valor (ej. 3 Reyes y 3 Ochos).',
    requiredCards: 6,
    category: 'trios',
  },
  {
    id: 'round-2-1-trio-1-escala',
    orderNumber: 2,
    name: '1 Trío + 1 Escala',
    description: 'Un trío (3 cartas mismo número) y una escala (4 cartas consecutivas de la misma pinta).',
    requiredCards: 7,
    category: 'mixto',
  },
  {
    id: 'round-3-2-escalas',
    orderNumber: 3,
    name: '2 Escalas',
    description: 'Dos escalas de 4 cartas consecutivas de la misma pinta cada una.',
    requiredCards: 8,
    category: 'escalas',
  },
  {
    id: 'round-4-3-trios',
    orderNumber: 4,
    name: '3 Tríos',
    description: 'Tres tríos de cartas del mismo valor (9 cartas en total).',
    requiredCards: 9,
    category: 'trios',
  },
  {
    id: 'round-5-2-trios-1-escala',
    orderNumber: 5,
    name: '2 Tríos + 1 Escala',
    description: 'Dos tríos y una escala de 4 cartas consecutivas del mismo palo.',
    requiredCards: 10,
    category: 'mixto',
  },
  {
    id: 'round-6-2-escalas-1-trio',
    orderNumber: 6,
    name: '2 Escalas + 1 Trío',
    description: 'Dos escalas de 4 cartas consecutivas y un trío de 3 cartas.',
    requiredCards: 11,
    category: 'mixto',
  },
  {
    id: 'round-7-3-escalas',
    orderNumber: 7,
    name: '3 Escalas',
    description: 'Tres escalas de 4 cartas consecutivas del mismo palo cada una (12 cartas).',
    requiredCards: 12,
    category: 'escalas',
  },
  {
    id: 'round-8-escala-real',
    orderNumber: 8,
    name: 'Escala Sucia / Real (As a K)',
    description: 'Escala completa de 13 cartas del As al Rey de la misma pinta (puede incluir comodines).',
    requiredCards: 13,
    category: 'especial',
  },
];

/**
 * Predefined Game Presets
 */
export const CARIOCA_PRESETS: GamePreset[] = [
  {
    id: 'classic-8',
    name: 'Clásica Chilena (8 Rondas)',
    description: 'La experiencia completa tradicional del Carioca chileno.',
    icon: '🏆',
    badge: 'Estándar',
    roundIds: DEFAULT_CARIOCA_ROUNDS.map((r) => r.id),
  },
  {
    id: 'express-4',
    name: 'Partida Rápida (4 Rondas)',
    description: 'Rondas 1 a 4: 2 Tríos, 1 Trío + 1 Escala, 2 Escalas, 3 Tríos.',
    icon: '⚡',
    badge: 'Rápida',
    roundIds: [
      'round-1-2-trios',
      'round-2-1-trio-1-escala',
      'round-3-2-escalas',
      'round-4-3-trios',
    ],
  },
  {
    id: 'competitiva-6',
    name: 'Competitiva Media (6 Rondas)',
    description: 'Rondas 1 a 6 sin llegar a las 3 escalas ni la escala real.',
    icon: '🎯',
    badge: 'Media',
    roundIds: [
      'round-1-2-trios',
      'round-2-1-trio-1-escala',
      'round-3-2-escalas',
      'round-4-3-trios',
      'round-5-2-trios-1-escala',
      'round-6-2-escalas-1-trio',
    ],
  },
  {
    id: 'trios-only',
    name: 'Especial Tríos',
    description: 'Foco en juegos de tríos (2 Tríos, 3 Tríos, 2 Tríos + 1 Escala).',
    icon: '🃏',
    badge: 'Tríos',
    roundIds: [
      'round-1-2-trios',
      'round-4-3-trios',
      'round-5-2-trios-1-escala',
    ],
  },
  {
    id: 'escalas-only',
    name: 'Especial Escalas',
    description: 'Foco en secuencias y escaleras (2 Escalas, 3 Escalas, Escala Real).',
    icon: '📈',
    badge: 'Escalas',
    roundIds: [
      'round-3-2-escalas',
      'round-7-3-escalas',
      'round-8-escala-real',
    ],
  },
];

/**
 * Card Values Guide for Reference
 */
export const CARIOCA_CARD_VALUES = [
  { card: 'As (A)', points: 20, note: 'Vale 20 puntos en mano (o 1 pt en algunas variantes acordadas).' },
  { card: 'Cartas 2 al 10', points: '2 a 10', note: 'Su valor numérico exacto.' },
  { card: 'Figuras (J, Q, K)', points: 10, note: 'Valen 10 puntos cada una.' },
  { card: 'Comodín (Joker)', points: 20, note: 'Vale 20 puntos si queda atrapado en tu mano al cortar.' },
];

/**
 * Categorized Emojis for Player Avatar Selector
 */
export const CASINO_AVATAR_CATEGORIES = [
  {
    id: 'cards',
    title: '♠️ Baraja & Casino',
    emojis: ['♠️', '♥️', '♦️', '♣️', '🃏', '👑', '🎲', '💎', '💰', '🪙', '🎩', '🏆', '🔥', '🎯', '🂠', '🂡'],
  },
  {
    id: 'vip_animals',
    title: '🦁 Animales VIP',
    emojis: ['🦁', '🦊', '🐬', '🦄', '🐯', '🦅', '🐸', '🦉', '🐺', '🐼', '🦚', '🐉', '🐙', '🐆', '🦈', '🐻'],
  },
  {
    id: 'characters',
    title: '🎭 Personajes de Juego',
    emojis: ['🤠', '🤵', '🕵️', '🧙‍♂️', '🥷', '👸', '🦹‍♂️', '🧑‍💼', '🤖', '👾', '👻', '😎', '🥳', '🧐', '🤩', '🤑'],
  },
];

/**
 * Casino Luxury Player Colors
 */
export const PLAYER_PALETTES = [
  { color: '#f59e0b', name: 'Oro Imperial', emoji: '👑', borderClass: 'border-amber-500', bgClass: 'bg-amber-500' },
  { color: '#10b981', name: 'Esmeralda Casino', emoji: '♠️', borderClass: 'border-emerald-500', bgClass: 'bg-emerald-500' },
  { color: '#ef4444', name: 'Rubí Carmesí', emoji: '♥️', borderClass: 'border-rose-500', bgClass: 'bg-rose-500' },
  { color: '#3b82f6', name: 'Zafiro Real', emoji: '♦️', borderClass: 'border-blue-500', bgClass: 'bg-blue-500' },
  { color: '#8b5cf6', name: 'Amatista Vegas', emoji: '♣️', borderClass: 'border-purple-500', bgClass: 'bg-purple-500' },
  { color: '#06b6d4', name: 'Diamante Cyan', emoji: '💎', borderClass: 'border-cyan-500', bgClass: 'bg-cyan-500' },
  { color: '#ec4899', name: 'Rosa Fresa VIP', emoji: '🦄', borderClass: 'border-pink-500', bgClass: 'bg-pink-500' },
  { color: '#84cc16', name: 'Lima Fortuna', emoji: '🎲', borderClass: 'border-lime-500', bgClass: 'bg-lime-500' },
];
