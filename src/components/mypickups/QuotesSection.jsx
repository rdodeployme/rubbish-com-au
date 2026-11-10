import { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44";
import QuoteCard from "./QuoteCard";
import BookedCard from "./BookedCard";
import ReviewForm from "./ReviewForm";
import CancelConfirm from "./CancelConfirm";
import CompleteConfirm from "./CompleteConfirm";
import StarRating from "@/components/StarRating";
import MessageSheet from "@/components/messages/MessageSheet";
import ReportProblem from "@/components/ReportProblem";
import { formatAUDate, melbourneToday } from "@/lib/format";

export default function QuotesSection({ record, onJobUpdate }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [jobData, setJobData] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [banner, setBanner] = useState("");
  const [messageAppId, setMessageAppId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    base44.functions.invoke("getQuotesForJob", { job_id: record.id })
      .then((res) => {
        if (res?.data) {
          setJobData(res.data.job);
          setQuotes(res.data.quotes || []);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [record.id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(""), 6000);
    return () => clearTimeout(t);
  }, [banner]);

  const currentStatus = jobData?.job_status || record.job_status;
  const quoteCount = jobData?.quote_count ?? record.quote_count ?? 0;

  const handleJobChange = (updatedJob) => {
    onJobUpdate({ ...record, ...(updatedJob || {}) });
    load();
  };

  if (loading) {
    return <div className="mt-5 flex items-center justify-center py-6"><div className="w-6 h-6 border-4 border-line border-t-black rounded-full animate-spin"></div></div>;
  }
  if (error) {
    return (
      <div className="mt-5">
        <p className="text-mute text-[14px]">Sorry, quotes did not load. Please try again.</p>
        <button type="button" onClick={load} className="mt-3 rounded-full bg-black text-white px-5 py-2.5 font-heading font-extrabold text-sm min-h-[48px]">Try again</button>
      </div>
    );
  }

  return (
    <div className="mt-5">
      {banner && (
        <div className="mb-4 rounded-2xl bg-gold px-4 py-3" role="status">
          <p className="font-heading font-extrabold text-black text-[14px]">{banner}</p>
        </div>
      )}

      {currentStatus === "Open" && (
        <div>
          <div className="flex items-baseline gap-2">
            <h3 className="font-heading font-extrabold text-[16px] text-black">Quotes</h3>
            <span className="text-mute text-[14px]">{quoteCount} of 3 quotes</span>
          </div>
          {quotes.length === 0 ? (
            <p className="mt-2 text-mute text-[14px]">No quotes yet. Collectors in your area can send up to 3.</p>
          ) : (
            <div className="mt-3 space-y-3">
              {quotes.map((q) => (
                <QuoteCard
                  key={q.id}
                  quote={q}
                  jobPickupDate={record.pickup_date}
                  onAccept={(updatedJob) => {
                    setBanner("Quote accepted. Your pick up is booked.");
                    handleJobChange(updatedJob);
                  }}
                  onMessage={() => setMessageAppId(q.collector?.application_id)}
                />
              ))}
            </div>
          )}
          <div className="mt-4">
            <CancelConfirm jobId={record.id} onSuccess={(updatedJob) => { setBanner("Pick up cancelled."); handleJobChange(updatedJob); }} />
          </div>
        </div>
      )}

      {currentStatus === "Booked" && (
        <div className="space-y-3">
          {quotes.filter((q) => q.status === "Accepted").map((q) => (
            <BookedCard
              key={q.id}
              quote={q}
              jobId={record.id}
              agreedDate={jobData?.agreed_date || record.agreed_date}
              pickupDate={record.pickup_date}
              onMessage={() => setMessageAppId(q.collector?.application_id)}
              onPriceChange={(accept) => { setBanner(accept ? "Price updated." : "Request declined."); load(); }}
            />
          ))}
          {(() => {
            // Confirm done only from the agreed date (or the pick up date if none was agreed).
            const due = jobData?.agreed_date || record.agreed_date || record.pickup_date || "";
            return !due || melbourneToday() >= due.slice(0, 10) ? (
              <CompleteConfirm jobId={record.id} onSuccess={handleJobChange} />
            ) : (
              <p className="rounded-2xl bg-soft px-4 py-3 text-[14px] text-black">
                You can confirm the job is done from {formatAUDate(due)}.
              </p>
            );
          })()}
          <CancelConfirm jobId={record.id} onSuccess={(updatedJob) => { setBanner("Pick up cancelled."); handleJobChange(updatedJob); }} />
        </div>
      )}

      {currentStatus === "Completed" && (
        <div>
          <p className="font-heading font-extrabold text-black text-[16px]">Job done.</p>
          {jobData?.review ? (
            <div className="mt-3">
              <p className="text-black text-[14px]">Thanks for your review.</p>
              <div className="mt-2"><StarRating value={jobData.review.rating} size={20} /></div>
              {jobData.review.comment && <p className="mt-2 text-black text-[14px]">{jobData.review.comment}</p>}
            </div>
          ) : (
            <ReviewForm jobId={record.id} onSubmitted={(review) => setJobData((prev) => ({ ...prev, review }))} />
          )}
          <div className="mt-4"><ReportProblem jobId={record.id} /></div>
        </div>
      )}

      {currentStatus === "Cancelled" && (
        <div>
          <p className="text-mute text-[14px]">This pick up was cancelled.</p>
          {jobData?.cancel_reason && <p className="mt-2 text-black text-[14px]">{jobData.cancel_reason}</p>}
        </div>
      )}

      {currentStatus === "Expired" && (
        <p className="text-mute text-[14px]">This pick up date has passed. Use Post again to put it up with a new date.</p>
      )}

      {messageAppId && <MessageSheet jobId={record.id} applicationId={messageAppId} onClose={() => setMessageAppId(null)} />}
    </div>
  );
}
