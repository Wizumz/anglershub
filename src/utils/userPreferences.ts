interface MarineZone {
  zone_code: string;
  location_name: string;
  synopsis_zone: string;
  latitude?: number;
  longitude?: number;
}

interface UserPreferences {
  favoriteZones: string[];
  recentSearches: string[];
}

const STORAGE_KEY = 'noaa-marine-weather-preferences';
const MAX_RECENT_SEARCHES = 10;

export const getUserPreferences = (): UserPreferences => {
  if (typeof window === 'undefined') {
    return { favoriteZones: [], recentSearches: [] };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading user preferences:', error);
  }

  return { favoriteZones: [], recentSearches: [] };
};

export const saveUserPreferences = (preferences: UserPreferences): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving user preferences:', error);
  }
};

export const addFavoriteZone = (zoneCode: string): void => {
  const preferences = getUserPreferences();
  if (!preferences.favoriteZones.includes(zoneCode)) {
    preferences.favoriteZones.push(zoneCode);
    saveUserPreferences(preferences);
  }
};

export const removeFavoriteZone = (zoneCode: string): void => {
  const preferences = getUserPreferences();
  preferences.favoriteZones = preferences.favoriteZones.filter(code => code !== zoneCode);
  saveUserPreferences(preferences);
};

export const isFavoriteZone = (zoneCode: string): boolean => {
  const preferences = getUserPreferences();
  return preferences.favoriteZones.includes(zoneCode);
};

export const addRecentSearch = (zoneCode: string): void => {
  const preferences = getUserPreferences();
  
  // Remove if already exists
  preferences.recentSearches = preferences.recentSearches.filter(code => code !== zoneCode);
  
  // Add to beginning
  preferences.recentSearches.unshift(zoneCode);
  
  // Keep only the most recent searches
  preferences.recentSearches = preferences.recentSearches.slice(0, MAX_RECENT_SEARCHES);
  
  saveUserPreferences(preferences);
};

export const getRecentSearches = (): string[] => {
  const preferences = getUserPreferences();
  return preferences.recentSearches;
};

export const getFavoriteZones = (): string[] => {
  const preferences = getUserPreferences();
  return preferences.favoriteZones;
};

export const clearAllPreferences = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing user preferences:', error);
  }
};