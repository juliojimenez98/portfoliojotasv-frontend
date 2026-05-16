'use server';

const API_URL = process.env.API_URL || 'http://localhost:5002';

export async function registerUser(data: any) {
  try {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true };
    } else {
      return { success: false, error: result.error || 'Registration failed' };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
