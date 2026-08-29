import type { PlaceVisit } from '@/constants/types';

/**
 * Mock route for the demo: one believable day around the University of Sydney
 * and the Darlington campus precinct.
 *
 * Owned by Track 3 (Location & Map). Track 2 can import this directly to
 * replace the inline dummy array in the Today screen.
 *
 * Notes for the rest of the team:
 * - Coordinates are real-world approximations of each landmark, accurate
 *   enough for markers and a polyline at campus zoom. The whole route spans
 *   roughly 1.2 km, so it frames nicely in a single map view.
 * - Stops are listed in chronological order, which is also the order the
 *   Polyline in RouteMap.tsx should connect them.
 * - `photoUrl` is deliberately omitted on every stop so Track 4's
 *   getFallbackPhoto() / photo-filling helper has something to populate.
 * - `time` is a display-ready 12-hour string, safe to render as-is.
 */
export const mockRoute: PlaceVisit[] = [
  {
    name: 'Home',
    type: 'home',
    lat: -33.8907,
    lng: 151.1958,
    time: '7:50 AM',
    subtitle: 'Golden Grove St, Darlington. Slow start and a coffee before walking in.',
  },
  {
    name: 'Fisher Library',
    type: 'study',
    lat: -33.889,
    lng: 151.1881,
    time: '9:15 AM',
    subtitle: 'Level 3 quiet zone, three hours on the statistics assignment.',
  },
  {
    name: 'Wentworth Building Food Court',
    type: 'food',
    lat: -33.8895,
    lng: 151.189,
    time: '12:35 PM',
    subtitle: 'Laksa with Aisha and Tom, then a lap of the bookshop.',
  },
  {
    name: 'Sydney Uni Sports & Aquatic Centre',
    type: 'gym',
    lat: -33.8896,
    lng: 151.1904,
    time: '4:05 PM',
    subtitle: 'Thirty laps in the pool, then a long sit in the sauna.',
  },
  {
    name: 'Manning Bar',
    type: 'social',
    lat: -33.8899,
    lng: 151.1876,
    time: '6:40 PM',
    subtitle: 'Trivia night with the design studio crew. Came second, again.',
  },
];
