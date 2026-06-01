import { useEffect, useState } from "react";
import { Route, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { hasSession, setSession } from "@/lib/storage";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import Dashboard from "@/pages/Dashboard";
import SkillView from "@/pages/SkillView";
import NotFound from "@/pages/NotFound";

// ── Auth guard hook ──────────────────────────────────────────
function useAuth() {
  const [authed, setAuthed] = useState<boolean>(() => hasSession());

  const login = () => {
    setSession(true);
    setAuthed(true);
  };

  const logout = () => {
    setSession(false);
    setAuthed(false);
  };

  return { authed, login, logout };
}

// ── Protected route wrapper ──────────────────────────────────
function Protected({
  children,
  authed,
}: {
  children: React.ReactNode;
  authed: boolean;
}) {
  const [location, navigate] = useHashLocation();
  useEffect(() => {
    if (!authed) navigate("/login");
  }, [authed, navigate]);
  return authed ? <>{children}</> : null;
}

// ── Router ───────────────────────────────────────────────────
function Router({
  authed,
  login,
  logout,
}: {
  authed: boolean;
  login: () => void;
  logout: () => void;
}) {
  return (
    <Switch hook={useHashLocation}>
      <Route path="/" component={() => <LandingPage authed={authed} />} />
      <Route path="/login" component={() => <LoginPage onLogin={login} authed={authed} />} />
      <Route
        path="/dashboard"
        component={() => (
          <Protected authed={authed}>
            <Dashboard onLogout={logout} />
          </Protected>
        )}
      />
      <Route
        path="/skill/:id"
        component={(params: { id: string }) => (
          <Protected authed={authed}>
            <SkillView skillId={params.id} onLogout={logout} />
          </Protected>
        )}
      />
      <Route component={NotFound} />
    </Switch>
  );
}

// ── App ───────────────────────────────────────────────────────
export default function App() {
  const { authed, login, logout } = useAuth();

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router authed={authed} login={login} logout={logout} />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
