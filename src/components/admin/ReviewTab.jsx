import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44";
import CollectorSheet from "./CollectorSheet";
import PickupSheet from "./PickupSheet";
import StatusPill from "./StatusPill";
import PostReviewCard from "./PostReviewCard";
import CollectorAvatar from "@/components/mypickups/CollectorAvatar";
import { formatAUDate, formatAUDateTime } from "@/lib/adminConfig";
import { melbourneToday } from "@/lib/format";
import { useUrlParam } from "@/hooks/useUrlParam";
import SwipeReview from "./swipe/SwipeReview";

// Ported from the Base44 app's admin (ReviewTab).
const WAITING_COLLECTOR = ["New", "Checking"];

function uploadedCount(app) {
  return ["carrier_licence_file", "insurance_certificate_file", "police_check_file", "public_photo_url"].filter((k) => !!app[k]).length;
}

function CheckLine({ label, value, warn }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-[13px]">
      <span className="text-mute">{label}</span>
      <span className={`text-right ${warn ? "font-bold text-danger" : "text-black"}`}>{value || "Not given"}</span>
    </div>
  );
}

function ApplicationCard({ app, onOpen }) {
  const name = `${app.first_name || ""} ${app.last_name || ""}`.trim();
  const abn = String(app.abn || "").replace(/\s/g, "");
  const today = melbourneToday();
  return (
    <div className="rounded-[18px] bg-white border border-line p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <CollectorAvatar photoUrl={app.public_photo_url} name={name} size={44} />
        <div className="min-w-0 flex-1">
          <p className="font-heading font-extrabold text-black text-[17px] leading-tight truncate">{app.trading_name || name}</p>
          <p className="text-mute text-[13px] truncate">
            {name}
            {app.home_suburb ? ` · ${app.home_suburb} ${app.state || ""}` : ""}
          </p>
        </div>
        <StatusPill status={app.status} />
      </div>

      <div className="rounded-[12px] bg-soft p-3 space-y-1">
        <CheckLine
          label="ABN"
          value={abn ? (
            <a href={`https://abr.business.gov.au/ABN/View?abn=${abn}`} target="_blank" rel="noreferrer" className="underline underline-offset-2 font-bold">
              {abn} (check)
            </a>
          ) : ""}
        />
        <CheckLine
          label="Driver licence"
          value={app.driver_licence_expiry ? `${app.driver_licence_state || ""} exp ${formatAUDate(app.driver_licence_expiry)}` : ""}
          warn={!app.driver_licence_expiry || app.driver_licence_expiry < today}
        />
        <CheckLine
          label="Insurance"
          value={app.insurance_expiry ? `${app.insurer || ""}, ${app.insurance_cover_amount || ""}, exp ${formatAUDate(app.insurance_expiry)}` : ""}
          warn={!app.insurance_expiry || app.insurance_expiry < today}
        />
        <CheckLine label="Certificate of currency" value={app.insurance_certificate_file ? "Uploaded" : "Not uploaded"} />
        <CheckLine label="Carrier licence (optional)" value={app.carrier_licence_number ? "Provided" : "None"} />
        <CheckLine label="Files uploaded" value={`${uploadedCount(app)} of 4`} />
      </div>

      <p className="text-mute text-[12px]">Applied {formatAUDateTime(app.created_date)}</p>

      <button type="button" onClick={() => onOpen(app)} className="min-h-[44px] inline-flex items-center justify-center rounded-full bg-black text-gold px-4 font-heading font-extrabold text-[14px]">
        Review and decide
      </button>
    </div>
  );
}

