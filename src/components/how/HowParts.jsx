import { useState } from "react";
import { ChevronDown, Triangle, X } from "lucide-react";
import { CUSTOMER_STEPS, PRICE_FACTORS, CANT_TAKE, FAQS } from "./content";

export function StepCards({ steps = CUSTOMER_STEPS }) {
  return (
    <ol className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      {steps.map((s) => (
        <li key={s.n} className="rounded-3xl bg-soft p-5">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center h-9 w-9 rounded-full bg-black text-gold font-heading font-extrabold text-sm shrink-0">{s.n}</span>
            <h3 className="font-heading font-extrabold text-lg text-black leading-tight">{s.title}</h3>
          </div>
          <p className="mt-2 text-mute text-[15px] leading-relaxed">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}

export function PriceFactors() {
  return (
    <div>
      <h2 id="price-factors" className="font-heading font-extrabold text-black text-[24px] md:text-[30px] scroll-mt-24">7 key factors impacting rubbish removal prices</h2>
      <p className="mt-1 text-mute text-[15px]">The main factors that affect how much you pay for rubbish removal:</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {PRICE_FACTORS.map((f) => (
          <div key={f.n} className="rounded-[20px] border border-line bg-white p-5">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center h-9 w-9 rounded-full bg-black text-gold font-heading font-extrabold text-sm shrink-0">{f.n}</span>
              <h3 className="font-heading font-extrabold text-black text-base">{f.title}</h3>
            </div>
            <p className="mt-2 text-mute text-[15px] leading-relaxed">{f.body}</p>
            {f.dir && (
              <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-black px-2.5 py-1 text-xs font-heading font-extrabold text-gold">
                <Triangle className={`h-2.5 w-2.5 fill-gold text-gold ${f.dir === "down" ? "rotate-180" : ""}`} aria-hidden="true" />
                Price<span className="sr-only">{f.dir === "down" ? " goes down" : " goes up"}</span>
              </span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-4 text-mute text-[15px]">Add photos and details when you post. The more collectors know, the more accurate your quotes.</p>
    </div>
  );
}

export function CantTake() {
  return (
    <div className="rounded-[24px] bg-asphalt p-6 md:p-8 text-white">
      <h2 className="font-heading font-extrabold text-xl md:text-2xl">What we can't take*</h2>
      <p className="mt-1 text-white/70 text-sm md:text-[15px]">Every customer confirms their job has none of these before posting:</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {CANT_TAKE.map((i) => (
          <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-white/40 px-3 py-1.5 text-sm">
            <X className="h-3.5 w-3.5 text-gold" strokeWidth={2.5} aria-hidden="true" />{i}
          </span>
        ))}
      </div>
      <p className="mt-3 text-white/50 text-xs">*This can vary between states and territories.</p>
    </div>
  );
}

export function Questions() {
  const [open, setOpen] = useState(null);
  return (
    <div>
      <h2 className="font-heading font-extrabold text-[24px] md:text-[30px] text-black">Questions</h2>
      <div className="mt-2 divide-y divide-line border-y border-line">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={i}>
              <button type="button" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} aria-controls={`faq-${i}`} className="flex items-center gap-3 w-full text-left py-4 min-h-[56px]">
                <span className="font-medium text-[16px] text-black flex-1">{f.q}</span>
                <ChevronDown className={`h-5 w-5 text-black shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              {isOpen && <p id={`faq-${i}`} className="pb-4 pr-8 text-mute text-[15px] leading-relaxed">{f.a}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
