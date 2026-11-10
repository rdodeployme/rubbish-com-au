import { useEffect, useState } from "react";
import { base44 } from "@/api/base44";
import DetailSheet from "./DetailSheet";
import StatusPill from "./StatusPill";
import ConfirmStatus from "./ConfirmStatus";
import FileLink from "./FileLink";
import PickupActivity from "./PickupActivity";
import PickupJobActions from "./PickupJobActions";
import { SheetField, SheetSection, SheetLink } from "./SheetField";
import { REQUEST_STATUSES, REQUEST_STATUS_BUTTONS, formatAUDate, formatAUDateTime, yesNo, joinList } from "@/lib/adminConfig";

// Ported from the Base44 app's admin (PickupSheet).
export default function PickupSheet({ record, onClose, onUpdated }) {
  const [current, setCurrent] = useState(record);
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setCurrent(record);
    setPending(null);
    setError("");
  }, [record]);

  const handleConfirm = async () => {
    setBusy(true);
    setError("");
    try {
      await base44.entities.PickupRequest.update(current.id, { status: pending });
      const updated = { ...current, status: pending };
      setCurrent(updated);
      onUpdated(updated);
      setPending(null);
    } catch {
      setError("Could not save. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleJobUpdated = (updatedJob) => {
    const merged = { ...current, ...updatedJob };
    setCurrent(merged);
    onUpdated(merged);
  };

  const subtitle = [current.suburb, current.size, current.pickup_date && formatAUDate(current.pickup_date), current.time_window].filter(Boolean).join(" · ");

  return (
    <DetailSheet title={current.name || "Unknown"} subtitle={subtitle} onClose={onClose}>
      {/* Waitlist requests (no live job) keep the lead statuses. Live posts use Job actions below. */}
      {!current.job_status && (
        <>
          <div className="mt-2">
            <p className="text-mute text-[12px] font-bold">Status</p>
            <div className="mt-1"><StatusPill status={current.status} /></div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {REQUEST_STATUSES.filter((s) => s !== current.status).map((s) => (
              <button key={s} type="button" onClick={() => setPending(s)} className="min-h-[44px] inline-flex items-center justify-center rounded-full border border-black px-3 py-1.5 font-heading font-extrabold text-[13px] text-black">
                {REQUEST_STATUS_BUTTONS[s]}
              </button>
            ))}
          </div>
          {pending && <ConfirmStatus toStatus={pending} busy={busy} onCancel={() => setPending(null)} onConfirm={handleConfirm} />}
        </>
      )}

      {error && <p className="mt-2 text-[13px] font-bold text-danger" role="alert">{error}</p>}

      <PickupJobActions job={current} onUpdated={handleJobUpdated} />
      <PickupActivity jobId={current.id} />

      {(current.job_status || current.quote_count != null || current.postcode || current.street_address) && (
        <SheetSection title="Live job">
          {current.job_status && <SheetField label="Job status" value={current.job_status} />}
          {current.quote_count != null && <SheetField label="Quotes so far" value={String(current.quote_count)} />}
          {current.postcode && <SheetField label="Postcode" value={current.postcode} />}
          {current.street_address && <SheetField label="Street address" value={current.street_address} />}
        </SheetSection>
      )}

      <SheetSection title="Details">
        <SheetField label="Name" value={current.name} />
        <SheetLink label="Mobile" href={current.mobile ? `tel:${current.mobile.replace(/\s/g, "")}` : ""} value={current.mobile} />
        <SheetLink label="Email" href={current.email ? `mailto:${current.email}` : ""} value={current.email} />
        <SheetField label="Suburb" value={current.suburb} />
        <SheetField label="Pickup date" value={formatAUDate(current.pickup_date)} />
        <SheetField label="Time window" value={current.time_window} />
        <SheetField label="Size" value={current.size} />
        <SheetField label="Vehicle" value={current.vehicle} />
        <SheetField label="Estimated volume (m³)" value={current.estimated_volume_m3 != null ? String(current.estimated_volume_m3) : ""} />
        <SheetField label="Materials" value={joinList(current.materials)} />
        <SheetField label="Description" value={current.description} />
        <SheetField label="Hazard confirmed" value={yesNo(current.hazard_confirmed)} />
      </SheetSection>

      <SheetSection title="Load items">
        {Array.isArray(current.load_items) && current.load_items.length > 0 ? (
          <ul className="space-y-1">
            {current.load_items.map((li, i) => (
              <li key={i} className="text-black text-[14px]">{li.item}{li.quantity ? ` (${li.quantity})` : ""}</li>
            ))}
          </ul>
        ) : (
          <p className="text-mute text-[14px]">No items</p>
        )}
      </SheetSection>

      <SheetSection title="Photos">
        {Array.isArray(current.photos) && current.photos.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {current.photos.map((uri, i) => <FileLink key={i} fileUri={uri} label={`Open photo ${i + 1}`} />)}
          </div>
        ) : (
          <p className="text-mute text-[14px]">No photos</p>
        )}
      </SheetSection>

      <SheetSection title="Submitted">
        <SheetField label="Date submitted" value={formatAUDateTime(current.created_date)} />
      </SheetSection>
    </DetailSheet>
  );
}
