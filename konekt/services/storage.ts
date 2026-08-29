import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { storage } from './firebaseConfig';

// fetch(uri).blob() is unreliable for local file:// URIs on React Native
// (it's a known Firebase+RN gotcha — see Expo's own with-firebase-storage-upload
// example). XMLHttpRequest is the battle-tested way to read a local file as a
// Blob on this platform.
function readLocalFileAsBlob(localUri: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.response);
    xhr.onerror = () => reject(new Error('Could not read the local file for upload'));
    xhr.responseType = 'blob';
    xhr.open('GET', localUri, true);
    xhr.send(null);
  });
}

/**
 * Uploads a local file (from a device URI, e.g. a recorded voice memo) to
 * Firebase Storage and returns its public download URL.
 */
export async function uploadLocalFile(localUri: string, storagePath: string): Promise<string> {
  const blob = await readLocalFileAsBlob(localUri);
  const fileRef = ref(storage, storagePath);
  try {
    await uploadBytes(fileRef, blob);
  } finally {
    // React Native's Blob holds a native file handle open until closed.
    (blob as Blob & { close?: () => void }).close?.();
  }
  return getDownloadURL(fileRef);
}
