import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { base44 } from "@/api/base44";

const AuthContext = createContext(null);

function hasStoredToken() {
  try {
    return Boolean(window.localStorage.getItem("base44_access_token"));
  } catch {
    return false;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!hasStoredToken()) {
      setUser(null);
      setLoading(false);
      return null;
    }
    setLoading(true);
    try {
      const me = await base44.auth.me();
      setUser(me);
      return me;
    } catch {
      // Expired or invalid token: treat as signed out.
      clearTokens();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Sign out here rather than with base44.auth.logout(), which redirects to a
  // logout address on the Base44 app's own domain.
  const signOut = useCallback(() => {
    clearTokens();
    setUser(null);
    window.location.href = import.meta.env.BASE_URL;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function clearTokens() {
  try {
    window.localStorage.removeItem("base44_access_token");
    window.localStorage.removeItem("token");
  } catch {
    // storage blocked: nothing to clear
  }
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export function userEmail(user) {
  return (user?.email || "").toLowerCase().trim();
}
