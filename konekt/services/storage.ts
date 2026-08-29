import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { storage } from './firebaseConfig';

/**
 * Uploads a local file (from a device URI, e.g. a recorded voice memo) to
 * Firebase Storage and returns its public download URL.
 */
export async function uploadLocalFile(localUri: string, storagePath: string): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();
  const fileRef = ref(storage, storagePath);
  await uploadBytes(fileRef, blob);
  return getDownloadURL(fileRef);
}
