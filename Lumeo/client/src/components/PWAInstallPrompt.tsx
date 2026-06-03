import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const alreadyDismissed = localStorage.getItem("lumeo-pwa-dismissed");
      if (!alreadyDismissed) {
        setTimeout(() => setVisible(true), 3000);
      }
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setVisible(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem("lumeo-pwa-dismissed", "1");
  };

  if (!visible || dismissed) return null;

  return (
    <div
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"
      style={{ animation: "fade-in-up 0.4s cubic-bezier(0.23,1,0.32,1) forwards" }}
    >
      <div
        className="lumeo-card rounded-2xl p-4 flex items-center gap-4 shadow-2xl"
        style={{ boxShadow: "0 8px 40px oklch(0% 0 0 / 50%)" }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "oklch(from var(--primary) l c h / 15%)" }}
        >
          <Download className="w-5 h-5" style={{ color: "var(--primary)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Install Lumeo</p>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Add to home screen for offline access</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleInstall}
            className="lumeo-btn px-3 py-1.5 text-xs"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--muted-foreground)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