// The work queue: collector applications and customer posts that need a person.
export default function ReviewTab({ onCountChange }) {
  const [apps, setApps] = useState(null);
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [flash, setFlash] = useState("");
  // Swipe review: ?swipe=jobs or ?swipe=collectors, so the phone's Back button closes it.
  const swipe = useUrlParam("swipe");
  const swipeKind = swipe.value === "jobs" || swipe.value === "collectors" ? swipe.value : "";

  const load = useCallback(async () => {
    setError("");
    try {
      const [a, p] = await Promise.all([
        base44.entities.CollectorApplication.filter({ status: { $in: WAITING_COLLECTOR } }, { sort: "created_date", limit: 200 }),
        base44.entities.PickupRequest.filter({ job_status: "Open", status: "New" }, { sort: "created_date", limit: 200 }),
      ]);
      setApps(a.items || a || []);
      setPosts(p.items || p || []);
    } catch {
      setError("Could not load the queue. Refresh the page to try again.");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (apps && posts && onCountChange) onCountChange(apps.length + posts.length);
  }, [apps, posts, onCountChange]);

  const showFlash = (text) => {
    setFlash(text);
    window.setTimeout(() => setFlash(""), 4000);
  };

  const handleAppUpdated = (updated) => {
    setApps((prev) => {
      if (!prev) return prev;
      if (!WAITING_COLLECTOR.includes(updated.status)) return prev.filter((x) => x.id !== updated.id);
      return prev.map((x) => (x.id === updated.id ? { ...x, ...updated } : x));
    });
    if (!WAITING_COLLECTOR.includes(updated.status)) {
      setSelectedApp(null);
      showFlash(`${updated.trading_name || "Collector"} set to ${updated.status}.`);
    }
  };

  const handlePostDone = (id, action) => {
    setPosts((prev) => (prev ? prev.filter((x) => x.id !== id) : prev));
    showFlash(action === "approve" ? "Post approved and sent to collectors." : "Post rejected and the customer told.");
  };

  const handlePostUpdated = (updated) => {
    if (updated.job_status !== "Open" || updated.status !== "New") {
      setPosts((prev) => (prev ? prev.filter((x) => x.id !== updated.id) : prev));
    } else {
      setPosts((prev) => (prev ? prev.map((x) => (x.id === updated.id ? { ...x, ...updated } : x)) : prev));
    }
  };

  const handleSwipeCommitted = useCallback((kind, id) => {
    if (kind === "jobs") setPosts((prev) => (prev ? prev.filter((x) => x.id !== id) : prev));
    else setApps((prev) => (prev ? prev.filter((x) => x.id !== id) : prev));
  }, []);

  const loading = apps === null || posts === null;

  return (
    <div className="px-4 md:px-0 pt-5 pb-10">
      {flash && <div className="mb-4 rounded-[14px] bg-gold px-4 py-3 text-black text-[14px] font-bold" role="status">{flash}</div>}
      {error && <p className="mb-4 text-[14px] font-bold text-danger" role="alert">{error}</p>}

      {/* Swipe review: one at a time, full screen, made for a phone. */}
      <section aria-labelledby="swipe-review" className="mb-8 rounded-[20px] bg-black p-4 md:p-5">
        <h2 id="swipe-review" className="font-heading font-extrabold text-white text-[20px]">Swipe to review</h2>
        <p className="mt-1 text-white/70 text-[14px]">Right to approve, left to reject. Scroll each card for the details.</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {[
            ["jobs", "Jobs", posts],
            ["collectors", "Collectors", apps],
          ].map(([k, label, list]) => (
            <button
              key={k}
              type="button"
              onClick={() => swipe.push(k)}
              disabled={loading}
              className="min-h-[96px] rounded-[16px] bg-gold px-4 py-3 text-left disabled:opacity-60"
            >
              <span className="block font-heading font-extrabold text-black text-[34px] leading-none">{loading ? "-" : list.length}</span>
              <span className="mt-1 block font-heading font-extrabold text-black text-[16px]">{label}</span>
              <span className="block text-black/70 text-[13px]">{loading ? "Loading" : list.length === 0 ? "Nothing waiting" : "Start reviewing"}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="review-collectors">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="review-collectors" className="font-heading font-extrabold text-black text-[22px]">Collector applications</h2>
            {!loading && <span className="text-mute text-[14px] font-bold">{apps.length} waiting</span>}
          </div>
          <p className="mt-1 text-mute text-[13px]">New and Checking, oldest first. Approve only once you've checked the ABN, licence and insurance.</p>
          <div className="mt-4 flex flex-col gap-3">
            {loading ? (
              <p className="text-mute text-[14px]">Loading...</p>
            ) : apps.length === 0 ? (
              <p className="rounded-[14px] bg-white border border-line p-4 text-mute text-[14px]">No applications waiting. New ones land here and the team is emailed.</p>
            ) : (
              apps.map((app) => <ApplicationCard key={app.id} app={app} onOpen={setSelectedApp} />)
            )}
          </div>
        </section>

        <section aria-labelledby="review-posts">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="review-posts" className="font-heading font-extrabold text-black text-[22px]">Posts to approve</h2>
            {!loading && <span className="text-mute text-[14px] font-bold">{posts.length} waiting</span>}
          </div>
          <p className="mt-1 text-mute text-[13px]">Customer pick ups stay hidden from collectors until you approve them. Oldest first.</p>
          <div className="mt-4 flex flex-col gap-3">
            {loading ? (
              <p className="text-mute text-[14px]">Loading...</p>
            ) : posts.length === 0 ? (
              <p className="rounded-[14px] bg-white border border-line p-4 text-mute text-[14px]">No posts waiting. New ones land here and the team is emailed.</p>
            ) : (
              posts.map((post) => <PostReviewCard key={post.id} post={post} onDone={handlePostDone} onOpen={setSelectedPost} />)
            )}
          </div>
        </section>
      </div>

      {selectedApp && <CollectorSheet record={selectedApp} onClose={() => setSelectedApp(null)} onUpdated={handleAppUpdated} />}
      {selectedPost && <PickupSheet record={selectedPost} onClose={() => setSelectedPost(null)} onUpdated={handlePostUpdated} />}
      {swipeKind && !loading && (
        <SwipeReview
          kind={swipeKind}
          jobs={posts}
          collectors={apps}
          onKindChange={(k) => swipe.replace(k)}
          onClose={() => swipe.clear()}
          onCommitted={handleSwipeCommitted}
        />
      )}
    </div>
  );
}
