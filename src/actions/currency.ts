"use server";

import { auth } from "@/auth";

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

export async function convertToCLP(
  amount: number,
  from: string,
): Promise<{
  originalAmount: number;
  exchangeRate: number;
  convertedAmount: number;
}> {
  const res = await fetchWithAuth(
    `/api/currency/convert?from=${from}&amount=${amount}`,
  );
  return res.data;
}
