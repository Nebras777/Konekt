import type { PlaceVisit } from '../src/constants/types';

/**
 * Hands the Today screen's places (with any media the user attached) to
 * building.tsx without round-tripping through route params. In-memory only —
 * building.tsx falls back to the raw mockRoute if nothing was set.
 */
let todayPlaces: PlaceVisit[] | undefined;

export function setTodayPlaces(places: PlaceVisit[]): void {
  todayPlaces = places;
}

export function getTodayPlaces(): PlaceVisit[] | undefined {
  return todayPlaces;
}
