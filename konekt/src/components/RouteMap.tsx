import { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import MapView, { Marker, Polyline, type LatLng, type Region } from 'react-native-maps';

import type { PlaceType, PlaceVisit } from '@/constants/types';

/**
 * RouteMap — renders a day's route as pins joined by a line, in array order.
 *
 * Owned by Track 3 (Location & Map). Deliberately has no knowledge of where
 * its data comes from: pass it any PlaceVisit[] (mockRoute today, a real
 * generated route later) and it will frame and draw it.
 */

/** Marker tint per place type. Keyed exhaustively, so adding a PlaceType breaks the build here on purpose. */
const PIN_COLORS: Record<PlaceType, string> = {
  home: '#7A5AF8',
  study: '#3B82F6',
  food: '#F59E0B',
  social: '#EC4899',
  gym: '#10B981',
  transit: '#64748B',
  outdoor: '#14B8A6',
  other: '#94A3B8',
};

/** Shown when there is nothing to plot: the University of Sydney / Darlington precinct. */
const FALLBACK_REGION: Region = {
  latitude: -33.8893,
  longitude: 151.1915,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

/** Breathing room around the route's bounding box, as a multiplier. */
const BOUNDS_PADDING = 1.5;

/** Stops a single stop (or several very close ones) from zooming in to street level. */
const MIN_DELTA = 0.006;

const EDGE_PADDING = { top: 64, right: 64, bottom: 64, left: 64 };

export type RouteMapProps = {
  /** Stops to plot, in chronological order. The polyline follows this order. */
  places: PlaceVisit[];
  /** Colour of the line joining the stops. */
  strokeColor?: string;
  /** Thickness of the line joining the stops. */
  strokeWidth?: number;
  /** Style for the wrapper. The map always fills this wrapper. */
  style?: StyleProp<ViewStyle>;
  /** Called when a marker is tapped. */
  onSelectPlace?: (place: PlaceVisit, index: number) => void;
};

function toCoordinate(place: PlaceVisit): LatLng {
  return { latitude: place.lat, longitude: place.lng };
}

/** Centres on the route's bounding box, padded so no marker sits on the edge. */
function regionForPlaces(places: PlaceVisit[]): Region {
  if (places.length === 0) {
    return FALLBACK_REGION;
  }

  const latitudes = places.map((place) => place.lat);
  const longitudes = places.map((place) => place.lng);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max((maxLat - minLat) * BOUNDS_PADDING, MIN_DELTA),
    longitudeDelta: Math.max((maxLng - minLng) * BOUNDS_PADDING, MIN_DELTA),
  };
}

export function RouteMap({
  places,
  strokeColor = '#7A5AF8',
  strokeWidth = 4,
  style,
  onSelectPlace,
}: RouteMapProps) {
  const mapRef = useRef<MapView>(null);

  const coordinates = useMemo(() => places.map(toCoordinate), [places]);
  const initialRegion = useMemo(() => regionForPlaces(places), [places]);

  // initialRegion frames the route on first paint; this tightens it once the
  // map knows its real size, so the fit accounts for the view's aspect ratio.
  const handleMapReady = useCallback(() => {
    if (coordinates.length > 1) {
      mapRef.current?.fitToCoordinates(coordinates, {
        edgePadding: EDGE_PADDING,
        animated: false,
      });
    }
  }, [coordinates]);

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        onMapReady={handleMapReady}>
        {coordinates.length > 1 ? (
          <Polyline coordinates={coordinates} strokeColor={strokeColor} strokeWidth={strokeWidth} />
        ) : null}

        {places.map((place, index) => (
          <Marker
            key={`${index}-${place.name}-${place.time}`}
            coordinate={coordinates[index]}
            title={place.name}
            description={place.subtitle ?? place.time}
            pinColor={PIN_COLORS[place.type]}
            onPress={onSelectPlace ? () => onSelectPlace(place, index) : undefined}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
});

export default RouteMap;
