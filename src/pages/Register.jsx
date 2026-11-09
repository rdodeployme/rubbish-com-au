import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2 } from "lucide-react";
import { base44, errorMessage } from "@/api/base44";
import { useAuth } from "@/lib/auth";
import { safeReturnTo } from "@/lib/authReturnTo";
import AuthShell, { authInput, authLabel, authButton, authLink, ErrorBox } from "@/components/auth/AuthShell";
import OtpInput from "@/components/auth/OtpInput";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const returnTo = safeReturnTo();
  const cleanEmail = email.toLowerCase().trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      await base44.auth.register({ email: cleanEmail, password });
      setShowOtp(true);
    } catch (err) {
      setError(errorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email: cleanEmail, otpCode });
      const token = result?.access_token || result?.data?.access_token;
      if (token) {
        base44.auth.setToken(token);
        await refresh();
        navigate(returnTo, { replace: true });
      } else {
        // Verified but no token returned: sign in to continue.
        navigate("/login" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : ""), { replace: true });
      }
    } catch (err) {
      setError(errorMessage(err, "Invalid verification code"));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setNotice("");
    try {
      await base44.auth.resendOtp(cleanEmail);
      setNotice("Code sent. Check your email for the new code.");
    } catch (err) {
      setError(errorMessage(err, "Failed to resend code"));
    }
  };

  if (showOtp) {
    return (
      <AuthShell title="Verify your email" subtitle={`We sent a 6-digit code to ${cleanEmail}`}>
        <ErrorBox>{error}</ErrorBox>
        {notice && <p className="mb-4 p-3 rounded-xl bg-soft text-black text-sm font-bold" role="status">{notice}</p>}
        <div className="mb-6"><OtpInput value={otpCode} onChange={setOtpCode} /></div>
        <button type="button" className={authButton} onClick={handleVerify} disabled={loading || otpCode.length < 6}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</> : "Verify"}
        </button>
        <p className="text-center text-sm text-mute mt-4">
          Didn't receive the code?{" "}
          <button type="button" onClick={handleResend} className={authLink}>Resend</button>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Post pick ups and compare quotes in one place."
      footer={<>Already have an account?{" "}<Link to={"/login" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")} className={authLink}>Sign in</Link></>}
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
          <label htmlFor="password" className={authLabel}>Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" aria-hidden="true" />
            <input id="password" type="password" autoComplete="new-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className={authInput} required />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="confirm" className={authLabel}>Confirm password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" aria-hidden="true" />
            <input id="confirm" type="password" autoComplete="new-password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={authInput} required />
          </div>
        </div>
        <button type="submit" className={authButton} disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</> : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
