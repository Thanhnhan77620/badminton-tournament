import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, setLogLevel } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
// Read config from Vite environment variables (Recommended for Vercel/Production)
// or fallback to import.meta.glob for local container development
const env = import.meta.env;

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || '',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: env.VITE_FIREBASE_APP_ID || '',
  firestoreDatabaseId: env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || '(default)',
};

// Auto-fill fallback in dev environment if local json is present
const localConfigModules = import.meta.glob<{ default: Record<string, string> }>('../../firebase-applet-config.json', {
  eager: true,
});
const localFile = localConfigModules['../../firebase-applet-config.json']?.default;
if (localFile) {
  if (!firebaseConfig.apiKey) firebaseConfig.apiKey = localFile.apiKey || '';
  if (!firebaseConfig.authDomain) firebaseConfig.authDomain = localFile.authDomain || '';
  if (!firebaseConfig.projectId) firebaseConfig.projectId = localFile.projectId || '';
  if (!firebaseConfig.storageBucket) firebaseConfig.storageBucket = localFile.storageBucket || '';
  if (!firebaseConfig.messagingSenderId) firebaseConfig.messagingSenderId = localFile.messagingSenderId || '';
  if (!firebaseConfig.appId) firebaseConfig.appId = localFile.appId || '';
  if (firebaseConfig.firestoreDatabaseId === '(default)' && localFile.firestoreDatabaseId) {
    firebaseConfig.firestoreDatabaseId = localFile.firestoreDatabaseId;
  }
}

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey.trim() !== '' &&
  firebaseConfig.apiKey !== 'MY_FIREBASE_API_KEY' &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId.trim() !== ''
);

// Mute internal Firestore connection retry logs so harmless offline states do not trigger artificial console errors
try {
  setLogLevel('silent');
} catch {}

// Initialize Firebase App singleton only if properly configured
const app: FirebaseApp | null = isFirebaseConfigured
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp())
  : null;

// Initialize Auth
export const auth: Auth | null = app ? getAuth(app) : null;

// Initialize Firestore with configured databaseId
export const db: Firestore | null = app
  ? (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app))
  : null;

export const TOURNAMENT_DOC_ID = 'badminton-open-2026';
export { firebaseConfig };

