import { useEffect, useState } from "react";
import { apiListServiceTypes } from "../api/serviceTypes";

export default function SearchFilters({ filters, setFilters, onSearch }) {
  const update = (key, value) => setFilters((f) => ({ ...f, [key]: value }));

  const [serviceTypes, setServiceTypes] = useState([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);
  const [typesError, setTypesError] = useState("");

  useEffect(() => {
    let isMounted = true;

    (async () => {
      setIsLoadingTypes(true);
      setTypesError("");

      try {
        const data = await apiListServiceTypes();

        // aceita tanto lista direta quanto paginada { results: [] }
        const list = Array.isArray(data) ? data : data?.results ?? [];

        if (isMounted) setServiceTypes(list);
      } catch (err) {
        if (isMounted) {
          setServiceTypes([]);
          setTypesError(
            err?.response?.data?.detail ||
              err?.message ||
              "Could not load service types."
          );
        }
      } finally {
        if (isMounted) setIsLoadingTypes(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  function toggleServiceType(id) {
    setFilters((f) => {
      const current = Array.isArray(f.service_type_ids) ? f.service_type_ids : [];
      const set = new Set(current);

      if (set.has(id)) set.delete(id);
      else set.add(id);

      return { ...f, service_type_ids: Array.from(set) };
    });
  }

  const selectedIds = Array.isArray(filters.service_type_ids)
    ? filters.service_type_ids
    : [];

  return (
    <div style={{ display: "grid", gap: 10, margin: "16px 0" }}>
      <input
        placeholder="Search keywords"
        value={filters.q ?? ""}
        onChange={(e) => update("q", e.target.value)}
      />

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          placeholder="Zipcode"
          value={filters.zipcode ?? ""}
          onChange={(e) => update("zipcode", e.target.value)}
        />
        <input
          placeholder="City"
          value={filters.city ?? ""}
          onChange={(e) => update("city", e.target.value)}
        />
        <input
          placeholder="State"
          value={filters.state ?? ""}
          onChange={(e) => update("state", e.target.value)}
        />
      </div>

      <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 10 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>
          Types of Service
        </div>

        {/* Loading */}
        {isLoadingTypes ? (
          <div style={{ opacity: 0.7 }}>Loading service types...</div>
        ) : typesError ? (
          /* Error */
          <div style={{ color: "#b00020", fontWeight: 600 }}>
            {typesError}
          </div>
        ) : serviceTypes.length === 0 ? (
          /* Empty (not an error) */
          <div style={{ opacity: 0.7 }}>
            No service types available yet.
          </div>
        ) : (
          /* List */
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {serviceTypes.map((st) => (
              <label
                key={st.id}
                style={{ display: "flex", gap: 6, alignItems: "center" }}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(st.id)}
                  onChange={() => toggleServiceType(st.id)}
                />
                {st.name || st.title || `#${st.id}`}
              </label>
            ))}
          </div>
        )}
      </div>

      <button onClick={onSearch}>Search</button>
    </div>
  );
}
