import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { base44 } from "@/api/base44";
import StarRating from "@/components/StarRating";
import { formatPrice } from "@/lib/exampleData";

function Photo({ src, className, alt = "" }) {
  const [err, setErr] = useState(false);
  if (!src || err) return null;
  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setErr(true)} />;
}

// Example finished jobs from the app's public ExampleCompletedJob table. Labelled as examples.
export default function FinishedJobs() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    base44.entities.ExampleCompletedJob
      .filter({}, { sort: "sort_order", limit: 50 })
      .then((r) => setJobs(Array.isArray(r) ? r : r?.items || []))
      .catch(() => setJobs([]));
  }, []);

  if (jobs.length === 0) return null;

  return (
    <section className="py-12 md:py-16" aria-labelledby="finished-h">
      <div className="mx-auto max-w-site px-4 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="finished-h" className="font-heading font-extrabold text-black text-[28px] md:text-[36px] leading-tight">What a finished job looks like</h2>
            <p className="mt-1 text-mute text-[15px]">Examples of how finished jobs will show. Names, prices and reviews are samples.</p>
          </div>
          <span className="inline-flex items-center rounded-full border border-black px-3 py-1 text-xs font-heading font-extrabold uppercase tracking-wide text-black">Examples</span>
        </div>
      </div>
      <div className="mt-6 overflow-x-auto no-scrollbar lg:overflow-visible">
        <ul className="flex lg:grid lg:grid-cols-4 gap-4 px-4 md:px-8 lg:mx-auto lg:max-w-site" style={{ scrollSnapType: "x mandatory" }}>
          {jobs.slice(0, 8).map((job) => (
            <li key={job.id} className="shrink-0 w-[240px] lg:w-auto rounded-2xl bg-white border border-line overflow-hidden flex flex-col" style={{ scrollSnapAlign: "start" }}>
              <div className="relative h-[120px] w-full bg-soft shrink-0">
                <Photo src={job.image_url} className="absolute inset-0 h-full w-full object-cover" />
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black px-2 py-0.5 text-[11px] font-bold text-white">
                  <Check className="h-3 w-3 text-gold" strokeWidth={3} aria-hidden="true" /> Example
                </span>
              </div>
              <div className="p-4 flex flex-col gap-1.5 flex-1">
                <h3 className="font-heading font-extrabold text-[15px] text-black leading-tight line-clamp-1">{job.title}</h3>
                <div className="flex items-center justify-between gap-2">
                  <StarRating value={5} size={13} filled="#FBC303" stroke="#1B1B1B" />
                  <span className="text-[12px] text-mute truncate">{job.reviewer_name}</span>
                </div>
                <p className="text-[13px] italic text-black leading-snug line-clamp-2 min-h-[34px]">&ldquo;{job.review_text}&rdquo;</p>
                <div className="mt-auto pt-2 border-t border-line flex items-center justify-between gap-2">
                  <p className="min-w-0 text-[12.5px] text-mute leading-tight truncate">
                    Done by <span className="font-bold text-black">{job.collector_name}</span>
                  </p>
                  <span className="text-right leading-none shrink-0">
                    <span className="block text-[10.5px] text-mute mb-0.5">Paid</span>
                    <span className="font-heading font-extrabold text-[17px] text-black">{formatPrice(job.price_paid)}</span>
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
