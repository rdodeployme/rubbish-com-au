import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Layout, { PageHero } from "@/components/layout/Layout";
import { StepCards, PriceFactors, CantTake, Questions } from "@/components/how/HowParts";

export default function HowItWorks() {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.replace("#", ""));
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 60);
  }, [hash]);

  return (
    <Layout>
      <PageHero title="How it works">Post a job for free. Compare up to 3 quotes. Choose the one you want.</PageHero>
      <div className="mx-auto max-w-site px-4 md:px-8 py-8 md:py-12 space-y-12">
        <div>
          <StepCards />
          <Link to="/post-pickup" className="mt-5 inline-flex items-center justify-center rounded-full min-h-[48px] px-8 bg-black text-white font-heading font-extrabold text-sm">
            Post a job for free
          </Link>
        </div>
        <PriceFactors />
        <CantTake />
        <div className="max-w-[860px]"><Questions /></div>
      </div>
    </Layout>
  );
}
