import { Link } from "react-router-dom";

export default function ProviderCard({ provider }) {
  return (
    <Link to={`/providers/${provider.id}`} style={styles.card}>
      <div style={{ fontWeight: 700 }}>{provider.display_name}</div>
      <div style={{ opacity: 0.8 }}>{provider.headline}</div>
      <div style={{ fontSize: 13, opacity: 0.7 }}>
        {provider.city} {provider.state} {provider.zipcode}
      </div>
      <div style={{ fontSize: 13, marginTop: 6 }}>
        {(provider.service_types || []).join(", ")}
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
