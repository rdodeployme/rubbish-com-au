import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Container, Trash2, ArrowRight } from "lucide-react";
import Layout, { PageHero } from "@/components/layout/Layout";
import BinDrawing from "@/components/bins/BinDrawing";
import { SKIP_BINS, HOOK_BINS, WHEELIE_SIZES, buildExampleLoad, buildFitsAbout } from "@/lib/binModel";

// Bin sizes guide. Same sizes and "Fits about" lines as the app's Bin sizes section.
// Sizes are typical Australian sizes, not supplier specifications (Assumption).
export default function Bins() {
  const [type, setType] = useState("skip");
  const sizes = type === "skip" ? SKIP_BINS : HOOK_BINS;
  const pxPerM = type === "skip" ? 52 : 33;
  const desc = type === "skip"
    ? "Skip bins are dropped and lifted by a skip truck. They fit on most driveways and suit household jobs."
    : "Hook bins are bigger and are rolled on and off a hook-lift truck. Most have a walk-in door, and they need room for the truck to reverse in.";

  const tab = (val, label) => (
    <button type="button" onClick={() => setType(val)} aria-pressed={type === val} className={`rounded-full px-5 min-h-[44px] inline-flex items-center justify-center font-heading font-extrabold text-sm ${type === val ? "bg-black text-white" : "text-black"}`}>
      {label}
    </button>
  );

  return (
    <Layout>
      <PageHero title="Bin sizes">Not sure what you need? Here's what each one holds. Bin bookings are coming soon, and you can join the waitlist now.</PageHero>

      <div className="mx-auto max-w-site px-4 md:px-8 py-8 md:py-12">
        <div className="grid gap-3 md:grid-cols-2">
          <Link to="/skip-request" className="flex items-center gap-3 rounded-2xl bg-gold px-4 py-4 min-h-[72px] hover:brightness-95">
            <span className="grid place-items-center h-11 w-11 rounded-full bg-black shrink-0"><Container className="h-5 w-5 text-gold" aria-hidden="true" /></span>
            <span className="flex-1 min-w-0">
              <span className="block font-heading font-extrabold text-black text-[17px]">Join the skip or hook bin waitlist</span>
              <span className="block text-black text-[14px]">Coming soon. DIY, you load it</span>
            </span>
            <ArrowRight className="h-5 w-5 text-black shrink-0" aria-hidden="true" />
          </Link>
          <Link to="/wheelie-request" className="flex items-center gap-3 rounded-2xl bg-black px-4 py-4 min-h-[72px] hover:bg-asphalt">
            <span className="grid place-items-center h-11 w-11 rounded-full bg-gold shrink-0"><Trash2 className="h-5 w-5 text-black" aria-hidden="true" /></span>
            <span className="flex-1 min-w-0">
              <span className="block font-heading font-extrabold text-white text-[17px]">Join the wheelie bin waitlist</span>
              <span className="block text-white/80 text-[14px]">Coming soon. You fill, we empty</span>
            </span>
            <ArrowRight className="h-5 w-5 text-gold shrink-0" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 md:flex md:items-end md:justify-between md:gap-6">
          <div>
            <h2 className="font-heading font-extrabold text-[28px] md:text-[34px] text-black leading-tight">Skip and hook bins</h2>
            <p className="mt-2 text-[15px] text-mute max-w-[620px]">{desc}</p>
          </div>
          <div className="mt-4 md:mt-0 inline-flex rounded-full p-1 bg-soft shrink-0" role="group" aria-label="Bin type">
            {tab("skip", "Skip bins")}
            {tab("hook", "Hook bins")}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sizes.map((s) => {
            const bin = { ...s, kind: type };
            const fits = buildFitsAbout(buildExampleLoad(bin));
            return (
              <div key={`${type}-${s.size}`} className="rounded-[18px] bg-white border border-line overflow-hidden flex flex-col">
                <div className="relative h-[160px] bg-black overflow-hidden">
                  <div className="absolute inset-0">
                    <BinDrawing bin={bin} placedItems={null} pxPerM={pxPerM} viewBoxW={260} viewBoxH={140} cx={130} groundY={134} outlineW={2.5} fillOpacity={0.08} outlineColor="#FBC303" svgClassName="w-full h-full" preserveAspectRatio="xMidYMax meet" />
                  </div>
                  {s.popular && (
                    <div className="absolute top-2 right-2" style={{ transform: "rotate(12deg)" }}>
                      <div className="w-[76px] h-[76px] rounded-full bg-white grid place-items-center text-center" style={{ boxShadow: "0 0 0 2px #1B1B1B, 0 0 0 5px #FBC303" }}>
                        <span className="font-heading font-extrabold text-[10px] uppercase text-black leading-tight">Most<br />popular</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1">
                  <h3 className="font-heading font-extrabold text-[22px] text-black leading-tight">{`${s.size} cubic metre ${type === "skip" ? "skip" : "hook bin"}`}</h3>
                  <p className="mt-1 text-[14px] text-black leading-snug"><span className="font-bold">Fits about:</span> {fits}.</p>
                  <p className="mt-1 text-[14px] text-mute leading-snug">{s.note}</p>
                  <ul className="mt-3 space-y-1.5">
                    {s.goodFor.map((g) => (
                      <li key={g} className="flex items-start gap-2 text-[14px] text-black">
                        <Check className="h-4 w-4 mt-0.5 text-gold shrink-0" strokeWidth={3} aria-hidden="true" />
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 rounded-[28px] bg-concrete p-6 md:p-8">
          <h2 className="font-heading font-extrabold text-[28px] md:text-[34px] text-black leading-tight">Wheelie bins</h2>
          <p className="mt-2 text-[15px] text-mute max-w-[620px]">
            Bins supplied and emptied by a local collector, once or on a schedule. Sizes available:
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {WHEELIE_SIZES.map((s) => (
              <span key={s} className="rounded-full bg-black text-gold px-4 py-2 font-heading font-extrabold text-sm">{`${s} L`}</span>
            ))}
          </div>
          <Link to="/wheelie-request" className="mt-5 inline-flex items-center rounded-full bg-black text-white px-6 min-h-[48px] font-heading font-extrabold text-sm">
            Join the wheelie bin waitlist
          </Link>
        </div>

        <p className="mt-6 text-[12px] text-mute">Sizes are typical Australian sizes and may vary between suppliers.</p>
      </div>
    </Layout>
  );
}
