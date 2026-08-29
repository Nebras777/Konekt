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
  /**
   * True when the sender's privacy settings withheld location from this
   * recipient's copy. The stops are not stripped from the UI — they were never
   * written to this document, so there is nothing to reveal.
   */
  locationHidden?: boolean;
};

export const DEMO_USERS = {
  sender: 'sebti_demo',
  recipient: 'family_demo',
} as const;

export type ConnectionStatus = 'pending' | 'active' | 'declined';

/**
 * How the user files a connection. Deliberately coarser than
 * ConnectionRelationship: the Privacy screen shares by group ("share location
 * with family"), which a six-way relationship can't answer cleanly.
 */
export type ConnectionGroup = 'family' | 'friends' | 'other';

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
  /** Optional: invites sent to a Konekt profile don't need a phone number. */
  phone?: string;
  relationship: ConnectionRelationship;
  status: ConnectionStatus;
  /** Family / Friends / Other, set by the owner. Defaults to 'other' when unset. */
  group?: ConnectionGroup;
  /** Profile that created this connection — the person who sent the invite. */
  ownerId?: string;
  /**
   * The inviter's display name, stored at invite time. The person receiving an
   * invite needs to see who it's from, and `name` holds the invitee's name.
   */
  ownerName?: string;
  /**
   * The invited person's profile id, when they're a Konekt user. This is what
   * makes an invite routable: recaps are addressed to this id.
   */
  profileId?: string;
};

// The app user's own identity, created at sign-up.
export type Profile = {
  id: string;
  name: string;
  createdAt: number;
};
