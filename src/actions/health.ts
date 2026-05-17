'use server';

export async function checkBackendHealth() {
  const API_URL = process.env.API_URL || 'http://localhost:5002';
  try {
    const res = await fetch(`${API_URL}/api/health`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    return {
      success: res.ok,
      status: res.status,
      apiUrl: API_URL,
      data,
      error: null,
    };
  } catch (error: any) {
    return {
      success: false,
      status: null,
      apiUrl: API_URL,
      data: null,
      error: error.message || 'Failed to fetch',
    };
  }
}
