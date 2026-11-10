import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { useLoad } from "@/lib/loadModel";
import { readDraft, useSaveDraft } from "@/lib/draft";
import { useUrlParam } from "@/hooks/useUrlParam";
import SkipPicker from "@/components/bins/SkipPicker";
import SkipQuoteForm from "@/components/bins/SkipQuoteForm";
import BinConfirmation from "@/components/bins/BinConfirmation";

export default function SkipRequest() {
  const { load, setLoad } = useLoad();
  // Step 2 has its own address (?step=details), so browser Back returns to the picker.
  const step = useUrlParam("step");
  const view = step.value === "details" ? "B" : "A";
  const [submitted, setSubmitted] = useState(null);
  const [saved] = useState(() => readDraft("skip-pick") || {});
  const [binType, setBinType] = useState(saved.binType === "hook" ? "hook" : "skip");
  const [size, setSize] = useState(Number(saved.size) || 6);
  useSaveDraft("skip-pick", { binType, size });
  useEffect(() => { window.scrollTo(0, 0); }, [submitted, view]);

  return (
    <Layout>
      {submitted ? (
        <BinConfirmation kind={binType === "skip" ? "skip bin" : "hook bin"} suburb={submitted.suburb} />
      ) : (
        <>
          <div style={{ display: view === "A" ? "block" : "none" }}>
            <SkipPicker load={load} setLoad={setLoad} binType={binType} setBinType={setBinType} size={size} setSize={setSize} onGetQuotes={() => step.push("details")} />
          </div>
          <div style={{ display: view === "B" ? "block" : "none" }}>
            <SkipQuoteForm binType={binType} size={size} load={load} onSubmitted={setSubmitted} onBack={step.clear} />
          </div>
        </>
      )}
    </Layout>
  );
}
