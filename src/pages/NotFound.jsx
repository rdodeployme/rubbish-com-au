import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";

export default function NotFound() {
  return (
    <Layout>
      <div className="mx-auto max-w-[720px] px-4 py-20 text-center">
        <h1 className="font-heading font-extrabold text-[36px] text-black">Page not found</h1>
        <p className="mt-2 text-mute text-[15px]">That page does not exist.</p>
        <Link to="/" className="mt-6 inline-flex items-center rounded-full bg-black text-white px-6 min-h-[48px] font-heading font-extrabold text-sm">Back home</Link>
      </div>
    </Layout>
  );
}
