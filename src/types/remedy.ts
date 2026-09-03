export type ReminderStatus = "pending" | "sent" | "snoozed";

export interface ReminderState {
  status: ReminderStatus;
  lastSentAt?: string;
  snoozedUntil?: string;
  snoozeCount: number;
}

export interface IRemedy {
  _id: string;
  userId: string;
  name: string;
  dose: string;
  instructions?: string;
  frequencyHours: number;
  nextDoseAt: string;
  snoozeMinutes: number;
  isActive: boolean;
  reminderState?: ReminderState;
  createdAt?: string;
  updatedAt?: string;
}

export type LogAction = "taken" | "skipped" | "snoozed";

export interface IRemedyLog {
  _id: string;
  userId: string;
  remedyId: string;
  remedyName: string;
  scheduledFor: string;
  action: LogAction;
  actionAt: string;
  skipReason?: string;
  createdAt?: string;
}

export interface ITelegramStatus {
  isLinked: boolean;
  telegramChatId: string | null;
  defaultSnoozeMinutes: number;
}

export interface ITelegramLinkCodeResponse {
  code: string;
  telegramLink: string;
  expiresAt: string;
}
