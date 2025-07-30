// Browser detection utility for Chrome compatibility fixes
export const isChrome = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
};

export const getChromeVersion = (): number => {
  if (!isChrome()) return 0;
  const match = navigator.userAgent.match(/Chrome\/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

export const isChromeAndroid = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Chrome/.test(navigator.userAgent) && /Android/.test(navigator.userAgent);
};

export const isChromeiOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /CriOS/.test(navigator.userAgent);
};

// Fix for Chrome date/time handling
export const fixChromeDateTime = (): void => {
  if (!isChrome()) return;
  
  // Add polyfill for Intl.DateTimeFormat if needed
  if (!window.Intl || !window.Intl.DateTimeFormat) {
    console.warn('DateTimeFormat not supported, using fallback');
  }
};

// Chrome-specific CSS fixes
export const applyChromeStyles = (): void => {
  if (!isChrome() || typeof document === 'undefined') return;
  
  const style = document.createElement('style');
  style.textContent = `
    /* Chrome-specific fixes */
    * {
      -webkit-tap-highlight-color: transparent;
    }
    
    /* Fix Chrome's font rendering */
    body {
      -webkit-font-feature-settings: "liga" 1, "calt" 1;
      font-feature-settings: "liga" 1, "calt" 1;
    }
    
    /* Fix Chrome's flexbox shrinking */
    .flex-shrink-0 {
      -webkit-flex-shrink: 0 !important;
      flex-shrink: 0 !important;
    }
  `;
  document.head.appendChild(style);
};

// Initialize Chrome fixes
export const initChromeCompatibility = (): void => {
  if (typeof window === 'undefined') return;
  
  fixChromeDateTime();
  applyChromeStyles();
  
  // Log Chrome info for debugging
  if (isChrome()) {
    console.log(`Chrome detected: version ${getChromeVersion()}`);
    if (isChromeAndroid()) console.log('Chrome on Android detected');
    if (isChromeiOS()) console.log('Chrome on iOS detected');
  }
};