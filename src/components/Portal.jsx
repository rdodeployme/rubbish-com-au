import { createPortal } from "react-dom";

// Renders pop-ups at the end of <body>, so a sticky panel or the site header
// can never sit on top of them.
export default function Portal({ children }) {
  if (typeof document === "undefined") return children;
  return createPortal(children, document.body);
}
