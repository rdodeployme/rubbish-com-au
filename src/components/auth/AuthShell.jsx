import Layout from "@/components/layout/Layout";

export default function AuthShell({ title, subtitle, footer, children }) {
  return (
    <Layout>
      <div className="bg-concrete">
        <div className="mx-auto max-w-site px-4 md:px-8 py-8 md:py-16">
          <div className="mx-auto max-w-[480px] rounded-[28px] bg-white p-6 md:p-8">
            <h1 className="font-heading font-extrabold text-[28px] leading-tight text-black">{title}</h1>
            {subtitle && <p className="mt-2 text-[15px] text-mute">{subtitle}</p>}
            <div className="mt-6">{children}</div>
            {footer && <p className="mt-6 text-center text-[14px] text-mute">{footer}</p>}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const authInput =
  "w-full h-[52px] rounded-[14px] border-[1.5px] border-line bg-white pl-10 pr-4 text-base text-black placeholder:text-mute focus:outline-none focus:border-black";
export const authLabel = "block font-heading font-extrabold text-[15px] text-black";
export const authButton =
  "w-full inline-flex items-center justify-center min-h-[48px] rounded-full bg-black text-white font-heading font-extrabold text-sm hover:bg-asphalt disabled:opacity-60";
export const authLink = "inline-flex items-center min-h-[44px] text-black font-bold underline underline-offset-2";

export function ErrorBox({ children }) {
  if (!children) return null;
  return <div className="mb-4 p-3 rounded-xl bg-[#B42318]/10 text-danger text-sm font-bold" role="alert">{children}</div>;
}
