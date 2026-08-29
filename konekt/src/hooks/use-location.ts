import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { PlaceType, PlaceVisit } from '@/constants/types';

/**
 * useLocation — reads the device's current position as a PlaceVisit.
 *
 * Owned by Track 3 (Location & Map). Mechanism only: it holds no UI and renders
 * nothing, so any screen can drive it without either track editing the other's
 * files.
 *
 * Scope note: this captures one point per call, on demand. Continuous
 * start/stop tracking is deliberately not here yet — it pairs with the Privacy
 * screen's Start/Stop control, and will be added once that exists so both sides
 * are built to the same interface.
 *
 * The returned point is shaped as a PlaceVisit, so it drops straight into a
 * route array and RouteMap plots it with no changes.
 */

/** Used when reverse geocoding gives us nothing usable. */
const FALLBACK_NAME = 'Current location';

export type LocationStatus =
  /** Nothing attempted yet. */
  | 'idle'
  /** Asking for permission, or waiting on a fix. */
  | 'loading'
  /** A point was captured successfully. */
  | 'ready'
  /** The user declined the permission prompt. */
  | 'denied'
  /** Location services are switched off at the OS level. */
  | 'unavailable'
  /** Something else failed; see `error`. */
  | 'error';

export type UseLocation = {
  /** The most recent point captured, or null. */
  place: PlaceVisit | null;
  status: LocationStatus;
  /** Human-readable failure reason, or null. */
  error: string | null;
  /** True while a capture is in flight. */
  isLoading: boolean;
  /** Capture the current position. Resolves with the point, or null on failure. */
  refresh: () => Promise<PlaceVisit | null>;
  /** Discard the captured point. */
  clear: () => void;
};

export type UseLocationOptions = {
  /** PlaceType applied to the captured stop. GPS can't infer this, so it defaults to 'other'. */
  type?: PlaceType;
  /**
   * Accuracy of the fix. Balanced (~100m) is the default because High hits GPS
   * hardware and can hang indoors.
   */
  accuracy?: Location.Accuracy;
  /** Look up a street name for the point. Costs one request per capture. */
  reverseGeocode?: boolean;
};

/**
 * Formats to match mockRoute's display style, e.g. "7:50 AM".
 * Done by hand rather than via toLocaleTimeString so the output can't drift
 * with device locale — a 24-hour phone would otherwise render "07:50".
 */
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const suffix = hours < 12 ? 'AM' : 'PM';
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

/** Best human-readable label from a reverse-geocoded address. */
function nameFromAddress(address: Location.LocationGeocodedAddress | undefined): string {
  if (!address) {
    return FALLBACK_NAME;
  }
  const street = address.name ?? address.street ?? null;
  const area = address.district ?? address.city ?? address.subregion ?? null;
  if (street && area) {
    return `${street}, ${area}`;
  }
  return street ?? area ?? FALLBACK_NAME;
}

export function useLocation(options: UseLocationOptions = {}): UseLocation {
  const {
    type = 'other',
    accuracy = Location.Accuracy.Balanced,
    reverseGeocode = true,
  } = options;

  const [place, setPlace] = useState<PlaceVisit | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // Guards every setState below: a fix can land after the screen has gone.
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const refresh = useCallback(async (): Promise<PlaceVisit | null> => {
    setError(null);
    setStatus('loading');

    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        if (mounted.current) {
          setStatus('unavailable');
          setError('Location services are turned off on this device.');
        }
        return null;
      }

      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        if (mounted.current) {
          setStatus('denied');
          setError(
            permission.canAskAgain
              ? 'Location permission was declined.'
              : 'Location permission is blocked. Enable it in system settings.',
          );
        }
        return null;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy });

      let name = FALLBACK_NAME;
      if (reverseGeocode) {
        try {
          const addresses = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          name = nameFromAddress(addresses[0]);
        } catch {
          // Geocoding is best-effort. A point with a generic name still plots.
          name = FALLBACK_NAME;
        }
      }

      const captured: PlaceVisit = {
        name,
        type,
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        time: formatTime(location.timestamp),
      };

      if (mounted.current) {
        setPlace(captured);
        setStatus('ready');
      }
      return captured;
    } catch (e) {
      if (mounted.current) {
        setStatus('error');
        setError(e instanceof Error ? e.message : 'Could not read your location.');
      }
      return null;
    }
  }, [accuracy, reverseGeocode, type]);

  const clear = useCallback(() => {
    setPlace(null);
    setStatus('idle');
    setError(null);
  }, []);

  return {
    place,
    status,
    error,
    isLoading: status === 'loading',
    refresh,
    clear,
  };
}

export default useLocation;
