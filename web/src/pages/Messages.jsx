import { useEffect, useState } from "react";
import { apiListMessages } from "../api/messages";
import { useAuth } from "../context/AuthContext";

export default function Messages() {
  const { role } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiListMessages();
        setMessages(data.results || data);
      } catch (err) {
        setError(err?.response?.data?.detail || "Could not load messages.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <h2>{role === "provider" ? "Messages from Families" : "My Messages"}</h2>

      {loading && <div>Loading...</div>}
      {error && <div style={{ color: "crimson" }}>{error}</div>}

      <div style={{ display: "grid", gap: 12 }}>
        {messages.map((m) => (
          <div key={m.id} style={{ border: "1px solid #eee", padding: 12, borderRadius: 8 }}>
            <div style={{ fontSize: 13, opacity: 0.7 }}>
              {role === "provider" ? `From: ${m.family_name}` : `To: ${m.provider_name}`}
            </div>
            <div style={{ marginTop: 6 }}>{m.body}</div>
            <div style={{ fontSize: 12, opacity: 0.6, marginTop: 6 }}>{m.created_at}</div>
          </div>
        ))}
        {messages.length === 0 && <div>No messages yet.</div>}
      </div>
    </div>
  );
}
