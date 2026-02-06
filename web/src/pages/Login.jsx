import { useState } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { apiLogin } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, reloadMe } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please enter your email and password.");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await apiLogin({ email, password });

      const payload = {
        access: res?.access ?? res?.tokens?.access ?? res?.data?.access,
        refresh: res?.refresh ?? res?.tokens?.refresh ?? res?.data?.refresh,
        user: res?.user ?? res?.data?.user,
      };

      if (!payload.access) {
        throw new Error("Login succeeded but no access token was returned.");
      }

      login(payload);

      if (!payload.user) {
        await reloadMe();
      }

      const redirectTo = location.state?.from?.pathname || "/professionals";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please check your credentials.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  // =========================
  // STYLE (match Signup + mock)
  // =========================
  const COLORS = {
    pageLeft: "#F2C9A9",
    pageMid: "#F7E6D6",
    pageRight: "#BFE3CF",
    card: "#FBF6EE",
    border: "rgba(40, 30, 25, 0.12)",
    text: "#2B2B2B",
    muted: "rgba(43, 43, 43, 0.62)",
    terracotta: "#B97A63",
    inputBlue: "#E9F1FF",
  };

  const page = {
    minHeight: "100vh",
    padding: "42px 16px",
    background: `linear-gradient(90deg, ${COLORS.pageLeft} 0%, ${COLORS.pageMid} 45%, ${COLORS.pageRight} 100%)`,
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
    color: COLORS.text,
  };

  const shell = {
    maxWidth: 920,
    margin: "0 auto",
    display: "grid",
    placeItems: "center",
    minHeight: "calc(100vh - 84px)", // keeps it centered visually
  };

  const card = {
    width: "100%",
    maxWidth: 440, // card smaller like the mock
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 18,
    boxShadow: "0 18px 50px rgba(0,0,0,0.12)",
    padding: "26px 26px 22px",
  };

  const heart = {
    width: 34,
    height: 34,
    borderRadius: 999,
    margin: "0 auto 10px",
    display: "grid",
    placeItems: "center",
    background: "rgba(0,0,0,0.04)",
    border: "1px solid rgba(0,0,0,0.06)",
    color: "rgba(0,0,0,0.35)",
    fontSize: 16,
  };

  const title = {
    fontSize: 22,
    fontWeight: 800,
    textAlign: "center",
    margin: "0 0 6px 0",
  };

  const subtitle = {
    textAlign: "center",
    margin: "0 0 18px 0",
    color: COLORS.muted,
    fontSize: 13,
  };

  const label = {
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 6,
  };

  const input = {
    width: "100%",
    padding: "11px 12px",
    borderRadius: 10,
    border: `1px solid ${COLORS.border}`,
    background: COLORS.inputBlue,
    outline: "none",
    fontSize: 14,
  };

  const button = {
    width: "100%",
    marginTop: 14,
    padding: "12px 14px",
    borderRadius: 12,
    border: "none",
    background: COLORS.terracotta,
    color: "white",
    fontWeight: 800,
    fontSize: 14,
    cursor: isSubmitting ? "not-allowed" : "pointer",
    opacity: isSubmitting ? 0.8 : 1,
    boxShadow: "0 12px 26px rgba(185,122,99,0.28)",
  };

  const linkRow = {
    textAlign: "center",
    marginTop: 12,
    fontSize: 13,
    color: COLORS.muted,
  };

  const linkAccent = {
    color: COLORS.terracotta,
    fontWeight: 800,
    textDecoration: "none",
  };

  const error = {
    marginTop: 10,
    color: "crimson",
    fontSize: 13,
    fontWeight: 700,
  };

  return (
    <div style={page}>
      <div style={shell}>
        <div style={card}>
          <div style={heart}>♡</div>

          <h1 style={title}>Sign In to Newborn Care Hub</h1>
          <p style={subtitle}>Access your account to continue</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <div style={label}>Email</div>
              <input
                style={input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={label}>Password</div>
              <input
                style={input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {errorMsg ? <div style={error}>{errorMsg}</div> : null}

            {/* Keep commented for future use */}
            {/*
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <label style={{ fontSize: 13, color: COLORS.muted }}>
                <input type="checkbox" style={{ marginRight: 8 }} />
                Remember me
              </label>

              <a href="#" style={{ ...linkAccent, fontWeight: 700 }}>
                Forgot password
              </a>
            </div>
            */}

            <button type="submit" style={button} disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>

            <div style={linkRow}>
              Don&apos;t have an account?{" "}
              <RouterLink to="/signup?role=family" style={linkAccent}>
                Sign up here
              </RouterLink>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
