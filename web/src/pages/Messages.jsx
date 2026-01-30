import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiInbox } from "../api/messages";
import { useAuth } from "../context/AuthContext";

function pickFirst(obj, keys) {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return null;
}

function inferProfessionalIdFromItem(item) {
  // tenta vários formatos possíveis
  return (
    item?.professional_id ||
    item?.professional?.id ||
    item?.professional_profile_id ||
    item?.provider_id ||
    item?.provider?.id ||
    null
  );
}

export default function Messages() {
  const { role, user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // se o usuário logado for provider, às vezes o backend quer o professional_id = "ele mesmo"
  const myProfessionalId = useMemo(() => {
    return (
      user?.professional_id ||
      user?.provider_id ||
      user?.profile?.id ||
      user?.professional_profile?.id ||
      null
    );
  }, [user]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiInbox(role);
        const list = data.results || data;
        setItems(list);

        // salva no localStorage os vínculos que vierem no payload (se vierem)
        for (const c of list) {
          const convId = Number(c.id || c.conversation_id);
          if (!convId) continue;

          const pid = inferProfessionalIdFromItem(c);
          if (pid) localStorage.setItem(`conv_prof_${convId}`, String(pid));
        }
      } catch (err) {
        setError(err?.response?.data?.detail || "Não foi possível carregar a inbox.");
      } finally {
        setLoading(false);
      }
    })();
  }, [role]);

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <h2>Mensagens</h2>

      {loading && <div>Carregando...</div>}
      {error && <div style={{ color: "crimson" }}>{error}</div>}

      <div style={{ display: "grid", gap: 12 }}>
        {items.map((c) => {
          const convId = Number(c.id || c.conversation_id);

          const title =
            pickFirst(c, ["other_name", "professional_name", "family_name"]) || "Conversa";

          const last =
            c?.last_message?.body ||
            c?.last_message?.message ||
            c?.last_message ||
            c?.preview ||
            "";

          // 1) tenta do payload
          const pidFromApi = inferProfessionalIdFromItem(c);

          // 2) tenta do localStorage (salvo quando iniciou conversa pelo perfil do provider)
          const pidFromStorage = convId
            ? Number(localStorage.getItem(`conv_prof_${convId}`) || 0) || null
            : null;

          // 3) fallback: se for provider, pode usar o próprio id dele
          const professionalId =
            pidFromApi || pidFromStorage || (role === "provider" ? myProfessionalId : null);

          const showWarning = !professionalId;

          return (
            <Link
              key={convId}
              to={`/conversations/${convId}`}
              state={{ professional_id: professionalId }}
              style={{
                border: "1px solid #eee",
                padding: 12,
                borderRadius: 8,
                textDecoration: "none",
                color: "#111",
              }}
            >
              <div style={{ fontWeight: 700 }}>{title}</div>
              {last && <div style={{ opacity: 0.8, marginTop: 6 }}>{last}</div>}

              {showWarning && (
                <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
                  (Aviso: não consegui identificar o professional_id desta conversa. Se falhar ao
                  enviar, abra a conversa pelo perfil do profissional uma vez para “registrar” o vínculo.)
                </div>
              )}
            </Link>
          );
        })}

        {!loading && items.length === 0 && <div>Nenhuma conversa ainda.</div>}
      </div>
    </div>
  );
}