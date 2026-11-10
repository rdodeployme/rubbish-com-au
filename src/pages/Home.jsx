import { Link } from "react-router-dom";
import { Sofa, Container, Trash2, ArrowRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { COLLECTOR_TILE } from "@/components/brand";
import { StepCards } from "@/components/how/HowParts";
import { SHORT_STEPS } from "@/components/how/content";
import FinishedJobs from "@/components/home/FinishedJobs";
import CollectorBand from "@/components/home/CollectorBand";

const TILES = [
  { to: "/skip-request", Icon: Container, title: "Skip bin", sub: "Waitlist, coming soon" },
  { to: "/wheelie-request", Icon: Trash2, title: "Wheelie bin", sub: "Waitlist, coming soon" },
];

export default function Home() {
  return (
    <Layout>
      <section className="bg-black">
        <div className="mx-auto max-w-site px-4 md:px-8 pt-8 pb-10 md:pt-16 md:pb-16 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] items-center">
          <div>
            <h1 className="font-heading font-extrabold text-white text-[36px] sm:text-[44px] lg:text-[60px] leading-[1.03]">
              Find your <span className="text-gold">cheapest</span> waste collector
            </h1>
            <p className="mt-4 text-white/85 text-[17px] md:text-[20px] leading-snug max-w-[560px]">
              Post a job for free. Compare up to 3 quotes.
            </p>

            <Link to="/post-pickup" className="mt-6 flex items-center gap-3 rounded-2xl bg-gold px-4 py-4 min-h-[76px] max-w-[560px] hover:brightness-95">
              <span className="grid place-items-center h-12 w-12 rounded-full bg-black shrink-0">
                <Sofa className="h-6 w-6 text-gold" strokeWidth={2} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-heading font-extrabold text-black text-[20px] leading-tight">Post a pick up</span>
                <span className="block mt-0.5 text-black text-[14px] font-medium">We do the lifting and loading</span>
              </span>
              <span className="grid place-items-center rounded-full h-11 w-11 shrink-0 bg-black text-gold" aria-hidden="true">
                <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
              </span>
            </Link>

            <div className="mt-3 grid grid-cols-2 gap-3 max-w-[560px]">
              {TILES.map(({ to, Icon, title, sub }) => (
                <Link key={to} to={to} className="flex items-center gap-2.5 rounded-2xl bg-asphalt border border-white/15 px-3 py-3 min-h-[64px] hover:border-white/40">
                  <span className="grid place-items-center h-9 w-9 rounded-full bg-gold shrink-0">
                    <Icon className="h-4 w-4 text-black" strokeWidth={2} aria-hidden="true" />
                  </span>
                  <span className="block min-w-0">
                    <span className="block font-heading font-extrabold text-white text-[15px] leading-tight">{title}</span>
                    <span className="block mt-0.5 text-white/80 text-[12.5px] leading-tight">{sub}</span>
                  </span>
                </Link>
              ))}
            </div>
            <p className="mt-4 text-white/55 text-[13px]">Melbourne and Brisbane. No asbestos or hazardous waste.</p>
          </div>

          <div className="hidden lg:block relative rounded-[32px] overflow-hidden h-[440px]">
            <img src={COLLECTOR_TILE} alt="A collector lifting an armchair onto the tray of a ute." className="absolute inset-0 h-full w-full object-cover object-[50%_35%]" />
          </div>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16" aria-labelledby="how-h">
        <div className="mx-auto max-w-site px-4 md:px-8">
          <div className="flex items-end justify-between gap-3">
            <h2 id="how-h" className="font-heading font-extrabold text-black text-[28px] md:text-[36px] leading-tight">How it works</h2>
            <Link to="/how" className="inline-flex items-center min-h-[44px] font-heading font-extrabold text-[15px] text-black underline decoration-gold decoration-2 underline-offset-4">
              More
            </Link>
          </div>
          <div className="mt-5"><StepCards steps={SHORT_STEPS} /></div>
        </div>
      </section>

      <div className="bg-concrete"><FinishedJobs /></div>
      <CollectorBand />
    </Layout>
  );
}
