'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

const API_URL = process.env.API_URL || 'http://localhost:5002';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const session = await auth();
  if (!session?.user?.token) throw new Error('Unauthorized');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.user.token}`,
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API request failed');
  return data;
}

export async function getSubscriptions() {
  const res = await fetchWithAuth('/api/subscriptions');
  return res.data;
}

export async function createSubscription(data: any) {
  const res = await fetchWithAuth('/api/subscriptions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  revalidatePath('/app/gastos/suscripciones');
  revalidatePath('/app/gastos');
  return res.data;
}

export async function updateSubscription(id: string, data: any) {
  const res = await fetchWithAuth(`/api/subscriptions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  revalidatePath('/app/gastos/suscripciones');
  revalidatePath('/app/gastos');
  return res.data;
}

export async function deleteSubscription(id: string) {
  await fetchWithAuth(`/api/subscriptions/${id}`, { method: 'DELETE' });
  revalidatePath('/app/gastos/suscripciones');
  revalidatePath('/app/gastos');
}

export async function getActiveSubscriptionsCost() {
  const subs = await getSubscriptions();
  const active = subs.filter((s: any) => s.isActive);
  
  let monthlyTotal = 0;
  let yearlyTotal = 0;

  active.forEach((s: any) => {
    if (s.billingCycle === 'monthly') {
      monthlyTotal += s.amount;
      yearlyTotal += s.amount * 12;
    } else {
      yearlyTotal += s.amount;
      monthlyTotal += s.amount / 12;
    }
  });

  return { monthlyTotal, yearlyTotal, count: active.length };
}
