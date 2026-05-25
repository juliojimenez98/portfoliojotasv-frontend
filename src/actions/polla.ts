"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import type {
  IPollaGroup,
  IPollaMatch,
  IPollaPrediction,
  GroupDashboard,
  FixtureMatch,
} from "@/types/polla";

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

// ─── Groups ─────────────────────────────────────────────────────────────────

export async function getMyPollaGroups(): Promise<IPollaGroup[]> {
  const res = await fetchWithAuth("/api/polla/groups");
  return res.data;
}

export async function getPollaGroup(id: string): Promise<GroupDashboard> {
  const res = await fetchWithAuth(`/api/polla/groups/${id}`);
  return res.data;
}

export async function createPollaGroup(data: {
  name: string;
  description?: string;
  entryFee?: number;
  currency?: string;
  tournamentName?: string;
}): Promise<IPollaGroup> {
  const res = await fetchWithAuth("/api/polla/groups", {
    method: "POST",
    body: JSON.stringify(data),
  });
  revalidatePath("/app/polla_futbolera");
  return res.data;
}

export async function joinPollaGroup(inviteCode: string): Promise<IPollaGroup> {
  const res = await fetchWithAuth("/api/polla/groups/join", {
    method: "POST",
    body: JSON.stringify({ inviteCode }),
  });
  revalidatePath("/app/polla_futbolera");
  return res.data;
}

export async function toggleMemberPayment(
  groupId: string,
  userId: string,
): Promise<IPollaGroup> {
  const res = await fetchWithAuth(
    `/api/polla/groups/${groupId}/members/${userId}/payment`,
    { method: "PATCH" },
  );
  revalidatePath(`/app/polla_futbolera/${groupId}`);
  return res.data;
}

export async function addGroupMember(
  groupId: string,
  username: string,
): Promise<IPollaGroup> {
  const res = await fetchWithAuth(`/api/polla/groups/${groupId}/members`, {
    method: "POST",
    body: JSON.stringify({ username }),
  });
  revalidatePath(`/app/polla_futbolera/${groupId}`);
  return res.data;
}

export async function removeGroupMember(
  groupId: string,
  userId: string,
): Promise<IPollaGroup> {
  const res = await fetchWithAuth(
    `/api/polla/groups/${groupId}/members/${userId}`,
    { method: "DELETE" },
  );
  revalidatePath(`/app/polla_futbolera/${groupId}`);
  return res.data;
}

export async function setTournamentResults(
  groupId: string,
  data: { actualChampion?: string; actualTopScorer?: string },
): Promise<IPollaGroup> {
  const res = await fetchWithAuth(`/api/polla/groups/${groupId}/results`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  revalidatePath(`/app/polla_futbolera/${groupId}`);
  return res.data;
}

// ─── Matches ─────────────────────────────────────────────────────────────────

export async function getPollaMatches(groupId: string): Promise<IPollaMatch[]> {
  const res = await fetchWithAuth(`/api/polla/groups/${groupId}/matches`);
  return res.data;
}

export async function createPollaMatch(
  groupId: string,
  data: {
    stage: string;
    matchday?: number;
    homeTeam: string;
    awayTeam: string;
    matchDate?: string;
  },
): Promise<IPollaMatch> {
  const res = await fetchWithAuth(`/api/polla/groups/${groupId}/matches`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  revalidatePath(`/app/polla_futbolera/${groupId}`);
  return res.data;
}

export async function setMatchResult(
  groupId: string,
  matchId: string,
  homeScore: number,
  awayScore: number,
): Promise<IPollaMatch> {
  const res = await fetchWithAuth(
    `/api/polla/groups/${groupId}/matches/${matchId}/result`,
    {
      method: "PATCH",
      body: JSON.stringify({ homeScore, awayScore }),
    },
  );
  revalidatePath(`/app/polla_futbolera/${groupId}`);
  return res.data;
}

// ─── Predictions ─────────────────────────────────────────────────────────────

export async function getMyPollaPredictions(
  groupId: string,
): Promise<IPollaPrediction> {
  const res = await fetchWithAuth(
    `/api/polla/groups/${groupId}/predictions/me`,
  );
  return res.data;
}

export async function setSpecialPredictions(
  groupId: string,
  data: { predictedChampion?: string; predictedTopScorer?: string },
): Promise<IPollaPrediction> {
  const res = await fetchWithAuth(
    `/api/polla/groups/${groupId}/predictions/special`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
  revalidatePath(`/app/polla_futbolera/${groupId}`);
  return res.data;
}

export async function upsertMatchPrediction(
  groupId: string,
  matchId: string,
  homeScore: number,
  awayScore: number,
): Promise<IPollaPrediction> {
  const res = await fetchWithAuth(
    `/api/polla/groups/${groupId}/predictions/match/${matchId}`,
    {
      method: "PUT",
      body: JSON.stringify({ homeScore, awayScore }),
    },
  );
  return res.data;
}

export async function getSuggestedFixture(): Promise<FixtureMatch[]> {
  const res = await fetchWithAuth("/api/polla/fixture/suggest");
  return res.data;
}

export async function bulkCreatePollaMatches(
  groupId: string,
  matches: FixtureMatch[],
): Promise<IPollaMatch[]> {
  const res = await fetchWithAuth(`/api/polla/groups/${groupId}/matches/bulk`, {
    method: "POST",
    body: JSON.stringify({ matches }),
  });
  revalidatePath(`/app/polla_futbolera/${groupId}`);
  return res.data;
}
