import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';

import { db } from './firebaseConfig';
import type { Ping, PingKind } from '../src/constants/types';

const COLLECTION = 'pings';

/**
 * Send a short message to one person.
 *
 * Ids are generated rather than derived, because unlike a reaction these are
 * events: sending "I'm okay" twice on different days is two pieces of news, not
 * an edit of the first.
 */
export async function sendPing(params: {
  kind: PingKind;
  fromId: string;
  fromName: string;
  toId: string;
}): Promise<void> {
  await addDoc(collection(db, COLLECTION), {
    ...params,
    createdAt: Date.now(),
    seen: false,
  });
}

/** Send the same message to several people at once. */
export async function sendPingToMany(params: {
  kind: PingKind;
  fromId: string;
  fromName: string;
  toIds: string[];
}): Promise<number> {
  await Promise.all(
    params.toIds.map((toId) =>
      sendPing({ kind: params.kind, fromId: params.fromId, fromName: params.fromName, toId }),
    ),
  );
  return params.toIds.length;
}

/** Messages addressed to this person, newest first. */
export async function getPingsFor(toId: string): Promise<Ping[]> {
  const snap = await getDocs(query(collection(db, COLLECTION), where('toId', '==', toId)));
  return snap.docs
    .map((d) => ({ ...(d.data() as Omit<Ping, 'id'>), id: d.id }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

/** Messages this person sent — used to work out when they last shared anything. */
export async function getPingsFrom(fromId: string): Promise<Ping[]> {
  const snap = await getDocs(query(collection(db, COLLECTION), where('fromId', '==', fromId)));
  return snap.docs
    .map((d) => ({ ...(d.data() as Omit<Ping, 'id'>), id: d.id }))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function markPingsSeen(ids: string[]): Promise<void> {
  await Promise.all(
    ids.map((id) => updateDoc(doc(db, COLLECTION, id), { seen: true }).catch(() => {})),
  );
}
