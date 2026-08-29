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
