import { Link } from "react-router-dom";
import { LOGO_WHITE } from "@/components/brand";
import { COLLECTOR_APP_URL, TERMS_URL } from "@/lib/config";

export default function SiteFooter() {
  return (
    <footer className="bg-black text-white">
      <div className="mx-auto max-w-site px-4 md:px-8 py-10 md:py-12 grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <img src={LOGO_WHITE} alt="Rubbish.com.au" className="h-7 w-auto max-w-[150px] object-contain object-left" />
          <p className="mt-3 text-white/70 text-[14px] max-w-[360px]">
            Marketplace for rubbish removal in Melbourne and Brisbane. Post a pick up for free and compare up to 3 quotes from local collectors.
          </p>
        </div>
        <div>
          <h2 className="font-heading font-extrabold text-[15px] text-gold">Customers</h2>
          <ul className="mt-2">
            <li><Link to="/post-pickup" className="inline-flex items-center min-h-[44px] text-white/85 hover:text-white text-[14px]">Post a pick up</Link></li>
            <li><Link to="/skip-request" className="inline-flex items-center min-h-[44px] text-white/85 hover:text-white text-[14px]">Skip bin waitlist</Link></li>
            <li><Link to="/wheelie-request" className="inline-flex items-center min-h-[44px] text-white/85 hover:text-white text-[14px]">Wheelie bin waitlist</Link></li>
            <li><Link to="/how" className="inline-flex items-center min-h-[44px] text-white/85 hover:text-white text-[14px]">How it works</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="font-heading font-extrabold text-[15px] text-gold">Collectors</h2>
          <ul className="mt-2">
            <li><a href={COLLECTOR_APP_URL} className="inline-flex items-center min-h-[44px] text-white/85 hover:text-white text-[14px]">Open the collector app</a></li>
            <li>
              {TERMS_URL ? (
                <a href={TERMS_URL} className="inline-flex items-center min-h-[44px] text-white/85 hover:text-white text-[14px]">Terms and privacy</a>
              ) : (
                <span className="inline-flex items-center min-h-[44px] text-white/50 text-[14px]">Terms and privacy: link to come</span>
              )}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-site px-4 md:px-8 py-5 space-y-1 text-white/50 text-[12px]">
          <p>Example jobs, prices and ratings shown on this site are samples.</p>
          <p>No asbestos or hazardous waste. Photos: Unsplash.</p>
        </div>
      </div>
    </footer>
  );
}
