import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${className}`}
      style={{
        background: "var(--accent)",
        border: "1px solid var(--border)",
        color: "var(--muted-foreground)",
      }}
    >
      {isDark
        ? <Sun className="w-4 h-4" />
        : <Moon className="w-4 h-4" />}
    </button>
  );
}
