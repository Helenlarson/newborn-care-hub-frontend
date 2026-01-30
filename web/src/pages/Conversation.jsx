import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { apiConversationMessages, apiSendMessage } from "../api/messages";

export default function Conversation() {
  const { conversationId } = useParams();
  const location = useLocation();

  const convIdNum = useMemo(() => Number(conversationId), [conversationId]);

  // 1) tenta vir do Link/nav state
  const professionalIdFromState =
    location.state?.professional_id ?? location.state?.professionalId ?? null;

  // 2) tenta do localStorage (salvo quando iniciou conversa pelo perfil)
  const professionalIdFromStorage =
    Number(localStorage.getItem(`conv_prof_${convIdNum}`) || 0) || null;

  const [professionalId, setProfessionalId] = useState(
    professionalIdFromState || professionalIdFromStorage
  );

  const [msgs, setMsgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await apiConversationMessages(conversationId);
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
  }

  useEffect(() => {
    // se recarregar e perder o state, tenta recuperar do storage de novo
    const fromStorage =
      Number(localStorage.getItem(`conv_prof_${Number(conversationId)}`) || 0) || null;
    if (!professionalId && fromStorage) setProfessionalId(fromStorage);

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  async function send(e) {
    e.preventDefault();

    const text = body.trim();
    if (!text) return;

    const pid = professionalId || null;
    if (!pid) {
      alert(
        "Não encontrei o professional_id desta conversa. Volte para a lista de mensagens e abra a conversa novamente (ou inicie a conversa pelo perfil do profissional uma vez)."
      );
      return;
    }

    setSending(true);
    try {
      await apiSendMessage({
        conversation_id: convIdNum,
        professional_id: Number(pid),
        message: text,
      });

      // garante o vínculo salvo (para próximos acessos)
      localStorage.setItem(`conv_prof_${convIdNum}`, String(pid));

      setBody("");
      await load();
    } catch (err) {
      const data = err?.response?.data;
      alert(
        data?.detail ||
          (data ? JSON.stringify(data, null, 2) : "Não foi possível enviar.")
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <h2>Conversa #{conversationId}</h2>

      {!professionalId && (
        <div style={{ marginTop: 8, fontSize: 13, opacity: 0.75 }}>
          Aviso: não consegui identificar o <code>professional_id</code> desta conversa.
          Se falhar ao enviar, volte para “Mensagens” e abra a conversa novamente.
        </div>
      )}

      {loading && <div style={{ marginTop: 12 }}>Carregando...</div>}
      {error && (
        <pre style={{ color: "crimson", whiteSpace: "pre-wrap", marginTop: 12 }}>
          {error}
        </pre>
      )}

      <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
        {msgs.map((m) => (
          <div
            key={m.id}
            style={{ border: "1px solid #eee", padding: 10, borderRadius: 8 }}
          >
            <div style={{ fontSize: 13, opacity: 0.7 }}>
              {m.sender_name || m.sender?.email || "Usuário"} • {m.created_at || ""}
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
        <button disabled={sending || !body.trim()}>
          {sending ? "Enviando..." : "Enviar"}
        </button>
      </form>
    </div>
  );
}