import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44";
import { useAuth, userEmail } from "@/lib/auth";
import { LOGO_WHITE } from "@/components/brand";
import { useUrlParam } from "@/hooks/useUrlParam";
import ReviewTab from "@/components/admin/ReviewTab";
import CollectorsTab from "@/components/admin/CollectorsTab";
import PickupsTab from "@/components/admin/PickupsTab";
import BinsTab from "@/components/admin/BinsTab";
import SettingsTab from "@/components/admin/SettingsTab";

// The team's admin portal, moved here from the Base44 app.
// Anyone can load this page, but every list and every action is checked by Base44:
// the tables only return rows to admin accounts, and the action functions refuse non-admins.
const TABS = [
  { key: "review", label: "To review" },
  { key: "collectors", label: "Collectors" },
  { key: "pickups", label: "Pick ups" },
  { key: "bins", label: "Bins" },
  { key: "settings", label: "Settings" },
];

function AdminShell({ children, onSignOut }) {
  return (
    <div className="min-h-screen bg-soft">
      <header className="sticky top-0 z-40 bg-black">
        <div className="mx-auto max-w-[1200px] px-4 md:px-8 h-[64px] flex items-center gap-3">
          <Link to="/admin" aria-label="Admin home" className="shrink-0 flex items-center min-h-[44px]">
            <img src={LOGO_WHITE} alt="Rubbish.com.au" className="h-7 w-auto max-w-[150px] object-contain object-left" />
          </Link>
          <span className="font-heading font-extrabold text-gold text-[14px]">Admin</span>
          <nav className="ml-auto flex items-center gap-1" aria-label="Admin">
            <Link to="/" className="inline-flex items-center min-h-[44px] px-3 font-heading font-extrabold text-[13px] text-white/80 hover:text-white">Website</Link>
            {onSignOut && (
              <button type="button" onClick={onSignOut} className="inline-flex items-center min-h-[44px] px-3 font-heading font-extrabold text-[13px] text-white/80 hover:text-white">Sign out</button>
            )}
          </nav>
        </div>
      </header>
      <main id="main">{children}</main>
    </div>
  );
}

function Message({ title, children }) {
  return (
    <div className="mx-auto max-w-[480px] px-4 py-16 text-center">
      <h1 className="font-heading font-extrabold text-black text-[24px]">{title}</h1>
      {children}
    </div>
  );
}

export default function Admin() {
  const { user, loading, signOut } = useAuth();
  const tabParam = useUrlParam("tab");
  const tab = TABS.some((t) => t.key === tabParam.value) ? tabParam.value : "review";
  const [reviewCount, setReviewCount] = useState(null);
  const isAdmin = user?.role === "admin";

  const loadCount = useCallback(async () => {
    try {
      const [a, p] = await Promise.all([
        base44.entities.CollectorApplication.count({ status: { $in: ["New", "Checking"] } }),
        base44.entities.PickupRequest.count({ job_status: "Open", status: "New" }),
      ]);
      setReviewCount((a || 0) + (p || 0));
    } catch {
      setReviewCount(null);
    }
  }, []);

  useEffect(() => { if (isAdmin) loadCount(); }, [isAdmin, loadCount]);

  // Keep the admin page out of search engines.
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  if (loading) {
    return <AdminShell><div className="py-16 flex justify-center"><div className="w-7 h-7 border-4 border-line border-t-black rounded-full animate-spin" /></div></AdminShell>;
  }

  if (!user) {
    return (
      <AdminShell>
        <Message title="Admins only">
          <p className="mt-2 text-mute text-[15px]">Sign in with your Rubbish.com.au admin account.</p>
          <Link to={`/login?returnTo=${encodeURIComponent("/admin")}`} className="mt-5 inline-flex items-center min-h-[48px] rounded-full bg-black text-white px-8 font-heading font-extrabold text-sm">Sign in</Link>
        </Message>
      </AdminShell>
    );
  }

  if (!isAdmin) {
    return (
      <AdminShell onSignOut={signOut}>
        <Message title="Admins only">
          <p className="mt-2 text-mute text-[15px]">You're signed in as {userEmail(user)}, which isn't an admin account.</p>
        </Message>
      </AdminShell>
    );
  }

  return (
    <AdminShell onSignOut={signOut}>
      <h1 className="sr-only">Rubbish.com.au admin</h1>
      <div className="bg-white border-b border-line">
        <div className="mx-auto max-w-[1200px] px-4 md:px-8">
          <div className="flex gap-2 overflow-x-auto py-3" role="tablist" aria-label="Admin sections">
            {TABS.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => { tabParam.replace(t.key === "review" ? "" : t.key); if (t.key === "review") loadCount(); }}
                  className={`shrink-0 min-h-[44px] inline-flex items-center gap-2 rounded-full px-4 font-heading font-extrabold text-[14px] ${active ? "bg-black text-gold" : "bg-white border border-line text-black"}`}
                >
                  {t.label}
                  {t.key === "review" && reviewCount > 0 && (
                    <span className={`inline-flex min-w-[22px] h-[22px] items-center justify-center rounded-full px-1.5 text-[12px] ${active ? "bg-gold text-black" : "bg-black text-gold"}`}>{reviewCount}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[1200px] md:px-8" role="tabpanel" aria-label={TABS.find((t) => t.key === tab).label}>
        {tab === "review" && <ReviewTab onCountChange={setReviewCount} />}
        {tab === "collectors" && <CollectorsTab />}
        {tab === "pickups" && <PickupsTab />}
        {tab === "bins" && <BinsTab />}
        {tab === "settings" && <SettingsTab />}
      </div>
    </AdminShell>
  );
}
