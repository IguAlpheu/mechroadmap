// ============================================================
// Lumeo — Login / Register Page
// ============================================================
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Zap, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import AuroraBackground from "@/components/AuroraBackground";
import { getAuth, saveAuth, verifyAuth, isFirstTime, setSession } from "@/lib/storage";

interface LoginPageProps {
  onLogin: () => void;
  authed: boolean;
}

export default function LoginPage({ onLogin, authed }: LoginPageProps) {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"login" | "register">(
    isFirstTime() ? "register" : "login"
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (authed) navigate("/dashboard");
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, [authed, navigate]);

  const handleSubmit = async () => {
    setError("");
    if (!username.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (mode === "register") {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPass) {
        setError("Passwords don't match.");
        return;
      }
      setLoading(true);
      await new Promise((r) => setTimeout(r, 400));
      saveAuth(username, password);
      setSession(true);
      onLogin();
      navigate("/dashboard");
    } else {
      if (!getAuth()) {
        setError("No account found. Please register first.");
        setMode("register");
        return;
      }
      setLoading(true);
      await new Promise((r) => setTimeout(r, 400));
      if (verifyAuth(username, password)) {
        setSession(true);
        onLogin();
        navigate("/dashboard");
      } else {
        setLoading(false);
        setError("Incorrect username or password.");
      }
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 bg-background overflow-hidden">
      <AuroraBackground intensity="low" />
      <div className="starfield absolute inset-0 opacity-20" />

      {/* Back to landing */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-5 left-5 z-10 flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-sm"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.5s var(--ease-out), transform 0.5s var(--ease-out)",
        }}
      >
        <div className="lumeo-card rounded-2xl p-8 space-y-6">
          {/* Logo */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(60% 0.22 240), oklch(50% 0.24 240))",
                  boxShadow: "0 0 20px oklch(58% 0.22 240 / 35%)",
                }}
              >
                <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">Lumeo</h1>
              <p className="text-white/40 text-sm mt-0.5">
                {mode === "register" ? "Create your account" : "Welcome back"}
              </p>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-white/40 mb-1.5 font-medium">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKey}
                placeholder="yourname"
                className="lumeo-input"
                autoFocus
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs text-white/40 mb-1.5 font-medium">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="••••••••"
                  className="lumeo-input pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === "register" && (
              <div>
                <label className="block text-xs text-white/40 mb-1.5 font-medium">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="••••••••"
                  className="lumeo-input"
                  disabled={loading}
                />
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="lumeo-btn w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {mode === "register" ? "Creating account..." : "Signing in..."}
              </>
            ) : mode === "register" ? (
              "Create account"
            ) : (
              "Sign in"
            )}
          </button>

          {/* Switch mode */}
          <p className="text-center text-xs text-white/35">
            {mode === "register" ? (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => { setMode("login"); setError(""); }}
                  className="text-primary hover:text-primary-light transition-colors"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                No account yet?{" "}
                <button
                  onClick={() => { setMode("register"); setError(""); }}
                  className="text-primary hover:text-primary-light transition-colors"
                >
                  Create one
                </button>
              </>
            )}
          </p>
        </div>

        <p className="text-center text-xs text-white/20 mt-5">
          Your data is stored locally on your device.
        </p>
      </div>
    </div>
  );
}
