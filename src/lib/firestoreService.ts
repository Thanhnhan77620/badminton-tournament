import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db, TOURNAMENT_DOC_ID, isFirebaseConfigured } from './firebase';
import { TournamentInfo, Pair, Match, Player } from '../types/tournament';

export interface TournamentCloudState {
  tournament: TournamentInfo;
  pairs: Pair[];
  matches: Match[];
  players: Player[];
  updatedAt: string;
  version: number;
}

/**
 * Save full tournament state to Firestore Realtime Database
 */
export async function saveTournamentToCloud(
  tournament: TournamentInfo,
  pairs: Pair[],
  matches: Match[],
  players: Player[],
  version: number = Date.now()
): Promise<boolean> {
  if (!isFirebaseConfigured || !db) {
    return false;
  }
  try {
    const docRef = doc(db, 'tournaments', TOURNAMENT_DOC_ID);
    const payload: TournamentCloudState = {
      tournament,
      pairs,
      matches,
      players,
      updatedAt: new Date().toISOString(),
      version,
    };
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (error) {
    console.warn('[Firestore] Failed to save tournament to cloud:', error);
    return false;
  }
}

/**
 * Fetch current tournament state from Firestore
 */
export async function getTournamentFromCloud(): Promise<TournamentCloudState | null> {
  if (!isFirebaseConfigured || !db) {
    return null;
  }
  try {
    const docRef = doc(db, 'tournaments', TOURNAMENT_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as TournamentCloudState;
    }
    return null;
  } catch (error) {
    console.warn('[Firestore] Failed to get tournament from cloud:', error);
    return null;
  }
}

/**
 * Subscribe to real-time updates for tournament
 */
export function subscribeTournamentFromCloud(
  onUpdate: (data: TournamentCloudState) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  if (!isFirebaseConfigured || !db) {
    return () => {};
  }
  try {
    const docRef = doc(db, 'tournaments', TOURNAMENT_DOC_ID);
    return onSnapshot(
      docRef,
      snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.data() as TournamentCloudState;
          onUpdate(data);
        }
      },
      error => {
        console.warn('[Firestore] Real-time subscription notice:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('[Firestore] Real-time init notice:', err);
    if (onError && err instanceof Error) onError(err);
    return () => {};
  }
}
