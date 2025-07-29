// Enhanced 5-Tier Forecast Summary System
// Tiers: Excellent (GREEN) -> Good (LIGHT GREEN) -> Moderate (BLUE) -> Caution (ORANGE) -> Dangerous (RED)

export interface ForecastData {
  windSpeed?: number;
  gusts?: number;
  seas?: number;
  weather: string[];
  visibility?: number;
  partialDay: boolean;
  originalText: string;
}

export interface SummaryStatement {
  emoji: string;
  text: string;
  color: string;
  tier: string;
}

// Comprehensive summary statements organized by tier
export const SUMMARY_STATEMENTS = {
  "Excellent": [
    { emoji: "⛵", text: "Mirror seas, gentle breeze—sail with ease, you salty trustee!", color: "green", tier: "Excellent" },
    { emoji: "🌞", text: "Clear skies gleam, seas serene—helm's your dream, you sharp mariner supreme!", color: "green", tier: "Excellent" },
    { emoji: "🐬", text: "Calm waves play, perfect day—cruise away, you savvy mainstay!", color: "green", tier: "Excellent" },
    { emoji: "⚓", text: "Gentle air, seas so fair—steer with flair, you bold sea heir!", color: "green", tier: "Excellent" },
    { emoji: "🌊", text: "Flat seas call, winds so small—sail and enthrall, you cunning admiral!", color: "green", tier: "Excellent" },
    { emoji: "😎", text: "Sun's aglow, seas lie low—go, you rogue, you nautical maestro!", color: "green", tier: "Excellent" },
    { emoji: "🌴", text: "Breezes light, seas just right—sail tonight, you dapper sea knight!", color: "green", tier: "Excellent" },
    { emoji: "🐠", text: "Clear and calm, waves a psalm—helm with charm, you wily sea balm!", color: "green", tier: "Excellent" },
    { emoji: "⛵", text: "Skies so bright, seas polite—sail with might, you crafty old sprite!", color: "green", tier: "Excellent" },
    { emoji: "⚡", text: "No storm in sight, seas slight—cruise with delight, you salty old wight!", color: "green", tier: "Excellent" },
    { emoji: "🌞", text: "Winds are tame, seas the same—claim your fame, you nautical flame!", color: "green", tier: "Excellent" },
    { emoji: "🐬", text: "Seas like glass, breezes pass—sail with sass, you clever sea lass!", color: "green", tier: "Excellent" },
    { emoji: "⚓", text: "Calm's the norm, no hint of storm—sail and perform, you weathered sea form!", color: "green", tier: "Excellent" },
    { emoji: "🌊", text: "Seas stay still, winds no thrill—sail at will, you sharp sea quill!", color: "green", tier: "Excellent" },
    { emoji: "⛵", text: "Sun's your friend, seas don't bend—sail and mend, you trusty sea trend!", color: "green", tier: "Excellent" },
    { emoji: "🌴", text: "Breezes fair, skies so rare—sail with care, you dashing sea mare!", color: "green", tier: "Excellent" },
    { emoji: "😎", text: "Seas so smooth, winds that soothe—make your move, you cunning sea groove!", color: "green", tier: "Excellent" },
    { emoji: "🐠", text: "Clear and bright, seas just right—sail tonight, you bold sea light!", color: "green", tier: "Excellent" },
    { emoji: "⛵", text: "Winds are mild, seas beguiled—sail and smile, you crafty sea child!", color: "green", tier: "Excellent" },
    { emoji: "🌞", text: "Skies that shine, seas divine—helm's your line, you wily sea sign!", color: "green", tier: "Excellent" },
    { emoji: "⚓", text: "Calm seas beckon, winds don't reckon—sail, you weapon, you nautical beacon!", color: "green", tier: "Excellent" },
    { emoji: "🌊", text: "Seas so flat, winds like that—sail, you cat, you savvy sea hat!", color: "green", tier: "Excellent" },
    { emoji: "🐬", text: "Breezes soft, seas aloft—sail and scoff, you dapper sea toff!", color: "green", tier: "Excellent" },
    { emoji: "⛵", text: "Sun's your guide, seas abide—sail with pride, you cunning sea tide!", color: "green", tier: "Excellent" },
    { emoji: "🌴", text: "Winds so light, seas polite—sail tonight, you sharp sea knight!", color: "green", tier: "Excellent" },
    { emoji: "😎", text: "Seas serene, skies a dream—helm supreme, you crafty sea beam!", color: "green", tier: "Excellent" },
    { emoji: "🐠", text: "Calm's the call, winds so small—sail and thrall, you bold sea hall!", color: "green", tier: "Excellent" },
    { emoji: "⚓", text: "Seas stay low, breezes flow—sail and show, you wily sea pro!", color: "green", tier: "Excellent" },
    { emoji: "🌊", text: "Clear and calm, seas a psalm—sail with balm, you dashing sea charm!", color: "green", tier: "Excellent" },
    { emoji: "⛵", text: "Skies so fair, seas don't scare—sail with flair, you salty sea heir!", color: "green", tier: "Excellent" }
  ],

  "Good": [
    { emoji: "⛵", text: "Light winds hum, seas stay mum—sail for fun, you crafty sea scum!", color: "lightgreen", tier: "Good" },
    { emoji: "🌤️", text: "Clouds may drift, seas don't shift—take the lift, you wily skipper swift!", color: "lightgreen", tier: "Good" },
    { emoji: "🐠", text: "Breezes sway, waves okay—cruise today, you salty mainstay!", color: "lightgreen", tier: "Good" },
    { emoji: "⚓", text: "Morning's fine, winds align—chart the line, you sharp sea divine!", color: "lightgreen", tier: "Good" },
    { emoji: "🌞", text: "Seas are low, breezes flow—go, you rogue, you nautical maestro!", color: "lightgreen", tier: "Good" },
    { emoji: "⛵", text: "Winds may tease, seas still please—sail with ease, you cunning trustee!", color: "lightgreen", tier: "Good" },
    { emoji: "🌴", text: "Light gusts play, seas okay—sail today, you bold sea mainstay!", color: "lightgreen", tier: "Good" },
    { emoji: "😎", text: "Breezes light, seas just right—helm tonight, you crafty sea sprite!", color: "lightgreen", tier: "Good" },
    { emoji: "🐬", text: "Clouds may loom, seas don't boom—sail with room, you wily sea plume!", color: "lightgreen", tier: "Good" },
    { emoji: "⚓", text: "Winds stay kind, seas aligned—sail and find, you sharp sea mind!", color: "lightgreen", tier: "Good" },
    { emoji: "🌊", text: "Seas stay small, breezes call—sail and thrall, you bold sea hall!", color: "lightgreen", tier: "Good" },
    { emoji: "⛵", text: "Skies half-clear, seas don't veer—sail with cheer, you dashing sea steer!", color: "lightgreen", tier: "Good" },
    { emoji: "🌞", text: "Light winds dance, seas a trance—take your chance, you cunning sea lance!", color: "lightgreen", tier: "Good" },
    { emoji: "🐠", text: "Waves stay tame, winds the same—claim your fame, you salty sea flame!", color: "lightgreen", tier: "Good" },
    { emoji: "⚓", text: "Breezes fair, seas don't scare—sail with flair, you crafty sea mare!", color: "lightgreen", tier: "Good" },
    { emoji: "🌴", text: "Morning's breeze, seas at ease—sail to please, you wily sea tease!", color: "lightgreen", tier: "Good" },
    { emoji: "⛵", text: "Clouds may pass, seas like glass—sail with sass, you bold sea lass!", color: "lightgreen", tier: "Good" },
    { emoji: "😎", text: "Winds stay low, seas aglow—helm and go, you sharp sea pro!", color: "lightgreen", tier: "Good" },
    { emoji: "🐬", text: "Seas stay light, skies polite—sail tonight, you cunning sea knight!", color: "lightgreen", tier: "Good" },
    { emoji: "🌊", text: "Breezes hum, waves don't drum—sail, you chum, you weathered sea rum!", color: "lightgreen", tier: "Good" },
    { emoji: "⛵", text: "Skies may gray, seas okay—sail today, you crafty sea stray!", color: "lightgreen", tier: "Good" },
    { emoji: "🌞", text: "Winds that sway, seas obey—helm away, you dashing sea ray!", color: "lightgreen", tier: "Good" },
    { emoji: "⚓", text: "Light gusts call, seas so small—sail and thrall, you bold sea wall!", color: "lightgreen", tier: "Good" },
    { emoji: "🐠", text: "Seas stay low, breezes flow—sail and show, you wily sea glow!", color: "lightgreen", tier: "Good" },
    { emoji: "🌴", text: "Morning's calm, winds no harm—sail with charm, you sharp sea arm!", color: "lightgreen", tier: "Good" },
    { emoji: "⛵", text: "Clouds may drift, seas uplift—sail with thrift, you cunning sea gift!", color: "lightgreen", tier: "Good" },
    { emoji: "😎", text: "Breezes play, seas okay—helm today, you salty sea mainstay!", color: "lightgreen", tier: "Good" },
    { emoji: "🌊", text: "Winds stay kind, seas aligned—sail and find, you crafty sea mind!", color: "lightgreen", tier: "Good" },
    { emoji: "🐬", text: "Seas serene, skies with sheen—sail, you queen, you nautical dream!", color: "lightgreen", tier: "Good" },
    { emoji: "⚓", text: "Light winds steer, seas stay clear—sail with cheer, you bold sea peer!", color: "lightgreen", tier: "Good" }
  ],

  "Moderate": [
    { emoji: "💨", text: "Winds that bite, waves ignite—steer with might, you bold sea sprite!", color: "blue", tier: "Moderate" },
    { emoji: "🌬️", text: "Seas that churn, breezes burn—take your turn, you weathered stern!", color: "blue", tier: "Moderate" },
    { emoji: "⛵", text: "Breezes hum, waves drum—helm with sum, you daring sea chum!", color: "blue", tier: "Moderate" },
    { emoji: "🌊", text: "Choppy seas, gusty breeze—sail with ease, you crafty old tease!", color: "blue", tier: "Moderate" },
    { emoji: "🚢", text: "Winds arise, waves don't lie—steer or sigh, you salty ally!", color: "blue", tier: "Moderate" },
    { emoji: "💨", text: "Seas that rock, winds that knock—helm with stock, you cunning sea hawk!", color: "blue", tier: "Moderate" },
    { emoji: "🌬️", text: "Breezes roar, waves explore—sail with lore, you wily commodore!", color: "blue", tier: "Moderate" },
    { emoji: "⛵", text: "Gusts that sing, waves that sting—helm and cling, you bold sea king!", color: "blue", tier: "Moderate" },
    { emoji: "🌊", text: "Seas stay rough, winds get tough—sail with stuff, you gritty sea bluff!", color: "blue", tier: "Moderate" },
    { emoji: "⚓", text: "Winds that howl, waves that prowl—steer with scowl, you salty old fowl!", color: "blue", tier: "Moderate" },
    { emoji: "💨", text: "Chop and breeze, seas don't please—sail with ease, you crafty sea tease!", color: "blue", tier: "Moderate" },
    { emoji: "🌬️", text: "Waves that roll, winds take toll—helm with soul, you daring sea goal!", color: "blue", tier: "Moderate" },
    { emoji: "⛵", text: "Breezes gust, seas robust—sail or bust, you weathered sea crust!", color: "blue", tier: "Moderate" },
    { emoji: "🌊", text: "Seas that sway, winds don't play—steer today, you cunning sea ray!", color: "blue", tier: "Moderate" },
    { emoji: "🚢", text: "Winds that hum, waves that drum—sail, you chum, you bold sea plum!", color: "blue", tier: "Moderate" },
    { emoji: "💨", text: "Gusts that bite, seas ignite—helm with might, you sharp sea sprite!", color: "blue", tier: "Moderate" },
    { emoji: "🌬️", text: "Waves that toss, breezes cross—sail with gloss, you wily sea boss!", color: "blue", tier: "Moderate" },
    { emoji: "⛵", text: "Seas get rough, winds stay tough—helm with stuff, you gritty sea puff!", color: "blue", tier: "Moderate" },
    { emoji: "🌊", text: "Breezes call, waves don't stall—sail or fall, you bold sea hall!", color: "blue", tier: "Moderate" },
    { emoji: "⚓", text: "Winds that race, seas embrace—steer with grace, you crafty sea face!", color: "blue", tier: "Moderate" },
    { emoji: "💨", text: "Seas that leap, breezes sweep—helm and keep, you daring sea deep!", color: "blue", tier: "Moderate" },
    { emoji: "🌬️", text: "Waves that roar, gusts galore—sail with lore, you salty commodore!", color: "blue", tier: "Moderate" },
    { emoji: "⛵", text: "Breezes sting, seas that swing—helm and cling, you bold sea wing!", color: "blue", tier: "Moderate" },
    { emoji: "🌊", text: "Chop and gust, sail you must—steer with trust, you weathered sea dust!", color: "blue", tier: "Moderate" },
    { emoji: "🚢", text: "Winds that blow, seas that grow—sail or woe, you cunning sea foe!", color: "blue", tier: "Moderate" },
    { emoji: "💨", text: "Seas that dance, gusts advance—take your chance, you sharp sea lance!", color: "blue", tier: "Moderate" },
    { emoji: "🌬️", text: "Waves that pound, breezes sound—helm around, you gritty sea hound!", color: "blue", tier: "Moderate" },
    { emoji: "⛵", text: "Breezes hum, seas stay glum—sail with sum, you daring sea chum!", color: "blue", tier: "Moderate" },
    { emoji: "🌊", text: "Winds that rise, waves surprise—steer with eyes, you wily sea prize!", color: "blue", tier: "Moderate" },
    { emoji: "⚓", text: "Seas that sway, gusts that play—helm today, you bold sea mainstay!", color: "blue", tier: "Moderate" }
  ],

  "Caution": [
    { emoji: "🌧️", text: "Morning's fine, showers align—sail with spine, you cunning sea swain!", color: "orange", tier: "Caution" },
    { emoji: "🌫️", text: "Fog's a veil 'til noon, winds assail—sail with guile, you sharp sea dial!", color: "orange", tier: "Caution" },
    { emoji: "⚡", text: "Breezes roar, storms may soar—watch the shore, you wily commodore!", color: "orange", tier: "Caution" },
    { emoji: "🌊", text: "Waves may rise, skies surprise—helm with eyes, you crafty sea prize!", color: "orange", tier: "Caution" },
    { emoji: "💨", text: "Gusts at dawn, calm by yawn—sail with brawn, you salty old prawn!", color: "orange", tier: "Caution" },
    { emoji: "🌧️", text: "Showers loom, seas may boom—sail with room, you daring sea plume!", color: "orange", tier: "Caution" },
    { emoji: "🌫️", text: "Morning haze, winds amaze—steer with gaze, you cunning sea blaze!", color: "orange", tier: "Caution" },
    { emoji: "⚡", text: "Storms may creep, seas get steep—helm and keep, you bold sea deep!", color: "orange", tier: "Caution" },
    { emoji: "🌊", text: "Waves that rock, gusts that knock—sail with stock, you gritty sea hawk!", color: "orange", tier: "Caution" },
    { emoji: "💨", text: "Breezes bite, showers might—steer with sight, you sharp sea sprite!", color: "orange", tier: "Caution" },
    { emoji: "🌧️", text: "Rain by noon, winds that swoon—sail with tune, you wily sea moon!", color: "orange", tier: "Caution" },
    { emoji: "🌫️", text: "Fog at dawn, gusts come on—helm with brawn, you crafty sea fawn!", color: "orange", tier: "Caution" },
    { emoji: "⚡", text: "Skies may frown, seas may drown—sail with crown, you bold sea clown!", color: "orange", tier: "Caution" },
    { emoji: "🌊", text: "Waves that surge, storms may urge—helm and purge, you cunning sea scourge!", color: "orange", tier: "Caution" },
    { emoji: "💨", text: "Gusts arise, showers surprise—sail with eyes, you salty sea prize!", color: "orange", tier: "Caution" },
    { emoji: "🌧️", text: "Morning's clear, rain draws near—steer with cheer, you dashing sea steer!", color: "orange", tier: "Caution" },
    { emoji: "🌫️", text: "Fog's a shroud, winds get loud—sail unbowed, you gritty sea crowd!", color: "orange", tier: "Caution" },
    { emoji: "⚡", text: "Storms may call, seas don't stall—helm with gall, you bold sea hall!", color: "orange", tier: "Caution" },
    { emoji: "🌊", text: "Waves that leap, gusts that sweep—sail and keep, you wily sea deep!", color: "orange", tier: "Caution" },
    { emoji: "💨", text: "Breezes hum, showers come—helm with sum, you daring sea chum!", color: "orange", tier: "Caution" },
    { emoji: "🌧️", text: "Rain's a threat, seas get wet—sail and bet, you crafty sea jet!", color: "orange", tier: "Caution" },
    { emoji: "🌫️", text: "Fog may blind, gusts unkind—steer with mind, you sharp sea find!", color: "orange", tier: "Caution" },
    { emoji: "⚡", text: "Storms may brew, seas grow too—helm with clue, you salty sea crew!", color: "orange", tier: "Caution" },
    { emoji: "🌊", text: "Waves that toss, skies may cross—sail with gloss, you cunning sea boss!", color: "orange", tier: "Caution" },
    { emoji: "💨", text: "Gusts at morn, calm reborn—sail with scorn, you weathered sea thorn!", color: "orange", tier: "Caution" },
    { emoji: "🌧️", text: "Showers near, skies unclear—steer with cheer, you bold sea peer!", color: "orange", tier: "Caution" },
    { emoji: "🌫️", text: "Fog's a veil, winds that wail—sail with sail, you crafty sea gale!", color: "orange", tier: "Caution" },
    { emoji: "⚡", text: "Storms may rise, seas surprise—helm with eyes, you wily sea prize!", color: "orange", tier: "Caution" },
    { emoji: "🌊", text: "Waves that sway, showers may—sail today, you cunning sea ray!", color: "orange", tier: "Caution" },
    { emoji: "💨", text: "Gusts by noon, storms may swoon—helm with tune, you salty sea dune!", color: "orange", tier: "Caution" }
  ],

  "Dangerous": [
    { emoji: "🌊", text: "Seas that wail, winds assail—stay in jail, you weathered old sail!", color: "red", tier: "Dangerous" },
    { emoji: "⚡", text: "Storms that scream, seas extreme—dock and dream, you grizzled sea beam!", color: "red", tier: "Dangerous" },
    { emoji: "🌧️", text: "Rain and gusts, seas robust—stay or bust, you salty old crust!", color: "red", tier: "Dangerous" },
    { emoji: "🌪️", text: "Winds that howl, waves that scowl—throw in the towel, you battle-worn fowl!", color: "red", tier: "Dangerous" },
    { emoji: "🚨", text: "Chop and spray, hell's at play—stay away, you cunning castaway!", color: "red", tier: "Dangerous" },
    { emoji: "🌊", text: "Seas that roar, winds galore—hug the shore, you wily commodore!", color: "red", tier: "Dangerous" },
    { emoji: "⚡", text: "Storms that rage, seas engage—stay in cage, you weathered sea sage!", color: "red", tier: "Dangerous" },
    { emoji: "🌧️", text: "Rain's a flood, seas like mud—stay, you stud, you salty old blood!", color: "red", tier: "Dangerous" },
    { emoji: "🌪️", text: "Winds that bite, seas ignite—dock tonight, you bold sea sprite!", color: "red", tier: "Dangerous" },
    { emoji: "🚨", text: "Waves that crash, storms that lash—stay and stash, you cunning sea dash!", color: "red", tier: "Dangerous" },
    { emoji: "🌊", text: "Seas that pound, winds surround—stay aground, you gritty sea hound!", color: "red", tier: "Dangerous" },
    { emoji: "⚡", text: "Storms that yell, seas from hell—dock and dwell, you crafty sea spell!", color: "red", tier: "Dangerous" },
    { emoji: "🌧️", text: "Rain and chop, seas don't stop—stay and flop, you salty old top!", color: "red", tier: "Dangerous" },
    { emoji: "🌪️", text: "Winds that scream, seas extreme—dock and dream, you bold sea beam!", color: "red", tier: "Dangerous" },
    { emoji: "🚨", text: "Waves that surge, storms that urge—stay and purge, you cunning sea scourge!", color: "red", tier: "Dangerous" },
    { emoji: "🌊", text: "Seas that toss, winds that cross—dock or loss, you weathered sea boss!", color: "red", tier: "Dangerous" },
    { emoji: "⚡", text: "Storms that roar, seas that soar—hug the shore, you wily sea lore!", color: "red", tier: "Dangerous" },
    { emoji: "🌧️", text: "Rain's a curse, seas get worse—dock and nurse, you salty sea verse!", color: "red", tier: "Dangerous" },
    { emoji: "🌪️", text: "Winds that wail, waves that flail—stay and bail, you grizzled sea trail!", color: "red", tier: "Dangerous" },
    { emoji: "🚨", text: "Chop and gust, seas disgust—stay or bust, you crafty sea rust!", color: "red", tier: "Dangerous" },
    { emoji: "🌊", text: "Seas that rage, winds engage—dock, you sage, you weathered sea page!", color: "red", tier: "Dangerous" },
    { emoji: "⚡", text: "Storms that bite, seas ignite—stay tonight, you bold sea sprite!", color: "red", tier: "Dangerous" },
    { emoji: "🌧️", text: "Rain and waves, seas like caves—dock and save, you cunning sea knave!", color: "red", tier: "Dangerous" },
    { emoji: "🌪️", text: "Winds that lash, seas that crash—stay and stash, you salty sea dash!", color: "red", tier: "Dangerous" },
    { emoji: "🚨", text: "Waves that pound, storms surround—stay aground, you gritty sea hound!", color: "red", tier: "Dangerous" },
    { emoji: "🌊", text: "Seas that scream, winds extreme—dock and dream, you wily sea beam!", color: "red", tier: "Dangerous" },
    { emoji: "⚡", text: "Storms that howl, waves that scowl—throw in the towel, you battle-worn fowl!", color: "red", tier: "Dangerous" },
    { emoji: "🌧️", text: "Rain and chop, seas don't stop—stay and flop, you salty old top!", color: "red", tier: "Dangerous" },
    { emoji: "🌪️", text: "Winds that roar, seas that soar—hug the shore, you crafty commodore!", color: "red", tier: "Dangerous" },
    { emoji: "🚨", text: "Chop and spray, hell's at play—stay away, you cunning castaway!", color: "red", tier: "Dangerous" }
  ]
};

