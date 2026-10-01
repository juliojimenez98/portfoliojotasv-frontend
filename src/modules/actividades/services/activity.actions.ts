"use server";

import { auth } from "@/auth";
import type {
  ActivityInput,
  IActivity,
  IActivityLog,
} from "../types/activity.types";

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

export async function getActivities(): Promise<IActivity[]> {
  const res = await fetchWithAuth("/api/activities");
  return res.activities || [];
}

export async function getActivityLogs(): Promise<IActivityLog[]> {
  const res = await fetchWithAuth("/api/activities/logs");
  return res.logs || [];
}

export async function createActivity(data: ActivityInput): Promise<IActivity> {
  const res = await fetchWithAuth("/api/activities", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.activity;
}

export async function updateActivity(
  id: string,
  data: Partial<ActivityInput>,
): Promise<IActivity> {
  const res = await fetchWithAuth(`/api/activities/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.activity;
}

export async function deleteActivity(id: string): Promise<void> {
  await fetchWithAuth(`/api/activities/${id}`, { method: "DELETE" });
}

export async function completeActivity(
  id: string,
  note?: string,
): Promise<{ message: string; activity: IActivity; log: IActivityLog }> {
  const res = await fetchWithAuth(`/api/activities/${id}/complete`, {
    method: "POST",
    body: JSON.stringify({ note }),
  });
  return { message: res.message, activity: res.activity, log: res.log };
}

export async function checkInActivity(
  id: string,
  note?: string,
): Promise<{ message: string; activity: IActivity; log: IActivityLog }> {
  const res = await fetchWithAuth(`/api/activities/${id}/check-in`, {
    method: "POST",
    body: JSON.stringify({ note }),
  });
  return { message: res.message, activity: res.activity, log: res.log };
}

export async function checkOutActivity(
  id: string,
  note?: string,
): Promise<{ message: string; activity: IActivity; log: IActivityLog }> {
  const res = await fetchWithAuth(`/api/activities/${id}/check-out`, {
    method: "POST",
    body: JSON.stringify({ note }),
  });
  return { message: res.message, activity: res.activity, log: res.log };
}

export async function skipActivity(
  id: string,
  reason?: string,
): Promise<{ message: string; activity: IActivity; log: IActivityLog }> {
  const res = await fetchWithAuth(`/api/activities/${id}/skip`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  return { message: res.message, activity: res.activity, log: res.log };
}
