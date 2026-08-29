import type { DaySummary, PlaceVisit } from '../src/constants/types';
import { DEMO_USERS } from '../src/constants/types';
import { generateDaySummary } from './aiSummary';
import { fillMissingPhotos } from './unsplash';
import { saveDaySummary } from './firestore';

type SendRecapOptions = {
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

// Total distance across the day, rounded to one decimal.
function totalDistanceKm(places: PlaceVisit[]): number {
  let km = 0;
  for (let i = 1; i < places.length; i++) {
    km += haversineKm(places[i - 1], places[i]);
  }
  return Math.round(km * 10) / 10;
}

/**
 * The full "Send" pipeline:
 *   1. generate the AI summary text
 *   2. fill in any missing photos
 *   3. assemble the DaySummary object
 *   4. save it to Firestore
 *
 * Steps 1 and 2 are independent, so they run in parallel.
 * Returns the saved DaySummary (with its final id).
 */
export async function sendDayRecap(
  places: PlaceVisit[],
  options: SendRecapOptions = {},
): Promise<DaySummary> {
  const userId = options.userId ?? DEMO_USERS.sender;
  const recipientId = options.recipientId ?? DEMO_USERS.recipient;
  const date = options.date ?? todayISO();

  const [summaryText, placesWithPhotos] = await Promise.all([
    generateDaySummary(places),
    fillMissingPhotos(places),
  ]);

  const createdAt = Date.now();
  const summary: DaySummary = {
    id: `${userId}_${date}_${createdAt}`,
    userId,
    recipientId,
    date,
    places: placesWithPhotos,
    summaryText,
    distanceKm: totalDistanceKm(placesWithPhotos),
    createdAt,
  };

  await saveDaySummary(summary);
  return summary;
}
