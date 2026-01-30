import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

export default function ProviderDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { role, user } = useAuth();

  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // review (novo formato: rating + comment)
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [savingReview, setSavingReview] = useState(false);

  // message (iniciar conversa)
  const [firstMessage, setFirstMessage] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  const providerIdNum = useMemo(() => Number(id), [id]);

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
          (data ? JSON.stringify(data, null, 2) : "Não foi possível carregar o profissional.")
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
          (data ? JSON.stringify(data, null, 2) : "Não foi possível enviar o review.")
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
      // dados do familiar (fallbacks para formatos possíveis)
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
        message: msg, // <- obrigatório no seu backend
      });

      const convId = getConversationId(resp);

      if (convId) {
        // salva vínculo: conversation -> professional
        localStorage.setItem(`conv_prof_${convId}`, String(providerIdNum));

        // navega já levando o professional_id no state
        nav(`/conversations/${convId}`, { state: { professional_id: providerIdNum } });
      } else {
        alert("Mensagem enviada, mas não veio conversation_id na resposta.");
      }
    } catch (err) {
      const data = err?.response?.data;
      alert(
        data?.detail ||
          (data ? JSON.stringify(data, null, 2) : "Não foi possível iniciar a conversa.")
      );
    } finally {
      setSendingMsg(false);
    }
  }

  if (loading) return <div style={{ padding: 16 }}>Carregando...</div>;
  if (error) return <div style={{ padding: 16, color: "crimson", whiteSpace: "pre-wrap" }}>{error}</div>;
  if (!provider) return null;

  const name = pickFirst(provider, ["display_name", "full_name"], "Profissional");
  const title = pickFirst(provider, ["headline", "role_title"], "");
  const bio = pickFirst(provider, ["bio"], "");
  const city = pickFirst(provider, ["city", "location_city"], "");
  const state = pickFirst(provider, ["state", "location_state"], "");
  const zipcode = pickFirst(provider, ["zipcode"], "");
  const photo = pickFirst(provider, ["photo"], "");
  const services = formatServices(provider);

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        {photo ? (
          <img
            src={photo}
            alt="Foto do profissional"
            style={{
              width: 72,
              height: 72,
              borderRadius: 999,
              objectFit: "cover",
              border: "1px solid #eee",
            }}
          />
        ) : (
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 999,
              border: "1px solid #eee",
              display: "grid",
              placeItems: "center",
              opacity: 0.6,
            }}
          >
            sem foto
          </div>
        )}

        <div>
          <h2 style={{ margin: 0 }}>{name}</h2>
          {title && <div style={{ opacity: 0.8, marginTop: 4 }}>{title}</div>}
          <div style={{ fontSize: 13, opacity: 0.7, marginTop: 6 }}>
            {[city, state, zipcode].filter(Boolean).join(" • ")}
          </div>
          {services && (
            <div style={{ fontSize: 13, marginTop: 6 }}>
              <strong>Serviços:</strong> {services}
            </div>
          )}
        </div>
      </div>

      {bio && <p style={{ marginTop: 12 }}>{bio}</p>}

      <hr style={{ margin: "24px 0" }} />

      <h3>Reviews</h3>
      <div style={{ display: "grid", gap: 12 }}>
        {reviews.map((r) => (
          <div
            key={r.id}
            style={{ border: "1px solid #eee", padding: 12, borderRadius: 8 }}
          >
            <div style={{ fontSize: 13, opacity: 0.7 }}>
              Nota: {r.rating ?? "-"} • {r.created_at || ""}
            </div>
            <div style={{ marginTop: 6, opacity: 0.95 }}>
              {r.comment || r.body || ""}
            </div>
          </div>
        ))}
        {reviews.length === 0 && <div>Nenhum review ainda.</div>}
      </div>

      {role === "family" && (
        <>
          <hr style={{ margin: "24px 0" }} />

          <h3>Adicionar review</h3>
          <form
            onSubmit={submitReview}
            style={{ display: "grid", gap: 10, maxWidth: 520 }}
          >
            <label style={{ display: "grid", gap: 6 }}>
              Nota (1 a 5):
              <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                <option value={5}>5</option>
                <option value={4}>4</option>
                <option value={3}>3</option>
                <option value={2}>2</option>
                <option value={1}>1</option>
              </select>
            </label>

            <textarea
              placeholder="Escreva sua avaliação..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />

            <button disabled={savingReview || !comment.trim()} type="submit">
              {savingReview ? "Enviando..." : "Enviar review"}
            </button>
          </form>

          <hr style={{ margin: "24px 0" }} />

          <h3>Iniciar conversa</h3>
          <form
            onSubmit={startConversation}
            style={{ display: "grid", gap: 10, maxWidth: 520 }}
          >
            <textarea
              placeholder="Escreva sua primeira mensagem..."
              value={firstMessage}
              onChange={(e) => setFirstMessage(e.target.value)}
              rows={3}
            />

            <button disabled={sendingMsg || !firstMessage.trim()} type="submit">
              {sendingMsg ? "Enviando..." : "Enviar mensagem"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}