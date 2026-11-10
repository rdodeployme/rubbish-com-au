import { useEffect, useState } from "react";
import { base44, errorMessage } from "@/api/base44";
import DetailSheet from "./DetailSheet";
import StatusPill from "./StatusPill";
import ConfirmStatus from "./ConfirmStatus";
import FileLink from "./FileLink";
import CollectorAvatar from "@/components/mypickups/CollectorAvatar";
import { SheetField, SheetSection } from "./SheetField";
import { COLLECTOR_STATUSES, COLLECTOR_STATUS_BUTTONS, formatAUDate, formatAUDateTime, yesNo, joinList } from "@/lib/adminConfig";

// Ported from the Base44 app's admin (CollectorSheet). Status changes go through
// setApplicationStatus, which checks the admin role, logs history and emails the collector.
function FileRow({ label, uri }) {
  return (
    <div>
      <p className="text-mute text-[12px] font-bold">{label}</p>
      <FileLink fileUri={uri} />
    </div>
  );
}

export default function CollectorSheet({ record, onClose, onUpdated }) {
  const [current, setCurrent] = useState(record);
  const [pending, setPending] = useState(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const loadHistory = (id) =>
    base44.entities.ApplicationHistory.filter({ application_id: id }, { sort: "-changed_at", limit: 100 })
      .then((r) => setHistory(r.items || []))
      .catch(() => setHistory([]));

  useEffect(() => {
    setCurrent(record);
    setHistoryLoading(true);
    loadHistory(record.id).finally(() => setHistoryLoading(false));
  }, [record]);

  const handleConfirm = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await base44.functions.invoke("setApplicationStatus", { applicationId: current.id, status: pending, note });
      const updated = response?.data?.application || { ...current, status: pending };
      setCurrent(updated);
      onUpdated(updated);
      setPending(null);
      setNote("");
      loadHistory(current.id);
    } catch (err) {
      setError(errorMessage(err, "Could not save. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const fullName = `${current.first_name || ""} ${current.last_name || ""}`.trim();
  const subtitle = [current.trading_name, [current.home_suburb, current.state].filter(Boolean).join(" ")].filter(Boolean).join(" · ");

  return (
    <DetailSheet title={fullName} subtitle={subtitle} onClose={onClose} headerLeading={<CollectorAvatar photoUrl={current.public_photo_url} name={fullName} size={56} />}>
      <div className="mt-2">
        <p className="text-mute text-[12px] font-bold">Status</p>
        <div className="mt-1"><StatusPill status={current.status} /></div>
      </div>

      <label htmlFor="cs-note" className="sr-only">Note (only admins see this)</label>
      <textarea
        id="cs-note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (only admins see this)"
        className="mt-3 w-full rounded-[12px] bg-white border border-line p-3 text-[14px] text-black min-h-[60px] resize-none focus:outline-none focus:border-black"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {COLLECTOR_STATUSES.filter((s) => s !== current.status).map((s) => (
          <button key={s} type="button" onClick={() => setPending(s)} className="min-h-[44px] inline-flex items-center justify-center rounded-full border border-black px-3 py-1.5 font-heading font-extrabold text-[13px] text-black">
            {COLLECTOR_STATUS_BUTTONS[s]}
          </button>
        ))}
      </div>

      {pending && <ConfirmStatus toStatus={pending} busy={busy} onCancel={() => setPending(null)} onConfirm={handleConfirm} />}
      {error && <p className="mt-2 text-[13px] text-danger font-bold" role="alert">{error}</p>}

      <div className="mt-5">
        <h3 className="font-heading font-extrabold text-[16px] text-black">History</h3>
        {historyLoading ? (
          <p className="mt-2 text-mute text-[13px]">Loading...</p>
        ) : history.length === 0 ? (
          <p className="mt-2 text-mute text-[13px]">No changes yet.</p>
        ) : (
          <div className="mt-2 space-y-3">
            {history.map((h) => (
              <div key={h.id}>
                <p className="text-black text-[13px]">
                  {h.from_status === h.to_status ? "Details updated" : `${h.from_status || "(none)"} to ${h.to_status}`} · {h.changed_by} · {formatAUDateTime(h.changed_at)}
                </p>
                {h.note && <p className="text-mute text-[13px]">{h.note}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <SheetSection title="About them">
        <SheetField label="First name" value={current.first_name} />
        <SheetField label="Last name" value={current.last_name} />
        <SheetField label="Mobile" value={current.mobile} />
        <SheetField label="Email" value={current.email} />
        <SheetField label="Home suburb" value={current.home_suburb} />
        <SheetField label="Postcode" value={current.postcode} />
        <SheetField label="State" value={current.state} />
        <FileRow label="Profile photo" uri={current.profile_photo} />
        <div>
          <p className="text-mute text-[12px] font-bold">Public photo</p>
          {current.public_photo_url ? (
            <a href={current.public_photo_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center min-h-[44px] text-black text-[14px] underline underline-offset-2">Open photo</a>
          ) : (
            <p className="text-black text-[14px]">Not provided</p>
          )}
        </div>
        <SheetField label="Bio" value={current.bio} />
        <SheetField label="Crew size" value={current.crew_size} />
      </SheetSection>

      <SheetSection title="Business">
        <SheetField label="Trading name" value={current.trading_name} />
        <SheetField label="Business structure" value={current.business_structure} />
        <SheetField label="ABN" value={current.abn} />
        <SheetField label="GST registered" value={current.gst_registered} />
        <SheetField label="Years of experience" value={current.years_experience} />
        <SheetField label="Website" value={current.website} />
      </SheetSection>

      <SheetSection title="Licences and insurance">
        <SheetField label="Driver licence number" value={current.driver_licence_number} />
        <SheetField label="Driver licence state" value={current.driver_licence_state} />
        <SheetField label="Driver licence expiry" value={formatAUDate(current.driver_licence_expiry)} />
        <SheetField label="Carrier licence number" value={current.carrier_licence_number} />
        <SheetField label="Carrier licence issuer" value={current.carrier_licence_issuer} />
        <SheetField label="Carrier licence expiry" value={formatAUDate(current.carrier_licence_expiry)} />
        <FileRow label="Carrier licence copy" uri={current.carrier_licence_file} />
        <SheetField label="Insurer" value={current.insurer} />
        <SheetField label="Insurance policy number" value={current.insurance_policy_number} />
        <SheetField label="Insurance cover amount" value={current.insurance_cover_amount} />
        <SheetField label="Insurance expiry" value={formatAUDate(current.insurance_expiry)} />
        <FileRow label="Insurance certificate" uri={current.insurance_certificate_file} />
        <FileRow label="Police check" uri={current.police_check_file} />
      </SheetSection>

      <SheetSection title="Vehicles">
        {Array.isArray(current.vehicles) && current.vehicles.length > 0 ? (
          <ul className="space-y-1">
            {current.vehicles.map((v, i) => (
              <li key={i} className="text-black text-[14px]">{[v.type, v.rego, v.make_model, v.load_size].filter(Boolean).join(" · ")}</li>
            ))}
          </ul>
        ) : (
          <p className="text-mute text-[14px]">No vehicles listed</p>
        )}
      </SheetSection>

      <SheetSection title="Area and hours">
        <SheetField label="Travel radius (km)" value={current.travel_radius_km} />
        <SheetField label="Service postcodes" value={(current.service_postcodes || []).join(", ")} />
        <SheetField label="Work days" value={joinList(current.work_days)} />
        <SheetField label="Time windows" value={joinList(current.time_windows)} />
        <SheetField label="Accepts same day" value={yesNo(current.accepts_same_day)} />
        <SheetField label="Accepts out of hours" value={yesNo(current.accepts_out_of_hours)} />
      </SheetSection>

      <SheetSection title="Jobs and materials">
        <SheetField label="Job types" value={joinList(current.job_types)} />
        <SheetField label="Materials" value={joinList(current.materials)} />
        <SheetField label="Can handle heavy items" value={yesNo(current.can_handle_heavy_items)} />
        <SheetField label="Disposal facilities" value={current.disposal_facilities} />
        <SheetField label="Will record disposal" value={yesNo(current.will_record_disposal)} />
      </SheetSection>

      <SheetSection title="Agreements">
        <SheetField label="Agreed to terms" value={yesNo(current.agreed_to_terms)} />
      </SheetSection>
    </DetailSheet>
  );
}
