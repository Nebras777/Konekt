import type { DaySummary, PlaceVisit } from '../src/constants/types';
import { DEMO_USERS } from '../src/constants/types';
import { generateDaySummary } from './aiSummary';
import { getContacts } from './contacts';
import { getPrivacySettings } from './privacySettings';
import { getCurrentProfile } from './currentProfile';
import { saveDaySummary } from './firestore';
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
/** A stop with a known position — the only kind we can measure between. */
type LocatedPlace = PlaceVisit & { lat: number; lng: number };

function haversineKm(a: LocatedPlace, b: LocatedPlace): number {
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
  // Stops whose location wasn't shared have no coordinates to measure between.
  const located = places.filter(
    (p): p is LocatedPlace => typeof p.lat === 'number' && typeof p.lng === 'number',
  );
  let km = 0;
  for (let i = 1; i < located.length; i++) {
    km += haversineKm(located[i - 1], located[i]);
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
  // Address the recap by profile id, not by name: names are freely typed, can
  // collide, and change. senderName carries the human-readable part.
  const profile = await getCurrentProfile();
  const userId = options.userId ?? profile?.id ?? DEMO_USERS.sender;
  const senderName = profile?.name ?? DEMO_USERS.sender;
  const recipientId = options.recipientId ?? DEMO_USERS.recipient;
  const date = options.date ?? todayISO();

  const [summaryText, placesWithPhotos] = await Promise.all([
    generateDaySummary(places),
    fillMissingPhotos(places),
  ]);

  const idSafeUserId = userId.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'sender';
  const createdAt = Date.now();
  return {
    id: `${idSafeUserId}_${date}_${createdAt}`,
    userId,
    senderName,
    recipientId,
    date,
    places: placesWithPhotos,
    summaryText,
    distanceKm: totalDistanceKm(placesWithPhotos),
    createdAt,
  };
}

/**
 * Deliver a recap to everyone the sender is actively connected to.
 *
 * One document per recipient, because getInbox() queries by recipientId — a
 * single document can only be addressed to one person. Each copy gets its own
 * id so they don't overwrite each other.
 *
 * Only `active` connections receive anything: a pending invite hasn't been
 * accepted, and sending to it would push a day's movements at someone who
 * never agreed to see them. Returns how many copies were delivered, so the
 * caller can tell the user when the answer is zero.
 */
export async function sendRecapToConnections(
  summary: DaySummary,
  ownerId: string,
): Promise<{ delivered: number; pending: number }> {
  const [contacts, privacy] = await Promise.all([
    getContacts(ownerId),
    getPrivacySettings(ownerId),
  ]);
  const recipients = contacts.filter((c) => c.status === 'active' && c.profileId);
  const pending = contacts.filter((c) => c.status === 'pending').length;

  // The sender's own record: complete, addressed to nobody, written once
  // regardless of how many people it goes to. Without this, Memory Lane shows
  // one entry per recipient — and if every recipient had location withheld, the
  // sender's own history would have no map at all.
  const senderCopy: Promise<unknown> = saveDaySummary({
    ...summary,
    recipientId: '',
    isSenderCopy: true,
  });

  await Promise.all([
    senderCopy,
    ...recipients.map((contact) => {
      const group = contact.group ?? 'other';
      const shareLocation =
        group === 'family'
          ? privacy.shareLocationWithFamily
          : group === 'friends'
            ? privacy.shareLocationWithFriends
            : true;

      // Withheld coordinates are omitted from the document, not hidden in the
      // UI: writing them and asking the recipient's app not to draw them would
      // still put the sender's movements in a database that recipient can read.
      //
      // Only the position goes. The stop keeps its name, time, note and photos,
      // so the recipient still sees the day — just not where it happened.
      const payload: DaySummary = shareLocation
        ? summary
        : {
            ...summary,
            places: summary.places.map(({ lat, lng, ...rest }) => rest),
            distanceKm: undefined,
            locationHidden: true,
          };

      return saveDaySummary({
        ...payload,
        id: `${summary.id}__${contact.profileId}`,
        recipientId: contact.profileId as string,
      });
    }),
  ]);

  return { delivered: recipients.length, pending };
}
