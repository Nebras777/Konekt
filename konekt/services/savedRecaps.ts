import { collection, deleteDoc, doc, getDocs, query, setDoc, where } from 'firebase/firestore';

import { db } from './firebaseConfig';

const COLLECTION = 'saved_recaps';

/**
 * Recaps a person has bookmarked from their inbox, so they can come back to one
 * any time instead of scrolling for it.
 *
 * Stored in Firestore rather than on the device: a save belongs to the profile,
 * so it should follow them to another phone, and it must outlive a log out.
 *
 * Only a reference is stored, never a copy of the recap. Copying would freeze
 * the recap at save time and quietly duplicate someone else's data under the
 * saver's profile; the original in day_summaries stays the single source.
 */

/**
 * Deterministic id so saving twice is a no-op rather than creating duplicates —
 * a double tap shouldn't produce two rows.
 */
function savedId(profileId: string, summaryId: string): string {
  return `${profileId}__${summaryId}`;
}

export async function saveRecap(profileId: string, summaryId: string): Promise<void> {
  await setDoc(doc(db, COLLECTION, savedId(profileId, summaryId)), {
    profileId,
    summaryId,
    savedAt: Date.now(),
  });
}

export async function unsaveRecap(profileId: string, summaryId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, savedId(profileId, summaryId)));
}

/**
 * The ids of every recap this profile has saved. Returned as a Set because the
 * caller checks membership per row while rendering a list.
 */
export async function getSavedRecapIds(profileId: string): Promise<Set<string>> {
  const snap = await getDocs(
    query(collection(db, COLLECTION), where('profileId', '==', profileId)),
  );
  return new Set(snap.docs.map((d) => d.data().summaryId as string));
}
