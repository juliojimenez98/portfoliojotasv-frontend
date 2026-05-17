"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import type { ISpendPeriod } from "@/types/period";

const API_URL = process.env.API_URL || "http://localhost:5002";

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const session = await auth();
  if (!session?.user?.token) throw new Error("Unauthorized");
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.user.token}`,
    ...options.headers,
  };
  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || "API request failed");
  }
  return res.json();
}

export async function getPeriods(): Promise<ISpendPeriod[]> {
  const res = await fetchWithAuth("/api/periods");
  return res.data;
}

export async function getActivePeriod(): Promise<ISpendPeriod | null> {
  const res = await fetchWithAuth("/api/periods/active");
  return res.data;
}

export async function startPeriod(data: {
  label?: string;
  startDate?: string;
  notes?: string;
}): Promise<ISpendPeriod> {
  const res = await fetchWithAuth("/api/periods/start", {
    method: "POST",
    body: JSON.stringify(data),
  });
  revalidatePath("/app/gastos");
  return res.data;
}

export async function closePeriod(id: string): Promise<ISpendPeriod> {
  const res = await fetchWithAuth(`/api/periods/${id}/close`, {
    method: "POST",
  });
  revalidatePath("/app/gastos");
  return res.data;
}

export async function deletePeriod(id: string): Promise<void> {
  await fetchWithAuth(`/api/periods/${id}`, { method: "DELETE" });
  revalidatePath("/app/gastos");
}
