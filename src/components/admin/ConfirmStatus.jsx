export default function ConfirmStatus({ toStatus, onConfirm, onCancel, busy }) {
  return (
    <div className="mt-3 rounded-[16px] bg-soft p-4">
      <p className="font-heading font-extrabold text-black text-[15px]">Set to {toStatus}?</p>
      <div className="mt-3 flex gap-3">
        <button type="button" onClick={onCancel} disabled={busy} className="flex-1 rounded-full border border-black text-black font-heading font-extrabold min-h-[44px] text-sm disabled:opacity-60">
          Cancel
        </button>
        <button type="button" onClick={onConfirm} disabled={busy} className="flex-1 rounded-full bg-black text-white font-heading font-extrabold min-h-[44px] text-sm disabled:opacity-60">
          {busy ? "Saving..." : "Confirm"}
        </button>
      </div>
    </div>
  );
}
