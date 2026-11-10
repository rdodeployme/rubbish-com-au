import { Link } from "react-router-dom";
import { ChevronRight, ClipboardList, HelpCircle, Truck, Plus, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import Layout, { PageHero } from "@/components/layout/Layout";
import { COLLECTOR_APP_URL, TERMS_URL } from "@/lib/config";

function getInitials(name, email) {
  const src = (name || email || "").trim();
  if (!src) return "?";
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

function Row({ to, href, icon: Icon, title, sub, primary }) {
  const cls = `flex items-center gap-3 rounded-2xl border px-4 py-3 min-h-[68px] ${primary ? "border-black bg-black" : "border-line bg-white hover:border-black"}`;
  const inner = (
    <>
      <span className={`grid place-items-center h-10 w-10 rounded-full shrink-0 ${primary ? "bg-gold" : "bg-black"}`}>
        <Icon className={`h-5 w-5 ${primary ? "text-black" : "text-gold"}`} strokeWidth={2.5} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block font-heading font-extrabold text-[16px] leading-tight ${primary ? "text-white" : "text-black"}`}>{title}</span>
        <span className={`mt-0.5 block text-[13px] leading-snug ${primary ? "text-white/70" : "text-mute"}`}>{sub}</span>
      </span>
      <ChevronRight className={`h-5 w-5 shrink-0 ${primary ? "text-gold" : "text-black"}`} strokeWidth={2.5} aria-hidden="true" />
    </>
  );
  return href ? <a href={href} className={cls}>{inner}</a> : <Link to={to} className={cls}>{inner}</Link>;
}

export default function Account() {
  const { user, signOut } = useAuth();
  return (
    <Layout>
      <PageHero title="Account" />
      <div className="mx-auto max-w-[720px] px-4 md:px-8 py-6 md:py-10">
        <div className="rounded-3xl bg-soft p-5 flex items-center gap-4">
          <span className="grid place-items-center h-14 w-14 rounded-full bg-gold text-black font-heading font-extrabold text-[20px] shrink-0" aria-hidden="true">
            {getInitials(user?.full_name, user?.email)}
          </span>
          <div className="min-w-0">
            {user?.full_name && <p className="font-heading font-extrabold text-black text-[18px]">{user.full_name}</p>}
            <p className="text-black text-[15px] break-all">{user?.email}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Row to="/my-pickups" icon={ClipboardList} title="My pick ups" sub="Quotes, bookings and messages" primary />
          <Row to="/post-pickup" icon={Plus} title="Post a pick up" sub="Free. Compare up to 3 quotes." />
          <Row to="/how" icon={HelpCircle} title="How it works" sub="Prices, what we take and common questions" />
          <Row href={COLLECTOR_APP_URL} icon={Truck} title="For collectors" sub="Open the collector app" />
          {user?.role === "admin" && <Row to="/admin" icon={ShieldCheck} title="Admin" sub="Approve collectors and posts" />}
        </div>

        <button type="button" onClick={signOut} className="mt-6 flex w-full md:w-auto md:px-12 justify-center rounded-full border border-black bg-white text-black py-3.5 font-heading font-extrabold text-sm min-h-[48px] hover:bg-black hover:text-white">
          Sign out
        </button>

        <p className="mt-6 text-mute text-[12px]">
          {TERMS_URL ? <a href={TERMS_URL} className="underline">Terms and privacy</a> : "Terms and privacy: link to come."}
        </p>
      </div>
    </Layout>
  );
}
