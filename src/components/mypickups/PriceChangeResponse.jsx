import { useState } from "react";
import { base44, errorMessage } from "@/api/base44";
import { formatPrice } from "@/lib/exampleData";

function YesNo({ question, busy, onYes, onNo }) {
  return (
    <div className="space-y-2">
      <p className="text-black text-[14px]">{question}</p>
      <div className="flex gap-2">
        <button type="button" onClick={onYes} disabled={busy} className="flex-1 rounded-full bg-black text-white py-3 font-heading font-extrabold text-sm min-h-[44px] disabled:opacity-60">
          {busy ? "Updating..." : "Yes"}
        </button>
        <button type="button" onClick={onNo} className="flex-1 rounded-full bg-white border border-line text-black py-3 font-heading font-extrabold text-sm min-h-[44px]">
          No
        </button>
      </div>
    </div>
  );
}

export default function PriceChangeResponse({ quote, onPriceChange }) {
  const [confirmAccept, setConfirmAccept] = useState(false);
  const [confirmDecline, setConfirmDecline] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleRespond = async (accept) => {
    setBusy(true);
    setError("");
    try {
      await base44.functions.invoke("respondPriceChange", { quote_id: quote.id, accept });
      setConfirmAccept(false);
      setConfirmDecline(false);
      onPriceChange(accept);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (quote.change_status === "Requested") {
    return (
      <div className="mt-3 rounded-2xl border-2 border-gold p-3 space-y-2">
        <p className="font-heading font-extrabold text-black text-[14px]">Price change requested</p>
        <p className="text-black text-[14px]">From {formatPrice(quote.price)} to {formatPrice(quote.change_price)}</p>
        {quote.change_reason && <p className="text-mute text-[13px]">{quote.change_reason}</p>}
        {error && <p className="text-danger text-[13px] font-bold" role="alert">{error}</p>}
        {confirmAccept ? (
          <YesNo question={`Accept the new price of ${formatPrice(quote.change_price)}?`} busy={busy} onYes={() => handleRespond(true)} onNo={() => { setConfirmAccept(false); setError(""); }} />
        ) : confirmDecline ? (
          <YesNo question="Decline this price change request?" busy={busy} onYes={() => handleRespond(false)} onNo={() => { setConfirmDecline(false); setError(""); }} />
        ) : (
          <div className="flex gap-2">
            <button type="button" onClick={() => setConfirmAccept(true)} className="flex-1 rounded-full bg-black text-white py-3 font-heading font-extrabold text-sm min-h-[44px]">
              Accept new price
            </button>
            <button type="button" onClick={() => setConfirmDecline(true)} className="flex-1 rounded-full bg-white border border-line text-black py-3 font-heading font-extrabold text-sm min-h-[44px]">
              Decline
            </button>
          </div>
        )}
      </div>
    );
  }
  if (quote.change_status === "Accepted") return <p className="mt-3 text-mute text-[13px]">Price updated to {formatPrice(quote.price)}.</p>;
  if (quote.change_status === "Declined") return <p className="mt-3 text-mute text-[13px]">Price change declined.</p>;
  return null;
}
