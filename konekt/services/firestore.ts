import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { DaySummary } from '../src/constants/types';

const COLLECTION = 'day_summaries';

/**
 * Save a full day summary to Firestore.
 * Returns the generated document id.
 */
export async function saveDaySummary(summary: DaySummary): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), summary);
  return ref.id;
}

/**
 * Get every day summary sent to a given recipient, newest first.
 */
export async function getInbox(recipientId: string): Promise<DaySummary[]> {
  const q = query(
    collection(db, COLLECTION),
    where('recipientId', '==', recipientId),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...(d.data() as DaySummary), id: d.id }));
}
