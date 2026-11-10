import { useEffect, useState } from "react";
import { base44 } from "@/api/base44";
import { SheetSection } from "./SheetField";
import { formatAUDate, formatAUDateTime } from "@/lib/adminConfig";
import { formatPrice } from "@/lib/exampleData";

// Ported from the Base44 app's admin (PickupActivity). Read-only quotes and messages for one pick up.
export default function PickupActivity({ jobId }) {
  const [quotes, setQuotes] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    Promise.all([
      base44.entities.Quote.filter({ job_id: jobId }, { sort: "-created_date", limit: 100 }),
      base44.entities.Message.filter({ job_id: jobId }, { sort: "created_date", limit: 100 }),
    ])
      .then(([quotePage, messagePage]) => {
        if (!active) return;
        setQuotes(quotePage.items || []);
        setMessages(messagePage.items || []);
      })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [jobId]);

  return (
    <>
      <SheetSection title="Quotes">
        {loading ? (
          <p className="text-mute text-[14px]">Loading...</p>
        ) : error ? (
          <p className="text-mute text-[14px]">Quotes did not load.</p>
        ) : quotes.length === 0 ? (
          <p className="text-mute text-[14px]">No quotes</p>
        ) : (
          quotes.map((q) => (
            <div key={q.id} className="rounded-[14px] border border-line p-3">
              <p className="font-bold text-black text-[14px]">{q.collector_name || "Collector"}</p>
              <p className="text-black text-[14px]">{formatPrice(q.price)} · {q.status}</p>
              <p className="text-mute text-[13px]">{q.created_date ? formatAUDate(q.created_date) : ""}</p>
            </div>
          ))
        )}
      </SheetSection>

      <SheetSection title="Messages">
        {loading ? (
          <p className="text-mute text-[14px]">Loading...</p>
        ) : error ? (
          <p className="text-mute text-[14px]">Messages did not load.</p>
        ) : messages.length === 0 ? (
          <p className="text-mute text-[14px]">No messages</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="rounded-[14px] border border-line p-3">
              <p className="text-mute text-[12px] font-bold">{[m.sender_role, m.sender_email].filter(Boolean).join(" · ")}</p>
              <p className="text-black text-[14px] whitespace-pre-wrap break-words">{m.body}</p>
              <p className="text-mute text-[13px]">{formatAUDateTime(m.created_date)}</p>
            </div>
          ))
        )}
      </SheetSection>
    </>
  );
}
