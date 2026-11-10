import { useEffect, useState, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { base44, errorMessage, errorStatus } from "@/api/base44";
import { parseServerDate } from "@/lib/format";
import Portal from "@/components/Portal";
import { useDialog } from "@/hooks/useDialog";

function melbourneDay(value) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Melbourne", year: "numeric", month: "2-digit", day: "2-digit" }).format(value);
}

// Time only for today, otherwise the date as well (Melbourne time).
function formatMessageTime(iso) {
  if (!iso) return "";
  const d = parseServerDate(iso);
  if (isNaN(d.getTime())) return "";
  const time = new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Melbourne", hour: "numeric", minute: "2-digit", hour12: true }).format(d);
  if (melbourneDay(d) === melbourneDay(new Date())) return time;
  const date = new Intl.DateTimeFormat("en-AU", { timeZone: "Australia/Melbourne", day: "numeric", month: "short" }).format(d);
  return date + ", " + time;
}

// Ported from the Base44 app. Full screen on phones, a side panel on wide screens.
export default function MessageSheet({ jobId, applicationId, onClose }) {
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [closed, setClosed] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const messagesLenRef = useRef(0);
  const prevCountRef = useRef(0);
  const panelRef = useRef(null);
  useDialog(panelRef, onClose);

  const loadThread = useCallback(async () => {
    try {
      const payload = { job_id: jobId };
      if (applicationId) payload.application_id = applicationId;
      const res = await base44.functions.invoke("getThread", payload);
      if (res?.data) {
        setThread(res.data.thread);
        setMessages(res.data.messages || []);
        setClosed(false);
        setError(false);
      } else {
        setError(true);
      }
    } catch (err) {
      if (errorStatus(err) === 409) { setClosed(true); return; }
      if (messagesLenRef.current === 0) setError(true);
    } finally {
      setLoading(false);
    }
  }, [jobId, applicationId]);

  useEffect(() => { loadThread(); }, [loadThread]);
  useEffect(() => { messagesLenRef.current = messages.length; }, [messages]);
  useEffect(() => {
    const newCount = messages.length;
    if (newCount !== prevCountRef.current) {
      prevCountRef.current = newCount;
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [messages]);
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 128) + "px";
  }, [text]);
  useEffect(() => {
    if (closed || loading || error) return;
    const interval = setInterval(() => { loadThread(); }, 15000);
    return () => clearInterval(interval);
  }, [closed, loading, error, loadThread]);
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || sending || closed) return;
    setSending(true);
    setSendError("");
    try {
      const payload = { job_id: jobId, body: trimmed };
      if (applicationId) payload.application_id = applicationId;
      const res = await base44.functions.invoke("sendMessage", payload);
      if (res?.data) {
        setMessages((prev) => [...prev, { ...res.data, mine: true }]);
        setText("");
      }
    } catch (err) {
      if (errorStatus(err) === 409) setClosed(true);
      else setSendError(errorMessage(err, "Sorry, that did not send. Please try again."));
    } finally {
      setSending(false);
    }
  };

  const otherName = thread?.other_party?.name || "Messages";
  const jobStatus = thread?.job_status;
  const isOpen = jobStatus === "Open";
  const closedThread = jobStatus === "Completed" || jobStatus === "Cancelled";
  const showLoading = loading && messages.length === 0;
  const showError = error && messages.length === 0;
  const showClosedOnly = closed && messages.length === 0;

  return (
    <Portal>
    <div className="fixed inset-0 z-[60] flex items-end md:items-stretch justify-center md:justify-end" role="dialog" aria-modal="true" aria-label={`Messages with ${otherName}`}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div ref={panelRef} tabIndex={-1} className="relative w-full md:max-w-[480px] bg-white rounded-t-[28px] md:rounded-none h-[100dvh] flex flex-col focus:outline-none">
        <div className="relative bg-white px-5 pt-4 pb-3 rounded-t-[28px] md:rounded-none border-b border-line shrink-0">
          <button type="button" onClick={onClose} aria-label="Close" className="absolute top-3 right-3 grid place-items-center h-11 w-11 rounded-full bg-soft hover:bg-line">
            <X className="h-5 w-5 text-black" />
          </button>
          <h2 className="font-heading font-extrabold text-[24px] text-black leading-tight pr-12">{otherName}</h2>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
          {showLoading ? (
            <div className="flex items-center justify-center py-10"><div className="w-6 h-6 border-4 border-line border-t-black rounded-full animate-spin"></div></div>
          ) : showError ? (
            <div className="py-10">
              <p className="text-mute text-[14px]">Sorry, messages did not load. Please try again.</p>
              <button type="button" onClick={() => { setError(false); setLoading(true); loadThread(); }} className="mt-3 rounded-full bg-black text-white px-5 py-2.5 font-heading font-extrabold text-sm min-h-[48px]">
                Try again
              </button>
            </div>
          ) : showClosedOnly ? null : (
            <div className="space-y-3">
              {closedThread && <p className="text-mute text-[13px] text-center">Messages are closed for this job.</p>}
              {messages.length === 0 ? (
                <p className="text-mute text-[14px]">No messages yet.</p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${m.mine ? "bg-black text-white" : "bg-soft text-black"}`}>
                      <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words">{m.body}</p>
                      <p className={`mt-1 text-[11px] ${m.mine ? "text-white/60" : "text-mute"}`}>{formatMessageTime(m.created_date)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {!showLoading && !showError && !closedThread && (
          <div className="shrink-0 border-t border-line px-5 py-3 bg-white">
            {closed ? (
              <p className="text-mute text-[14px] text-center py-2">Messages are closed for this pick up.</p>
            ) : (
              <div className="space-y-2">
                {isOpen && <p className="text-mute text-[12px]">Phone numbers and emails are shared when the customer accepts a quote.</p>}
                {sendError && <p className="text-danger text-[13px] font-bold" role="alert">{sendError}</p>}
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <textarea
                      ref={textareaRef}
                      aria-label="Write a message"
                      value={text}
                      onChange={(e) => setText(e.target.value.slice(0, 1000))}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && window.matchMedia("(pointer: fine)").matches) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Type a message"
                      rows={1}
                      className="w-full rounded-2xl bg-soft px-4 py-3 text-[14px] text-black placeholder:text-mute focus:outline-none resize-none min-h-[48px]"
                    />
                    {text.length >= 800 && <p className="mt-1 text-mute text-[11px] text-right">{text.length} / 1000</p>}
                  </div>
                  <button type="button" onClick={handleSend} disabled={sending || !text.trim()} className="rounded-full bg-black text-white px-5 py-3 font-heading font-extrabold text-sm min-h-[48px] disabled:opacity-60 shrink-0">
                    {sending ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </Portal>
  );
}
