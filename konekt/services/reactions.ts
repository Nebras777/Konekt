import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

import { db } from './firebaseConfig';
import type { Reaction, ReactionLabel } from '../src/constants/types';

const COLLECTION = 'reactions';

/**
 * Deterministic id: one reaction per person per recap. Reacting again replaces
 * the previous one instead of stacking, which is what "Love it" then "Proud"
 * should mean.
 */
function reactionId(summaryId: string, reactorId: string): string {
  return `${summaryId}__${reactorId}`;
}

export async function setReaction(params: {
  summaryId: string;
  ownerId: string;
  reactorId: string;
  reactorName: string;
  label: ReactionLabel;
}): Promise<void> {
  await setDoc(doc(db, COLLECTION, reactionId(params.summaryId, params.reactorId)), {
    summaryId: params.summaryId,
    ownerId: params.ownerId,
    reactorId: params.reactorId,
    reactorName: params.reactorName,
    label: params.label,
    createdAt: Date.now(),
    // A replaced reaction is new news for the author, so it resurfaces.
    seen: false,
  });
}

export async function clearReaction(summaryId: string, reactorId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, reactionId(summaryId, reactorId)));
}

/** Every reaction this person has left, so their own choice shows as selected. */
export async function getMyReactions(reactorId: string): Promise<Reaction[]> {
  const snap = await getDocs(
    query(collection(db, COLLECTION), where('reactorId', '==', reactorId)),
  );
  return snap.docs.map((d) => ({ ...(d.data() as Omit<Reaction, 'id'>), id: d.id }));
}

/**
 * Reactions to this person's recaps, newest first — their activity feed.
 */
export async function getReactionsForOwner(ownerId: string): Promise<Reaction[]> {
  const snap = await getDocs(
    query(collection(db, COLLECTION), where('ownerId', '==', ownerId)),
  );
  return snap.docs
    .map((d) => ({ ...(d.data() as Omit<Reaction, 'id'>), id: d.id }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

/** Mark activity as read. Best-effort: a failed write only costs the unread dot. */
export async function markReactionsSeen(ids: string[]): Promise<void> {
  await Promise.all(
    ids.map((id) => updateDoc(doc(db, COLLECTION, id), { seen: true }).catch(() => {})),
  );
}
