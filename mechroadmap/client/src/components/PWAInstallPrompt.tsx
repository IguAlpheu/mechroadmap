import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export default function PWAInstallPrompt() {
  const { installPrompt, isInstalled, isOnline, installApp } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed === 'true') {
      setDismissed(true);
    }
  }, []);

  useEffect(() => {
    if (installPrompt && !isInstalled && !dismissed && isOnline) {
      setShowPrompt(true);
    } else {
      setShowPrompt(false);
    }
  }, [installPrompt, isInstalled, dismissed, isOnline]);

  const handleInstall = async () => {
    await installApp();
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
      <div className="mission-card rounded-lg p-4 shadow-lg border border-primary/30">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
              <Download className="w-4 h-4 text-primary" />
              Install App
            </h3>
            <p className="text-xs text-white/60 mb-3">
              Install MechRoadmap for offline access and a better experience.
            </p>
            <button
              onClick={handleInstall}
              className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-smooth hover:bg-primary-light active:scale-95"
            >
              Install
            </button>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/50 hover:text-white transition-smooth p-1"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
