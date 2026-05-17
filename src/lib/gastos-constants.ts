/**
 * Shared constants for the gastos app — keeps icons consistent everywhere.
 */

export const ACCOUNT_TYPE_ICONS: Record<string, string> = {
  credit_card: "💳",
  debit: "🏦",
  cash: "💵",
  savings: "🏆",
  investment: "📈",
  other: "📁",
};

export const SUBSCRIPTION_CATEGORY_EMOJIS: Record<string, string> = {
  streaming: "🎬",
  music: "🎵",
  software: "💻",
  gaming: "🎮",
  cloud: "☁️",
  fitness: "🏋️",
  news: "📰",
  productivity: "⚡",
  other: "📁",
};

export const SUBSCRIPTION_CATEGORIES = [
  { value: "streaming", emoji: "🎬", label: "Streaming" },
  { value: "music", emoji: "🎵", label: "Música" },
  { value: "software", emoji: "💻", label: "Software" },
  { value: "gaming", emoji: "🎮", label: "Gaming" },
  { value: "cloud", emoji: "☁️", label: "Nube" },
  { value: "fitness", emoji: "🏋️", label: "Fitness" },
  { value: "news", emoji: "📰", label: "Noticias" },
  { value: "productivity", emoji: "⚡", label: "Productividad" },
  { value: "other", emoji: "📁", label: "Otro" },
];
