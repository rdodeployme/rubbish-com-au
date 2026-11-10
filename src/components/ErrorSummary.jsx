import { forwardRef } from "react";

const FOCUSABLE = "input, textarea, select, button";

// One list of what needs fixing, shown above the submit button after a failed submit.
// It takes focus so screen readers read it once, and each line jumps to its field.
const ErrorSummary = forwardRef(function ErrorSummary({ errors, order, refs, id = "form-errors" }, ref) {
  const keys = order.filter((k) => errors[k]);
  if (keys.length === 0) return null;

  const jump = (k) => {
    const box = refs.current[k];
    if (!box) return;
    box.scrollIntoView({ behavior: "smooth", block: "center" });
    const target = box.matches?.(FOCUSABLE) ? box : box.querySelector(FOCUSABLE);
    target?.focus({ preventScroll: true });
  };

  return (
    <div ref={ref} id={id} tabIndex={-1} aria-labelledby={`${id}-title`} className="rounded-2xl border-2 border-danger bg-white p-4 focus:outline-none">
      <h2 id={`${id}-title`} className="font-heading font-extrabold text-[16px] text-danger">
        {keys.length === 1 ? "There is 1 thing to fix" : `There are ${keys.length} things to fix`}
      </h2>
      <ul className="mt-2 space-y-1">
        {keys.map((k) => (
          <li key={k}>
            <button type="button" onClick={() => jump(k)} className="text-left text-[14px] text-black underline underline-offset-2 min-h-[44px] py-2">
              {errors[k]}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
});

export default ErrorSummary;
