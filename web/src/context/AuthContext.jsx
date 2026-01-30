import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiMe } from "../api/auth";
import { clearTokens, getAccessToken, setTokens } from "../api/client";

const AuthContext = createContext(null);

function normalizeRole(role) {
  if (!role) return null;
  if (role === "provider") return "professional";
  return role; // "family" | "professional" (ideal)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  const [booting, setBooting] = useState(true);

  const isAuthed = !!getAccessToken();
  const role = normalizeRole(user?.role);

  async function loadMe() {
    try {
      const me = await apiMe();
      const normalized = { ...me, role: normalizeRole(me.role) };
      setUser(normalized);
      localStorage.setItem("user", JSON.stringify(normalized));
    } catch {
      // token inválido/expirado sem refresh ok
      clearTokens();
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setBooting(false);
    }
  }

  useEffect(() => {
    if (isAuthed) loadMe();
    else setBooting(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = ({ access, refresh, user }) => {
    setTokens({ access, refresh });
    const normalized = user ? { ...user, role: normalizeRole(user.role) } : null;
    setUser(normalized);
    if (normalized) localStorage.setItem("user", JSON.stringify(normalized));
  };

  const logout = () => {
    clearTokens();
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, role, isAuthed, booting, login, logout, setUser, reloadMe: loadMe }),
    [user, role, isAuthed, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}