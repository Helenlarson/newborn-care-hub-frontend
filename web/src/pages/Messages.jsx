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

  // fallback: se provider e não vier professional no payload, tenta usar o próprio profile id
  const myProfessionalId = useMemo(() => {
    return user?.professional_profile?.id || user?.profile?.id || null;
  }, [user]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiInbox(role);
        const list = data?.results || data || [];
        setItems(list);

        // salva professional_id para uso posterior (ex: link e criação de payloads antigos)
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

          const pid =
            (typeof c.professional === "number" ? c.professional : null) ||
            c.professional_id ||
            Number(localStorage.getItem(`conv_prof_${convId}`) || 0) ||
            (isProviderRole(role) ? myProfessionalId : null) ||
            null;

          const title = isProviderRole(role)
            ? (c.family_name || "Familiar")
            : (c.professional_name || "Profissional");

          const last = c?.last_message || "";

          return (
            <Link
              key={convId}
              to={`/conversations/${convId}`}
              state={{ professional_id: pid }}
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
            </Link>
          );
        })}

        {!loading && items.length === 0 && <div>Nenhuma conversa ainda.</div>}
      </div>
    </div>
  );
}