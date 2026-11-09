import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2 } from "lucide-react";
import { base44, errorMessage } from "@/api/base44";
import { useAuth } from "@/lib/auth";
import { safeReturnTo } from "@/lib/authReturnTo";
import AuthShell, { authInput, authLabel, authButton, authLink, ErrorBox } from "@/components/auth/AuthShell";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const returnTo = safeReturnTo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email.toLowerCase().trim(), password);
      await refresh();
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Invalid email or password"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to see your pick ups and quotes."
      footer={<>Don't have an account?{" "}<Link to={"/register" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")} className={authLink}>Create one</Link></>}
    >
      <ErrorBox>{error}</ErrorBox>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="email" className={authLabel}>Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" aria-hidden="true" />
            <input id="email" type="email" autoComplete="email" autoFocus placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={authInput} required />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className={authLabel}>Password</label>
            <Link to="/forgot-password" className="inline-flex items-center min-h-[44px] text-xs text-black font-bold underline underline-offset-2">Forgot password?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" aria-hidden="true" />
            <input id="password" type="password" autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className={authInput} required />
          </div>
        </div>
        <button type="submit" className={authButton} disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</> : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}
