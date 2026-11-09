import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { base44 } from "@/api/base44";
import { ITEMS, getCounts } from "@/lib/loadModel";
import { SKIP_BINS, HOOK_BINS, SKIP_WASTE_TYPES, SKIP_HIRE_PERIODS, SKIP_PLACEMENTS, getLoadVolume } from "@/lib/binModel";
import { SelectField, TextField, HazardCheck } from "@/components/Fields";
import BinFormShell, { RequestSummary } from "./BinFormShell";

// Ported from the Base44 app. Saves a BinRequest row; status is left to the table default.
export default function SkipQuoteForm({ binType, size, load, onSubmitted, onBack }) {
  const sizes = binType === "skip" ? SKIP_BINS : HOOK_BINS;
  const kind = binType;
  const todayStr = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const tomorrowStr = useMemo(() => { const t = new Date(); t.setDate(t.getDate() + 1); return format(t, "yyyy-MM-dd"); }, []);

  const [sizeM3, setSizeM3] = useState(size);
  const [wasteType, setWasteType] = useState("General household");
  const [hirePeriod, setHirePeriod] = useState("7 days");
  const [placement, setPlacement] = useState("Driveway");
  const [suburb, setSuburb] = useState("");
  const [neededDate, setNeededDate] = useState(tomorrowStr);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [hazard, setHazard] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const refs = useRef({});

  useEffect(() => { setSizeM3(size); }, [size]);

  const validate = () => {
    const e = {};
    if (!sizeM3) e.sizeM3 = "Pick a size";
    if (!wasteType) e.wasteType = "Pick a waste type";
    if (!hirePeriod) e.hirePeriod = "Pick a hire period";
    if (!placement) e.placement = "Pick where it will go";
    if (!suburb.trim()) e.suburb = "Enter your suburb";
    if (!neededDate) e.neededDate = "Pick a date";
    else if (neededDate < todayStr) e.neededDate = "Pick today or a later date";
    if (!name.trim()) e.name = "Enter your name";
    if (!mobile.trim()) e.mobile = "Enter your mobile";
    else if (!/^[0-9 +]{8,}$/.test(mobile.trim())) e.mobile = "Enter a valid mobile (at least 8 digits)";
    if (!email.trim()) e.email = "Enter your email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Enter a valid email";
    if (!hazard) e.hazard = "Please confirm";
    return e;
  };

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      const order = ["sizeM3", "wasteType", "hirePeriod", "placement", "suburb", "neededDate", "name", "mobile", "email", "hazard"];
      const k = order.find((x) => e[x] && refs.current[x]);
      if (k) refs.current[k].scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setErrors({});
    setSubmitError("");
    setSubmitting(true);
    try {
      const counts = getCounts(load.placedItems);
      const loadItems = ITEMS.filter((i) => counts[i.key]).map((i) => ({ item: i.name, quantity: counts[i.key] }));
      const volume = getLoadVolume(load.placedItems);
      const payload = {
        bin_kind: kind === "skip" ? "Skip" : "Hook",
        size_m3: sizeM3,
        waste_type: wasteType,
        hire_period: hirePeriod,
        placement,
        suburb: suburb.trim(),
        needed_date: neededDate,
        name: name.trim(),
        mobile: mobile.trim(),
        email: email.trim().toLowerCase(),
        hazard_confirmed: hazard,
      };
      if (volume > 0) { payload.estimated_volume_m3 = volume; payload.load_items = loadItems; }
      await base44.entities.BinRequest.create(payload);
      onSubmitted({ suburb: suburb.trim() });
    } catch {
      setSubmitError("Sorry, that didn't send. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const r = (k) => (el) => (refs.current[k] = el);
  const summary = (
    <RequestSummary
      onEdit={onBack}
      rows={[
        ["Bin", `${sizeM3} m³ ${kind === "skip" ? "skip" : "hook bin"}`],
        ["Waste", wasteType],
        ["Hire", hirePeriod],
        ["Placement", placement],
        ["Suburb", suburb],
      ]}
    />
  );

  return (
    <BinFormShell
      title={kind === "skip" ? "Skip bin quotes" : "Hook bin quotes"}
      intro="Free to request. We're signing up local suppliers first. Leave your details and we'll send your request out for quotes as soon as bookings open near you."
      aside={summary}
    >
      <div className="rounded-[28px] bg-concrete p-[22px] md:p-7 space-y-4">
        <h2 className="font-heading font-extrabold text-lg md:text-xl text-black">The bin</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField id="sk-size" label="Size" value={String(sizeM3)} onChange={(v) => setSizeM3(Number(v))} options={sizes.map((s) => ({ value: String(s.size), label: `${s.size} m³` }))} error={errors.sizeM3} refCb={r("sizeM3")} />
          <SelectField id="sk-waste" label="Waste type" value={wasteType} onChange={setWasteType} options={SKIP_WASTE_TYPES} error={errors.wasteType} refCb={r("wasteType")} />
          <SelectField id="sk-hire" label="Hire period" value={hirePeriod} onChange={setHirePeriod} options={SKIP_HIRE_PERIODS} error={errors.hirePeriod} refCb={r("hirePeriod")} />
          <SelectField id="sk-place" label="Where will it go?" value={placement} onChange={setPlacement} options={SKIP_PLACEMENTS} error={errors.placement} refCb={r("placement")} />
        </div>
      </div>

      <div className="rounded-[28px] bg-concrete p-[22px] md:p-7 space-y-4">
        <h2 className="font-heading font-extrabold text-lg md:text-xl text-black">When and where?</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField id="sk-suburb" label="Suburb" value={suburb} onChange={(e) => setSuburb(e.target.value)} placeholder="e.g. Brunswick VIC" autoComplete="address-level2" error={errors.suburb} refCb={r("suburb")} />
          <TextField id="sk-date" label="Date needed" type="date" min={todayStr} value={neededDate} onChange={(e) => setNeededDate(e.target.value)} error={errors.neededDate} refCb={r("neededDate")} />
        </div>
        <p className="text-[13px] text-mute leading-snug">Your suburb is shown so suppliers can locate you. No address is shared until you accept a quote.</p>
      </div>

      <div className="rounded-[28px] bg-concrete p-[22px] md:p-7 space-y-4">
        <h2 className="font-heading font-extrabold text-lg md:text-xl text-black">Your details</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField id="sk-name" label="Your name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" error={errors.name} refCb={r("name")} />
          <TextField id="sk-mobile" label="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="04xx xxx xxx" inputMode="tel" autoComplete="tel" error={errors.mobile} refCb={r("mobile")} />
        </div>
        <TextField id="sk-email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" inputMode="email" autoComplete="email" error={errors.email} refCb={r("email")} />
        <HazardCheck checked={hazard} onChange={(v) => { setHazard(v); if (v) setErrors((p) => { const n = { ...p }; delete n.hazard; return n; }); }} error={errors.hazard} refCb={r("hazard")}>
          No asbestos, chemicals, paint, gas bottles, tyres, batteries or medical waste will go in the bin.
        </HazardCheck>
      </div>

      <button type="button" onClick={submit} disabled={submitting} className="w-full md:w-auto md:px-12 rounded-full bg-black text-white py-3.5 font-heading font-extrabold text-sm min-h-[52px] disabled:opacity-60">
        {submitting ? "Sending…" : "Join the waitlist"}
      </button>
      {submitError && <p className="text-[14px] text-danger" role="alert">{submitError}</p>}
    </BinFormShell>
  );
}
