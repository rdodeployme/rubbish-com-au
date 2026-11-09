import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Loader2 } from "lucide-react";
import { base44, errorMessage } from "@/api/base44";
import AuthShell, { authInput, authLabel, authButton, authLink, ErrorBox } from "@/components/auth/AuthShell";

// Ready for when reset emails point at the website. Today they open the Base44 app's own page.
export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      await base44.auth.resetPassword({ resetToken, newPassword });
      navigate("/login", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Failed to reset password"));
    } finally {
      setLoading(false);
    }
  };

  if (!resetToken) {
    return (
      <AuthShell title="Invalid reset link" subtitle="This password reset link is missing or invalid." footer={<Link to="/forgot-password" className={authLink}>Request a new link</Link>}>
        <p className="text-[15px] text-black text-center">The link you used looks incomplete. Please request a new password reset email.</p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="New password" subtitle="Enter your new password below.">
      <ErrorBox>{error}</ErrorBox>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="password" className={authLabel}>New password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" aria-hidden="true" />
            <input id="password" type="password" autoComplete="new-password" autoFocus placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={authInput} required />
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
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Resetting...</> : "Reset password"}
        </button>
      </form>
    </AuthShell>
  );
}
