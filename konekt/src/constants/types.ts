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
  /**
   * The sender's display name at the time of sending. userId is a profile id,
   * which is not human-readable, so the inbox shows this instead. Optional
   * because recaps sent before profiles existed don't have it.
   */
  senderName?: string;
};

export const DEMO_USERS = {
  sender: 'sebti_demo',
  recipient: 'family_demo',
} as const;

export type ConnectionStatus = 'pending' | 'active' | 'declined';

export type ConnectionRelationship =
  | 'parent'
  | 'grandparent'
  | 'sibling'
  | 'partner'
  | 'friend'
  | 'other';

// A person the user has invited to see their recaps.
export type Connection = {
  id: string;
  name: string;
  phone: string;
  relationship: ConnectionRelationship;
  status: ConnectionStatus;
};

// The app user's own identity, created at sign-up.
export type Profile = {
  id: string;
  name: string;
  createdAt: number;
};
