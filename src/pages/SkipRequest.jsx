import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { useLoad } from "@/lib/loadModel";
import SkipPicker from "@/components/bins/SkipPicker";
import SkipQuoteForm from "@/components/bins/SkipQuoteForm";
import BinConfirmation from "@/components/bins/BinConfirmation";

export default function SkipRequest() {
  const { load, setLoad } = useLoad();
  const [view, setView] = useState("A");
  const [submitted, setSubmitted] = useState(null);
  const [binType, setBinType] = useState("skip");
  const [size, setSize] = useState(6);
  useEffect(() => { if (submitted) window.scrollTo(0, 0); }, [submitted]);
  const go = (v) => { setView(v); window.scrollTo(0, 0); };

  return (
    <Layout>
      {submitted ? (
        <BinConfirmation suburb={submitted.suburb} />
      ) : (
        <>
          <div style={{ display: view === "A" ? "block" : "none" }}>
            <SkipPicker load={load} setLoad={setLoad} binType={binType} setBinType={setBinType} size={size} setSize={setSize} onGetQuotes={() => go("B")} />
          </div>
          <div style={{ display: view === "B" ? "block" : "none" }}>
            <SkipQuoteForm binType={binType} size={size} load={load} onSubmitted={setSubmitted} onBack={() => go("A")} />
          </div>
        </>
      )}
    </Layout>
  );
}
