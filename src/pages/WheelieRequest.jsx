import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useLoad } from "@/lib/loadModel";
import WheeliePicker from "@/components/bins/WheeliePicker";
import WheelieQuoteForm from "@/components/bins/WheelieQuoteForm";
import BinConfirmation from "@/components/bins/BinConfirmation";

export default function WheelieRequest() {
  const { load, setLoad } = useLoad();
  const [view, setView] = useState("A");
  const [submitted, setSubmitted] = useState(null);
  const [binSize, setBinSize] = useState(240);
  const [count, setCount] = useState(4);
  const [frequency, setFrequency] = useState("Weekly");
  const go = (v) => { setView(v); window.scrollTo(0, 0); };

  return (
    <Layout>
      {submitted ? (
        <BinConfirmation suburb={submitted.suburb} />
      ) : (
        <>
          <div style={{ display: view === "A" ? "block" : "none" }}>
            <WheeliePicker load={load} setLoad={setLoad} binSize={binSize} setBinSize={setBinSize} count={count} setCount={setCount} frequency={frequency} setFrequency={setFrequency} onGetQuotes={() => go("B")} />
          </div>
          <div style={{ display: view === "B" ? "block" : "none" }}>
            <WheelieQuoteForm binSize={binSize} count={count} frequency={frequency} load={load} onSubmitted={setSubmitted} onBack={() => go("A")} />
          </div>
        </>
      )}
    </Layout>
  );
}
