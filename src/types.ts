export type SportType = 'Basket' | 'Futsal' | 'Bola';
export type GenderType = 'Laki-laki' | 'Perempuan';
export type CoachBillingUnit = 'daily' | 'weekly' | 'monthly';

export type PlayerSortOption =
  | 'nearest'
  | 'price_asc'
  | 'price_desc'
  | 'experience_desc'
  | 'position_asc'
  | 'gender';

export type CoachSortOption =
  | 'nearest'
  | 'price_asc'
  | 'price_desc'
  | 'experience_desc'
  | 'gender';

export interface UserLocation {
  id: string;
  label: string;
  city: string;
  lat: number;
  lng: number;
  isGps?: boolean;
}

export interface PhysicalProfile {
  heightCm: number;
  weightKg: number;
  staminaNotes: string;
}

export interface PlayerProfile {
  id: string;
  name: string;
  sport: SportType;
  position: string;
  experienceYears: number;
  experienceSummary: string;
  skills: string[];
  physical: PhysicalProfile;
  gender: GenderType;
  hourlyRate: number;
  locationName: string;
  lat: number;
  lng: number;
  rating: number;
  completedMatches: number;
  imageUrl?: string;
  courtFeeExempt: true;
}

export interface CoachRates {
  daily: number;
  weekly: number;
  monthly: number;
}

export interface CoachProfile {
  id: string;
  name: string;
  sport: SportType;
  experienceYears: number;
  experienceSummary: string;
  specialty: string;
  certification: string;
  gender: GenderType;
  rates: CoachRates;
  locationName: string;
  lat: number;
  lng: number;
  rating: number;
  sessionsLed: number;
  imageUrl?: string;
}

export interface BookingRecord {
  id: string;
  role: 'player' | 'coach';
  targetId: string;
  targetName: string;
  sport: SportType;
  positionOrCert: string;
  durationLabel: string;
  baseAmount: number;
  platformFeeRate: number;
  platformFeeAmount: number;
  totalAmount: number;
  venueName: string;
  scheduleDate: string;
  courtPaidByRenter: boolean;
  createdAt: string;
}