/**
 * Parse NOAA forecast text to extract key weather parameters
 */
export function parseNoaaForecast(forecastText: string): ForecastData {
  const text = forecastText.toLowerCase();
  let windSpeed: number | undefined;
  let gusts: number | undefined;
  let seas: number | undefined;
  const weather: string[] = [];
  let visibility: number | undefined;
  let partialDay = false;

  // Extract wind speed and gusts using improved regex patterns
  const windPatterns = [
    /winds?\s+(?:around\s+|about\s+)?(\d+)\s*(?:to\s*(\d+))?\s*kt/,
    /(\w+)\s+winds?\s+(\d+)\s*(?:to\s*(\d+))?\s*kt/,
    /winds?\s+(\w+)\s+(\d+)\s*(?:to\s*(\d+))?\s*kt/
  ];

  for (const pattern of windPatterns) {
    const match = text.match(pattern);
    if (match) {
      const numbers = match.filter(m => m && /^\d+$/.test(m)).map(Number);
      if (numbers.length > 0) {
        windSpeed = Math.max(...numbers);
        break;
      }
    }
  }

  // Extract gusts
  const gustMatch = text.match(/gusts?\s+(?:up\s+to\s+|to\s+)?(\d+)\s*kt/);
  if (gustMatch) {
    gusts = parseInt(gustMatch[1]);
  }

  // Extract seas with improved patterns
  const seasPatterns = [
    /seas?\s+(?:around\s+|about\s+)?(\d+)\s*(?:to\s*(\d+))?\s*ft/,
    /waves?\s+(?:around\s+|about\s+)?(\d+)\s*(?:to\s*(\d+))?\s*ft/,
    /(\d+)\s*(?:to\s*(\d+))?\s*ft\s+seas?/
  ];

  for (const pattern of seasPatterns) {
    const match = text.match(pattern);
    if (match) {
      const numbers = match.filter(m => m && /^\d+$/.test(m)).map(Number);
      if (numbers.length > 0) {
        seas = Math.max(...numbers);
        break;
      }
    }
  }

  // Extract weather conditions
  const weatherConditions = [
    { pattern: /\b(?:clear|sunny|fair)\b/, condition: 'clear' },
    { pattern: /\bpartly\s+cloudy\b/, condition: 'partly cloudy' },
    { pattern: /\bcloudy|overcast\b/, condition: 'cloudy' },
    { pattern: /\bshowers?\b/, condition: 'showers' },
    { pattern: /\b(?:thunderstorms?|tstms?)\b/, condition: 'thunderstorms' },
    { pattern: /\bfog|mist\b/, condition: 'fog' },
    { pattern: /\brain\b/, condition: 'rain' }
  ];

  for (const { pattern, condition } of weatherConditions) {
    if (pattern.test(text)) {
      weather.push(condition);
    }
  }

  // Check for partial-day conditions
  const partialDayTerms = [
    'morning', 'afternoon', 'evening', 'tonight', 'later', 
    'becoming', 'then', 'after', 'before', 'until'
  ];
  partialDay = partialDayTerms.some(term => text.includes(term));

  // Extract visibility
  const visibilityPatterns = [
    /(?:visibility|vsby)\s+(\d+(?:\.\d+)?)\s*(?:to\s*(\d+(?:\.\d+)?))?\s*(?:nm|miles?)/,
    /(?:visibility|vsby)\s+(?:less\s+than\s+|under\s+)?(\d+(?:\.\d+)?)\s*(?:nm|miles?)/
  ];

  for (const pattern of visibilityPatterns) {
    const match = text.match(pattern);
    if (match) {
      const numbers = match.filter(m => m && /^\d+(\.\d+)?$/.test(m)).map(Number);
      if (numbers.length > 0) {
        visibility = Math.min(...numbers);
        break;
      }
    }
  }

  return {
    windSpeed,
    gusts,
    seas,
    weather,
    visibility,
    partialDay,
    originalText: forecastText
  };
}

