import { useEffect, useState } from "react";
import { base44 } from "@/api/base44";
import { useAuth, userEmail } from "@/lib/auth";
import { formatAUDateTime } from "@/lib/adminConfig";

// Ported from the Base44 app's admin (SettingsTab): the customer posting switch.
export default function SettingsTab() {
  const { user } = useAuth();
  const [settingId, setSettingId] = useState(null);
  const [isOn, setIsOn] = useState(false);
  const [lastChanged, setLastChanged] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      base44.entities.AppSetting.filter({ key: "customer_posting_live" }, { limit: 1 }),
      base44.entities.SettingHistory.filter({ setting_key: "customer_posting_live" }, { sort: "-changed_at", limit: 1 }),
    ])
      .then(([settingPage, historyPage]) => {
        const setting = (settingPage.items || [])[0];
        setSettingId(setting?.id || null);
        setIsOn(setting?.value === "true");
        setLastChanged((historyPage.items || [])[0] || null);
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, []);

  const handleConfirm = async () => {
    setBusy(true);
    setError("");
    const fromValue = isOn ? "true" : "false";
    const toValue = pending;
    try {
      if (settingId) {
        await base44.entities.AppSetting.update(settingId, { value: toValue });
      } else {
        const created = await base44.entities.AppSetting.create({ key: "customer_posting_live", value: toValue });
        setSettingId(created.id);
      }
      setIsOn(toValue === "true");
      setPending(null);
      try {
        const historyRow = await base44.entities.SettingHistory.create({
          setting_key: "customer_posting_live",
          from_value: fromValue,
          to_value: toValue,
          changed_by: userEmail(user),
          changed_at: new Date().toISOString(),
        });
        setLastChanged(historyRow);
      } catch {
        setError("Saved, but the history entry could not be recorded.");
      }
    } catch {
      setError("Could not save. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="px-4 md:px-0 pt-6"><p className="text-mute text-[15px]">Loading...</p></div>;
  if (loadError) return <div className="px-4 md:px-0 pt-6"><p className="text-[14px] font-bold text-danger" role="alert">Could not load settings. Refresh the page to try again.</p></div>;

  return (
    <div className="px-4 md:px-0 pt-4 pb-8 max-w-[640px]">
      <div className="rounded-[16px] bg-white border border-line p-4">
        <div className="flex items-center justify-between gap-3">
          <p id="posting-label" className="font-heading font-extrabold text-black text-[15px]">Customer posting live</p>
          <div className="flex items-center gap-2">
            <span className="font-heading font-extrabold text-[13px] text-black">{isOn ? "On" : "Off"}</span>
            <button
              type="button"
              role="switch"
              aria-checked={isOn}
              aria-labelledby="posting-label"
              onClick={() => { if (!pending && !busy) { setPending(isOn ? "false" : "true"); setError(""); } }}
              disabled={!!pending || busy}
              className="inline-flex items-center justify-center min-h-[44px] min-w-[56px] shrink-0"
            >
              <span className={`relative h-8 w-14 rounded-full transition-colors ${isOn ? "bg-black" : "bg-white border border-line"}`}>
                <span className={`absolute top-1 h-6 w-6 rounded-full transition-all ${isOn ? "right-1 bg-gold" : "left-1 bg-mute"}`} />
              </span>
            </button>
          </div>
        </div>

        {pending && (
          <div className="mt-3 rounded-[16px] bg-soft p-4">
            <p className="font-heading font-extrabold text-black text-[15px]">Turn customer posting {pending === "true" ? "ON" : "OFF"}?</p>
            <div className="mt-3 flex gap-3">
              <button type="button" onClick={() => setPending(null)} disabled={busy} className="flex-1 rounded-full border border-black text-black font-heading font-extrabold min-h-[44px] text-sm disabled:opacity-60">Cancel</button>
              <button type="button" onClick={handleConfirm} disabled={busy} className="flex-1 rounded-full bg-black text-white font-heading font-extrabold min-h-[44px] text-sm disabled:opacity-60">{busy ? "Saving..." : "Confirm"}</button>
            </div>
          </div>
        )}

        {error && <p className="mt-2 text-[13px] text-danger font-bold" role="alert">{error}</p>}

        <p className="mt-3 text-mute text-[13px]">
          {lastChanged ? `Last changed by ${lastChanged.changed_by} on ${formatAUDateTime(lastChanged.changed_at)}` : "Never changed"}
        </p>
        <p className="mt-1 text-mute text-[13px]">
          When on, signed-in customers can post pick ups and approved collectors can quote on them. When off, everyone sees the waitlist.
        </p>
      </div>
    </div>
  );
}
