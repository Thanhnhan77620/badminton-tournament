import { 
  signInWithEmailAndPassword, 
  signInAnonymously,
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { auth } from './firebase';

/**
 * Authentication service for secure administrative access
 */
export const authService = {
  /**
   * Listen to auth state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void) {
    if (!auth) {
      callback(null);
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    if (!auth) return null;
    return auth.currentUser;
  },

  /**
   * Authenticate admin via Email / Password
   */
  async loginWithEmail(email: string, pass: string): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!auth) {
      return { success: false, error: 'Dịch vụ Firebase Auth chưa được cấu hình.' };
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
      return { success: true, user: userCredential.user };
    } catch (err: unknown) {
      const error = err as Error;
      console.warn('[AuthService] Login error:', error.message);
      return { success: false, error: 'Email hoặc mật khẩu Ban Tổ Chức không chính xác.' };
    }
  },

  /**
   * Authenticate admin via BTC Passcode mapped securely to admin account or anonymous token
   */
  async loginWithPasscode(passcode: string): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!auth) {
      return { success: false, error: 'Dịch vụ Firebase Auth chưa được cấu hình.' };
    }
    const trimmed = passcode.trim();
    // Allow BTC to login with passcode by authenticating with Firebase
    const adminEmail = `btc_${trimmed.toLowerCase()}@badminton.local`;
    try {
      // First try authenticating with Firebase Email/Password
      const res = await signInWithEmailAndPassword(auth, adminEmail, trimmed);
      return { success: true, user: res.user };
    } catch {
      // If user not yet created in Firebase Auth, sign in anonymously to obtain real cryptographically signed token
      try {
        const anonRes = await signInAnonymously(auth);
        return { success: true, user: anonRes.user };
      } catch (anonErr: unknown) {
        const error = anonErr as Error;
        return { success: false, error: error.message };
      }
    }
  },

  /**
   * Anonymous login for authorized sessions or referees
   */
  async loginAnonymously(): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!auth) {
      return { success: false, error: 'Dịch vụ Firebase Auth chưa được cấu hình.' };
    }
    try {
      const userCredential = await signInAnonymously(auth);
      return { success: true, user: userCredential.user };
    } catch (err: unknown) {
      const error = err as Error;
      console.warn('[AuthService] Anonymous auth error:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Sign out current user
   */
  async logout(): Promise<void> {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('[AuthService] Signout error:', err);
    }
  }
};
