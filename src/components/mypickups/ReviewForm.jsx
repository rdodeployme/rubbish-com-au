import { useState } from "react";
import { Star } from "lucide-react";
import { base44, errorMessage } from "@/api/base44";

export default function ReviewForm({ jobId, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!rating) { setError("Please select a star rating."); return; }
    setBusy(true);
    setError("");
    try {
      await base44.functions.invoke("leaveReview", { job_id: jobId, rating, comment: comment.trim() });
      onSubmitted({ rating, comment: comment.trim() });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-3">
      <div className="flex gap-1" role="group" aria-label="Star rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            aria-pressed={rating === n}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className="grid place-items-center min-w-[44px] min-h-[44px]"
          >
            <Star size={40} fill={n <= (hover || rating) ? "#FBC303" : "none"} stroke={n <= (hover || rating) ? "#FBC303" : "#E6E6E6"} strokeWidth={1.5} />
          </button>
        ))}
      </div>
      <label htmlFor={`review-${jobId}`} className="sr-only">Your review</label>
      <textarea
        id={`review-${jobId}`}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
        rows={3}
        placeholder="Tell others about your experience (optional)"
        className="mt-3 w-full rounded-[14px] bg-white border-[1.5px] border-line px-4 py-3 text-base text-black placeholder:text-mute focus:outline-none focus:border-black resize-none"
      />
      <div className="mt-1 flex justify-end"><span className="text-mute text-[13px]">{comment.length} / 500</span></div>
      {error && <p className="mt-1 text-danger text-[13px] font-bold" role="alert">{error}</p>}
      <button type="button" onClick={handleSubmit} disabled={busy} className="mt-3 w-full rounded-full bg-black text-white py-3.5 font-heading font-extrabold text-sm min-h-[48px] disabled:opacity-60">
        {busy ? "Sending..." : "Send review"}
      </button>
    </div>
  );
}
