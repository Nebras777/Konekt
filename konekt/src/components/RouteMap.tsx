import { useCallback, useMemo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import type { PlaceType, PlaceVisit } from '@/constants/types';

/**
 * RouteMap — renders a day's route as pins joined by a line, in array order.
 *
 * Owned by Track 3 (Location & Map). Deliberately has no knowledge of where its
 * data comes from: pass it any PlaceVisit[] and it will frame and draw it.
 *
 * Implementation note: this draws with Leaflet inside a WebView rather than with
 * react-native-maps. On Android, react-native-maps can only use Google Maps, and
 * Google Maps fails to authorise inside Expo Go — it renders a black surface and
 * logs "Authorization failure / Error requesting API token". That is an Expo Go
 * limitation, not a project one, and the only fixes are a development build with
 * a billed Google Maps API key, or dropping the native map. Leaflet needs no key,
 * no billing, and no development build, and react-native-webview ships in Expo Go.
 *
 * The props below are unchanged from the react-native-maps version, so swapping
 * back later is a file-for-file replacement that touches no other track's code.
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

/** Used when there is nothing to plot: the University of Sydney / Darlington precinct. */
const FALLBACK_CENTER = { lat: -33.8893, lng: 151.1915, zoom: 14 };

/**
 * Keyless raster tiles, verified rendering this exact route in a browser.
 *
 * OpenStreetMap's own tile server is the default: no key, no billing, no account.
 * Its usage policy blocks non-browser clients — a raw image request from the app
 * got a 403 earlier in this project — but a WebView sends browser-like headers and
 * Leaflet is its canonical client, so requests from here are served normally.
 *
 * If OSM ever rate-limits us, pass `tileUrl` to switch. Also verified keyless:
 *   https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}
 *     (attribution: '&copy; OpenStreetMap contributors &copy; Esri')
 * CARTO's basemap CDN is NOT usable — it now stamps "API KEY REQUIRED" across every tile.
 */
const DEFAULT_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const DEFAULT_ATTRIBUTION = '&copy; OpenStreetMap contributors';

/** Zoom used when there is only one stop to show — street level. */
const SINGLE_STOP_ZOOM = 17;

/** Gap in pixels between the outermost pins and the edge of the map. */
const FIT_PADDING_PX = 24;

/** Ceiling for the auto-fit, so two stops a few metres apart don't slam to max zoom. */
const MAX_FIT_ZOOM = 17;

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

export type RouteMapProps = {
  /** Stops to plot, in chronological order. The line follows this order. */
  places: PlaceVisit[];
  /** Colour of the line joining the stops. */
  strokeColor?: string;
  /** Thickness of the line joining the stops. */
  strokeWidth?: number;
  /** Style for the wrapper. The map always fills this wrapper. */
  style?: StyleProp<ViewStyle>;
  /** Called when a marker is tapped. */
  onSelectPlace?: (place: PlaceVisit, index: number) => void;
  /** Override the tile source, e.g. to use a provider you hold a key for. */
  tileUrl?: string;
  /** Attribution shown on the map. Change this whenever tileUrl changes. */
  tileAttribution?: string;
  /**
   * Whether the map pans and zooms. Set false when the map sits inside a
   * ScrollView, so vertical drags scroll the page instead of being swallowed
   * by the map. Markers stay tappable either way.
   */
  interactive?: boolean;
};

type BridgeMessage = {
  type?: string;
  index?: number;
  message?: string;
  stops?: number;
};

/** Escapes a JSON payload so it cannot terminate the script block it is embedded in. */
function toSafeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function buildHtml(
  places: PlaceVisit[],
  strokeColor: string,
  strokeWidth: number,
  tileUrl: string,
  tileAttribution: string,
  interactive: boolean,
): string {
  const stops = toSafeJson(
    places.map((place, index) => ({
      lat: place.lat,
      lng: place.lng,
      name: place.name,
      subtitle: place.subtitle ?? '',
      time: place.time,
      color: PIN_COLORS[place.type],
      index,
    })),
  );

  const mapOptions = interactive
    ? { zoomControl: false }
    : {
        zoomControl: false,
        dragging: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
      };

  return [
    '<!DOCTYPE html>',
    '<html><head><meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />',
    '<link rel="stylesheet" href="' + LEAFLET_CSS + '" />',
    '<style>',
    'html, body, #map { height: 100%; width: 100%; margin: 0; padding: 0; background: #e8e5df; }',
    '.pin { width: 22px; height: 22px; border-radius: 50%; border: 2px solid #fff;',
    '  box-shadow: 0 1px 4px rgba(0,0,0,0.4); color: #fff; text-align: center;',
    '  font: 600 12px/20px -apple-system, Roboto, sans-serif; }',
    '.leaflet-container { font-family: -apple-system, Roboto, sans-serif; }',
    '</style></head><body><div id="map"></div>',
    '<script src="' + LEAFLET_JS + '"></script>',
    '<script>',
    '(function () {',
    '  var stops = ' + stops + ';',
    '  var post = function (msg) {',
    '    if (window.ReactNativeWebView) {',
    '      window.ReactNativeWebView.postMessage(JSON.stringify(msg));',
    '    }',
    '  };',
    '  if (typeof L === "undefined") {',
    '    post({ type: "error", message: "Leaflet failed to load from the CDN" });',
    '    return;',
    '  }',
    '  try {',
    '    var map = L.map("map", ' + toSafeJson(mapOptions) + ');',
    '    L.tileLayer(' + toSafeJson(tileUrl) + ', {',
    '      maxZoom: 19,',
    '      attribution: ' + toSafeJson(tileAttribution),
    '    }).addTo(map);',
    '    if (stops.length === 0) {',
    '      map.setView([' + FALLBACK_CENTER.lat + ', ' + FALLBACK_CENTER.lng + '], ' +
      FALLBACK_CENTER.zoom + ');',
    '      post({ type: "ready", stops: 0 });',
    '      return;',
    '    }',
    '    var latlngs = stops.map(function (s) { return [s.lat, s.lng]; });',
    '    if (stops.length > 1) {',
    '      L.polyline(latlngs, {',
    '        color: ' + toSafeJson(strokeColor) + ',',
    '        weight: ' + strokeWidth + ',',
    '        opacity: 0.9',
    '      }).addTo(map);',
    '    }',
    '    stops.forEach(function (s) {',
    '      var icon = L.divIcon({',
    '        className: "",',
    '        html: \'<div class="pin" style="background:\' + s.color + \'">\' + (s.index + 1) + "</div>",',
    '        iconSize: [22, 22],',
    '        iconAnchor: [11, 11]',
    '      });',
    '      L.marker([s.lat, s.lng], { icon: icon })',
    '        .addTo(map)',
    '        .bindPopup("<strong>" + s.name + "</strong><br/>" + s.time +',
    '          (s.subtitle ? "<br/>" + s.subtitle : ""))',
    '        .on("click", function () { post({ type: "select", index: s.index }); });',
    '    });',
    '    var frame = function () {',
    '      if (stops.length === 1) {',
    '        map.setView(latlngs[0], ' + SINGLE_STOP_ZOOM + ');',
    '      } else {',
    '        map.fitBounds(L.latLngBounds(latlngs), {',
    '          padding: [' + FIT_PADDING_PX + ', ' + FIT_PADDING_PX + '],',
    '          maxZoom: ' + MAX_FIT_ZOOM,
    '        });',
    '      }',
    '    };',
    '    frame();',
    // Inside a FlatList or ScrollView the WebView is often laid out AFTER the
    // map initialises, so the first fit is computed against the wrong height
    // and the route ends up off-frame. Re-measure and re-fit once layout settles.
    '    var settle = function () { map.invalidateSize(); frame(); };',
    '    setTimeout(settle, 150);',
    '    setTimeout(settle, 600);',
    '    window.addEventListener("resize", settle);',
    '    if (typeof ResizeObserver !== "undefined") {',
    '      new ResizeObserver(settle).observe(document.getElementById("map"));',
    '    }',
    '    post({ type: "ready", stops: stops.length });',
    '  } catch (err) {',
    '    post({ type: "error", message: String(err && err.message ? err.message : err) });',
    '  }',
    '})();',
    '</script></body></html>',
  ].join('\n');
}

export function RouteMap({
  places,
  strokeColor = '#7A5AF8',
  strokeWidth = 4,
  style,
  onSelectPlace,
  tileUrl = DEFAULT_TILE_URL,
  tileAttribution = DEFAULT_ATTRIBUTION,
  interactive = true,
}: RouteMapProps) {
  const html = useMemo(
    () => buildHtml(places, strokeColor, strokeWidth, tileUrl, tileAttribution, interactive),
    [places, strokeColor, strokeWidth, tileUrl, tileAttribution, interactive],
  );

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      let message: BridgeMessage;
      try {
        message = JSON.parse(event.nativeEvent.data) as BridgeMessage;
      } catch {
        return;
      }

      if (message.type === 'error') {
        console.warn('[RouteMap] Leaflet failed to initialise:', message.message);
        return;
      }

      if (message.type === 'select' && typeof message.index === 'number') {
        const place = places[message.index];
        if (place && onSelectPlace) {
          onSelectPlace(place, message.index);
        }
      }
    },
    [places, onSelectPlace],
  );

  return (
    <View style={[styles.container, style]}>
      <WebView
        style={styles.webview}
        originWhitelist={['*']}
        source={{ html }}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        androidLayerType="hardware"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default RouteMap;
