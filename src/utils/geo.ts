import { UserLocation } from '../types';

export const LOCATION_PRESETS: UserLocation[] = [
  {
    id: 'senayan',
    label: 'Senayan, Jakarta Selatan',
    city: 'Jakarta Selatan',
    lat: -6.2246,
    lng: 106.8018,
  },
  {
    id: 'kemang',
    label: 'Kemang, Jakarta Selatan',
    city: 'Jakarta Selatan',
    lat: -6.2607,
    lng: 106.8133,
  },
  {
    id: 'menteng',
    label: 'Menteng, Jakarta Pusat',
    city: 'Jakarta Pusat',
    lat: -6.1952,
    lng: 106.8358,
  },
  {
    id: 'puri',
    label: 'Puri Indah, Jakarta Barat',
    city: 'Jakarta Barat',
    lat: -6.1887,
    lng: 106.7336,
  },
  {
    id: 'bsd',
    label: 'BSD City, Tangerang Selatan',
    city: 'Tangerang Selatan',
    lat: -6.3019,
    lng: 106.6524,
  },
  {
    id: 'margonda',
    label: 'Margonda, Depok',
    city: 'Depok',
    lat: -6.3728,
    lng: 106.8322,
  },
  {
    id: 'dago',
    label: 'Dago, Bandung',
    city: 'Bandung',
    lat: -6.8851,
    lng: 107.6138,
  },
];

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Haversine formula to compute straight-line distance in kilometers.
 */
export function calculateDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((earthRadiusKm * c).toFixed(1));
}
