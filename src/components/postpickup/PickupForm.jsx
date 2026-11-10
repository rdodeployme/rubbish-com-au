import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { X, Plus } from "lucide-react";
import { base44, errorMessage } from "@/api/base44";
import {
  VEHICLES,
  ITEMS,
  getCounts,
  getVolume,
  formatVolume,
  SIZE_OPTIONS,
  MATERIAL_OPTIONS,
  TIME_WINDOWS,
} from "@/lib/loadModel";
import JobSummary from "./JobSummary";
import { takeRepost } from "@/lib/repost";

// Ported from the Base44 app's PickupForm. Same checks, wording and payload.
// Desktop change only: two columns, with the job summary kept beside the form.

function ymd(d) {
  return format(d, "yyyy-MM-dd");
}

function parseYmd(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s || "")) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function prefillFromLoad(load) {
  const counts = getCounts(load.placedItems);
  const volume = getVolume(load.placedItems);
  if (volume === 0) return null;
  const size =
    volume < 0.7
      ? "A few items"
      : volume < 1.8
      ? "Quarter load"
      : volume < 3.6
      ? "Half load"
      : "Full load";
  const parts = ITEMS.filter((i) => counts[i.key]).map(
    (i) => `${counts[i.key]} × ${i.name.toLowerCase()}`
  );
  const description = `${parts.join(", ")}. About ${formatVolume(volume)} m³.`;
  const materials = ["General"];
  if (counts["mattress"] || counts["bed-base"]) materials.push("Mattresses");
  if (counts["fridge"] || counts["washer"] || counts["tv"]) materials.push("E-waste");
  if (counts["boxes"]) materials.push("Cardboard");
  if (counts["green-waste"]) materials.push("Green waste");
  return { size, description, materials };
}

const MAX_PHOTOS = 8;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

const inputClass =
  "mt-2 w-full rounded-xl bg-white border border-line p-3 text-[15px] text-black min-h-[48px] focus:outline-none focus:border-black";

