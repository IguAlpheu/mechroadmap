import { useState, useEffect } from "react";
import { useHashLocation as useLocation } from "wouter/use-hash-location";
import { Zap, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import AuroraBackground from "@/components/AuroraBackground";
import { signIn, signUp } from "@/lib/storage";

interface LoginPageProps {
  authed: boolean;
}

export default function LoginPage({ authed }: LoginPageProps) {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (authed) navigate("/dashboard");
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, [authed, navigate]);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (!email.trim() || !password) { setError("Please fill in all fields."); return; }
    if (!email.includes("@")) { setError("Enter a valid email address."); return; }

    if (mode === "register") {
      if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
      if (password !== confirmPass) { setError("Passwords don't match."); return; }
      setLoading(true);
      try {
        await signUp(email, password);
        setSuccess("Account created! Check your email to confirm, then sign in.");
        setMode("login");
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        await signIn(email, password);
        navigate("/dashboard");
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Wrong email or password.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 bg-background overflow-hidden">
      <AuroraBackground intensity="low" />
      <div className="starfield absolute inset-0 opacity-15" />

      <button onClick={() => navigate("/")}
        className="absolute top-5 left-5 z-10 flex items-center gap-2 text-sm text-white/35 hover:text-white/70 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="relative z-10 w-full max-w-sm"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(18px)", transition: "opacity 0.45s cubic-bezier(0.23,1,0.32,1), transform 0.45s cubic-bezier(0.23,1,0.32,1)" }}>
        <div className="lumeo-card rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, oklch(60% 0.22 240), var(--primary-dim)))", boxShadow: "0 0 20px var(--primary) / 35%)" }}>
                <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">Lumeo</h1>
              <p className="text-white/35 text-sm mt-0.5">
                {mode === "register" ? "Create your account" : "Welcome back"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs text-white/35 mb-1.5 font-medium">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="you@email.com" className="lumeo-input" autoFocus disabled={loading} />
            </div>
            <div>
              <label className="block text-xs text-white/35 mb-1.5 font-medium">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="••••••••" className="lumeo-input pr-10" disabled={loading} />
                <button type="button" onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {mode === "register" && (
              <div>
                <label className="block text-xs text-white/35 mb-1.5 font-medium">Confirm password</label>
                <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="••••••••" className="lumeo-input" disabled={loading} />
              </div>
            )}
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
          )}
          {success && (
            <p className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">{success}</p>
          )}

          <button onClick={handleSubmit} disabled={loading}
            className="lumeo-btn w-full flex items-center justify-center gap-2">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" />{mode === "register" ? "Creating..." : "Signing in..."}</>
              : mode === "register" ? "Create account" : "Sign in"}
          </button>

          <p className="text-center text-xs text-white/30">
            {mode === "register"
              ? <>Already have an account?{" "}<button onClick={() => { setMode("login"); setError(""); setSuccess(""); }} className="text-primary hover:underline">Sign in</button></>
              : <>No account?{" "}<button onClick={() => { setMode("register"); setError(""); setSuccess(""); }} className="text-primary hover:underline">Create one</button></>}
          </p>
        </div>
        <p className="text-center text-xs text-white/15 mt-5">
          Your data is securely stored in the cloud.
        </p>
      </div>
    </div>
  );
}
