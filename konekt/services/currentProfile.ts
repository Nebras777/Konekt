import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Profile } from '../src/constants/types';

const STORAGE_KEY = 'konekt.currentProfile';

/**
 * Remembers which profile this device is signed up as, so sends know whose
 * name to attach without asking again every time.
 */
export async function setCurrentProfile(profile: Profile): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Profile) : null;
}

/**
 * Forget the signed-in profile. Only clears which profile this device is
 * signed in as — the profile document itself, and everything it has sent,
 * stay in Firestore so logging back in restores them.
 */
export async function clearCurrentProfile(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
