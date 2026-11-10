import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Plus, User } from "lucide-react";
import { LOGO_WHITE } from "@/components/brand";
import { useAuth } from "@/lib/auth";
import { COLLECTOR_APP_URL } from "@/lib/config";

const LINKS = [
  { to: "/bins", label: "Bins" },
  { to: "/how", label: "How it works" },
  { to: "/my-pickups", label: "My pick ups" },
];

function navClass({ isActive }) {
  return `inline-flex items-center min-h-[44px] px-3 rounded-full font-heading font-extrabold text-[14px] whitespace-nowrap ${
    isActive ? "text-gold" : "text-white/85 hover:text-white"
  }`;
}

export default function SiteHeader() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const toggleRef = useRef(null);
  useEffect(() => { setOpen(false); }, [pathname]);
  // Escape closes the phone menu and puts focus back on the menu button.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") { setOpen(false); toggleRef.current?.focus(); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 bg-black">
      <div className="mx-auto max-w-site px-4 md:px-8 h-[68px] flex items-center gap-2">
        <Link to="/" aria-label="Rubbish.com.au home" className="shrink-0 flex items-center min-h-[44px] mr-2">
          <img src={LOGO_WHITE} alt="Rubbish.com.au" className="h-7 w-auto max-w-[150px] object-contain object-left" />
        </Link>

        <nav className="hidden lg:flex items-center gap-1 flex-1" aria-label="Main">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className={navClass}>{l.label}</NavLink>
          ))}
          <a href={COLLECTOR_APP_URL} className="inline-flex items-center min-h-[44px] px-3 rounded-full font-heading font-extrabold text-[14px] text-white/85 hover:text-white whitespace-nowrap">
            For collectors
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden lg:block">
            {!loading && (user ? (
              <NavLink to="/account" className={navClass}>
                <User className="h-4 w-4 mr-1.5" aria-hidden="true" />Account
              </NavLink>
            ) : (
              <NavLink to="/login" className={navClass}>Sign in</NavLink>
            ))}
          </div>
          <Link
            to="/post-pickup"
            className="inline-flex items-center gap-1.5 rounded-full bg-gold text-black px-4 min-h-[44px] font-heading font-extrabold text-[14px] whitespace-nowrap hover:brightness-95"
          >
            <Plus className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
            Post a pick up
          </Link>
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="lg:hidden grid place-items-center h-11 w-11 rounded-full text-white hover:bg-white/10"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" className="lg:hidden border-t border-white/10 bg-black" aria-label="Main">
          <div className="mx-auto max-w-site px-4 py-3 flex flex-col">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => `flex items-center min-h-[48px] font-heading font-extrabold text-[16px] ${isActive ? "text-gold" : "text-white"}`}>
                {l.label}
              </NavLink>
            ))}
            <NavLink to={user ? "/account" : "/login"} className={({ isActive }) => `flex items-center min-h-[48px] font-heading font-extrabold text-[16px] ${isActive ? "text-gold" : "text-white"}`}>
              {user ? "Account" : "Sign in"}
            </NavLink>
            <a href={COLLECTOR_APP_URL} className="flex items-center min-h-[48px] font-heading font-extrabold text-[16px] text-white">
              For collectors
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
