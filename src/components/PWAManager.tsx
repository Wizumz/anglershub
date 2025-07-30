'use client';

import { useEffect, useState } from 'react';

interface PWAManagerProps {
  children?: React.ReactNode;
}

export default function PWAManager({ children }: PWAManagerProps) {
  const [isInstallable, setIsInstallable] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    window.addEventListener('appinstalled', () => {
      setIsInstallable(false);
      setInstallPrompt(null);
      console.log('PWA was installed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    const result = await installPrompt.prompt();
    console.log('Install prompt result:', result);
    
    setInstallPrompt(null);
    setIsInstallable(false);
  };

  return (
    <>
      {children}
      
      {/* Install prompt banner */}
      {isInstallable && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-terminal-bg-alt border border-terminal-border rounded-lg p-4 shadow-lg z-50">
          <div className="flex items-start gap-3">
            <div className="text-2xl">📱</div>
            <div className="flex-1">
              <h3 className="text-terminal-accent font-semibold text-sm mb-1">
                Install Marine Weather App
              </h3>
              <p className="text-terminal-muted text-xs mb-3">
                Add to home screen for quick access and offline support
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleInstallClick}
                  className="text-xs px-3 py-1.5 bg-terminal-accent text-terminal-bg rounded hover:bg-terminal-accent/80 transition-colors font-semibold"
                >
                  Install
                </button>
                <button
                  onClick={() => setIsInstallable(false)}
                  className="text-xs px-3 py-1.5 border border-terminal-fg/20 text-terminal-fg rounded hover:bg-terminal-fg/10 transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}