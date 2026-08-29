import type { PlaceVisit, PlaceType } from '../src/constants/types';

const UNSPLASH_API_URL = 'https://api.unsplash.com/photos/random';

// What to search Unsplash for, per place type.
const QUERY_BY_TYPE: Record<PlaceType, string> = {
  home: 'cozy home living room',
  study: 'university library study',
  food: 'cafe coffee food',
  social: 'friends hanging out cafe',
  gym: 'gym workout fitness',
  transit: 'city train station street',
  outdoor: 'park nature path',
  other: 'city street daytime',
};

// Always-works fallback if the Unsplash key is missing or the request fails.
// Lorem Picsum needs no key and never 404s; the seed keeps it stable per type.
function placeholderFor(placeType: PlaceType): string {
  return `https://picsum.photos/seed/konekt-${placeType}/800/600`;
}

// Re-use one fetched photo per type within a run (fewer API calls, and the
// same "home" photo for both the morning and evening stop).
const cache = new Map<PlaceType, string>();

/**
 * Get a stock photo URL that matches a place type.
 * Uses the Unsplash API when EXPO_PUBLIC_UNSPLASH_ACCESS_KEY is set,
 * otherwise falls back to a stable placeholder image.
 */
export async function getFallbackPhoto(placeType: PlaceType): Promise<string> {
  const cached = cache.get(placeType);
  if (cached) return cached;

  const key = process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY;
  if (key) {
    try {
      const query = QUERY_BY_TYPE[placeType] ?? QUERY_BY_TYPE.other;
      const url = `${UNSPLASH_API_URL}?query=${encodeURIComponent(
        query,
      )}&orientation=landscape&content_filter=high&client_id=${key}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = (await res.json()) as { urls?: { regular?: string } };
        const photo = data.urls?.regular;
        if (photo) {
          cache.set(placeType, photo);
          return photo;
        }
      }
    } catch {
      // fall through to the placeholder
    }
  }

  const placeholder = placeholderFor(placeType);
  cache.set(placeType, placeholder);
  return placeholder;
}

/**
 * Return a copy of the places array where every place has a photoUrl.
 * Places that already have one are left untouched.
 */
export async function fillMissingPhotos(
  places: PlaceVisit[],
): Promise<PlaceVisit[]> {
  return Promise.all(
    places.map(async (place) => {
      if (place.photoUrl) return place;
      return { ...place, photoUrl: await getFallbackPhoto(place.type) };
    }),
  );
}