export default function PickupForm({ load, loadVersion = 0, onOpenLoader, onSubmitted, mode = "waitlist", userEmail = "", onPosted = null }) {
  const repost = useMemo(() => takeRepost(), []);
  const prefill = useMemo(() => prefillFromLoad(load), []);
  const lastAutoDescription = useRef(repost?.description || prefill?.description || "");
  const todayStr = useMemo(() => ymd(new Date()), []);
  const tomorrowStr = useMemo(() => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return ymd(t);
  }, []);

  const [size, setSize] = useState(repost?.size || prefill?.size || "");
  const [materials, setMaterials] = useState(
    Array.isArray(repost?.materials) && repost.materials.length > 0
      ? repost.materials
      : prefill?.materials || []
  );
  const [description, setDescription] = useState(repost?.description || prefill?.description || "");
  const [photos, setPhotos] = useState(Array.isArray(repost?.photos) ? repost.photos : []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [suburb, setSuburb] = useState(repost?.suburb || "");
  const [pickupDate, setPickupDate] = useState(tomorrowStr);
  const [timeWindow, setTimeWindow] = useState(repost?.time_window || "");
  const [name, setName] = useState(repost?.name || "");
  const [mobile, setMobile] = useState(repost?.mobile || "");
  const [email, setEmail] = useState("");
  const [streetAddress, setStreetAddress] = useState(repost?.street_address || "");
  const [postcode, setPostcode] = useState(repost?.postcode || "");
  const [hazard, setHazard] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const refs = useRef({});
  const [tried, setTried] = useState(false);

  useEffect(() => {
    return () => {
      photos.forEach((p) => {
        if (p.previewUrl) URL.revokeObjectURL(p.previewUrl);
      });
    };
  }, []);

  useEffect(() => {
    if (loadVersion === 0) return;
    const next = prefillFromLoad(load);
    if (next) {
      setSize(next.size);
      setMaterials((prev) => {
        const set = new Set(prev);
        for (const m of next.materials) set.add(m);
        return Array.from(set);
      });
      setDescription((prev) => {
        if (!prev || prev === lastAutoDescription.current) {
          lastAutoDescription.current = next.description;
          return next.description;
        }
        return prev;
      });
    } else {
      setDescription((prev) => {
        if (prev === lastAutoDescription.current) {
          lastAutoDescription.current = "";
          return "";
        }
        return prev;
      });
    }
  }, [loadVersion]);

  const toggleMaterial = (m) => {
    setMaterials((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );
  };

  const onFilesChosen = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    setUploadError("");
    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) return;
    const valid = files.filter(
      (f) => f.type.startsWith("image/") && f.size <= MAX_PHOTO_BYTES
    );
    const taken = valid.slice(0, room);
    if (taken.length === 0) return;
    setUploading(true);
    for (const file of taken) {
      const previewUrl = URL.createObjectURL(file);
      try {
        const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
        setPhotos((prev) => [...prev, { file_uri, previewUrl, name: file.name }]);
      } catch (err) {
        URL.revokeObjectURL(previewUrl);
        setUploadError(errorMessage(err, "Sorry, a photo did not upload. Please try again."));
      }
    }
    setUploading(false);
  };

  const removePhoto = (idx) => {
    setPhotos((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(idx, 1);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return copy;
    });
  };

  const validate = () => {
    const e = {};
    if (!size) e.size = "Pick a size";
    if (!description.trim()) e.description = "Describe what needs to go";
    if (!suburb.trim()) e.suburb = "Enter your suburb";
    if (!pickupDate) e.pickupDate = "Pick a date";
    else if (pickupDate < todayStr) e.pickupDate = "Pick today or a later date";
    if (!timeWindow) e.timeWindow = "Pick a time window";
    if (!name.trim()) e.name = "Enter your name";
    if (!mobile.trim()) e.mobile = "Enter your mobile";
    else if (!/^[0-9 +]{8,}$/.test(mobile.trim()))
      e.mobile = "Enter a valid mobile (at least 8 digits)";
    if (mode === "waitlist") {
      if (!email.trim()) e.email = "Enter your email";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
        e.email = "Enter a valid email";
    }
    if (mode === "live") {
      if (!streetAddress.trim()) e.streetAddress = "Enter your street address";
      else if (streetAddress.trim().length > 200) e.streetAddress = "Street address is too long";
      if (!/^[0-9]{4}$/.test(postcode.trim())) {
        e.postcode = "Enter a 4-digit postcode";
      } else {
        const pc = Number(postcode.trim());
        const inVic = (pc >= 3000 && pc <= 3999) || (pc >= 8000 && pc <= 8999);
        const inQld = (pc >= 4000 && pc <= 4999) || (pc >= 9000 && pc <= 9999);
        if (!inVic && !inQld) e.postcode = "Sorry, we only cover Melbourne and Brisbane for now.";
      }
    }
    if (description.trim().length > 2000) e.description = "Keep the description under 2000 characters";
    if (!hazard) e.hazard = "Please confirm there are no hazardous items";
    return e;
  };

  const scrollToFirstError = (e) => {
    const order = [
      "size", "description", "suburb", "pickupDate", "timeWindow",
      "streetAddress", "postcode", "name", "mobile", "email", "hazard",
    ];
    for (const k of order) {
      if (e[k] && refs.current[k]) {
        refs.current[k].scrollIntoView({ behavior: "smooth", block: "center" });
        break;
      }
    }
  };

  // After a first submit, errors update as each field is fixed (no stale messages).
  useEffect(() => {
    if (tried) setErrors(validate());
  }, [tried, size, description, suburb, pickupDate, timeWindow, name, mobile, email, streetAddress, postcode, hazard]);

  const submit = async () => {
    setTried(true);
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      scrollToFirstError(e);
      return;
    }
    setErrors({});
    setSubmitError("");
    setSubmitting(true);
    try {
      const counts = getCounts(load.placedItems);
      const loadItems = ITEMS.filter((i) => counts[i.key]).map((i) => ({
        item: i.name,
        quantity: counts[i.key],
      }));
      if (mode === "live") {
        await base44.functions.invoke("postPickup", {
          name: name.trim(),
          mobile: mobile.trim(),
          suburb: suburb.trim(),
          pickup_date: pickupDate,
          time_window: timeWindow,
          size,
          materials,
          description: description.trim(),
          photos: photos.map((p) => p.file_uri),
          vehicle: VEHICLES[load.vehicle].name,
          estimated_volume_m3: getVolume(load.placedItems),
          load_items: loadItems,
          hazard_confirmed: hazard,
          postcode: postcode.trim(),
          street_address: streetAddress.trim(),
        });
        onPosted();
      } else {
        await base44.entities.PickupRequest.create({
          name: name.trim(),
          mobile: mobile.trim(),
          email: email.trim().toLowerCase(),
          suburb: suburb.trim(),
          pickup_date: pickupDate,
          time_window: timeWindow,
          size,
          materials,
          description: description.trim(),
          photos: photos.map((p) => p.file_uri),
          vehicle: VEHICLES[load.vehicle].name,
          estimated_volume_m3: getVolume(load.placedItems),
          load_items: loadItems,
          hazard_confirmed: hazard,
          status: "New",
        });
        onSubmitted({ name: name.trim(), suburb: suburb.trim(), mobile: mobile.trim() });
      }
    } catch (err) {
      setSubmitError(
        mode === "live"
          ? errorMessage(err, "Sorry, that did not post. Please try again.")
          : "Sorry, that didn't send. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const dateObj = parseYmd(pickupDate);
  const job = {
    size,
    materials: materials.length ? materials.join(", ") : "",
    when: dateObj && timeWindow ? `${format(dateObj, "EEE d MMM")}, ${timeWindow}` : "",
    suburb,
    photos: photos.length ? `${photos.length} added` : "",
  };

  const fieldErr = (key) =>
    errors[key] ? <p className="mt-1 text-[13px] text-danger" role="alert">{errors[key]}</p> : null;

  const heading = (
    <section className="bg-black">
      <div className="mx-auto max-w-site px-4 md:px-8 pt-8 pb-9 md:pt-12 md:pb-12">
        <h1 className="font-heading font-extrabold text-white text-[40px] md:text-[56px] leading-[1.05]">
          Post a pick up
        </h1>
        <p className="mt-3 max-w-[640px] text-white/70 text-[15px] md:text-[17px] leading-relaxed">
          {mode === "live"
            ? "Free. Takes a couple of minutes. Collectors in your area can send you up to 3 quotes."
            : "Free. Takes a couple of minutes. We're signing up local collectors first: post your job now and we'll send it out for quotes as soon as bookings open near you."}
        </p>
      </div>
    </section>
  );

  return (
    <div>
      {heading}
      <div className="mx-auto max-w-site px-4 md:px-8 py-6 md:py-10 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 lg:items-start">
        <div className="space-y-4 md:space-y-5">
          {/* Card 1: What needs to go? */}
          <div className="rounded-[28px] bg-concrete p-[22px] md:p-7 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-heading font-extrabold text-lg md:text-xl text-black">What needs to go?</h2>
              <button
                type="button"
                onClick={onOpenLoader}
                className="shrink-0 rounded-full border border-black bg-white text-black px-4 font-heading font-extrabold text-[13px] min-h-[44px] hover:bg-black hover:text-white transition-colors"
              >
                {load.placedItems.length > 0 ? "Edit your load" : "Fill the ute"}
              </button>
            </div>

            <div ref={(el) => (refs.current.size = el)}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {SIZE_OPTIONS.map((opt) => {
                  const sel = size === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSize(opt.value)}
                      aria-pressed={sel}
                      className={`rounded-2xl p-3 text-left min-h-[72px] ${sel ? "bg-black" : "bg-white hover:ring-1 hover:ring-black"}`}
                    >
                      <p className={`font-heading font-extrabold text-sm ${sel ? "text-white" : "text-black"}`}>{opt.value}</p>
                      <p className={`text-[12px] mt-0.5 ${sel ? "text-gold" : "text-mute"}`}>{opt.sub}</p>
                    </button>
                  );
                })}
              </div>
              {fieldErr("size")}
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <h3 className="font-heading font-extrabold text-sm text-black">What's in it?</h3>
                <span className="text-mute text-[12px]">Pick any</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {MATERIAL_OPTIONS.map((m) => {
                  const sel = materials.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => toggleMaterial(m)}
                      aria-pressed={sel}
                      className={`rounded-full px-3.5 py-2 inline-flex items-center justify-center min-h-[44px] font-heading font-extrabold text-[13px] ${
                        sel ? "bg-black text-gold" : "bg-white border border-line text-black hover:border-black"
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            <div ref={(el) => (refs.current.description = el)}>
              <label htmlFor="pp-description" className="font-heading font-extrabold text-sm text-black">Describe it</label>
              <textarea
                id="pp-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                placeholder="e.g. Couch, two mattresses and about 10 bags. Second-floor unit with a lift."
                className="mt-2 w-full rounded-2xl bg-white border border-line p-3 text-[15px] text-black min-h-[110px] resize-y focus:outline-none focus:border-black"
              />
              {fieldErr("description")}
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <h3 className="font-heading font-extrabold text-sm text-black">Photos</h3>
                <span className="text-mute text-[12px]">Optional, but they get better quotes</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {photos.map((p, idx) => (
                  <div key={p.file_uri} className="relative h-20 w-20 rounded-lg overflow-hidden border border-line bg-white">
                    {p.previewUrl ? (
                      <img src={p.previewUrl} alt={p.name || "Photo"} className="h-full w-full object-cover" />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-[11px] text-mute">Photo {idx + 1}</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      aria-label="Remove photo"
                      className="absolute top-0 right-0 grid place-items-center h-11 w-11"
                    >
                      <span className="absolute top-0.5 right-0.5 grid place-items-center h-5 w-5 rounded-full bg-black/70 text-white">
                        <X className="h-3 w-3" />
                      </span>
                    </button>
                  </div>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <label className="h-20 w-20 rounded-lg border border-line bg-white flex flex-col items-center justify-center cursor-pointer text-mute hover:border-black focus-within:border-black">
                    {uploading ? (
                      <span className="text-[11px]">Uploading</span>
                    ) : (
                      <>
                        <Plus className="h-5 w-5" />
                        <span className="text-[11px] mt-0.5">Add</span>
                      </>
                    )}
                    <input type="file" accept="image/*" multiple onChange={onFilesChosen} className="sr-only" aria-label="Add photos" />
                  </label>
                )}
              </div>
              <p className="mt-1.5 text-[12px] text-mute">Up to 8 photos, 10 MB each. Stored privately.</p>
              {uploadError && <p className="mt-1 text-[13px] text-danger" role="alert">{uploadError}</p>}
            </div>
          </div>

          {/* Card 2: When and where? */}
          <div className="rounded-[28px] bg-concrete p-[22px] md:p-7 space-y-4">
            <h2 className="font-heading font-extrabold text-lg md:text-xl text-black">When and where?</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div ref={(el) => (refs.current.suburb = el)}>
                <label htmlFor="pp-suburb" className="font-heading font-extrabold text-sm text-black">Suburb</label>
                <input id="pp-suburb" value={suburb} onChange={(e) => setSuburb(e.target.value)} placeholder="e.g. Brunswick VIC" autoComplete="address-level2" className={inputClass} />
                {fieldErr("suburb")}
              </div>

              <div ref={(el) => (refs.current.pickupDate = el)}>
                <label htmlFor="pp-date" className="font-heading font-extrabold text-sm text-black">Date</label>
                <input id="pp-date" type="date" value={pickupDate} min={todayStr} onChange={(e) => setPickupDate(e.target.value)} className={inputClass} />
                {fieldErr("pickupDate")}
              </div>
            </div>

            <div ref={(el) => (refs.current.timeWindow = el)}>
              <h3 className="font-heading font-extrabold text-sm text-black">Time window</h3>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                {TIME_WINDOWS.map((tw) => {
                  const sel = timeWindow === tw.value;
                  return (
                    <button
                      key={tw.value}
                      type="button"
                      onClick={() => setTimeWindow(tw.value)}
                      aria-pressed={sel}
                      className={`rounded-2xl p-3 text-left min-h-[64px] ${sel ? "bg-black" : "bg-white border border-line hover:border-black"}`}
                    >
                      <p className={`font-heading font-extrabold text-sm ${sel ? "text-white" : "text-black"}`}>{tw.value}</p>
                      <p className={`text-[12px] mt-0.5 ${sel ? "text-gold" : "text-mute"}`}>{tw.label}</p>
                    </button>
                  );
                })}
              </div>
              {fieldErr("timeWindow")}
            </div>

            {mode === "live" && (
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
                <div ref={(el) => (refs.current.streetAddress = el)}>
                  <label htmlFor="pp-street" className="font-heading font-extrabold text-sm text-black">Street address</label>
                  <input id="pp-street" value={streetAddress} onChange={(e) => setStreetAddress(e.target.value)} placeholder="123 Smith St" maxLength={200} autoComplete="address-line1" className={inputClass} />
                  {fieldErr("streetAddress")}
                </div>
                <div ref={(el) => (refs.current.postcode = el)}>
                  <label htmlFor="pp-postcode" className="font-heading font-extrabold text-sm text-black">Postcode</label>
                  <input id="pp-postcode" value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="3000" inputMode="numeric" maxLength={4} autoComplete="postal-code" className={inputClass} />
                  {fieldErr("postcode")}
                </div>
              </div>
            )}

            <p className="text-[13px] text-mute leading-snug">
              {mode === "live"
                ? "Collectors see your suburb only. Your street address is shared only with the collector whose quote you accept."
                : "Your suburb is shown so collectors can locate you. No address is shared until you accept a quote."}
            </p>
          </div>

          {/* Card 3: Your details */}
          <div className="rounded-[28px] bg-concrete p-[22px] md:p-7 space-y-4">
            <h2 className="font-heading font-extrabold text-lg md:text-xl text-black">Your details</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div ref={(el) => (refs.current.name = el)}>
                <label htmlFor="pp-name" className="font-heading font-extrabold text-sm text-black">Your name</label>
                <input id="pp-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={inputClass} />
                {fieldErr("name")}
              </div>

              <div ref={(el) => (refs.current.mobile = el)}>
                <label htmlFor="pp-mobile" className="font-heading font-extrabold text-sm text-black">Mobile</label>
                <input id="pp-mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="04xx xxx xxx" inputMode="tel" autoComplete="tel" className={inputClass} />
                {fieldErr("mobile")}
              </div>
            </div>

            <div ref={(el) => (refs.current.email = el)}>
              <label htmlFor="pp-email" className="font-heading font-extrabold text-sm text-black">Email</label>
              <input
                id="pp-email"
                value={mode === "live" ? userEmail : email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                inputMode="email"
                autoComplete="email"
                readOnly={mode === "live"}
                className={`${inputClass} ${mode === "live" ? "!bg-soft text-mute" : ""}`}
              />
              {fieldErr("email")}
            </div>

            <label
              ref={(el) => (refs.current.hazard = el)}
              className="flex items-start gap-3 cursor-pointer min-h-[44px] py-1"
            >
              <input
                type="checkbox"
                checked={hazard}
                onChange={(e) => {
                  setHazard(e.target.checked);
                }}
                className="mt-0.5 h-5 w-5 shrink-0 accent-black"
              />
              <span className="text-[14px] text-black leading-snug">
                I confirm there are no hazardous items: no asbestos, explosives or
                ammunition, poisons or chemicals, gas bottles, fuel, paint or
                medical waste.
              </span>
            </label>
            {fieldErr("hazard")}
          </div>

          <div className="lg:hidden">
            <JobSummary job={job} />
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="w-full md:w-auto md:px-12 rounded-full bg-black text-white py-3.5 font-heading font-extrabold text-sm min-h-[52px] disabled:opacity-60 hover:bg-asphalt"
          >
            {submitting ? (mode === "live" ? "Posting…" : "Sending…") : (mode === "live" ? "Post my pick up" : "Join the waitlist with this job")}
          </button>
          {submitError && <p className="text-[14px] text-danger" role="alert">{submitError}</p>}
        </div>

        <aside className="hidden lg:block sticky top-24">
          <JobSummary job={job} />
        </aside>
      </div>
    </div>
  );
}
