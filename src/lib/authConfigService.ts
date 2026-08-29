import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { hashWithSalt, recordFailedAttempt, resetRateLimit, getRateLimitStatus } from './cryptoUtils';

export interface AdminSecurityConfig {
  salt: string;
  loginHash: string;
  statusHash: string;
  updatedAt: string;
}

const CONFIG_COLLECTION = 'system_config';
const CONFIG_DOC_ID = 'admin_security';

/**
 * Fetch security config purely from Firestore DB
 */
export async function getAdminSecurityConfig(): Promise<AdminSecurityConfig | null> {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, CONFIG_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as AdminSecurityConfig;
    }
    return null;
  } catch (err) {
    console.warn('[SecurityConfig] Error fetching security config from DB:', err);
    return null;
  }
}

/**
 * Verify Login Passcode against Salt and Hash stored in DB
 */
export async function verifyLoginPasscode(enteredPasscode: string): Promise<{
  success: boolean;
  error?: string;
}> {
  // 1. Check Rate Limiter
  const rateLimit = getRateLimitStatus();
  if (rateLimit.isLocked) {
    return {
      success: false,
      error: `Tài khoản tạm khóa do nhập sai quá 5 lần. Vui lòng thử lại sau ${rateLimit.remainingSeconds} giây.`,
    };
  }

  // 2. Fetch Salt & Hash from Firestore
  const config = await getAdminSecurityConfig();
  if (!config || !config.loginHash || !config.salt) {
    return {
      success: false,
      error: 'Không tìm thấy cấu hình bảo mật trên máy chủ hoặc lỗi kết nối. Vui lòng thử lại.',
    };
  }

  // 3. Hash user input with salt from DB
  const inputHash = await hashWithSalt(enteredPasscode, config.salt);

  const isValid = inputHash === config.loginHash;

  if (isValid) {
    resetRateLimit();
    return { success: true };
  } else {
    const limitAfterFail = recordFailedAttempt();
    if (limitAfterFail.isLocked) {
      return {
        success: false,
        error: `Nhập sai quá 5 lần. Hệ thống tạm khóa 5 phút để bảo vệ tài khoản.`,
      };
    }
    return {
      success: false,
      error: 'Mật mã Ban Tổ Chức không chính xác. Vui lòng thử lại.',
    };
  }
}

/**
 * Verify Tournament Status Change Passcode against Salt and Hash stored in DB
 */
export async function verifyStatusPasscode(enteredPasscode: string): Promise<boolean> {
  try {
    const config = await getAdminSecurityConfig();
    if (!config || !config.statusHash || !config.salt) return false;
    const inputHash = await hashWithSalt(enteredPasscode, config.salt);
    return inputHash === config.statusHash;
  } catch {
    return false;
  }
}
