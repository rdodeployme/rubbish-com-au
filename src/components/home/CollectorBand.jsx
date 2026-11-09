import { COLLECTOR_APP_URL } from "@/lib/config";

// "For collectors": a real screenshot of the collector app's Jobs screen in a plain phone frame.
export default function CollectorBand() {
  const shot = import.meta.env.BASE_URL + "collector-app-jobs.png";
  return (
    <section className="bg-black text-white overflow-hidden" aria-labelledby="collectors-h">
      <div className="mx-auto max-w-site px-4 md:px-8 py-12 md:py-16 grid gap-10 md:grid-cols-[minmax(0,1fr)_320px] lg:grid-cols-[minmax(0,1fr)_360px] items-center">
        <div>
          <span className="inline-flex items-center rounded-full bg-gold px-3 py-1 font-heading font-extrabold text-[11px] tracking-wide text-black">FOR COLLECTORS</span>
          <h2 id="collectors-h" className="mt-4 font-heading font-extrabold text-[32px] md:text-[44px] leading-[1.05]">
            Quote on rubbish jobs in your area
          </h2>
          <p className="mt-3 max-w-[520px] text-white/75 text-[16px] md:text-[17px] leading-relaxed">
            Free to register. See open jobs near you, send your price and message customers, all from the collector app.
          </p>
          <a href={COLLECTOR_APP_URL} className="mt-6 inline-flex items-center justify-center rounded-full bg-gold text-black px-8 min-h-[52px] font-heading font-extrabold text-[15px] hover:brightness-95">
            Get the app
          </a>
          <p className="mt-4 max-w-[460px] text-white/60 text-[14px] leading-relaxed">
            Open it on your phone, then tap Share and Add to Home Screen (iPhone) or the menu and Install app (Android).
          </p>
        </div>
        <div className="mx-auto w-[260px] md:w-full max-w-[320px]">
          <div className="rounded-[44px] bg-[#111111] p-3 shadow-[0_30px_60px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
            <div className="relative rounded-[34px] overflow-hidden bg-white aspect-[390/844]">
              <img src={shot} alt="The Rubbish.com.au collector app showing the Jobs screen." className="absolute inset-0 h-full w-full object-cover object-top" loading="lazy" />
              <span className="absolute top-2 left-1/2 -translate-x-1/2 h-5 w-24 rounded-full bg-[#111111]" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
