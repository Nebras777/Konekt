export type PlaceVisit = {
  name: string;       
  type: PlaceType;     
  lat: number;
  lng: number;
  time: string;         
  subtitle?: string;    
  photoUrl?: string;  
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
