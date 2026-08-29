export type PlaceVisit = {
  name: string;
  type: PlaceType;
  lat: number;
  lng: number;
  time: string;
  subtitle?: string;
  photoUrl?: string;
  /** A real photo/video the user picked for this stop, from their own device. */
  mediaUri?: string;
  mediaType?: 'photo' | 'video';
};

export type PlaceType =
  | 'home'
  | 'study'
  | 'food'
  | 'social'
  | 'gym'
  | 'transit'
  | 'outdoor'
  | 'other';

export type DaySummary = {
  id: string;
  userId: string;          
  recipientId: string;     
  date: string;            
  places: PlaceVisit[];
  summaryText: string;
  distanceKm?: number;
  createdAt: number;
  /** A personal note the sender adds on top of the AI-written summary. */
  highlightNote?: string;
  /** URL of a recorded voice memo attached to this recap, if any. */
  voiceNoteUrl?: string;
};

export const DEMO_USERS = {
  sender: 'sebti_demo',
  recipient: 'family_demo',
} as const;