/**
 * Enhanced 5-tier decision tree for forecast classification
 */
export function assignForecastTier(data: ForecastData): string {
  const { windSpeed, gusts, seas, weather, visibility, partialDay } = data;

  // Dangerous conditions (RED) - immediate safety concerns
  if (
    (windSpeed !== undefined && windSpeed > 20) ||
    (seas !== undefined && seas > 4) ||
    (weather.includes('thunderstorms') && !partialDay) ||
    (weather.includes('fog') && !partialDay) ||
    (visibility !== undefined && visibility < 1) ||
    (gusts !== undefined && gusts > 25)
  ) {
    return "Dangerous";
  }

  // Caution conditions (ORANGE) - partial day issues or moderate risk
  if (
    (windSpeed !== undefined && windSpeed >= 15 && windSpeed <= 20) ||
    (gusts !== undefined && gusts > 20 && gusts <= 25) ||
    (seas !== undefined && seas >= 3 && seas <= 4) ||
    (weather.includes('showers') && partialDay) ||
    (weather.includes('thunderstorms') && partialDay) ||
    (weather.includes('fog') && partialDay) ||
    (visibility !== undefined && visibility >= 1 && visibility < 3) ||
    (partialDay && (weather.includes('rain') || weather.includes('showers')))
  ) {
    return "Caution";
  }

  // Moderate conditions (BLUE) - manageable but not ideal
  if (
    (windSpeed !== undefined && windSpeed >= 11 && windSpeed <= 20) ||
    (seas !== undefined && seas >= 2 && seas <= 4) ||
    weather.includes('cloudy') ||
    (gusts !== undefined && gusts > 15 && gusts <= 20) ||
    (visibility !== undefined && visibility >= 3 && visibility < 6)
  ) {
    return "Moderate";
  }

  // Good conditions (LIGHT GREEN) - mostly favorable with minor issues
  if (
    (windSpeed !== undefined && windSpeed >= 5 && windSpeed <= 15) ||
    (seas !== undefined && seas >= 1 && seas <= 2) ||
    weather.includes('partly cloudy') ||
    (partialDay && weather.includes('clear')) ||
    (gusts !== undefined && gusts <= 15)
  ) {
    return "Good";
  }

  // Excellent conditions (GREEN) - ideal conditions
  if (
    (windSpeed === undefined || windSpeed <= 10) &&
    (seas === undefined || seas <= 1) &&
    (weather.length === 0 || weather.includes('clear') || weather.includes('sunny')) &&
    (visibility === undefined || visibility >= 6) &&
    !weather.includes('rain') &&
    !weather.includes('showers') &&
    !weather.includes('thunderstorms') &&
    !weather.includes('fog')
  ) {
    return "Excellent";
  }

  // Default fallback
  return "Moderate";
}

/**
 * Get a random summary statement for the given forecast text
 */
export function getForecastSummary(forecastText: string): SummaryStatement {
  const forecastData = parseNoaaForecast(forecastText);
  const tier = assignForecastTier(forecastData);
  const statements = SUMMARY_STATEMENTS[tier as keyof typeof SUMMARY_STATEMENTS];
  
  if (!statements || statements.length === 0) {
    // Fallback to Moderate if tier not found
    const fallbackStatements = SUMMARY_STATEMENTS.Moderate;
    return fallbackStatements[Math.floor(Math.random() * fallbackStatements.length)];
  }
  
  return statements[Math.floor(Math.random() * statements.length)];
}

/**
 * Get all available tiers
 */
export function getAvailableTiers(): string[] {
  return Object.keys(SUMMARY_STATEMENTS);
}

/**
 * Get tier color mapping for CSS classes
 */
export function getTierColorClass(tier: string): string {
  const colorMap: Record<string, string> = {
    'Excellent': 'text-green-400',
    'Good': 'text-lime-400',
    'Moderate': 'text-blue-400',
    'Caution': 'text-orange-400',
    'Dangerous': 'text-red-400'
  };
  
  return colorMap[tier] || 'text-blue-400';
}