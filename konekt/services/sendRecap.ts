import type { DaySummary, PlaceVisit } from '../src/constants/types';
import { DEMO_USERS } from '../src/constants/types';
import { generateDaySummary } from './aiSummary';
import { getCurrentProfile } from './currentProfile';
import { fillMissingPhotos } from './unsplash';

type BuildRecapOptions = {
  userId?: string;
  recipientId?: string;
  date?: string; // "2026-08-29"; defaults to today
};

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// Straight-line distance between two coordinates, in km (haversine formula).
function haversineKm(a: PlaceVisit, b: PlaceVisit): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Total distance across the day, rounded to one decimal. Exported so the
// recap screen can recompute it after the user excludes stops, pre-send.
export function totalDistanceKm(places: PlaceVisit[]): number {
  let km = 0;
  for (let i = 1; i < places.length; i++) {
    km += haversineKm(places[i - 1], places[i]);
  }
  return Math.round(km * 10) / 10;
}

/**
 * Turns raw places into a draft DaySummary, ready for review:
 *   1. generate the AI summary text
 *   2. fill in any missing photos
 *   3. assemble the DaySummary object
 *
 * Steps 1 and 2 are independent, so they run in parallel.
 * Does NOT save anything — the recap screen only persists it (via
 * saveDaySummary) once the user actually presses Send, so they can edit
 * (e.g. exclude stops) before anyone else sees it.
 */
export async function buildDayRecap(
  places: PlaceVisit[],
  options: BuildRecapOptions = {},
): Promise<DaySummary> {
  const profile = options.userId ? null : await getCurrentProfile();
  const userId = options.userId ?? profile?.name ?? DEMO_USERS.sender;
  const recipientId = options.recipientId ?? DEMO_USERS.recipient;
  const date = options.date ?? todayISO();

  const [summaryText, placesWithPhotos] = await Promise.all([
    generateDaySummary(places),
    fillMissingPhotos(places),
  ]);

  // userId doubles as the sender's display name (see recaps.tsx), but a
  // freely-typed profile name isn't safe to use as-is in a Firestore doc id.
  const idSafeUserId = userId.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'sender';
  const createdAt = Date.now();
  return {
    id: `${idSafeUserId}_${date}_${createdAt}`,
    userId,
    recipientId,
    date,
    places: placesWithPhotos,
    summaryText,
    distanceKm: totalDistanceKm(placesWithPhotos),
    createdAt,
  };
}
