import { Link } from "react-router-dom";

function getField(p, keys, fallback = "") {
  for (const k of keys) {
    if (p?.[k] !== undefined && p?.[k] !== null && p?.[k] !== "") return p[k];
  }
  return fallback;
}

function formatServices(p) {
  const st = p?.service_types ?? p?.services_offered ?? [];
  if (!Array.isArray(st) || st.length === 0) return "";

  if (typeof st[0] === "string") return st.join(", ");

  if (typeof st[0] === "object" && st[0] !== null) {
    return st
      .map((x) => x.name || x.title || x.slug || x.code)
      .filter(Boolean)
      .join(", ");
  }

  return "";
}

export default function ProviderCard({ provider }) {
  const name = getField(provider, ["display_name", "full_name"], "Profissional");
  const headline = getField(provider, ["headline", "role_title"], "");
  const city = getField(provider, ["city", "location_city"], "");
  const state = getField(provider, ["state", "location_state"], "");
  const zipcode = getField(provider, ["zipcode"], "");
  const services = formatServices(provider);
  const photo = getField(provider, ["photo"], "");

  return (
    <Link to={`/professionals/${provider.id}`} style={styles.card}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {photo ? (
          <img
            src={photo}
            alt={name}
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              objectFit: "cover",
              border: "1px solid #eee",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              border: "1px solid #eee",
              display: "grid",
              placeItems: "center",
              opacity: 0.6,
              flexShrink: 0,
              fontSize: 12,
            }}
          >
            sem foto
          </div>
        )}

        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700 }}>{name}</div>
          {headline && <div style={{ opacity: 0.8 }}>{headline}</div>}
          <div style={{ fontSize: 13, opacity: 0.7 }}>
            {[city, state, zipcode].filter(Boolean).join(" • ")}
          </div>
          {services && (
            <div style={{ fontSize: 13, marginTop: 6 }}>
              <strong>Serviços:</strong> {services}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

const styles = {
  card: {
    display: "block",
    padding: 14,
    border: "1px solid #eee",
    textDecoration: "none",
    color: "#111",
    borderRadius: 8,
  },
};