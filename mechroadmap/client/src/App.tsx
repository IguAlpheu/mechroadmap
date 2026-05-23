import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import OfflineIndicator from "./components/OfflineIndicator";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          {loggedIn ? (
            <>
              <Router />
              <PWAInstallPrompt />
              <OfflineIndicator />
            </>
          ) : (
            <LoginPage onLogin={() => setLoggedIn(true)} />
          )}
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
