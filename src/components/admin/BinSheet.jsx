import { useEffect, useState } from "react";
import { base44 } from "@/api/base44";
import DetailSheet from "./DetailSheet";
import StatusPill from "./StatusPill";
import ConfirmStatus from "./ConfirmStatus";
import { SheetField, SheetSection, SheetLink } from "./SheetField";
import { REQUEST_STATUSES, REQUEST_STATUS_BUTTONS, formatAUDate, formatAUDateTime, yesNo, joinList } from "@/lib/adminConfig";

export function binSizeLabel(r) {
  if (r.bin_kind === "Wheelie") return r.bin_count != null && r.bin_litres != null ? `${r.bin_count} × ${r.bin_litres} L` : "";
  return r.size_m3 != null ? `${r.size_m3} m³` : "";
}

// Ported from the Base44 app's admin (BinSheet).
export default function BinSheet({ record, onClose, onUpdated }) {
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
      await base44.entities.BinRequest.update(current.id, { status: pending });
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

  const subtitle = [current.bin_kind && `${current.bin_kind} bin`, binSizeLabel(current), current.suburb, current.needed_date && formatAUDate(current.needed_date)].filter(Boolean).join(" · ");

  return (
    <DetailSheet title={current.bin_kind ? `${current.bin_kind} bin` : "Bin request"} subtitle={subtitle} onClose={onClose}>
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
      {error && <p className="mt-2 text-[13px] text-danger font-bold" role="alert">{error}</p>}

      <SheetSection title="Bin details">
        <SheetField label="Bin kind" value={current.bin_kind} />
        <SheetField label="Size (m³)" value={current.size_m3 != null ? String(current.size_m3) : ""} />
        <SheetField label="Waste type" value={current.waste_type} />
        <SheetField label="Hire period" value={current.hire_period} />
        <SheetField label="Placement" value={current.placement} />
        <SheetField label="Property type" value={current.property_type} />
        <SheetField label="Bin litres" value={current.bin_litres != null ? String(current.bin_litres) : ""} />
        <SheetField label="Bin count" value={current.bin_count != null ? String(current.bin_count) : ""} />
        <SheetField label="Frequency" value={current.frequency} />
        <SheetField label="Streams" value={joinList(current.streams)} />
      </SheetSection>

      <SheetSection title="Contact">
        <SheetField label="Name" value={current.name} />
        <SheetLink label="Mobile" href={current.mobile ? `tel:${current.mobile.replace(/\s/g, "")}` : ""} value={current.mobile} />
        <SheetLink label="Email" href={current.email ? `mailto:${current.email}` : ""} value={current.email} />
        <SheetField label="Suburb" value={current.suburb} />
        <SheetField label="Needed date" value={formatAUDate(current.needed_date)} />
      </SheetSection>

      <SheetSection title="Other">
        <SheetField label="Hazard confirmed" value={yesNo(current.hazard_confirmed)} />
        <SheetField label="Estimated volume (m³)" value={current.estimated_volume_m3 != null ? String(current.estimated_volume_m3) : ""} />
        <div>
          <p className="text-mute text-[12px] font-bold">Load items</p>
          {Array.isArray(current.load_items) && current.load_items.length > 0 ? (
            <ul className="mt-1 space-y-1">
              {current.load_items.map((li, i) => <li key={i} className="text-black text-[14px]">{li.item}{li.quantity ? ` (${li.quantity})` : ""}</li>)}
            </ul>
          ) : (
            <p className="text-black text-[14px]">No items</p>
          )}
        </div>
      </SheetSection>

      <SheetSection title="Submitted">
        <SheetField label="Date submitted" value={formatAUDateTime(current.created_date)} />
      </SheetSection>
    </DetailSheet>
  );
}
