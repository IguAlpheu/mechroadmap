import { useEffect, useState } from "react";
import { Route, Switch, Router as WouterRouter } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { supabase } from "@/lib/supabase";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import type { Session } from "@supabase/supabase-js";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
import SkillView from "@/pages/SkillView";
import AccountPage from "@/pages/AccountPage";
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";
import NotFound from "@/pages/NotFound";

function usePushReminder() {
  useEffect(() => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    
    // Check if user enabled reminders
    const enabled = localStorage.getItem("lumeo_notif_enabled");
    if (enabled !== "true") return;

    // Check if we already sent one today
    const today = new Date().toISOString().split("T")[0];
    const lastSent = localStorage.getItem("lumeo_last_push_date");
    if (lastSent === today) return;

    // Send daily reminder
    setTimeout(() => {
      new Notification("Hora de Estudar! 🔥", {
        body: "Mantenha sua ofensiva! Reserve 5 minutos para o seu aprendizado diário no Lumeo.",
        icon: "/pwa-192x192.png",
      });
      localStorage.setItem("lumeo_last_push_date", today);
    }, 5000); // Wait 5s after load to show
  }, []);
}

function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return { session, loading, authed: !!session, logout };
}

function Protected({ children, authed }: { children: React.ReactNode; authed: boolean }) {
  const [, navigate] = useHashLocation();
  useEffect(() => { if (!authed) navigate("/login"); }, [authed, navigate]);
  return authed ? <>{children}</> : null;
}

function Router({ authed, loading, logout }: { authed: boolean; loading: boolean; logout: () => void }) {
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--primary)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <WouterRouter hook={useHashLocation}>
      <Switch>
        <Route path="/" component={() => <LandingPage authed={authed} />} />
        <Route path="/login" component={() => <LoginPage authed={authed} />} />
        <Route path="/terms" component={TermsPage} />
        <Route path="/privacy" component={PrivacyPage} />
        <Route path="/dashboard" component={() => (
          <Protected authed={authed}><Dashboard onLogout={logout} /></Protected>
        )} />
        <Route path="/account" component={() => (
          <Protected authed={authed}><AccountPage /></Protected>
        )} />
        <Route path="/skill/:id">
          {(params) => (
            <Protected authed={authed}>
              <SkillView skillId={params.id} onLogout={logout} />
            </Protected>
          )}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

export default function App() {
  const { authed, loading, logout } = useAuth();
  usePushReminder();

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <PWAInstallPrompt />
          <Router authed={authed} loading={loading} logout={logout} />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
