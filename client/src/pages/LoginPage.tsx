import { useState, useEffect } from "react";
import { quotes } from "@/data/quotes";

interface LoginPageProps {
  onLogin: () => void;
}

// Credentials stored in localStorage (simulated auth — no backend)
const CREDS_KEY = "mechroadmap-credentials";
const DEFAULT_USER = "admin";
const DEFAULT_PASS = "roadmap2026";

function getStoredCreds(): { username: string; password: string } {
  try {
    const raw = localStorage.getItem(CREDS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { username: DEFAULT_USER, password: DEFAULT_PASS };
}

// Rotate quote every hour
function getQuoteOfTheHour() {
  const now = new Date();
  const hourIndex = now.getFullYear() * 8760 + now.getMonth() * 744 + now.getDate() * 24 + now.getHours();
  return quotes[hourIndex % quotes.length];
}

type View = "login" | "forgot";

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [view, setView] = useState<View>("login");

  // Login state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Forgot password state
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotError, setForgotError] = useState("");

  const [visible, setVisible] = useState(false);
  const [quoteVisible, setQuoteVisible] = useState(false);
  const [quote, setQuote] = useState(getQuoteOfTheHour());

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 100);
    const t2 = setTimeout(() => setQuoteVisible(true), 600);
    // Refresh quote every hour
    const interval = setInterval(() => setQuote(getQuoteOfTheHour()), 60 * 60 * 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearInterval(interval); };
  }, []);

  function handleLogin() {
    if (!username.trim() || !password.trim()) {
      setError("Please fill in both fields.");
      return;
    }
    const creds = getStoredCreds();
    if (username.trim() === creds.username && password === creds.password) {
      onLogin();
    } else {
      setError("Incorrect username or password.");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") view === "login" ? handleLogin() : handleSaveCredentials();
  }

  function handleSaveCredentials() {
    setForgotError("");
    setForgotMsg("");
    if (!newUsername.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setForgotError("All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setForgotError("Password must be at least 6 characters.");
      return;
    }
    localStorage.setItem(CREDS_KEY, JSON.stringify({ username: newUsername.trim(), password: newPassword }));
    setForgotMsg("Credentials updated! You can now log in.");
    setTimeout(() => {
      setView("login");
      setUsername(newUsername.trim());
      setPassword("");
      setForgotMsg("");
      setNewUsername(""); setNewPassword(""); setConfirmPassword("");
    }, 1800);
  }

  const inputStyle = {
    background: "oklch(12% 0.025 240)",
    border: "1px solid oklch(22% 0.03 240)",
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[oklch(5%_0.02_240)]">
      {/* Edge glow */}
      <div className="pointer-events-none absolute inset-0 z-0" style={{ boxShadow: "inset 0 0 120px 40px oklch(45% 0.25 240 / 0.35)" }} />
      <div className="pointer-events-none absolute top-0 left-0 w-96 h-96 z-0 rounded-full" style={{ background: "radial-gradient(circle, oklch(50% 0.25 240 / 0.12) 0%, transparent 70%)", transform: "translate(-30%, -30%)" }} />
      <div className="pointer-events-none absolute bottom-0 right-0 w-96 h-96 z-0 rounded-full" style={{ background: "radial-gradient(circle, oklch(50% 0.25 240 / 0.12) 0%, transparent 70%)", transform: "translate(30%, 30%)" }} />
      <div className="absolute inset-0 starfield opacity-20 z-0" />

      <div
        className="relative z-10 w-full max-w-md px-4"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.6s cubic-bezier(0.23, 1, 0.32, 1), transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)",
        }}
      >
        {/* Logo */}
        <div className="text-center mb-10 space-y-3">
          <span className="mono-label text-xs">OBJECTIVE PLANNER · 2026</span>
          <h1 className="text-4xl font-black font-display text-white leading-tight">
            Mechatronics<br />
            <span className="gradient-text-blue">Roadmap</span>
          </h1>
          <p className="text-white/40 text-sm">
            {view === "login" ? "Sign in to continue your journey" : "Reset your credentials"}
          </p>
        </div>

        {/* Card */}
        <div
          className="mission-card rounded-2xl p-8 space-y-5"
          style={{
            background: "oklch(9% 0.02 240)",
            border: "1px solid oklch(25% 0.05 240 / 0.8)",
            boxShadow: "0 0 40px oklch(45% 0.25 240 / 0.08), 0 20px 60px rgba(0,0,0,0.5)",
          }}
        >
          {view === "login" ? (
            <>
              {/* Username */}
              <div className="space-y-2">
                <label className="mono-label text-xs block">USERNAME</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(""); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your username"
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all duration-200"
                  style={inputStyle}
                  autoComplete="username"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="mono-label text-xs block">PASSWORD</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all duration-200"
                  style={inputStyle}
                  autoComplete="current-password"
                />
              </div>

              {/* Forgot password link */}
              <div className="flex justify-end -mt-2">
                <button
                  onClick={() => { setView("forgot"); setError(""); }}
                  className="text-xs text-blue-400/70 hover:text-blue-300 transition-colors"
                >
                  Forgot credentials?
                </button>
              </div>

              {error && <p className="text-xs text-red-400/80 text-center">{error}</p>}

              <button
                onClick={handleLogin}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, oklch(55% 0.22 240), oklch(45% 0.25 240))",
                  boxShadow: "0 0 24px oklch(50% 0.25 240 / 0.3)",
                }}
              >
                Enter
              </button>

              <div className="flex items-center gap-3 pt-1">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-white/20 text-xs">quote of the hour</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              {/* Quote — rotates every hour */}
              <div
                className="pt-1 text-center space-y-2"
                style={{
                  opacity: quoteVisible ? 1 : 0,
                  transform: quoteVisible ? "translateY(0)" : "translateY(10px)",
                  transition: "opacity 0.7s ease, transform 0.7s ease",
                }}
              >
                <p className="text-white/50 text-sm italic leading-relaxed">"{quote.text}"</p>
                <p className="mono-label text-xs" style={{ color: "oklch(55% 0.18 240)" }}>— {quote.author}</p>
              </div>
            </>
          ) : (
            <>
              {/* Forgot / Reset credentials */}
              <p className="text-xs text-white/50 leading-relaxed">
                Set a new username and password. These are stored locally in your browser.
              </p>

              <div className="space-y-2">
                <label className="mono-label text-xs block">NEW USERNAME</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => { setNewUsername(e.target.value); setForgotError(""); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Choose a username"
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all duration-200"
                  style={inputStyle}
                />
              </div>

              <div className="space-y-2">
                <label className="mono-label text-xs block">NEW PASSWORD</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setForgotError(""); }}
                  onKeyDown={handleKeyDown}
                  placeholder="At least 6 characters"
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all duration-200"
                  style={inputStyle}
                />
              </div>

              <div className="space-y-2">
                <label className="mono-label text-xs block">CONFIRM PASSWORD</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setForgotError(""); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Repeat your password"
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25 outline-none transition-all duration-200"
                  style={inputStyle}
                />
              </div>

              {forgotError && <p className="text-xs text-red-400/80 text-center">{forgotError}</p>}
              {forgotMsg && <p className="text-xs text-green-400/80 text-center">{forgotMsg}</p>}

              <button
                onClick={handleSaveCredentials}
                className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all duration-200 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, oklch(55% 0.22 240), oklch(45% 0.25 240))",
                  boxShadow: "0 0 24px oklch(50% 0.25 240 / 0.3)",
                }}
              >
                Save New Credentials
              </button>

              <button
                onClick={() => { setView("login"); setForgotError(""); setForgotMsg(""); }}
                className="w-full py-2 text-xs text-white/40 hover:text-white/60 transition-colors"
              >
                ← Back to login
              </button>
            </>
          )}
        </div>

        {view === "login" && (
          <p className="text-center text-white/20 text-xs mt-6">
            Default credentials: <span className="text-white/35">admin / roadmap2026</span>
          </p>
        )}
      </div>
    </div>
  );
}
