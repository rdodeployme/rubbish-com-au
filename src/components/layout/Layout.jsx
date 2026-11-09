import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

export default function Layout({ children, footer = true }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-gold focus:text-black focus:px-4 focus:py-3 focus:rounded-full font-heading font-extrabold">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1">{children}</main>
      {footer && <SiteFooter />}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="px-4 py-16 flex items-center justify-center" role="status" aria-label="Loading">
      <div className="w-7 h-7 border-4 border-line border-t-black rounded-full animate-spin"></div>
    </div>
  );
}

export function PageHero({ title, children }) {
  return (
    <section className="bg-black">
      <div className="mx-auto max-w-site px-4 md:px-8 pt-8 pb-9 md:pt-12 md:pb-12">
        <h1 className="font-heading font-extrabold text-white text-[36px] md:text-[52px] leading-[1.05]">{title}</h1>
        {children && <div className="mt-3 max-w-[680px] text-white/70 text-[15px] md:text-[17px] leading-relaxed">{children}</div>}
      </div>
    </section>
  );
}
