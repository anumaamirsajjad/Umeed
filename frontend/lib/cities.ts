export interface CityOption {
  code: string; // matches CrisisResource.city (case-insensitive)
  label: string;
  country: string;
}

// Pakistan-focused phase. To expand to another country later, add a sibling
// list here (e.g. INDIA_CITIES) and point ACTIVE_CITY_FILTERS at whichever
// market build is active — the Support Resources screen reads only this
// config, never a hardcoded city list.
export const PAKISTAN_CITIES: CityOption[] = [
  { code: 'Karachi', label: 'Karachi', country: 'Pakistan' },
  { code: 'Lahore', label: 'Lahore', country: 'Pakistan' },
  { code: 'Islamabad', label: 'Islamabad', country: 'Pakistan' },
  { code: 'Rawalpindi', label: 'Rawalpindi', country: 'Pakistan' },
  { code: 'Faisalabad', label: 'Faisalabad', country: 'Pakistan' },
  { code: 'Peshawar', label: 'Peshawar', country: 'Pakistan' },
];

export const ACTIVE_CITY_FILTERS: CityOption[] = PAKISTAN_CITIES;
export const ACTIVE_REGION = 'south-asia';
