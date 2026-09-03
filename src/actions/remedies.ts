"use server";

import { auth } from "@/auth";
import type {
  IRemedy,
  IRemedyLog,
  ITelegramStatus,
  ITelegramLinkCodeResponse,
} from "@/types/remedy";

const API_URL = process.env.API_URL || "http://localhost:5002";

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const session = await auth();
  if (!session?.user?.token) throw new Error("Unauthorized");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.user.token}`,
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    cache: "no-store",
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error || "Error al comunicarse con la API");
  }

  return res.json();
}

export async function getRemedies(): Promise<IRemedy[]> {
  const res = await fetchWithAuth("/api/remedies");
  return res.remedies || [];
}

export async function createRemedy(data: {
  name: string;
  dose: string;
  instructions?: string;
  frequencyHours: number;
  firstDoseTime?: string;
  snoozeMinutes?: number;
}): Promise<IRemedy> {
  const res = await fetchWithAuth("/api/remedies", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.remedy;
}

export async function updateRemedy(
  id: string,
  data: Partial<IRemedy>,
): Promise<IRemedy> {
  const res = await fetchWithAuth(`/api/remedies/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.remedy;
}

export async function deleteRemedy(id: string): Promise<void> {
  await fetchWithAuth(`/api/remedies/${id}`, { method: "DELETE" });
}

export async function executeRemedyAction(
  id: string,
  action: "taken" | "snooze" | "skipped",
  skipReason?: string,
  customSnoozeMinutes?: number,
): Promise<{ message: string; remedy: IRemedy }> {
  const res = await fetchWithAuth(`/api/remedies/${id}/action`, {
    method: "POST",
    body: JSON.stringify({ action, skipReason, customSnoozeMinutes }),
  });
  return { message: res.message, remedy: res.remedy };
}

export async function getRemedyLogs(): Promise<IRemedyLog[]> {
  const res = await fetchWithAuth("/api/remedies/logs");
  return res.logs || [];
}

export async function getTelegramStatus(): Promise<ITelegramStatus> {
  const res = await fetchWithAuth("/api/remedies/telegram/status");
  return {
    isLinked: res.isLinked,
    telegramChatId: res.telegramChatId,
    defaultSnoozeMinutes: res.defaultSnoozeMinutes,
  };
}

export async function generateTelegramLinkCode(): Promise<ITelegramLinkCodeResponse> {
  const res = await fetchWithAuth("/api/remedies/telegram/link-code", {
    method: "POST",
  });
  return {
    code: res.code,
    telegramLink: res.telegramLink,
    expiresAt: res.expiresAt,
  };
}

export async function unlinkTelegram(): Promise<void> {
  await fetchWithAuth("/api/remedies/telegram/unlink", {
    method: "POST",
  });
}

export async function linkTelegramManual(chatId: string): Promise<void> {
  await fetchWithAuth("/api/remedies/telegram/manual", {
    method: "POST",
    body: JSON.stringify({ chatId }),
  });
}

