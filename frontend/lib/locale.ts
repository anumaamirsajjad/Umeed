import { REGIONS } from './constants';

// Maps an IANA timezone's leading region (the part before the first "/") to
// one of our REGIONS codes. This is a coarse, privacy-friendly stand-in for
// geolocation — no permission prompt, no coordinates, just what the browser
// already exposes via Intl.
const TIMEZONE_AREA_TO_REGION: Record<string, string> = {
  America: 'north-america',
  Antarctica: 'oceania',
  Atlantic: 'europe',
  Arctic: 'europe',
  Australia: 'oceania',
  Europe: 'europe',
  Indian: 'south-asia',
  Pacific: 'oceania',
};

// A few timezones need country-level disambiguation because their "area"
// prefix isn't specific enough (e.g. "America/*" covers both continents).
const TIMEZONE_OVERRIDES: Record<string, string> = {
  'America/Mexico_City': 'central-america',
  'America/Belize': 'central-america',
  'America/Costa_Rica': 'central-america',
  'America/El_Salvador': 'central-america',
  'America/Guatemala': 'central-america',
  'America/Managua': 'central-america',
  'America/Panama': 'central-america',
  'America/Tegucigalpa': 'central-america',
  'America/Argentina': 'south-america',
  'America/Bogota': 'south-america',
  'America/Lima': 'south-america',
  'America/Santiago': 'south-america',
  'America/Sao_Paulo': 'south-america',
  'America/Caracas': 'south-america',
  'Asia/Karachi': 'south-asia',
  'Asia/Kolkata': 'south-asia',
  'Asia/Calcutta': 'south-asia',
  'Asia/Dhaka': 'south-asia',
  'Asia/Colombo': 'south-asia',
  'Asia/Kathmandu': 'south-asia',
  'Asia/Kabul': 'south-asia',
  'Asia/Dubai': 'middle-east',
  'Asia/Riyadh': 'middle-east',
  'Asia/Baghdad': 'middle-east',
  'Asia/Tehran': 'middle-east',
  'Asia/Jerusalem': 'middle-east',
  'Asia/Amman': 'middle-east',
  'Asia/Beirut': 'middle-east',
  'Asia/Istanbul': 'middle-east',
  'Asia/Bangkok': 'southeast-asia',
  'Asia/Jakarta': 'southeast-asia',
  'Asia/Manila': 'southeast-asia',
  'Asia/Singapore': 'southeast-asia',
  'Asia/Ho_Chi_Minh': 'southeast-asia',
  'Asia/Kuala_Lumpur': 'southeast-asia',
  'Asia/Shanghai': 'east-asia',
  'Asia/Tokyo': 'east-asia',
  'Asia/Seoul': 'east-asia',
  'Asia/Hong_Kong': 'east-asia',
  'Asia/Taipei': 'east-asia',
};

const VALID_REGION_CODES = new Set(REGIONS.map((r) => r.code));

/**
 * Best-effort guess at the user's region from their browser's timezone,
 * for defaulting the resources filter — never sent anywhere, never asks
 * for location permission. Returns null if it can't make a confident guess.
 */
export function guessRegionFromLocale(): string | null {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!timeZone) return null;

    if (TIMEZONE_OVERRIDES[timeZone]) return TIMEZONE_OVERRIDES[timeZone];

    const area = timeZone.split('/')[0];
    if (area === 'Africa') return 'africa';

    const region = TIMEZONE_AREA_TO_REGION[area];
    if (region && VALID_REGION_CODES.has(region)) return region;

    return null;
  } catch {
    return null;
  }
}
