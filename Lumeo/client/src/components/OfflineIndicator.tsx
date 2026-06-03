import { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      // Hide indicator after 3 seconds
      setTimeout(() => setShowIndicator(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showIndicator) return null;

  return (
    <div
      className={`fixed top-4 left-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
        isOnline
          ? 'bg-green-500/20 text-green-400 border border-green-500/50'
          : 'bg-red-500/20 text-red-400 border border-red-500/50'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          <span className="text-sm font-medium">Back Online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">Offline Mode</span>
        </>
      )}
    </div>
  );
}
