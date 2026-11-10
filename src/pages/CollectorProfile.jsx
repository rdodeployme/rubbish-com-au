import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { base44, errorMessage, errorStatus } from "@/api/base44";
import Layout, { Spinner } from "@/components/layout/Layout";
import StarRating from "@/components/StarRating";
import CollectorAvatar from "@/components/mypickups/CollectorAvatar";
import { formatAUDate } from "@/lib/format";

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-mute text-[12px] font-bold">{label}</p>
      <p className="text-black text-[15px]">{value}</p>
    </div>
  );
}

export default function CollectorProfile() {
  const [params] = useSearchParams();
  const { pathname, search, state: navState } = useLocation();
  const navigate = useNavigate();
  const id = params.get("id");
  const [collector, setCollector] = useState(null);
  const [state, setState] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!id) { setState("missing"); return; }
    setState("loading");
    base44.functions.invoke("getCollectorCard", { application_id: id })
      .then((res) => { setCollector(res?.data || null); setState(res?.data ? "ok" : "missing"); })
      .catch((err) => {
        if (errorStatus(err) === 401) { setState("signin"); return; }
        setMessage(errorMessage(err, "Collector not found."));
        setState("error");
      });
  }, [id]);

  if (state === "signin") return <Navigate to={`/login?returnTo=${encodeURIComponent(pathname + search)}`} replace />;
  if (state === "loading") return <Layout><Spinner /></Layout>;
  if (state !== "ok") {
    return (
      <Layout>
        <div className="mx-auto max-w-[720px] px-4 py-16 text-center">
          <p className="text-mute text-[15px]">{state === "missing" ? "Collector not found." : message}</p>
        </div>
      </Layout>
    );
  }

  const c = collector;
  const reviews = c.reviews || [];
  const hasReviews = c.rating_count > 0 && reviews.length > 0;
  const locationLabel = [c.home_suburb, c.state].filter(Boolean).join(", ");

  return (
    <Layout>
      <section className="bg-black">
        <div className="mx-auto max-w-site px-4 md:px-8 pt-4">
          <Link
            to="/my-pickups"
            onClick={(e) => { if (navState?.fromPickups) { e.preventDefault(); navigate(-1); } }}
            className="inline-flex items-center gap-1.5 min-h-[44px] text-white/80 hover:text-white font-heading font-extrabold text-[14px]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to my pick ups
          </Link>
        </div>
        <div className="mx-auto max-w-site px-4 md:px-8 pt-2 pb-8 md:pb-12 flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-6 text-center md:text-left">
          <span className="inline-flex rounded-full" style={{ boxShadow: "0 0 0 4px #FBC303" }}>
            <CollectorAvatar photoUrl={c.public_photo_url} name={c.trading_name} size={88} />
          </span>
          <div>
            <h1 className="font-heading font-extrabold text-[28px] md:text-[40px] text-white leading-tight">{c.trading_name || "Collector"}</h1>
            {locationLabel && <p className="mt-1 text-white/60 text-[15px]">{locationLabel}</p>}
            <div className="mt-2 flex items-center justify-center md:justify-start gap-2">
              {hasReviews ? (
                <>
                  <StarRating value={c.rating_avg} size={18} filled="#FBC303" empty="#4a4a4a" />
                  <span className="font-heading font-extrabold text-[18px] text-white">{Number(c.rating_avg).toFixed(1)}</span>
                  <span className="text-white/60 text-[14px]">({c.rating_count} {c.rating_count === 1 ? "review" : "reviews"})</span>
                </>
              ) : (
                <span className="text-white/60 text-[15px]">No reviews yet</span>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-site px-4 md:px-8 py-8 md:py-12 grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
        <section aria-labelledby="about-h">
          <h2 id="about-h" className="font-heading font-extrabold text-[22px] text-black">About</h2>
          <div className="mt-3 space-y-3 rounded-[20px] bg-soft p-5">
            {c.years_experience && <DetailRow label="Years of experience" value={c.years_experience} />}
            {c.crew_size && <DetailRow label="Crew size" value={c.crew_size} />}
            {(c.vehicle_types || []).length > 0 && <DetailRow label="Vehicle types" value={c.vehicle_types.join(", ")} />}
            {(c.job_types || []).length > 0 && <DetailRow label="Job types" value={c.job_types.join(", ")} />}
            {(c.materials || []).length > 0 && <DetailRow label="Materials" value={c.materials.join(", ")} />}
          </div>
        </section>

        <section aria-labelledby="reviews-h">
          <h2 id="reviews-h" className="font-heading font-extrabold text-[22px] text-black">Reviews</h2>
          {reviews.length > 0 ? (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {reviews.map((r, i) => (
                <div key={i} className="rounded-[18px] bg-soft p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid place-items-center h-9 w-9 rounded-full bg-black shrink-0" aria-hidden="true">
                      <span className="font-heading font-extrabold text-[15px] text-white">{r.reviewer_first_name?.[0] || "?"}</span>
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-bold text-black text-[15px]">{r.reviewer_first_name || "Anonymous"}</p>
                          <p className="text-[12px] text-mute">{formatAUDate(r.created_date)}</p>
                        </div>
                        <StarRating value={r.rating} size={14} />
                      </div>
                      {r.comment && <p className="mt-2 text-[15px] text-black leading-snug">{r.comment}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-mute text-[15px]">No reviews yet</p>
          )}
        </section>
      </div>
    </Layout>
  );
}
