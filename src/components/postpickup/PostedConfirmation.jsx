import { Link } from "react-router-dom";

export default function PostedConfirmation() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-10">
      <div className="rounded-[28px] bg-gold p-7 md:p-10">
        <h2 className="font-heading font-extrabold text-[40px] text-black leading-[1.05]">Your pick up is posted.</h2>
        <p className="mt-3 text-black text-[15px] md:text-[17px] leading-relaxed">
          Collectors in your area can now send you up to 3 quotes. You will see them in My pick ups.
        </p>
        <div className="mt-6 flex flex-col md:flex-row gap-3">
          <Link to="/my-pickups" className="flex items-center justify-center md:px-10 rounded-full bg-black text-white py-3.5 font-heading font-extrabold text-sm min-h-[48px]">
            See my pick ups
          </Link>
          <Link to="/" className="flex items-center justify-center md:px-10 rounded-full border border-black text-black py-3.5 font-heading font-extrabold text-sm min-h-[48px]">
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
