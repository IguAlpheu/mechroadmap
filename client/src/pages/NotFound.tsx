import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  const [, navigate] = useLocation();
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 text-center px-4">
      <p className="mono-label">404</p>
      <h1 className="text-4xl font-black text-white">Page not found</h1>
      <p className="text-white/40 max-w-xs">This page doesn't exist or has been moved.</p>
      <button
        onClick={() => navigate("/")}
        className="lumeo-btn flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Go home
      </button>
    </div>
  );
}
