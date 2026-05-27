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
  if (!res.ok) throw new Error("API request failed");
  return res.json();
}

export async function getTransactions(
  filters: { type?: string; accountId?: string } = {},
) {
  const params = new URLSearchParams();
  if (filters.type) params.append("type", filters.type);
  if (filters.accountId) params.append("accountId", filters.accountId);

  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await fetchWithAuth(`/api/transactions${query}`);
  return res.data;
}

export async function getTransactionCategories() {
  const res = await fetchWithAuth("/api/transactions/categories");
  return res.data;
}

export async function createTransaction(data: any) {
  const res = await fetchWithAuth("/api/transactions", {
    method: "POST",
    body: JSON.stringify(data),
  });
  revalidatePath("/app/gastos");
  return res.data;
}

export async function updateTransaction(id: string, data: any) {
  const res = await fetchWithAuth(`/api/transactions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  revalidatePath("/app/gastos");
  revalidatePath("/app/gastos/transacciones");
  return res.data;
}

export async function deleteTransaction(id: string) {
  await fetchWithAuth(`/api/transactions/${id}`, { method: "DELETE" });
  revalidatePath("/app/gastos");
}

export async function createCategory(data: { label: string; icon: string; limit?: number }) {
  const res = await fetchWithAuth("/api/transactions/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
  revalidatePath("/app/gastos");
  return res.data;
}

export async function updateCategory(
  id: string,
  data: { label?: string; icon?: string; limit?: number | null },
) {
  const res = await fetchWithAuth(`/api/transactions/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  revalidatePath("/app/gastos");
  return res.data;
}

export async function deleteCategory(id: string) {
  await fetchWithAuth(`/api/transactions/categories/${id}`, {
    method: "DELETE",
  });
  revalidatePath("/app/gastos");
}

export async function getMonthlyExpenseSummary(month: number, year: number) {
  const [txns, resAccounts] = await Promise.all([
    getTransactions({ type: "expense" }),
    fetchWithAuth("/api/accounts"),
  ]);

  const accounts = resAccounts.data || [];

  const filtered = txns.filter((t: any) => {
    const d = new Date(t.date);
    return d.getMonth() + 1 === month && d.getFullYear() === year;
  });

  const summaryMap: Record<
    string,
    { total: number; count: number; name: string; color: string }
  > = {};

  for (const acc of accounts) {
    summaryMap[acc._id] = {
      total: 0,
      count: 0,
      name: acc.name,
      color: acc.color || "#8b5cf6",
    };
  }

  for (const t of filtered) {
    if (summaryMap[t.accountId]) {
      summaryMap[t.accountId].total += t.amount;
      summaryMap[t.accountId].count += 1;
    }
  }

  return Object.entries(summaryMap)
    .map(([accountId, data]) => ({
      accountId,
      accountName: data.name,
      accountColor: data.color,
      total: data.total,
      count: data.count,
    }))
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total);
}

export async function getCurrentMonthTotal() {
  const txns = await getTransactions({ type: "expense" });
  const now = new Date();
  return txns
    .filter(
      (t: any) =>
        new Date(t.date).getMonth() === now.getMonth() &&
        new Date(t.date).getFullYear() === now.getFullYear(),
    )
    .reduce((acc: number, t: any) => acc + t.amount, 0);
}

export async function getCurrentYearTotal() {
  const txns = await getTransactions({ type: "expense" });
  const now = new Date();
  return txns
    .filter((t: any) => new Date(t.date).getFullYear() === now.getFullYear())
    .reduce((acc: number, t: any) => acc + t.amount, 0);
}

export async function getMonthlyComparisonSummary(year: number) {
  const txns = await getTransactions();

  const filtered = txns.filter(
    (t: any) => new Date(t.date).getFullYear() === year,
  );

  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const monthlyData = months.map((monthName, idx) => ({
    monthIndex: idx,
    monthName,
    income: 0,
    expense: 0,
    savings: 0,
    categories: {} as Record<string, number>,
  }));

  for (const t of filtered) {
    const d = new Date(t.date);
    const m = d.getMonth();

    if (t.type === "income") {
      monthlyData[m].income += t.amount;
    } else if (t.type === "expense") {
      monthlyData[m].expense += t.amount;
      const cat = t.category || "other";
      monthlyData[m].categories[cat] =
        (monthlyData[m].categories[cat] || 0) + t.amount;
    }
  }

  return monthlyData.map((m) => {
    const savings = m.income - m.expense;
    const topCategories = Object.entries(m.categories)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    return {
      monthIndex: m.monthIndex,
      monthName: m.monthName,
      income: m.income,
      expense: m.expense,
      savings,
      topCategories,
    };
  });
}
