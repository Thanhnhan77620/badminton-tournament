/**
 * Cryptographic Utility for Secure Salted Hashing
 * Prevents plain-text password leakage in client bundles and Rainbow Table attacks.
 */

const AUTH_SALT = 'BadmintonOpen_2026_SecureSalt_FTEL_ISC_CDC';

/**
 * Hash a plain string with internal salt using browser native SHA-256 (Web Crypto API)
 */
export async function hashWithSalt(plainText: string): Promise<string> {
  const normalized = plainText.trim();
  const data = new TextEncoder().encode(normalized + AUTH_SALT);
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback simple 32-bit FNV-1a / DJB2 mix if subtle crypto is unavailable
  let hash = 0x811c9dc5;
  for (let i = 0; i < data.length; i++) {
    hash ^= data[i];
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16);
}

// Rate Limiter to prevent Brute-Force Attacks on Client UI
interface RateLimitState {
  failedAttempts: number;
  lockedUntil: number | null;
}

const STORAGE_KEY_RATE_LIMIT = 'badminton_admin_rate_limit';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

export function getRateLimitStatus(): { isLocked: boolean; remainingSeconds: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RATE_LIMIT);
    if (!raw) return { isLocked: false, remainingSeconds: 0 };
    const state: RateLimitState = JSON.parse(raw);
    if (state.lockedUntil && Date.now() < state.lockedUntil) {
      const remainingSeconds = Math.ceil((state.lockedUntil - Date.now()) / 1000);
      return { isLocked: true, remainingSeconds };
    }
    return { isLocked: false, remainingSeconds: 0 };
  } catch {
    return { isLocked: false, remainingSeconds: 0 };
  }
}

export function recordFailedAttempt(): { isLocked: boolean; remainingSeconds: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RATE_LIMIT);
    const state: RateLimitState = raw ? JSON.parse(raw) : { failedAttempts: 0, lockedUntil: null };
    
    state.failedAttempts += 1;
    if (state.failedAttempts >= MAX_ATTEMPTS) {
      state.lockedUntil = Date.now() + LOCKOUT_MS;
    }
    localStorage.setItem(STORAGE_KEY_RATE_LIMIT, JSON.stringify(state));
    return getRateLimitStatus();
  } catch {
    return { isLocked: false, remainingSeconds: 0 };
  }
}

export function resetRateLimit(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_RATE_LIMIT);
  } catch {}
}
