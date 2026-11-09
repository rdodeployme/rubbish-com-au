import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44";
import AuthShell, { authInput, authLabel, authButton, authLink } from "@/components/auth/AuthShell";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await base44.auth.resetPasswordRequest(email.toLowerCase().trim());
    } catch {
      // Always show the same message, so the form does not reveal who has an account.
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <AuthShell
      title="Reset password"
      subtitle="We'll email you a link to reset it."
      footer={<Link to="/login" className={authLink}><ArrowLeft className="w-3 h-3 inline mr-1" aria-hidden="true" />Back to sign in</Link>}
    >
      {sent ? (
        <p className="text-[15px] text-black text-center" role="status">If an account exists with that email, you'll receive a password reset link shortly.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className={authLabel}>Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mute" aria-hidden="true" />
              <input id="email" type="email" autoComplete="email" autoFocus placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={authInput} required />
            </div>
          </div>
          <button type="submit" className={authButton} disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</> : "Send reset link"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
