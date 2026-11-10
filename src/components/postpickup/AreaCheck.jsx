import { useState } from "react";
import { postcodeError } from "@/lib/area";

// Shown before sign-up, so someone outside the area finds out before making an account.
export default function AreaCheck() {
  const [postcode, setPostcode] = useState("");
  const [result, setResult] = useState(null);

  const check = (e) => {
    e.preventDefault();
    const err = postcodeError(postcode);
    setResult(err ? { ok: false, text: err === "Enter a 4-digit postcode" ? err : "Sorry, we only cover Melbourne and Brisbane for now, so we can't take a pick up at that postcode yet." } : { ok: true, text: `Good news, you can post a pick up for ${postcode.trim()}.` });
  };

  return (
    <form onSubmit={check} className="mt-5 rounded-2xl bg-concrete p-4" noValidate>
      <p className="font-heading font-extrabold text-[15px] text-black">We cover Melbourne and Brisbane</p>
      <label htmlFor="area-postcode" className="mt-1 block text-[14px] text-black">Check your postcode before you sign up</label>
      <div className="mt-2 flex gap-2">
        <input
          id="area-postcode"
          value={postcode}
          onChange={(e) => { setPostcode(e.target.value.replace(/\D/g, "").slice(0, 4)); setResult(null); }}
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="3000"
          className="w-[120px] h-[48px] rounded-xl bg-white border-[1.5px] border-line px-3 text-[15px] text-black focus:outline-none focus:border-black"
        />
        <button type="submit" className="rounded-full bg-white border border-black text-black px-5 min-h-[48px] font-heading font-extrabold text-sm hover:bg-black hover:text-white">
          Check
        </button>
      </div>
      <p className={`mt-2 text-[14px] ${result ? (result.ok ? "text-black font-bold" : "text-danger font-bold") : "sr-only"}`} aria-live="polite">
        {result?.text || ""}
      </p>
    </form>
  );
}
