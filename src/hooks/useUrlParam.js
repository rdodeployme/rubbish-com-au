import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

// Keeps one bit of page state (a step, an open pick up) in the address, so browser
// Back and Forward move between them and a refresh lands in the same place.
export function useUrlParam(name) {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const value = params.get(name) || "";

  const withValue = (v) => {
    const next = new URLSearchParams(params);
    if (v) next.set(name, v); else next.delete(name);
    return next;
  };

  // Adds a history entry, so Back returns to the previous state.
  const push = (v) => setParams(withValue(v), { state: { pushedBy: name } });
  // Changes the address without adding a history entry.
  const replace = (v) => setParams(withValue(v), { replace: true, state: location.state });
  // Goes back if we added the entry, otherwise just clears the value.
  const clear = () => {
    if (location.state?.pushedBy === name) navigate(-1);
    else replace("");
  };

  return { value, push, replace, clear };
}
