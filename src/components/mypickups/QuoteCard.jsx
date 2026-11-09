import { useState } from "react";
import { Link } from "react-router-dom";
import { base44, errorMessage } from "@/api/base44";
import CollectorAvatar from "./CollectorAvatar";
import StarRating from "@/components/StarRating";
import { formatPrice } from "@/lib/exampleData";
import { formatAUDate } from "@/lib/format";

export default function QuoteCard({ quote, jobPickupDate, onAccept, onMessage }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const c = quote.collector || {};

  const handleAccept = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await base44.functions.invoke("acceptQuote", { quote_id: quote.id });
      onAccept(res?.data);
    } catch (err) {
      setError(errorMessage(err));
      setConfirming(false);
    } finally {
      setBusy(false);
    }
  };

  const showDate = quote.available_date && quote.available_date !== jobPickupDate;
  const locationStr = [c.home_suburb, c.state].filter(Boolean).join(", ");

  return (
    <div className="rounded-2xl bg-white border border-line p-4">
      <div className="flex items-start gap-3">
        <CollectorAvatar photoUrl={c.public_photo_url} name={c.trading_name} size={48} />
        <div className="flex-1 min-w-0">
          <p className="font-heading font-extrabold text-black text-[15px]">{c.trading_name || "Collector"}</p>
          {locationStr && <p className="text-mute text-[13px]">{locationStr}</p>}
          <div className="mt-1 flex items-center gap-1.5">
            {c.rating_count > 0 ? (
              <>
                <StarRating value={c.rating_avg} size={14} />
                <span className="text-mute text-[13px]">{c.rating_avg} ({c.rating_count})</span>
              </>
            ) : (
              <span className="text-mute text-[13px]">No reviews yet</span>
            )}
          </div>
        </div>
        <p className="font-heading font-extrabold text-black text-[22px] shrink-0">{formatPrice(quote.price)}</p>
      </div>

      {quote.message && <p className="mt-3 text-black text-[14px]">{quote.message}</p>}
      {showDate && <p className="mt-1 text-mute text-[13px]">Can do {formatAUDate(quote.available_date)}</p>}
      {error && <p className="mt-2 text-danger text-[13px] font-bold" role="alert">{error}</p>}

      {confirming ? (
        <div className="mt-3">
          <p className="text-black text-[14px]">Accept this quote? The other quotes will be declined.</p>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={handleAccept} disabled={busy} className="flex-1 rounded-full bg-black text-white py-3 font-heading font-extrabold text-sm min-h-[48px] disabled:opacity-60">
              {busy ? "Accepting..." : "Yes"}
            </button>
            <button type="button" onClick={() => { setConfirming(false); setError(""); }} className="flex-1 rounded-full bg-white border border-line text-black py-3 font-heading font-extrabold text-sm min-h-[48px]">
              No
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {onMessage && (
            <button type="button" onClick={onMessage} className="rounded-full border border-line bg-white text-black px-4 py-2 font-heading font-extrabold text-[13px] min-h-[44px] hover:border-black">
              Message
            </button>
          )}
          <Link to={`/collector-profile?id=${encodeURIComponent(c.application_id || "")}`} className="flex-1 inline-flex items-center justify-center rounded-full bg-white border border-line text-black py-3 px-4 font-heading font-extrabold text-sm min-h-[48px] hover:border-black">
            View profile
          </Link>
          <button type="button" onClick={() => setConfirming(true)} className="flex-1 rounded-full bg-black text-white py-3 px-4 font-heading font-extrabold text-sm min-h-[48px]">
            Accept quote
          </button>
        </div>
      )}
    </div>
  );
}
