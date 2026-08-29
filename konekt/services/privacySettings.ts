import { doc, getDoc, setDoc } from 'firebase/firestore';

import { db } from './firebaseConfig';

const COLLECTION = 'privacy_settings';

/**
 * A profile's sharing preferences, enforced when a recap is sent.
 *
 * Stored in Firestore, keyed by profile id, rather than on the device. If these
 * lived in local storage they'd reset to the defaults on a new phone — and the
 * defaults are permissive, so a device change would silently start sharing
 * location with people the user had turned off.
 */
export type PrivacySettings = {
  shareLocationWithFamily: boolean;
  shareLocationWithFriends: boolean;
  shareLocationWithOthers: boolean;
};

/** Sharing is on unless the user turns it off. */
export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  shareLocationWithFamily: true,
  shareLocationWithFriends: true,
  shareLocationWithOthers: true,
};

export async function getPrivacySettings(profileId: string): Promise<PrivacySettings> {
  const snap = await getDoc(doc(db, COLLECTION, profileId));
  if (!snap.exists()) {
    return DEFAULT_PRIVACY_SETTINGS;
  }
  // Merge over the defaults so a document written before a setting existed
  // doesn't come back with that field undefined.
  return { ...DEFAULT_PRIVACY_SETTINGS, ...(snap.data() as Partial<PrivacySettings>) };
}

export async function savePrivacySettings(
  profileId: string,
  settings: PrivacySettings,
): Promise<void> {
  await setDoc(doc(db, COLLECTION, profileId), settings);
}
