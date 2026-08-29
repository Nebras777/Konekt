import {
  collection,
  doc,
  getDoc,
  query,
  setDoc,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import type { DaySummary } from '../src/constants/types';

const COLLECTION = 'day_summaries';

/**
 * Save a full day summary to Firestore, keyed by its own `id` field so it can
 * be looked up later with getDaySummaryById.
 * Returns the summary's id.
 */
export async function saveDaySummary(summary: DaySummary): Promise<string> {
  // Firestore rejects any field explicitly set to `undefined` (e.g. an
  // optional highlightNote that wasn't filled in) — drop those keys
  // entirely rather than writing them.
  const cleaned = Object.fromEntries(
    Object.entries(summary).filter(([, value]) => value !== undefined),
  ) as DaySummary;

  await setDoc(doc(db, COLLECTION, summary.id), cleaned);
  return summary.id;
}

/**
 * Get a single day summary by id, or null if it doesn't exist.
 */
export async function getDaySummaryById(id: string): Promise<DaySummary | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  return snap.exists() ? (snap.data() as DaySummary) : null;
}

/**
 * Get every day summary sent to a given recipient, newest first.
 */
export async function getInbox(recipientId: string): Promise<DaySummary[]> {
  const q = query(
    collection(db, COLLECTION),
    where('recipientId', '==', recipientId),
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ ...(d.data() as DaySummary), id: d.id }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Get every day summary a given user has sent, newest first — their own
 * Memory Lane archive.
 */
export async function getMyDays(userId: string): Promise<DaySummary[]> {
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
  );
  const snap = await getDocs(q);
  const all = snap.docs.map((d) => ({ ...(d.data() as DaySummary), id: d.id }));

  return dedupeToOnePerDay(all).sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Sending fans a recap out to one document per recipient, so a day sent to
 * three people is three documents. Memory Lane is the sender's own history and
 * should show that day once, with everything in it.
 *
 * Recaps sent from now on include an unstripped sender copy, which is simply
 * the right answer. Recaps sent before that exist only as per-recipient copies,
 * so those are grouped by the id they share and the richest one is kept — a
 * copy that still has coordinates beats one whose location was withheld.
 */
function dedupeToOnePerDay(summaries: DaySummary[]): DaySummary[] {
  const senderCopies = summaries.filter((s) => s.isSenderCopy);
  const senderCopyIds = new Set(senderCopies.map((s) => s.id));

  const byDay = new Map<string, DaySummary>();
  for (const summary of summaries) {
    if (summary.isSenderCopy) {
      continue;
    }
    // Recipient copies are the sender copy's id plus "__<recipient>".
    const baseId = summary.id.split('__')[0];
    if (senderCopyIds.has(baseId)) {
      continue; // a full copy of this day already exists
    }

    const existing = byDay.get(baseId);
    if (!existing || locatedCount(summary) > locatedCount(existing)) {
      byDay.set(baseId, summary);
    }
  }

  return [...senderCopies, ...byDay.values()];
}

function locatedCount(summary: DaySummary): number {
  return summary.places.filter(
    (p) => typeof p.lat === 'number' && typeof p.lng === 'number',
  ).length;
}
