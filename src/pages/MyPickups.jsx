import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44";
import { useAuth, userEmail } from "@/lib/auth";
import Layout, { Spinner, PageHero } from "@/components/layout/Layout";
import { DetailSheet } from "@/components/Sheet";
import PickupDetail from "@/components/mypickups/PickupDetail";
import { jobStatusPillClass, customerStatusLabel, customerStatusPillClass, isInReview } from "@/lib/jobStatus";
import { formatAUDate } from "@/lib/format";
import { saveRepost } from "@/lib/repost";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useUrlParam } from "@/hooks/useUrlParam";

const DONE = ["Completed", "Cancelled", "Expired"];

// Jobs still in play first, soonest pick-up date at the top. Finished jobs after, latest first.
function sortPickups(list) {
  const active = list.filter((p) => !DONE.includes(p.job_status));
  const done = list.filter((p) => DONE.includes(p.job_status));
  const date = (p) => p.agreed_date || p.pickup_date || "";
  active.sort((a, b) => date(a).localeCompare(date(b)));
  done.sort((a, b) => date(b).localeCompare(date(a)));
  return [...active, ...done];
}

function addressLine(p) {
  const street = (p.street_address || "").trim();
  const area = [p.suburb, p.postcode].filter(Boolean).join(" ");
  return [street, area].filter(Boolean).join(", ");
}

export default function MyPickups() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const wide = useMediaQuery("(min-width: 1024px)");
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  // The open pick up lives in the address (?id=), so Back from a collector profile
  // or a refresh reopens the same one.
  const selectedParam = useUrlParam("id");
  const selectedId = selectedParam.value || null;
  const [reposting, setReposting] = useState(false);
  const email = userEmail(user);

  const loadList = () => {
    if (!email) return;
    setLoading(true);
    setLoadError(false);
    base44.entities.PickupRequest
      .filter({ email, job_status: { $exists: true } }, { sort: "-created_date", limit: 100 })
      .then((page) => setPickups(sortPickups(Array.isArray(page) ? page : page?.items || [])))
      .catch(() => { setPickups([]); setLoadError(true); })
      .finally(() => setLoading(false));
  };

  useEffect(loadList, [email]);

  // On wide screens the first pick up opens beside the list.
  useEffect(() => {
    if (wide && !selectedId && pickups.length > 0) selectedParam.replace(pickups[0].id);
  }, [wide, pickups, selectedId]);

  const selected = useMemo(() => pickups.find((p) => p.id === selectedId) || null, [pickups, selectedId]);

  const handleJobUpdate = (updatedJob) => {
    setPickups((prev) => prev.map((p) => (p.id === updatedJob.id ? { ...p, ...updatedJob } : p)));
  };

  // Carries the old job's details into the post form. The date is left out.
  const postAgain = async (pickup) => {
    setReposting(true);
    const photos = [];
    const uris = Array.isArray(pickup.photos) ? pickup.photos.slice(0, 8) : [];
    for (const uri of uris) {
      if (typeof uri !== "string" || uri === "") continue;
      try {
        const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: uri, expires_in: 3600 });
        if (signed_url) photos.push({ file_uri: uri, previewUrl: signed_url, name: "Photo" });
      } catch {
        // Skip a photo that cannot be signed.
      }
    }
    saveRepost({
      size: pickup.size || "",
      materials: Array.isArray(pickup.materials) ? pickup.materials : [],
      description: pickup.description || "",
      suburb: pickup.suburb || "",
      street_address: pickup.street_address || "",
      postcode: pickup.postcode || "",
      time_window: pickup.time_window || "",
      name: pickup.name || "",
      mobile: pickup.mobile || "",
      photos,
    });
    setReposting(false);
    navigate("/post-pickup");
  };

  const subtitle = (p) => [addressLine(p), p.pickup_date && formatAUDate(p.pickup_date), p.time_window].filter(Boolean).join(" · ");
  const openPickup = (id) => (wide ? selectedParam.replace(id) : selectedParam.push(id));

  return (
    <Layout>
      <PageHero title="My pick ups">Your posted pick ups, their quotes and messages.</PageHero>
      <div className="mx-auto max-w-site px-4 md:px-8 py-6 md:py-10">
        {loading ? (
          <Spinner />
        ) : loadError ? (
          <div className="py-10 text-center">
            <p className="text-mute text-[15px]">Sorry, your pick ups did not load. Please try again.</p>
            <button type="button" onClick={loadList} className="mt-4 rounded-full bg-black text-white px-6 py-3 font-heading font-extrabold text-sm min-h-[48px]">Try again</button>
          </div>
        ) : pickups.length === 0 ? (
          <div className="py-10 flex flex-col items-center justify-center text-center">
            <p className="text-mute text-[15px]">You have not posted a pick up yet.</p>
            <Link to="/post-pickup" className="mt-5 inline-flex items-center rounded-full bg-black text-white px-6 py-3 font-heading font-extrabold text-sm min-h-[48px]">
              Post a pick up
            </Link>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-8 lg:items-start">
            <ul className="space-y-3" aria-label="Your pick ups">
              {pickups.map((p) => {
                const isSel = wide && p.id === selectedId;
                return (
                  <li key={p.id} className={`rounded-2xl bg-white border p-4 ${isSel ? "border-black ring-1 ring-black" : "border-line"}`}>
                    <button type="button" onClick={() => openPickup(p.id)} className="block w-full text-left min-h-[44px]" aria-current={isSel ? "true" : undefined}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-heading font-extrabold text-black text-[15px]">
                          {p.pickup_date ? formatAUDate(p.pickup_date) : "No date"}
                          {p.time_window ? ` · ${p.time_window}` : ""}
                        </p>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-heading font-extrabold shrink-0 ${customerStatusPillClass(p)}`}>
                          {customerStatusLabel(p)}
                        </span>
                      </div>
                      {addressLine(p) && <p className="mt-1 text-black text-[14px] font-bold break-words">{addressLine(p)}</p>}
                      <p className="mt-0.5 text-mute text-[13px]">
                        {p.size || (p.estimated_volume_m3 != null ? `${p.estimated_volume_m3} m³` : "")}
                      </p>
                      {isInReview(p) ? (
                        <p className="mt-0.5 text-mute text-[13px]">We're checking your post</p>
                      ) : p.job_status === "Open" && <p className="mt-0.5 text-mute text-[13px]">{p.quote_count || 0} of 3 quotes</p>}
                    </button>
                    {p.job_status === "Expired" && (
                      <button type="button" onClick={() => postAgain(p)} disabled={reposting} className="mt-3 w-full rounded-full bg-black text-white py-3 font-heading font-extrabold text-sm min-h-[48px] disabled:opacity-60">
                        {reposting ? "Opening..." : "Post again"}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>

            {wide && selected && (
              <section className="rounded-[28px] border border-line p-6 xl:p-8 sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto" aria-label="Pick up details">
                <h2 className="font-heading font-extrabold text-[28px] text-black leading-tight">My pick up</h2>
                <p className="mt-1 text-[15px] text-mute">{subtitle(selected)}</p>
                <PickupDetail record={selected} onJobUpdate={handleJobUpdate} />
              </section>
            )}
          </div>
        )}
      </div>
      {!wide && selected && (
        <DetailSheet title="My pick up" subtitle={subtitle(selected)} onClose={selectedParam.clear} scrollKey={`pickup-${selected.id}`}>
          <PickupDetail record={selected} onJobUpdate={handleJobUpdate} />
        </DetailSheet>
      )}
    </Layout>
  );
}
