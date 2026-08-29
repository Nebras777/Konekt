import type { PlaceVisit } from '@/constants/types';
import { useLocation } from '@/hooks/use-location';

/**
 * useDayRoute — the single source of truth for "today's stops".
 *
 * Owned by Track 3 (Location & Map). Every screen that needs the day's route
 * reads it from here.
 *
 * There is no sample or seed data: the route is whatever the user has actually
 * captured. Before anything is captured the route is empty, and screens should
 * show an empty state rather than invented stops.
 */
export type DayRoute = {
  /** Stops for today, in visit order. Empty until the user captures one. */
  route: PlaceVisit[];
  /** True when nothing has been captured yet. */
  isEmpty: boolean;
  /**
   * Ends the day: discards today's captured stops, on the device and in
   * storage, so tomorrow starts empty.
   *
   * Deliberately local-only. Recaps already sent live in Firestore and are the
   * app's history — the guardian inbox and Memory Lane both read them — so
   * ending a day must never delete from there. Archive first (send the recap),
   * then end the day.
   */
  endDay: () => void;
  /** Record the device's current position as a stop on today's route. */
  capture: () => Promise<PlaceVisit | null>;
  /** True while a capture is in flight. */
  isCapturing: boolean;
  /** Why the last capture failed, or null. */
  error: string | null;
};

export function useDayRoute(): DayRoute {
  const { points, clear, refresh, isLoading, error } = useLocation();

  return {
    route: points,
    isEmpty: points.length === 0,
    endDay: clear,
    capture: refresh,
    isCapturing: isLoading,
    error,
  };
}

export default useDayRoute;
