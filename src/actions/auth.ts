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

export async function forgotPassword(email: string) {
  try {
    const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, message: result.message };
    } else {
      return { success: false, error: result.error || 'Request failed' };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function resetPassword(data: any) {
  try {
    const res = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    if (res.ok && result.success) {
      return { success: true, message: result.message };
    } else {
      return { success: false, error: result.error || 'Reset failed' };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
