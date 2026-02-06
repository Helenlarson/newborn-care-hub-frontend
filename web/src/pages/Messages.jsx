// src/pages/Messages.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiInbox } from "../api/messages";
import { useAuth } from "../context/AuthContext";

function isProviderRole(role) {
  return role === "provider" || role === "professional";
}

export default function Messages() {
  const { role, user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const myProfessionalId = useMemo(() => {
    return user?.professional_profile?.id || user?.profile?.id || null;
  }, [user]);

  // ===== STYLE (mesma paleta/padrão) =====
  const COLORS = useMemo(
    () => ({
      pageLeft: "#F2C9A9",
      pageMid: "#F7E6D6",
      pageRight: "#BFE3CF",
      card: "#FBF6EE",
      border: "rgba(40, 30, 25, 0.12)",
      text: "#1F2937",
      muted: "rgba(31,41,55,0.62)",
      terracotta: "#B97A63",
      terracottaHover: "#A76652",
      inputBg: "#F6EFE6",
      white: "#FFFFFF",
    }),
    []
  );

  const page = {
    minHeight: "100vh",
    padding: "34px 16px 60px",
    background: `linear-gradient(90deg, ${COLORS.pageLeft} 0%, ${COLORS.pageMid} 45%, ${COLORS.pageRight} 100%)`,
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
    color: COLORS.text,
  };

  const container = { maxWidth: 980, margin: "0 auto" };

  const card = {
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 18,
    boxShadow: "0 18px 50px rgba(0,0,0,0.10)",
    padding: 18,
  };

  const badge = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(185,122,99,0.12)",
    border: "1px solid rgba(185,122,99,0.30)",
    fontSize: 12,
    fontWeight: 900,
  };

  const subtleHr = {
    height: 1,
    border: "none",
    background: "rgba(0,0,0,0.06)",
    margin: "14px 0",
  };

  const convoCard = {
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 14,
    background: "rgba(255,255,255,0.65)",
    padding: 14,
    textDecoration: "none",
    color: COLORS.text,
    boxShadow: "0 10px 22px rgba(0,0,0,0.06)",
    display: "block",
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiInbox(role);
        const list = data?.results || data || [];
        setItems(list);

        // salva professional_id (pra telas que precisem)
        for (const c of list) {
          const convId = Number(c.id || c.conversation_id);
          if (!convId) continue;

          const pid =
            (typeof c.professional === "number" ? c.professional : null) ||
            c.professional_id ||
            null;

          if (pid) localStorage.setItem(`conv_prof_${convId}`, String(pid));
        }
      } catch (err) {
        setError(err?.response?.data?.detail || "Unable to load messages.");
      } finally {
        setLoading(false);
      }
    })();
  }, [role]);

  return (
    <div style={page}>
      <div style={container}>
        <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={badge}>💬 Messages</span>
        </div>

        <div style={card}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, letterSpacing: "-0.2px" }}>Messages</h2>
          <div style={{ marginTop: 6, color: COLORS.muted, fontWeight: 800, fontSize: 13 }}>
            Open conversations with your connections.
          </div>

          <hr style={subtleHr} />

          {loading && <div style={{ color: COLORS.muted, fontWeight: 900 }}>Loading...</div>}
          {error && <div style={{ color: "crimson", fontWeight: 900 }}>{error}</div>}

          <div style={{ display: "grid", gap: 12 }}>
            {items.map((c) => {
              const convId = Number(c.id || c.conversation_id);

              const pid =
                (typeof c.professional === "number" ? c.professional : null) ||
                c.professional_id ||
                Number(localStorage.getItem(`conv_prof_${convId}`) || 0) ||
                (isProviderRole(role) ? myProfessionalId : null) ||
                null;

              const title = isProviderRole(role)
                ? (c.family_name || "Family")
                : (c.professional_name || "Professional");

              const last = c?.last_message || "";

              return (
                <Link
                  key={convId}
                  to={`/conversations/${convId}`}
                  state={{ professional_id: pid }}
                  style={convoCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "rgba(185,122,99,0.35)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)";
                    e.currentTarget.style.transform = "translateY(0px)";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ fontWeight: 900 }}>{title}</div>
                    <div style={{ fontSize: 12, color: COLORS.muted, fontWeight: 800 }}>#{convId}</div>
                  </div>

                  {last ? (
                    <div style={{ opacity: 0.9, marginTop: 8, lineHeight: 1.5 }}>
                      {last}
                    </div>
                  ) : (
                    <div style={{ color: COLORS.muted, marginTop: 8, fontWeight: 800 }}>
                      No messages yet.
                    </div>
                  )}
                </Link>
              );
            })}

            {!loading && items.length === 0 && (
              <div style={{ color: COLORS.muted, fontWeight: 800 }}>
                No conversations yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
