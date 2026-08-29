import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

import type { PlaceType, PlaceVisit } from '@/constants/types';
import { useAuth } from '@/hooks/use-auth';

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
 * Captured points are shaped as PlaceVisit, so they drop straight into a route
 * array and RouteMap plots them with no changes.
 *
 * Points live in a module-level store rather than component state, so they
 * survive navigating away from a screen and back — every caller of this hook
 * sees the same list. The store is mirrored to AsyncStorage, so they also
 * survive an app restart or a Metro reload. That matters when the route is
 * built by actually walking to places: losing an afternoon's captures to a
 * Fast Refresh would be worse than not having the feature.
 */

/**
 * AsyncStorage key holding the captured points, scoped per profile so two
 * accounts signed in on the same device don't share a day.
 */
const STORAGE_PREFIX = 'konekt.capturedPoints.v2';

/** Which profile the in-memory store currently belongs to. */
let storeOwnerId: string | null = null;

function storageKey(profileId: string): string {
  return `${STORAGE_PREFIX}.${profileId}`;
}

/**
 * Module-level store. Component state is discarded when a screen unmounts, so
 * anything held there is lost the moment the user navigates away.
 */
let capturedPoints: PlaceVisit[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Must return a stable reference between changes, or useSyncExternalStore loops. */
function getSnapshot(): PlaceVisit[] {
  return capturedPoints;
}

/** Replaces the store and mirrors it to disk. Persistence is best-effort. */
function setCapturedPoints(next: PlaceVisit[]) {
  capturedPoints = next;
  emit();
  if (!storeOwnerId) {
    return;
  }
  void AsyncStorage.setItem(storageKey(storeOwnerId), JSON.stringify(next)).catch(() => {
    // A failed write costs persistence, not the in-memory points. Don't throw
    // in the middle of a capture the user is watching.
  });
}

/** One hydration per profile; switching profiles reloads from that profile's key. */
let hydration: Promise<void> | null = null;

function hydrate(profileId: string): Promise<void> {
  if (storeOwnerId === profileId && hydration) {
    return hydration;
  }

  // Different profile than the one in memory: drop their stops before loading.
  if (storeOwnerId !== profileId) {
    storeOwnerId = profileId;
    capturedPoints = [];
    emit();
  }

  hydration = (async () => {
    try {
      const raw = await AsyncStorage.getItem(storageKey(profileId));
      if (!raw) {
        return;
      }
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return;
      }
      // Guard against a slow read landing after the user switched again.
      if (storeOwnerId === profileId && capturedPoints.length === 0) {
        capturedPoints = parsed as PlaceVisit[];
        emit();
      }
    } catch {
      // Corrupt or unreadable storage shouldn't stop the hook working.
    }
  })();
  return hydration;
}

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
  /** Every point captured so far, oldest first. Survives navigation. */
  points: PlaceVisit[];
  /** The most recent point captured, or null. */
  place: PlaceVisit | null;
  status: LocationStatus;
  /** Human-readable failure reason, or null. */
  error: string | null;
  /** True while a capture is in flight. */
  isLoading: boolean;
  /** Capture the current position. Resolves with the point, or null on failure. */
  refresh: () => Promise<PlaceVisit | null>;
  /** Discard every captured point. */
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
 * Formats for display, e.g. "7:50 AM".
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
  const { profile } = useAuth();
  const {
    type = 'other',
    accuracy = Location.Accuracy.Balanced,
    reverseGeocode = true,
  } = options;

  const points = useSyncExternalStore(subscribe, getSnapshot);
  const [status, setStatus] = useState<LocationStatus>(() =>
    capturedPoints.length > 0 ? 'ready' : 'idle',
  );
  const [error, setError] = useState<string | null>(null);

  // Guards every setState below: a fix can land after the screen has gone.
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Pull this profile's previously captured points back in.
  useEffect(() => {
    if (!profile) {
      return;
    }
    void hydrate(profile.id).then(() => {
      if (mounted.current && capturedPoints.length > 0) {
        setStatus((prev) => (prev === 'idle' ? 'ready' : prev));
      }
    });
  }, [profile]);

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

      // Append to the shared store rather than local state, so the point is
      // still here after the user navigates away and comes back.
      setCapturedPoints([...capturedPoints, captured]);

      if (mounted.current) {
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
    setCapturedPoints([]);
    setStatus('idle');
    setError(null);
  }, []);

  return {
    points,
    place: points.length > 0 ? points[points.length - 1] : null,
    status,
    error,
    isLoading: status === 'loading',
    refresh,
    clear,
  };
}

export default useLocation;
