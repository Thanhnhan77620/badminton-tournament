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
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  /**
   * Authenticate admin via Email / Password
   */
  async loginWithEmail(email: string, pass: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      return { success: true, user: userCredential.user };
    } catch (err: unknown) {
      const error = err as Error;
      console.warn('[AuthService] Login error:', error.message);
      return { success: false, error: 'Thông tin đăng nhập không chính xác hoặc quyền truy cập bị từ chối.' };
    }
  },

  /**
   * Anonymous login for authorized sessions or referees
   */
  async loginAnonymously(): Promise<{ success: boolean; user?: User; error?: string }> {
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
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('[AuthService] Signout error:', err);
    }
  }
};
