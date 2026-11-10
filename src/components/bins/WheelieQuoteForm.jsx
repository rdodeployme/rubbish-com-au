import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { base44 } from "@/api/base44";
import { ITEMS, getCounts } from "@/lib/loadModel";
import { WHEELIE_PROPERTY_TYPES, WHEELIE_STREAMS, WHEELIE_FORM_FREQUENCIES, WHEELIE_FREQUENCY_MAP, WHEELIE_SIZES, getLoadVolume } from "@/lib/binModel";
import { SelectField, TextField, HazardCheck, FieldError } from "@/components/Fields";
import ErrorSummary from "@/components/ErrorSummary";
import { postcodeError } from "@/lib/area";
import { readDraft, clearDraft, useSaveDraft } from "@/lib/draft";
import BinFormShell, { RequestSummary } from "./BinFormShell";

const DRAFT_KEY = "wheelie-form";
const MAX_BINS = 999;
const ORDER = ["propertyType", "binLitres", "binCount", "formFreq", "streams", "suburb", "postcode", "startDate", "name", "mobile", "email", "hazard"];

// Ported from the Base44 app. Saves a BinRequest row; status is left to the table default.
export default function WheelieQuoteForm({ binSize, count, frequency, load, onSubmitted, onBack }) {
  const todayStr = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);
  const tomorrowStr = useMemo(() => { const t = new Date(); t.setDate(t.getDate() + 1); return format(t, "yyyy-MM-dd"); }, []);

  const [d] = useState(() => readDraft(DRAFT_KEY) || {});
  const [propertyType, setPropertyType] = useState(WHEELIE_PROPERTY_TYPES.includes(d.propertyType) ? d.propertyType : "Home");
  const [binLitres, setBinLitres] = useState(binSize);
  // Kept as typed text, so the field can be cleared and retyped. Checked on submit.
  const [binCount, setBinCount] = useState(String(count));
  const [formFreq, setFormFreq] = useState(WHEELIE_FREQUENCY_MAP[frequency] || "One-off collection");
  const [streams, setStreams] = useState(Array.isArray(d.streams) && d.streams.length ? d.streams.filter((s) => WHEELIE_STREAMS.includes(s)) : ["General waste"]);
  const [suburb, setSuburb] = useState(d.suburb || "");
  const [postcode, setPostcode] = useState(d.postcode || "");
  const [startDate, setStartDate] = useState(d.startDate && d.startDate >= todayStr ? d.startDate : tomorrowStr);
  const [name, setName] = useState(d.name || "");
  const [mobile, setMobile] = useState(d.mobile || "");
  const [email, setEmail] = useState(d.email || "");
  const [hazard, setHazard] = useState(!!d.hazard);
  const summaryRef = useRef(null);
  const [focusSummary, setFocusSummary] = useState(0);
  useEffect(() => { if (focusSummary) summaryRef.current?.focus(); }, [focusSummary]);
  useSaveDraft(DRAFT_KEY, { propertyType, streams, suburb, postcode, startDate, name, mobile, email, hazard });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const refs = useRef({});
  const [tried, setTried] = useState(false);

  useEffect(() => {
    setBinLitres(binSize);
    setBinCount(String(count));
    setFormFreq(WHEELIE_FREQUENCY_MAP[frequency] || "One-off collection");
  }, [binSize, count, frequency]);

  const toggleStream = (s) => setStreams((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const validate = () => {
    const e = {};
    if (!propertyType) e.propertyType = "Pick a property type";
    if (!binLitres) e.binLitres = "Pick a bin size";
    const n = Number(binCount);
    if (!binCount.trim() || !Number.isInteger(n) || n < 1) e.binCount = "Enter how many bins";
    else if (n > MAX_BINS) e.binCount = `Enter ${MAX_BINS} or fewer`;
    if (!formFreq) e.formFreq = "Pick a frequency";
    if (streams.length === 0) e.streams = "Pick at least one waste stream";
    if (!suburb.trim()) e.suburb = "Enter your suburb";
    const pcErr = postcodeError(postcode);
    if (pcErr) e.postcode = pcErr;
    if (!startDate) e.startDate = "Pick a date";
    else if (startDate < todayStr) e.startDate = "Pick today or a later date";
    if (!name.trim()) e.name = "Enter your name";
    if (!mobile.trim()) e.mobile = "Enter your mobile";
    else if (!/^[0-9 +]{8,}$/.test(mobile.trim())) e.mobile = "Enter a valid mobile (at least 8 digits)";
    if (!email.trim()) e.email = "Enter your email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Enter a valid email";
    if (!hazard) e.hazard = "Please confirm";
    return e;
  };

  useEffect(() => {
    if (tried) setErrors(validate());
  }, [tried, propertyType, binLitres, binCount, formFreq, streams, suburb, postcode, startDate, name, mobile, email, hazard]);

  const submit = async () => {
    setTried(true);
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      setFocusSummary((n) => n + 1);
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
        bin_kind: "Wheelie",
        property_type: propertyType,
        bin_litres: binLitres,
        bin_count: Number(binCount),
        frequency: formFreq,
        streams,
        suburb: `${suburb.trim()} ${postcode.trim()}`,
        needed_date: startDate,
        name: name.trim(),
        mobile: mobile.trim(),
        email: email.trim().toLowerCase(),
        hazard_confirmed: hazard,
      };
      if (volume > 0) { payload.estimated_volume_m3 = volume; payload.load_items = loadItems; }
      await base44.entities.BinRequest.create(payload);
      clearDraft(DRAFT_KEY);
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
        ["Bins", `${binCount || "?"} × ${binLitres} L`],
        ["How often", formFreq],
        ["Streams", streams.join(", ")],
        ["Property", propertyType],
        ["Suburb", [suburb.trim(), postcode.trim()].filter(Boolean).join(" ")],
      ]}
    />
  );

  return (
    <BinFormShell
      title="Wheelie bin waitlist"
      intro="Wheelie bins can't be booked yet. We're signing up suppliers in Melbourne and Brisbane first. Join the waitlist and we'll contact you when bookings open in your area. It's free and you're not committing to anything."
      aside={summary}
    >
      <div className="rounded-[28px] bg-concrete p-[22px] md:p-7 space-y-4">
        <h2 className="font-heading font-extrabold text-lg md:text-xl text-black">The bins</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField id="wb-prop" label="Property type" value={propertyType} onChange={setPropertyType} options={WHEELIE_PROPERTY_TYPES} error={errors.propertyType} refCb={r("propertyType")} />
          <SelectField id="wb-litres" label="Bin size" value={String(binLitres)} onChange={(v) => setBinLitres(Number(v))} options={WHEELIE_SIZES.map((s) => ({ value: String(s), label: `${s} L` }))} error={errors.binLitres} refCb={r("binLitres")} />
          <TextField id="wb-count" label="How many bins?" inputMode="numeric" value={binCount} onChange={(e) => setBinCount(e.target.value.replace(/\D/g, "").slice(0, 4))} error={errors.binCount} refCb={r("binCount")} />
          <SelectField id="wb-freq" label="One-off or ongoing?" value={formFreq} onChange={setFormFreq} options={WHEELIE_FORM_FREQUENCIES} error={errors.formFreq} refCb={r("formFreq")} />
        </div>
        <div ref={r("streams")}>
          <p id="wb-streams" className="font-heading font-extrabold text-[15px] text-black">What goes in them?</p>
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-labelledby="wb-streams" {...(errors.streams ? { "aria-describedby": "wb-streams-group-error" } : {})}>
            {WHEELIE_STREAMS.map((s) => {
              const sel = streams.includes(s);
              return (
                <button key={s} type="button" onClick={() => toggleStream(s)} aria-pressed={sel} className={`rounded-full px-3.5 py-2 inline-flex items-center justify-center min-h-[44px] font-heading font-extrabold text-[13px] ${sel ? "bg-black text-gold" : "bg-white border border-line text-black hover:border-black"}`}>
                  {s}
                </button>
              );
            })}
          </div>
          <FieldError id="wb-streams-group">{errors.streams}</FieldError>
        </div>
      </div>

      <div className="rounded-[28px] bg-concrete p-[22px] md:p-7 space-y-4">
        <h2 className="font-heading font-extrabold text-lg md:text-xl text-black">When and where?</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField id="wb-suburb" label="Suburb" value={suburb} onChange={(e) => setSuburb(e.target.value)} placeholder="e.g. Brunswick VIC" autoComplete="address-level2" error={errors.suburb} refCb={r("suburb")} />
          <TextField id="wb-postcode" label="Postcode" value={postcode} onChange={(e) => setPostcode(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="3000" inputMode="numeric" autoComplete="postal-code" hint="Melbourne and Brisbane only for now" error={errors.postcode} refCb={r("postcode")} />
          <TextField id="wb-date" label="Start date" type="date" min={todayStr} value={startDate} onChange={(e) => setStartDate(e.target.value)} error={errors.startDate} refCb={r("startDate")} />
        </div>
        <p className="text-[13px] text-mute leading-snug">We don't ask for your street address yet. Suppliers will only see your suburb and postcode.</p>
      </div>

      <div className="rounded-[28px] bg-concrete p-[22px] md:p-7 space-y-4">
        <h2 className="font-heading font-extrabold text-lg md:text-xl text-black">Your details</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <TextField id="wb-name" label="Your name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" error={errors.name} refCb={r("name")} />
          <TextField id="wb-mobile" label="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="04xx xxx xxx" inputMode="tel" autoComplete="tel" error={errors.mobile} refCb={r("mobile")} />
        </div>
        <TextField id="wb-email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" inputMode="email" autoComplete="email" error={errors.email} refCb={r("email")} />
        <HazardCheck id="wb-hazard" checked={hazard} onChange={setHazard} error={errors.hazard} refCb={r("hazard")}>
          No asbestos, chemicals, paint, gas bottles, tyres, batteries or medical waste will go in the bins.
        </HazardCheck>
      </div>

      {tried && <ErrorSummary ref={summaryRef} id="wb-errors" errors={errors} order={ORDER} refs={refs} />}

      <button type="button" onClick={submit} disabled={submitting} className="w-full md:w-auto md:px-12 rounded-full bg-black text-white py-3.5 font-heading font-extrabold text-sm min-h-[52px] disabled:opacity-60">
        {submitting ? "Sending…" : "Join the waitlist"}
      </button>
      {submitError && <p className="text-[14px] text-danger" role="alert">{submitError}</p>}
    </BinFormShell>
  );
}
