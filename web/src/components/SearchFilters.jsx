import { useEffect, useState } from "react";
import { apiListServiceTypes } from "../api/serviceTypes";

export default function SearchFilters({ filters, setFilters, onSearch }) {
  const update = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  const [serviceTypes, setServiceTypes] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiListServiceTypes();
        setServiceTypes(data.results || data);
      } catch {
        setServiceTypes([]);
      }
    })();
  }, []);

  function toggleServiceType(id) {
    setFilters((f) => {
      const set = new Set(f.service_type_ids || []);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return { ...f, service_type_ids: Array.from(set) };
    });
  }

  return (
    <div style={{ display: "grid", gap: 10, margin: "16px 0" }}>
      <input
        placeholder="Buscar (nome, bio, etc.)"
        value={filters.q}
        onChange={(e) => update("q", e.target.value)}
      />

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input placeholder="Zipcode" value={filters.zipcode} onChange={(e) => update("zipcode", e.target.value)} />
        <input placeholder="Cidade" value={filters.city} onChange={(e) => update("city", e.target.value)} />
        <input placeholder="Estado" value={filters.state} onChange={(e) => update("state", e.target.value)} />
      </div>

      <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 10 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Tipos de serviço</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {serviceTypes.map((st) => (
            <label key={st.id} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={(filters.service_type_ids || []).includes(st.id)}
                onChange={() => toggleServiceType(st.id)}
              />
              {st.name || st.title || `#${st.id}`}
            </label>
          ))}
          {serviceTypes.length === 0 && (
            <div style={{ opacity: 0.7 }}>Não foi possível carregar service-types.</div>
          )}
        </div>
      </div>

      <button onClick={onSearch}>Buscar</button>
    </div>
  );
}