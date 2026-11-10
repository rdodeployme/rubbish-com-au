import { Link } from "react-router-dom";

export default function BinConfirmation({ kind = "bin", suburb }) {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-10">
      <div className="rounded-[28px] bg-gold p-7 md:p-10">
        <h2 className="font-heading font-extrabold text-[40px] text-black leading-[1.05]">You're on the waitlist.</h2>
        <p className="mt-3 text-black text-[15px] md:text-[17px] leading-relaxed">
          {`We've saved your ${kind} request for ${suburb}. ${kind[0].toUpperCase() + kind.slice(1)} bookings aren't open yet. When they open in your area, we'll contact you on the email or mobile you gave us.`}
        </p>
        <p className="mt-2 text-black text-[15px] leading-relaxed">Nothing is booked and you don't owe anything.</p>
        <div className="mt-6 flex flex-col md:flex-row gap-3">
          <Link to="/post-pickup" className="flex items-center justify-center md:px-8 rounded-full bg-black text-white py-3.5 font-heading font-extrabold text-sm min-h-[48px]">
            Need it gone sooner? Post a pick up
          </Link>
          <Link to="/" className="flex items-center justify-center md:px-8 rounded-full border border-black text-black py-3.5 font-heading font-extrabold text-sm min-h-[48px]">
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
}
