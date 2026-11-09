import { Link } from "react-router-dom";

export default function Confirmation({ name, suburb }) {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-10">
      <div className="rounded-[28px] bg-gold p-7 md:p-10">
        <h2 className="font-heading font-extrabold text-[40px] text-black leading-[1.05]">You're on the list.</h2>
        <p className="mt-3 text-black text-[15px] md:text-[17px] leading-relaxed">
          Thanks {name}. We're signing up collectors near {suburb} now, and we'll
          email you as soon as your job can go out for quotes.
        </p>
        <Link to="/" className="mt-6 flex items-center justify-center w-full md:w-auto md:inline-flex md:px-10 rounded-full bg-black text-white py-3.5 font-heading font-extrabold text-sm min-h-[48px]">
          Back home
        </Link>
      </div>
    </div>
  );
}
