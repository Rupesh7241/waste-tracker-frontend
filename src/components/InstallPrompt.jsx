// frontend/src/components/InstallPrompt.jsx
// Shows a custom install banner when PWA install is available

import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function InstallPrompt() {
  const [installEvent,  setInstallEvent]  = useState(null);
  const [showBanner,    setShowBanner]    = useState(false);
  const [isInstalled,   setIsInstalled]   = useState(false);

  useEffect(() => {
    // Check if already installed (running as standalone PWA)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user already dismissed the banner
    const dismissed = localStorage.getItem('pwa-banner-dismissed');
    if (dismissed) return;

    // Listen for browser's install prompt event
    const handler = (e) => {
      e.preventDefault();              // prevent default mini-infobar
      setInstallEvent(e);              // save event for later
      setShowBanner(true);             // show our custom banner
      console.log('💾 PWA install prompt captured');
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setShowBanner(false);
      setIsInstalled(true);
      console.log('✅ PWA installed successfully');
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!installEvent) return;

    // Show the browser's native install dialog
    installEvent.prompt();

    // Wait for user's choice
    const { outcome } = await installEvent.userChoice;
    console.log(`PWA install outcome: ${outcome}`);

    setInstallEvent(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Remember dismissal for 7 days
    localStorage.setItem('pwa-banner-dismissed', Date.now().toString());
  };

  // Don't show if already installed or no event
  if (!showBanner || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50">
      <div className="bg-green-800 text-white rounded-2xl shadow-2xl p-4 flex items-start gap-3">

        {/* Icon */}
        <div className="bg-green-700 rounded-xl p-2.5 flex-shrink-0">
          <Smartphone size={22} className="text-green-300" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Install WasteTracker</p>
          <p className="text-green-300 text-xs mt-0.5 leading-relaxed">
            Add to your home screen for quick access and offline support
          </p>

          {/* Buttons */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="flex items-center gap-1.5 bg-white text-green-800 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
            >
              <Download size={13} /> Install App
            </button>
            <button
              onClick={handleDismiss}
              className="text-green-300 hover:text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
            >
              Not now
            </button>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={handleDismiss}
          className="text-green-400 hover:text-white flex-shrink-0 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}