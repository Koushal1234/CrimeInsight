import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CrimeInsightLogo } from "@/components/CrimeInsightLogo";
import loginBg from "@/assets/login-bg.jpg";
import { useAuth } from "@/lib/authContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username || !password) {
      setError("Please enter Officer ID and Password");
      return;
    }

    try {
      await login(username, password);
      setError("");
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to connect to server");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <img
        src={loginBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/80 to-background/95" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(210 100% 56% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(210 100% 56% / 0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }}
      />

      <div className="relative z-10 w-full max-w-md px-4 animate-fade-in">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <CrimeInsightLogo collapsed={false} size="lg" className="justify-center" />
          </div>
          <div className="glow-line mt-6" />
        </div>

        <form
          onSubmit={handleLogin}
          className="glass rounded-xl p-8 space-y-6 animate-scale-in"
        >
          <div className="text-center mb-2">
            <h2 className="text-sm font-semibold text-foreground">Secure Access Portal</h2>
            <p className="text-xs text-muted-foreground mt-1">Authorized personnel only</p>
          </div>

          <div className="space-y-4">
            <div className="relative group">
              <label
                className={`absolute left-10 transition-all duration-200 pointer-events-none ${
                  focused === "user" || username
                    ? "top-1 text-[10px] text-primary"
                    : "top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
                }`}
              >
                Officer ID
              </label>
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setFocused("user")}
                onBlur={() => setFocused(null)}
                className="w-full bg-transparent border-b border-border pl-10 pr-4 pt-5 pb-2 text-sm text-foreground outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="relative group">
              <label
                className={`absolute left-10 transition-all duration-200 pointer-events-none ${
                  focused === "pass" || password
                    ? "top-1 text-[10px] text-primary"
                    : "top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
                }`}
              >
                Password
              </label>
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused("pass")}
                onBlur={() => setFocused(null)}
                className="w-full bg-transparent border-b border-border pl-10 pr-10 pt-5 pb-2 text-sm text-foreground outline-none focus:border-primary transition-colors"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!username || !password}
            className="w-full group rounded-lg h-11 text-sm font-semibold uppercase tracking-wider bg-primary hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
          >
            Access System
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>

          {error && (
            <p className="text-xs text-red-400 text-center">{error}</p>
          )}

          <p className="text-[10px] text-center text-muted-foreground">
            All activity is monitored and logged. Unauthorized access is prohibited.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
