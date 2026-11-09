import StarRating from "@/components/StarRating";
import { formatPrice } from "@/lib/exampleData";
import { formatAUDate } from "@/lib/format";
import ReportProblem from "@/components/ReportProblem";
import CollectorAvatar from "./CollectorAvatar";
import PriceChangeResponse from "./PriceChangeResponse";

export default function BookedCard({ quote, jobId, agreedDate, pickupDate, onMessage, onPriceChange }) {
  const c = quote.collector || {};
  const contact = quote.contact || {};
  return (
    <div className="rounded-2xl bg-white border border-line p-4">
      <p className="font-heading font-extrabold text-black text-[15px]">Booked with {c.trading_name || "collector"}</p>
      <div className="mt-3 flex items-start gap-3">
        <CollectorAvatar photoUrl={c.public_photo_url} name={c.trading_name} size={48} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {c.rating_count > 0 ? (
              <>
                <StarRating value={c.rating_avg} size={14} />
                <span className="text-mute text-[13px]">{c.rating_avg} ({c.rating_count})</span>
              </>
            ) : (
              <span className="text-mute text-[13px]">No reviews yet</span>
            )}
          </div>
          <p className="mt-1 font-heading font-extrabold text-black text-[22px]">{formatPrice(quote.price)}</p>
          <p className="mt-1 text-mute text-[13px]">
            You pay the collector directly when the job is done. Agree on the price and what's included in the messages.
          </p>
          <div className="mt-2">
            <p className="text-mute text-[12px] font-bold">Agreed date</p>
            <p className="text-black text-[14px]">{formatAUDate(agreedDate || pickupDate)}</p>
          </div>
        </div>
      </div>
      {contact.name && <p className="mt-3 text-black text-[14px] font-bold">{contact.name}</p>}
      {contact.mobile && (
        <a href={`tel:${contact.mobile}`} className="mt-1 flex items-center min-h-[44px] text-black text-[14px] underline underline-offset-2">{contact.mobile}</a>
      )}
      {contact.email && (
        <a href={`mailto:${contact.email}`} className="mt-1 flex items-center min-h-[44px] text-black text-[14px] underline underline-offset-2 break-all">{contact.email}</a>
      )}
      <PriceChangeResponse quote={quote} onPriceChange={onPriceChange} />
      {onMessage && (
        <button type="button" onClick={onMessage} className="mt-3 rounded-full border border-line bg-white text-black px-4 py-2 font-heading font-extrabold text-[13px] min-h-[44px] hover:border-black">
          Message
        </button>
      )}
      <div className="mt-2"><ReportProblem jobId={jobId} /></div>
    </div>
  );
}
