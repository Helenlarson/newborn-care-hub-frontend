export default function SearchFilters({ filters, setFilters, onSearch }) {
  const update = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  return (
    <div style={{ display: "grid", gap: 10, margin: "16px 0" }}>
      <input
        placeholder="Search by name/headline..."
        value={filters.q}
        onChange={(e) => update("q", e.target.value)}
      />

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input placeholder="Zipcode" value={filters.zipcode} onChange={(e) => update("zipcode", e.target.value)} />
        <input placeholder="City" value={filters.city} onChange={(e) => update("city", e.target.value)} />
        <input placeholder="State" value={filters.state} onChange={(e) => update("state", e.target.value)} />
      </div>

      <input
        placeholder="Service types (comma separated)"
        value={filters.service_types}
        onChange={(e) => update("service_types", e.target.value)}
      />

      <button onClick={onSearch}>Search</button>
    </div>
  );
}
