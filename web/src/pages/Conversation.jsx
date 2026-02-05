import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { apiConversationMessages, apiSendMessage } from "../api/messages";

export default function Conversation() {
  const { conversationId } = useParams();
  const location = useLocation();

  const convIdNum = useMemo(() => Number(conversationId), [conversationId]);

  // Ainda aceitamos professional_id via state/storage (pode ser útil em algumas telas),
  // mas agora NÃO é obrigatório para enviar, porque responder conversa vai por /conversations/<id>/messages/
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

  const load = useCallback(async () => {
    if (!convIdNum) {
      setError("ID da conversa inválido.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await apiConversationMessages(convIdNum);
      setMsgs(data?.results || data || []);
    } catch (err) {
      const data = err?.response?.data;
      setError(
        data?.detail ||
          (data ? JSON.stringify(data, null, 2) : "Não foi possível carregar mensagens.")
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
        // Backend aceita message ou body (no view que ajustamos).
        // E apiSendMessage deve detectar conversation_id e postar em /conversations/<id>/messages/
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
        alert(data?.detail || (data ? JSON.stringify(data, null, 2) : "Não foi possível enviar."));
      } finally {
        setSending(false);
      }
    },
    [body, convIdNum, professionalId, load]
  );

  function renderSender(m) {
    const name = m?.sender_name || "Usuário";

    // Se veio sender_professional_id, é mensagem de provider → linka pro perfil
    if (m?.sender_professional_id) {
      return <Link to={`/professionals/${m.sender_professional_id}`}>{name}</Link>;
    }
    return <span>{name}</span>;
  }

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <h2>Conversa #{conversationId}</h2>

      {loading && <div style={{ marginTop: 12 }}>Carregando...</div>}
      {error && (
        <pre style={{ color: "crimson", whiteSpace: "pre-wrap", marginTop: 12 }}>
          {error}
        </pre>
      )}

      <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
        {msgs.map((m, idx) => (
          <div
            key={m.id ?? `${m.created_at ?? "msg"}-${idx}`}
            style={{ border: "1px solid #eee", padding: 10, borderRadius: 8 }}
          >
            <div style={{ fontSize: 13, opacity: 0.7 }}>
              {renderSender(m)} • {m.created_at || ""}
            </div>
            <div style={{ marginTop: 6 }}>{m.body || m.message || ""}</div>
          </div>
        ))}

        {!loading && msgs.length === 0 && <div>Sem mensagens ainda.</div>}
      </div>

      <form onSubmit={send} style={{ display: "grid", gap: 10, marginTop: 16 }}>
        <textarea
          rows={3}
          placeholder="Digite sua mensagem..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button disabled={sending || !body.trim() || !convIdNum}>
          {sending ? "Enviando..." : "Enviar"}
        </button>
      </form>
    </div>
  );
}