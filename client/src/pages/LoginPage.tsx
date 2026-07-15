import { useState, useEffect } from "react";
import { useHashLocation as useLocation } from "wouter/use-hash-location";
import { Zap, Eye, EyeOff, ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import AuroraBackground from "@/components/AuroraBackground";
import { signIn, signUp } from "@/lib/storage";
import { motion, AnimatePresence } from "framer-motion";

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
    if (!email.trim() || !password) { setError("Por favor, preencha todos os campos."); return; }
    if (!email.includes("@")) { setError("Insira um endereço de e-mail válido."); return; }

    if (mode === "register") {
      if (password.length < 6) { setError("A senha deve ter pelo menos 6 caracteres."); return; }
      if (password !== confirmPass) { setError("As senhas não coincidem."); return; }
      setLoading(true);
      try {
        await signUp(email, password);
        setSuccess("Conta criada com sucesso! Verifique seu e-mail para confirmar e depois faça login.");
        setMode("login");
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Algo deu errado ao criar a conta.");
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        await signIn(email, password);
        navigate("/dashboard");
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "E-mail ou senha incorretos.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden" style={{ background: "var(--background)" }}>
      <AuroraBackground intensity="low" />

      {/* Floating Header Back Button */}
      <motion.button 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 z-20 lumeo-btn-ghost px-4 py-2 text-xs flex items-center gap-1.5 font-bold"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> 
        <span>Voltar</span>
      </motion.button>

      {/* Login Box wrapper */}
      <motion.div 
        initial={{ opacity: 0, y: 25, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] blur-xl -z-10 transform translate-y-3" />
        
        {/* Double-Bezel Card */}
        <div className="lumeo-card p-8 space-y-6 bg-card/60 backdrop-blur-md">
          
          {/* Logo & Headline */}
          <div className="text-center space-y-2.5">
            <div className="flex justify-center">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dim))", boxShadow: "0 0 20px var(--primary-glow)" }}
              >
                <Zap className="w-5 h-5" style={{ color: "var(--primary-foreground)" }} strokeWidth={2.5} />
              </motion.div>
            </div>
            <div className="space-y-1">
              <h1 className="font-extrabold text-2xl tracking-tight" style={{ color: "var(--foreground)" }}>Lumeo</h1>
              <p className="text-muted-foreground text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                {mode === "register" ? "Crie sua conta para começar" : "Acesse seu hub de aprendizado"}
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--muted-foreground)", opacity: 0.8 }}>E-mail</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="seu@email.com" 
                className="lumeo-input" 
                autoFocus 
                disabled={loading} 
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--muted-foreground)", opacity: 0.8 }}>Senha</label>
              <div className="relative">
                <input 
                  type={showPass ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  placeholder="••••••••" 
                  className="lumeo-input pr-10" 
                  disabled={loading} 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (register mode) */}
            <AnimatePresence>
              {mode === "register" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5 mt-2" style={{ color: "var(--muted-foreground)", opacity: 0.8 }}>Confirmar Senha</label>
                  <input 
                    type="password" 
                    value={confirmPass} 
                    onChange={(e) => setConfirmPass(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder="••••••••" 
                    className="lumeo-input" 
                    disabled={loading} 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Feedback Messages */}
          {error && (
            <p className="text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3.5 py-2.5">{error}</p>
          )}
          {success && (
            <p className="text-xs font-medium text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-3.5 py-2.5">{success}</p>
          )}

          {/* Submit Button */}
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="lumeo-btn w-full h-11 text-sm gap-2 font-bold transition-all relative overflow-hidden group"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{mode === "register" ? "Criando..." : "Entrando..."}</span>
              </>
            ) : (
              <>
                {mode === "register" ? "Criar conta" : "Entrar"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          {/* Toggle login/register mode */}
          <p className="text-center text-xs text-muted-foreground font-medium pt-2">
            {mode === "register" ? (
              <>
                Já possui uma conta?{" "}
                <button onClick={() => { setMode("login"); setError(""); setSuccess(""); }} className="text-primary hover:underline font-bold transition-colors">
                  Faça login
                </button>
              </>
            ) : (
              <>
                Não tem uma conta?{" "}
                <button onClick={() => { setMode("register"); setError(""); setSuccess(""); }} className="text-primary hover:underline font-bold transition-colors">
                  Crie uma
                </button>
              </>
            )}
          </p>
        </div>

        <p className="text-center text-[10px] text-muted-foreground/60 mt-6 font-medium">
          Seus dados de estudo são sincronizados de forma segura na nuvem.
        </p>
      </motion.div>
    </div>
  );
}

