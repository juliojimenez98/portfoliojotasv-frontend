"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

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
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "API request failed");
  return data;
}

export async function getAccounts() {
  const res = await fetchWithAuth("/api/accounts");
  return res.data;
}

export async function getAccount(id: string) {
  const res = await fetchWithAuth(`/api/accounts/${id}`);
  return res.data;
}

export async function createAccount(data: any) {
  const res = await fetchWithAuth("/api/accounts", {
    method: "POST",
    body: JSON.stringify(data),
  });
  revalidatePath("/app/gastos/cuentas");
  revalidatePath("/app/gastos");
  return res.data;
}

export async function updateAccount(id: string, data: any) {
  const res = await fetchWithAuth(`/api/accounts/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  revalidatePath("/app/gastos/cuentas");
  revalidatePath("/app/gastos");
  return res.data;
}

export async function deleteAccount(id: string) {
  await fetchWithAuth(`/api/accounts/${id}`, { method: "DELETE" });
  revalidatePath("/app/gastos/cuentas");
  revalidatePath("/app/gastos");
}

export async function depositToAccount(
  id: string,
  amount: number,
  description?: string,
) {
  const res = await fetchWithAuth(`/api/accounts/${id}/deposit`, {
    method: "POST",
    body: JSON.stringify({ amount, description }),
  });
  revalidatePath("/app/gastos/cuentas");
  revalidatePath("/app/gastos");
  return res.data;
}

export async function previewRoundBalances() {
  const res = await fetchWithAuth("/api/accounts/recalculate-balances/preview");
  return res.data as {
    accountId: string;
    name: string;
    oldBalance: number;
    newBalance: number;
    diff: number;
    hasChange: boolean;
  }[];
}

export async function recalculateBalances() {
  const res = await fetchWithAuth("/api/accounts/recalculate-balances", {
    method: "POST",
  });
  revalidatePath("/app/gastos/cuentas");
  revalidatePath("/app/gastos");
  return res.data;
}

export async function transferBetweenAccounts(
  fromAccountId: string,
  toAccountId: string,
  amount: number,
  description?: string,
) {
  const res = await fetchWithAuth("/api/accounts/transfer", {
    method: "POST",
    body: JSON.stringify({ fromAccountId, toAccountId, amount, description }),
  });
  revalidatePath("/app/gastos/cuentas");
  revalidatePath("/app/gastos");
  return res.data;
}
