import { useEffect, useState } from "react";
import { VEHICLES } from "@/lib/loadModel";
import { Link } from "react-router-dom";
import Layout, { Spinner } from "@/components/layout/Layout";
import { useLoad } from "@/lib/loadModel";
import { usePostingLive } from "@/hooks/usePostingLive";
import { useAuth } from "@/lib/auth";
import LoadEstimator from "@/components/postpickup/LoadEstimator";
import PickupForm from "@/components/postpickup/PickupForm";
import Confirmation from "@/components/postpickup/Confirmation";
import PostedConfirmation from "@/components/postpickup/PostedConfirmation";

export default function PostPickup() {
  const { load, setLoad, hydrated } = useLoad();
  const { live, loading: loadingLive } = usePostingLive();
  const { user, loading: loadingUser } = useAuth();
  const [view, setView] = useState("form");
  const [loadVersion, setLoadVersion] = useState(0);
  const [submitted, setSubmitted] = useState(null);
  const [posted, setPosted] = useState(false);

  useEffect(() => { if (posted || submitted) window.scrollTo(0, 0); }, [posted, submitted]);

  // Fetch the vehicle pictures early so the loader is not empty on a slow phone connection.
  useEffect(() => {
    Object.values(VEHICLES).forEach((v) => { [v.image, v.overlay].forEach((src) => { const i = new Image(); i.src = src; }); });
  }, []);

  const openLoader = () => { setView("loader"); window.scrollTo(0, 0); };
  const closeLoader = () => { setLoadVersion((v) => v + 1); setView("form"); window.scrollTo(0, 0); };

  if (loadingLive || !hydrated || loadingUser) {
    return <Layout><Spinner /></Layout>;
  }

  if (live && !user) {
    return (
      <Layout>
        <div className="mx-auto max-w-[560px] px-4 py-10 md:py-16">
          <div className="rounded-[28px] bg-white border border-line p-6 md:p-8">
            <h1 className="font-heading font-extrabold text-[28px] md:text-[32px] text-black leading-tight">Sign in to post your pick up</h1>
            <p className="mt-2 text-mute text-[15px]">It takes a minute, and you will see your quotes in one place.</p>
            <div className="mt-6 space-y-3">
              <Link to={`/login?returnTo=${encodeURIComponent("/post-pickup")}`} className="flex items-center justify-center w-full rounded-full bg-black text-white py-3.5 font-heading font-extrabold text-sm min-h-[48px]">
                Sign in
              </Link>
              <Link to={`/register?returnTo=${encodeURIComponent("/post-pickup")}`} className="flex items-center justify-center w-full rounded-full border border-black text-black py-3.5 font-heading font-extrabold text-sm min-h-[48px]">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const done = live ? posted : submitted;
  return (
    <Layout>
      {done ? (
        live ? <PostedConfirmation /> : <Confirmation name={submitted.name} suburb={submitted.suburb} />
      ) : (
        <>
          {view === "loader" && <LoadEstimator load={load} setLoad={setLoad} onDone={closeLoader} />}
          <div className={view === "loader" ? "hidden" : ""}>
            <PickupForm
              load={load}
              loadVersion={loadVersion}
              onOpenLoader={openLoader}
              onSubmitted={setSubmitted}
              onPosted={() => setPosted(true)}
              mode={live ? "live" : "waitlist"}
              userEmail={user?.email ? user.email.toLowerCase().trim() : ""}
            />
          </div>
        </>
      )}
    </Layout>
  );
}
