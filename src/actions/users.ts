'use server';

import { auth } from '@/auth';
import type { PaydayConfig } from '@/types/user';

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
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(errorData?.error || 'API request failed');
  }
  
  return res.json();
}

export async function getUsers() {
  const res = await fetchWithAuth('/api/users');
  return res.data;
}

export async function getUser(id: string) {
  const res = await fetchWithAuth(`/api/users/${id}`);
  return res.data;
}

export async function createUser(data: any) {
  const res = await fetchWithAuth('/api/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateUser(id: string, data: any) {
  const res = await fetchWithAuth(`/api/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteUser(id: string) {
  await fetchWithAuth(`/api/users/${id}`, { method: 'DELETE' });
}

// ── Payday profile (current user) ──────────────────────────────────────────

export async function getPaydayConfig(): Promise<PaydayConfig | null> {
  const res = await fetchWithAuth('/api/profile/payday');
  return res.data;
}

export async function savePaydayConfig(data: PaydayConfig): Promise<PaydayConfig> {
  const res = await fetchWithAuth('/api/profile/payday', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deletePaydayConfig(): Promise<void> {
  await fetchWithAuth('/api/profile/payday', { method: 'DELETE' });
}
