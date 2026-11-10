import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { useLoad } from "@/lib/loadModel";
import { WHEELIE_SIZES, WHEELIE_FREQUENCIES } from "@/lib/binModel";
import { readDraft, useSaveDraft } from "@/lib/draft";
import { useUrlParam } from "@/hooks/useUrlParam";
import WheeliePicker from "@/components/bins/WheeliePicker";
import WheelieQuoteForm from "@/components/bins/WheelieQuoteForm";
import BinConfirmation from "@/components/bins/BinConfirmation";

export default function WheelieRequest() {
  const { load, setLoad } = useLoad();
  // Step 2 has its own address (?step=details), so browser Back returns to the picker.
  const step = useUrlParam("step");
  const view = step.value === "details" ? "B" : "A";
  const [submitted, setSubmitted] = useState(null);
  const [saved] = useState(() => readDraft("wheelie-pick") || {});
  const [binSize, setBinSize] = useState(WHEELIE_SIZES.includes(saved.binSize) ? saved.binSize : 240);
  const [count, setCount] = useState(Number(saved.count) > 0 ? Number(saved.count) : 4);
  const [frequency, setFrequency] = useState(WHEELIE_FREQUENCIES.includes(saved.frequency) ? saved.frequency : "Weekly");
  useSaveDraft("wheelie-pick", { binSize, count, frequency });
  useEffect(() => { window.scrollTo(0, 0); }, [submitted, view]);

  return (
    <Layout>
      {submitted ? (
        <BinConfirmation kind="wheelie bin" suburb={submitted.suburb} />
      ) : (
        <>
          <div style={{ display: view === "A" ? "block" : "none" }}>
            <WheeliePicker load={load} setLoad={setLoad} binSize={binSize} setBinSize={setBinSize} count={count} setCount={setCount} frequency={frequency} setFrequency={setFrequency} onGetQuotes={() => step.push("details")} />
          </div>
          <div style={{ display: view === "B" ? "block" : "none" }}>
            <WheelieQuoteForm binSize={binSize} count={count} frequency={frequency} load={load} onSubmitted={setSubmitted} onBack={step.clear} />
          </div>
        </>
      )}
    </Layout>
  );
}
