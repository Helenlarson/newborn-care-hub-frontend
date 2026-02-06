// src/pages/Conversation.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { apiConversationMessages, apiSendMessage } from "../api/messages";

function fmtDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function Conversation() {
  const { conversationId } = useParams();
  const location = useLocation();
  const nav = useNavigate();

  const convIdNum = useMemo(() => Number(conversationId), [conversationId]);

  const professionalId = useMemo(() => {
    const fromState =
      location.state?.professional_id ?? location.state?.professionalId ?? null;

    const fromStorage =
      convIdNum
        ? Number(localStorage.getItem(`conv_prof_${convIdNum}`) || 0) || null
        : null;

    return fromState || fromStorage || null;
  }, [location.state, convIdNum]);

  const [msgs, setMsgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const listRef = useRef(null);

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

  const textarea = {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.10)",
    background: COLORS.inputBg,
    outline: "none",
    fontSize: 14,
    minHeight: 96,
    resize: "vertical",
  };

  const primaryBtn = (enabled = true) => ({
    padding: "12px 14px",
    borderRadius: 12,
    border: "none",
    background: enabled ? COLORS.terracotta : "rgba(185,122,99,0.45)",
    color: "white",
    fontWeight: 900,
    fontSize: 14,
    cursor: enabled ? "pointer" : "not-allowed",
    boxShadow: enabled ? "0 12px 26px rgba(185,122,99,0.28)" : "none",
    minWidth: 140,
  });

  const ghostBtn = {
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(185,122,99,0.55)",
    background: "rgba(255,255,255,0.55)",
    color: COLORS.terracotta,
    fontWeight: 900,
    fontSize: 14,
    cursor: "pointer",
    minWidth: 140,
  };

  const bubbleMine = {
    maxWidth: "78%",
    padding: "12px 12px",
    borderRadius: 16,
    border: "1px solid rgba(185,122,99,0.22)",
    background: "rgba(185,122,99,0.14)",
    boxShadow: "0 10px 22px rgba(0,0,0,0.06)",
  };

  const bubbleOther = {
    maxWidth: "78%",
    padding: "12px 12px",
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(255,255,255,0.70)",
    boxShadow: "0 10px 22px rgba(0,0,0,0.06)",
  };

  const load = useCallback(async () => {
    if (!convIdNum) {
      setError("ID of conversation is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await apiConversationMessages(convIdNum);
      const list = data?.results || data || [];
      setMsgs(Array.isArray(list) ? list : []);

      // scroll final
      setTimeout(() => {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
      }, 0);
    } catch (err) {
      const data = err?.response?.data;
      setError(
        data?.detail ||
          (data ? JSON.stringify(data, null, 2) : "Unable to load messages.")
      );
    } finally {
      setLoading(false);
    }
  }, [convIdNum]);

  useEffect(() => {
    load();
  }, [load]);

  const send = useCallback(
    async (e) => {
      e.preventDefault();
      if (!convIdNum) return;

      const text = body.trim();
      if (!text) return;

      setSending(true);
      try {
        await apiSendMessage({
          conversation_id: convIdNum,
          message: text,
          body: text,
          ...(professionalId ? { professional_id: Number(professionalId) } : {}),
        });

        if (professionalId) {
          localStorage.setItem(`conv_prof_${convIdNum}`, String(professionalId));
        }

        setBody("");
        await load();
      } catch (err) {
        const data = err?.response?.data;
        alert(data?.detail || (data ? JSON.stringify(data, null, 2) : "Unable to send."));
      } finally {
        setSending(false);
      }
    },
    [body, convIdNum, professionalId, load]
  );

  function renderSender(m) {
    const name = m?.sender_name || "User";
    if (m?.sender_professional_id) {
      return <Link to={`/professionals/${m.sender_professional_id}`}>{name}</Link>;
    }
    return <span>{name}</span>;
  }

  // Heurística simples: se tem sender_professional_id => é do profissional
  // (Você pode melhorar depois com user.id/email, mas isso NÃO quebra)
  function isMine(m) {
    // se quem está logado é family e a msg NÃO tem sender_professional_id, provavelmente é minha
    // se quem está logado é provider e a msg tem sender_professional_id, provavelmente é minha
    // (fallback visual, não afeta backend)
    const hasProf = !!m?.sender_professional_id;
    // se veio um professionalId e bate com sender_professional_id, é "mine" quando for provider
    if (professionalId && hasProf) return Number(m.sender_professional_id) === Number(professionalId);
    return !hasProf; // default: family msgs à direita
  }

  return (
    <div style={page}>
      <div style={container}>
        <div
          style={{
            marginBottom: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <span style={badge}>💬 Conversation</span>

          <button
            type="button"
            style={ghostBtn}
            onClick={() => nav(-1)}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.80)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.55)")}
          >
            ← Back to Messages
          </button>
        </div>

        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, letterSpacing: "-0.2px" }}>
                Conversa #{conversationId}
              </h2>
              <div style={{ marginTop: 6, color: COLORS.muted, fontWeight: 800, fontSize: 13 }}>
                {professionalId ? `professional_id: ${professionalId}` : " "}
              </div>
            </div>

            <div style={{ alignSelf: "center", color: COLORS.muted, fontWeight: 800, fontSize: 13 }}>
              {msgs.length} messages
            </div>
          </div>

          <hr style={subtleHr} />

          {loading && <div style={{ color: COLORS.muted, fontWeight: 900 }}>Loading...</div>}
          {error && (
            <pre style={{ color: "crimson", whiteSpace: "pre-wrap", marginTop: 12, fontWeight: 900 }}>
              {error}
            </pre>
          )}

          {!loading && !error && (
            <div
              ref={listRef}
              style={{
                display: "grid",
                gap: 12,
                maxHeight: 520,
                overflow: "auto",
                paddingRight: 6,
              }}
            >
              {msgs.map((m, idx) => {
                const mine = isMine(m);
                const when = fmtDate(m.created_at || "");
                const text = m.body || m.message || "";

                return (
                  <div
                    key={m.id ?? `${m.created_at ?? "msg"}-${idx}`}
                    style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}
                  >
                    <div style={mine ? bubbleMine : bubbleOther}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ fontSize: 12, fontWeight: 900, color: mine ? COLORS.terracotta : COLORS.text }}>
                          {renderSender(m)}
                        </div>
                        <div style={{ fontSize: 11, color: COLORS.muted, fontWeight: 800 }}>
                          {when}
                        </div>
                      </div>

                      <div style={{ marginTop: 8, fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                        {text}
                      </div>
                    </div>
                  </div>
                );
              })}

              {msgs.length === 0 && <div style={{ color: COLORS.muted, fontWeight: 800 }}>No messages yet.</div>}
            </div>
          )}

          <hr style={subtleHr} />

          <form onSubmit={send} style={{ display: "grid", gap: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 900, marginBottom: -4 }}>Message</div>

            <textarea
              rows={3}
              placeholder="Type your message..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={textarea}
            />

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", flexWrap: "wrap" }}>
              <button
                type="button"
                style={ghostBtn}
                onClick={() => setBody("")}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.80)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.55)")}
              >
                Clear
              </button>

              <button
                disabled={sending || !body.trim() || !convIdNum}
                type="submit"
                style={primaryBtn(!sending && !!body.trim() && !!convIdNum)}
                onMouseEnter={(e) => {
                  if (!sending && body.trim() && convIdNum) e.currentTarget.style.background = COLORS.terracottaHover;
                }}
                onMouseLeave={(e) => {
                  if (!sending && body.trim() && convIdNum) e.currentTarget.style.background = COLORS.terracotta;
                }}
              >
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
