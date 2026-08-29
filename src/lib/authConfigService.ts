import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { hashWithSalt, recordFailedAttempt, resetRateLimit, getRateLimitStatus } from './cryptoUtils';

export interface AdminSecurityConfig {
  loginHash: string;
  statusHash: string;
  updatedAt: string;
}

const CONFIG_COLLECTION = 'system_config';
const CONFIG_DOC_ID = 'admin_security';

// Primary Salted Hash Defaults in Database
const DEFAULT_LOGIN_HASH = '0d2322b03f69d5d2981018c2cc8d81ef4abbf0b7f9dc2b6c6c56fbf107580ad4';
const DEFAULT_STATUS_HASH = '934e1f127a8b565eae6567d192d4ba2175ca9b24d60136316c3ddd5ac0a853c0';

/**
 * Fetch or initialize security hashes from Firestore DB
 */
export async function getAdminSecurityConfig(): Promise<AdminSecurityConfig> {
  try {
    const docRef = doc(db, CONFIG_COLLECTION, CONFIG_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as AdminSecurityConfig;
    }
    // If not exists in DB yet, initialize it
    const initialConfig: AdminSecurityConfig = {
      loginHash: DEFAULT_LOGIN_HASH,
      statusHash: DEFAULT_STATUS_HASH,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, initialConfig, { merge: true }).catch(() => {});
    return initialConfig;
  } catch {
    return {
      loginHash: DEFAULT_LOGIN_HASH,
      statusHash: DEFAULT_STATUS_HASH,
      updatedAt: new Date().toISOString(),
    };
  }
}

/**
 * Verify Login Passcode against Salted Cryptographic Hash in DB
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

  // 2. Hash user input with internal salt
  const inputHash = await hashWithSalt(enteredPasscode);

  // 3. Compare with DB Hash
  const config = await getAdminSecurityConfig();
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
 * Verify Tournament Status Change Passcode against Salted Cryptographic Hash in DB
 */
export async function verifyStatusPasscode(enteredPasscode: string): Promise<boolean> {
  try {
    const inputHash = await hashWithSalt(enteredPasscode);
    const config = await getAdminSecurityConfig();
    return inputHash === config.statusHash;
  } catch {
    return false;
  }
}
