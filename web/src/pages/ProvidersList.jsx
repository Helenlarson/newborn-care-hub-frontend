import { useEffect, useState } from "react";
import { apiListProviders } from "../api/providers";
import ProviderCard from "../components/ProviderCard";
import SearchFilters from "../components/SearchFilters";

export default function ProvidersList() {
  const [filters, setFilters] = useState({
    q: "",
    zipcode: "",
    city: "",
    state: "",
    service_type_ids: [],
  });

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProviders = async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        q: filters.q || undefined,
        zipcode: filters.zipcode || undefined,
        city: filters.city || undefined,
        state: filters.state || undefined,
        service_types: (filters.service_type_ids || []).length ? filters.service_type_ids : undefined,
      };

      const data = await apiListProviders(params);
      setProviders(data.results || data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Não foi possível carregar profissionais.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: "24px auto", padding: 16 }}>
      <h2>Profissionais</h2>

      <SearchFilters filters={filters} setFilters={setFilters} onSearch={fetchProviders} />

      {loading && <div>Carregando...</div>}
      {error && <div style={{ color: "crimson" }}>{error}</div>}

      <div style={{ display: "grid", gap: 12 }}>
        {providers.map((p) => (
          <ProviderCard key={p.id} provider={p} />
        ))}
      </div>
    </div>
  );
}