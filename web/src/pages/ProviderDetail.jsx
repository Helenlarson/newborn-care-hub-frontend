// src/pages/ProviderDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link as RouterLink } from "react-router-dom";
import { apiGetProvider, apiListProviderReviews } from "../api/providers";
import { apiCreateReview } from "../api/reviews";
import { apiSendMessage } from "../api/messages";
import { useAuth } from "../context/AuthContext";

function getConversationId(resp) {
  return resp?.conversation_id || resp?.conversation?.id || resp?.conversation || null;
}

function pickFirst(obj, keys, fallback = "") {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return fallback;
}

function formatServices(p) {
  const st = p?.service_types || p?.services_offered || [];
  if (!Array.isArray(st)) return "";
  if (st.length && typeof st[0] === "object") {
    return st.map((x) => x.name || x.title).filter(Boolean).join(", ");
  }
  return st.join(", ");
}

function initials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const a = parts[0]?.[0] || "";
  const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
  const out = (a + b).toUpperCase();
  return out || "👤";
}

export default function ProviderDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { role, user } = useAuth();

  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // review
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [savingReview, setSavingReview] = useState(false);

  // message
  const [firstMessage, setFirstMessage] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  const providerIdNum = useMemo(() => Number(id), [id]);

  // =========================
  // STYLE (same palette as others)
  // =========================
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

  const container = { maxWidth: 1100, margin: "0 auto" };

  const card = {
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 18,
    boxShadow: "0 18px 50px rgba(0,0,0,0.10)",
    padding: 18,
  };

  const subtleHr = {
    height: 1,
    border: "none",
    background: "rgba(0,0,0,0.06)",
    margin: "14px 0",
  };

  const sectionTitle = {
    margin: 0,
    fontSize: 14,
    fontWeight: 900,
    letterSpacing: "0.2px",
  };

  const label = { fontSize: 12, fontWeight: 900, marginBottom: 6 };

  const input = {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.10)",
    background: COLORS.inputBg,
    outline: "none",
    fontSize: 14,
  };

  const textarea = { ...input, minHeight: 110, resize: "vertical" };
  const select = { ...input, appearance: "none" };

  const primaryBtn = (enabled = true) => ({
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "none",
    background: enabled ? COLORS.terracotta : "rgba(185,122,99,0.45)",
    color: "white",
    fontWeight: 900,
    fontSize: 14,
    cursor: enabled ? "pointer" : "not-allowed",
    boxShadow: enabled ? "0 12px 26px rgba(185,122,99,0.28)" : "none",
  });

  const ghostBtn = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(185,122,99,0.55)",
    background: "rgba(255,255,255,0.55)",
    color: COLORS.terracotta,
    fontWeight: 900,
    fontSize: 14,
    cursor: "pointer",
  };

  const pill = {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.10)",
    background: COLORS.white,
    fontSize: 12,
    fontWeight: 800,
    color: "rgba(31,41,55,0.78)",
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

  const reviewCard = {
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 14,
    background: "rgba(255,255,255,0.60)",
    padding: 12,
  };

  // responsive layout (no CSS file)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const grid = isMobile
    ? { display: "grid", gridTemplateColumns: "1fr", gap: 18, alignItems: "start" }
    : { display: "grid", gridTemplateColumns: "1.35fr 0.85fr", gap: 18, alignItems: "start" };

  async function load() {
    setLoading(true);
    setError("");

    try {
      const data = await apiGetProvider(id);
      setProvider(data);

      const r = await apiListProviderReviews(id);
      setReviews(r?.results || r || []);
    } catch (err) {
      const data = err?.response?.data;
      setError(
        data?.detail ||
          (data ? JSON.stringify(data, null, 2) : "Unable to load provider details.")
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function submitReview(e) {
    e.preventDefault();

    const text = comment.trim();
    if (!text) return;

    setSavingReview(true);
    try {
      await apiCreateReview({
        professional_id: providerIdNum,
        rating: Number(rating),
        comment: text,
      });

      setRating(5);
      setComment("");
      await load();
    } catch (err) {
      const data = err?.response?.data;
      alert(
        data?.detail ||
          (data ? JSON.stringify(data, null, 2) : "Unable to send review.")
      );
    } finally {
      setSavingReview(false);
    }
  }

  async function startConversation(e) {
    e.preventDefault();

    const msg = firstMessage.trim();
    if (!msg) return;

    setSendingMsg(true);

    try {
      const familyName =
        user?.display_name ||
        user?.full_name ||
        user?.name ||
        user?.profile?.display_name ||
        user?.profile?.full_name ||
        user?.family_profile?.display_name ||
        user?.family_profile?.full_name ||
        "Family";

      const familyEmail = user?.email || user?.user?.email || "";

      const familyCity =
        user?.city ||
        user?.profile?.city ||
        user?.family_profile?.city ||
        user?.location_city ||
        user?.profile?.location_city ||
        "";

      const familyZipcode =
        user?.zipcode ||
        user?.profile?.zipcode ||
        user?.family_profile?.zipcode ||
        "";

      const resp = await apiSendMessage({
        professional_id: providerIdNum,
        family_name: familyName,
        family_email: familyEmail,
        family_city: familyCity,
        family_zipcode: familyZipcode,
        message: msg,
      });

      const convId = getConversationId(resp);

      if (convId) {
        localStorage.setItem(`conv_prof_${convId}`, String(providerIdNum));
        nav(`/conversations/${convId}`, { state: { professional_id: providerIdNum } });
      } else {
        alert("Message sent, but no conversation_id was returned in the response.");
      }
    } catch (err) {
      const data = err?.response?.data;
      alert(
        data?.detail ||
          (data ? JSON.stringify(data, null, 2) : "Unable to start the conversation.")
      );
    } finally {
      setSendingMsg(false);
    }
  }

  if (loading)
    return (
      <div style={page}>
        <div style={container}>
          <div style={{ ...card, color: COLORS.muted, fontWeight: 900 }}>Loading…</div>
        </div>
      </div>
    );

  if (error)
    return (
      <div style={page}>
        <div style={container}>
          <div style={{ ...card, color: "crimson", whiteSpace: "pre-wrap", fontWeight: 900 }}>
            {error}
          </div>
        </div>
      </div>
    );

  if (!provider) return null;

  const name = pickFirst(provider, ["display_name", "full_name"], "Professional");
  // const title = pickFirst(provider, ["headline", "role_title"], ""); // <- not shown anymore (to avoid duplication)
  const bio = pickFirst(provider, ["bio"], "");
  const city = pickFirst(provider, ["city", "location_city"], "");
  const state = pickFirst(provider, ["state", "location_state"], "");
  const zipcode = pickFirst(provider, ["zipcode"], "");
  const photo = pickFirst(provider, ["photo"], "");
  const services = formatServices(provider);

  const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);

  return (
    <div style={page}>
      <div style={container}>
        {/* top helper row */}
        <div
          style={{
            marginBottom: 12,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={badge}>🤍 Professional Profile</span>

          <RouterLink
            to="/professionals"
            style={{
              textDecoration: "none",
              fontWeight: 900,
              color: COLORS.terracotta,
              fontSize: 12,
            }}
          >
            ← Back to Professionals
          </RouterLink>
        </div>

        {/* header card */}
        <div style={card}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {photo ? (
              <img
                src={photo}
                alt="Photo of the professional"
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 999,
                  objectFit: "cover",
                  border: `1px solid ${COLORS.border}`,
                  flex: "0 0 auto",
                }}
              />
            ) : (
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 999,
                  border: `1px solid ${COLORS.border}`,
                  background: "rgba(0,0,0,0.04)",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 900,
                  color: "rgba(31,41,55,0.55)",
                  flex: "0 0 auto",
                }}
              >
                {initials(name)}
              </div>
            )}

            <div style={{ flex: 1 }}>
              {/* name only (no duplicate pill here) */}
              <h2
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 900,
                  letterSpacing: "-0.2px",
                }}
              >
                {name}
              </h2>

              <div style={{ marginTop: 6, fontSize: 13, color: COLORS.muted, fontWeight: 800 }}>
                {[city, state, zipcode].filter(Boolean).join(" • ") || "Location not provided"}
              </div>

              {/* show service pills only once (below city) */}
              {services ? (
                <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {services
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .slice(0, 10)
                    .map((s) => (
                      <span key={s} style={pill}>
                        {s}
                      </span>
                    ))}
                </div>
              ) : (
                <div style={{ marginTop: 10, fontSize: 12, color: COLORS.muted }}>
                  Services not listed yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ height: 14 }} />

        {/* main layout */}
        <div style={grid}>
          {/* LEFT: About + Reviews */}
          <div style={{ display: "grid", gap: 18 }}>
            <div style={card}>
              <p style={sectionTitle}>About</p>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: bio ? COLORS.text : COLORS.muted,
                }}
              >
                {bio || "This professional hasn’t added a bio yet."}
              </div>
            </div>

            <div style={card}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <p style={sectionTitle}>Reviews</p>
                <div style={{ fontSize: 12, color: COLORS.muted, fontWeight: 900 }}>
                  {reviews.length} total
                </div>
              </div>

              <hr style={subtleHr} />

              <div style={{ display: "grid", gap: 12 }}>
                {reviews.map((r) => {
                  const rate = Number(r.rating ?? 0);
                  const text = r.comment || r.body || "";
                  const who =
                    r.author_name ||
                    r.user_name ||
                    r.user?.display_name ||
                    r.user?.email ||
                    "Anonymous";

                  return (
                    <div key={r.id} style={reviewCard}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 10,
                        }}
                      >
                        <div style={{ fontWeight: 900, fontSize: 13 }}>{who}</div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 900,
                            color: COLORS.terracotta,
                          }}
                        >
                          {rate ? stars(rate) : "—"}
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 12,
                          color: COLORS.muted,
                          fontWeight: 800,
                        }}
                      >
                        {r.created_at || ""}
                      </div>

                      <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6 }}>
                        {text || <span style={{ color: COLORS.muted }}>No text.</span>}
                      </div>
                    </div>
                  );
                })}

                {reviews.length === 0 && (
                  <div style={{ color: COLORS.muted, fontWeight: 800 }}>
                    No reviews yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Add review + Start conversation (family only) */}
          <div style={{ display: "grid", gap: 18 }}>
            {role === "family" ? (
              <>
                <div style={card}>
                  <p style={sectionTitle}>Add review</p>
                  <hr style={subtleHr} />

                  <form onSubmit={submitReview} style={{ display: "grid", gap: 10 }}>
                    <div>
                      <div style={label}>Rating (1 to 5)</div>
                      <select
                        style={select}
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                      >
                        <option value={5}>5</option>
                        <option value={4}>4</option>
                        <option value={3}>3</option>
                        <option value={2}>2</option>
                        <option value={1}>1</option>
                      </select>
                    </div>

                    <div>
                      <div style={label}>Your review</div>
                      <textarea
                        style={textarea}
                        placeholder="Write your review..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                    </div>

                    <button
                      disabled={savingReview || !comment.trim()}
                      type="submit"
                      style={primaryBtn(!savingReview && !!comment.trim())}
                      onMouseEnter={(e) => {
                        if (!savingReview && comment.trim())
                          e.currentTarget.style.background = COLORS.terracottaHover;
                      }}
                      onMouseLeave={(e) => {
                        if (!savingReview && comment.trim())
                          e.currentTarget.style.background = COLORS.terracotta;
                      }}
                    >
                      {savingReview ? "Sending..." : "Send review"}
                    </button>
                  </form>
                </div>

                <div style={card}>
                  <p style={sectionTitle}>Start conversation</p>
                  <hr style={subtleHr} />

                  <form onSubmit={startConversation} style={{ display: "grid", gap: 10 }}>
                    <div>
                      <div style={label}>Message</div>
                      <textarea
                        style={textarea}
                        placeholder="Write your first message..."
                        value={firstMessage}
                        onChange={(e) => setFirstMessage(e.target.value)}
                      />
                    </div>

                    <button
                      disabled={sendingMsg || !firstMessage.trim()}
                      type="submit"
                      style={primaryBtn(!sendingMsg && !!firstMessage.trim())}
                      onMouseEnter={(e) => {
                        if (!sendingMsg && firstMessage.trim())
                          e.currentTarget.style.background = COLORS.terracottaHover;
                      }}
                      onMouseLeave={(e) => {
                        if (!sendingMsg && firstMessage.trim())
                          e.currentTarget.style.background = COLORS.terracotta;
                      }}
                    >
                      {sendingMsg ? "Sending..." : "Send message"}
                    </button>

                    <button type="button" style={ghostBtn} onClick={() => setFirstMessage("")}>
                      Clear message
                    </button>

                    <div
                      style={{
                        fontSize: 12,
                        color: COLORS.muted,
                        fontWeight: 800,
                        lineHeight: 1.6,
                      }}
                    >
                      Tip: Include your due date/baby age, what support you need, and your city/state.
                    </div>
                  </form>
                </div>
              </>
            ) : (
              <div style={card}>
                <p style={sectionTitle}>Contact</p>
                <div
                  style={{
                    marginTop: 10,
                    color: COLORS.muted,
                    fontWeight: 800,
                    lineHeight: 1.6,
                  }}
                >
                  Only families/clients can start a conversation and submit reviews.
                </div>
                <div style={{ marginTop: 12 }}>
                  <button type="button" style={ghostBtn} onClick={() => nav("/login")}>
                    Sign in as Family
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
