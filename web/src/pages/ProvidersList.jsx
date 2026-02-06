import { useEffect, useMemo, useState } from "react";
import { apiListProviders } from "../api/providers";
import ProviderCard from "../components/ProviderCard";

/* =========================
   US STATES (full list)
========================= */
const US_STATES = [
  { label: "Alabama", value: "AL" },
  { label: "Alaska", value: "AK" },
  { label: "Arizona", value: "AZ" },
  { label: "Arkansas", value: "AR" },
  { label: "California", value: "CA" },
  { label: "Colorado", value: "CO" },
  { label: "Connecticut", value: "CT" },
  { label: "Delaware", value: "DE" },
  { label: "Florida", value: "FL" },
  { label: "Georgia", value: "GA" },
  { label: "Hawaii", value: "HI" },
  { label: "Idaho", value: "ID" },
  { label: "Illinois", value: "IL" },
  { label: "Indiana", value: "IN" },
  { label: "Iowa", value: "IA" },
  { label: "Kansas", value: "KS" },
  { label: "Kentucky", value: "KY" },
  { label: "Louisiana", value: "LA" },
  { label: "Maine", value: "ME" },
  { label: "Maryland", value: "MD" },
  { label: "Massachusetts", value: "MA" },
  { label: "Michigan", value: "MI" },
  { label: "Minnesota", value: "MN" },
  { label: "Mississippi", value: "MS" },
  { label: "Missouri", value: "MO" },
  { label: "Montana", value: "MT" },
  { label: "Nebraska", value: "NE" },
  { label: "Nevada", value: "NV" },
  { label: "New Hampshire", value: "NH" },
  { label: "New Jersey", value: "NJ" },
  { label: "New Mexico", value: "NM" },
  { label: "New York", value: "NY" },
  { label: "North Carolina", value: "NC" },
  { label: "North Dakota", value: "ND" },
  { label: "Ohio", value: "OH" },
  { label: "Oklahoma", value: "OK" },
  { label: "Oregon", value: "OR" },
  { label: "Pennsylvania", value: "PA" },
  { label: "Rhode Island", value: "RI" },
  { label: "South Carolina", value: "SC" },
  { label: "South Dakota", value: "SD" },
  { label: "Tennessee", value: "TN" },
  { label: "Texas", value: "TX" },
  { label: "Utah", value: "UT" },
  { label: "Vermont", value: "VT" },
  { label: "Virginia", value: "VA" },
  { label: "Washington", value: "WA" },
  { label: "West Virginia", value: "WV" },
  { label: "Wisconsin", value: "WI" },
  { label: "Wyoming", value: "WY" },
];

// Opcional: filtrar só os 4 do seu projeto (igual Signup)
const ALLOWED_SERVICE_TYPE_SLUGS = new Set([
  "birth-doula",
  "postpartum-doula",
  "newborn-care-specialist",
  "lactation-consultant",
]);

function normalize(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function isAllowedServiceType(st) {
  const slug = normalize(st?.slug);
  const name = normalize(st?.name);
  if (ALLOWED_SERVICE_TYPE_SLUGS.has(slug)) return true;
  // fallback por nome (caso slug venha estranho)
  return (
    name.includes("birth doula") ||
    name.includes("postpartum doula") ||
    name.includes("newborn care specialist") ||
    name.includes("lactation consultant")
  );
}

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

  // Service types (from backend)
  const [serviceTypes, setServiceTypes] = useState([]);
  const [serviceTypesLoading, setServiceTypesLoading] = useState(false);
  const [serviceTypesError, setServiceTypesError] = useState("");

  const filteredServiceTypes = useMemo(() => {
    return (serviceTypes || []).filter(isAllowedServiceType);
  }, [serviceTypes]);

  async function fetchServiceTypes() {
    const API = import.meta.env.VITE_API_URL; // ex: http://127.0.0.1:8000
    const url = API ? `${API}/service-types/` : `/api/service-types/`;

    setServiceTypesLoading(true);
    setServiceTypesError("");

    try {
      const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Unable to load service types (${res.status}).`);
      }
      const data = await res.json();
      setServiceTypes(Array.isArray(data) ? data : []);
    } catch (e) {
      setServiceTypesError(e?.message || "Unable to load service types.");
      setServiceTypes([]);
    } finally {
      setServiceTypesLoading(false);
    }
  }

  const fetchProviders = async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        q: filters.q || undefined,
        zipcode: filters.zipcode || undefined,
        city: filters.city || undefined,
        state: filters.state || undefined,

        // ✅ mantenho igual seu código que FUNCIONA
        service_type_ids:
          (filters.service_type_ids || []).length > 0
            ? filters.service_type_ids
            : undefined,
      };

      const data = await apiListProviders(params);
      setProviders(data.results || data);
    } catch (err) {
      setError(err?.response?.data?.detail || "Unable to load professionals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
    fetchServiceTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleServiceTypeId(id) {
    const n = Number(id);
    setFilters((prev) => ({
      ...prev,
      service_type_ids: prev.service_type_ids.includes(n)
        ? prev.service_type_ids.filter((x) => x !== n)
        : [...prev.service_type_ids, n],
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    fetchProviders();
  }

  function handleClear() {
    setFilters({ q: "", zipcode: "", city: "", state: "", service_type_ids: [] });
    // após limpar, já refaz a busca
    setTimeout(fetchProviders, 0);
  }

  /* =========================
     STYLE (sem Chakra)
========================= */
  const COLORS = {
    pageLeft: "#F2C9A9",
    pageMid: "#F7E6D6",
    pageRight: "#BFE3CF",
    card: "#FBF6EE",
    border: "rgba(40, 30, 25, 0.12)",
    text: "#1F2937",
    muted: "rgba(31,41,55,0.62)",
    terracotta: "#B97A63",
    terracottaHover: "#A76652",
    inputBg: "#F6EFE6",
    white: "#FFFFFF",
  };

  const page = {
    minHeight: "100vh",
    padding: "42px 16px",
    background: `linear-gradient(90deg, ${COLORS.pageLeft} 0%, ${COLORS.pageMid} 45%, ${COLORS.pageRight} 100%)`,
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
    color: COLORS.text,
  };

  const shell = {
    maxWidth: 980,
    margin: "0 auto",
  };

  const filterCard = {
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 18,
    boxShadow: "0 18px 50px rgba(0,0,0,0.12)",
    padding: "26px 26px 22px",
  };

  const title = {
    fontSize: 30,
    fontWeight: 800,
    textAlign: "center",
    margin: "0 0 6px 0",
  };

  const subtitle = {
    textAlign: "center",
    margin: "0 0 18px 0",
    color: COLORS.muted,
    fontSize: 14,
  };

  const divider = {
    height: 1,
    background: "rgba(0,0,0,0.06)",
    margin: "16px 0 18px",
  };

  const label = { fontSize: 13, fontWeight: 700, marginBottom: 6 };

  const input = {
    width: "100%",
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(0,0,0,0.10)",
    background: COLORS.inputBg,
    outline: "none",
    fontSize: 14,
  };

  const row3 = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 14,
  };

  const servicesBox = {
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.10)",
    background: COLORS.white,
    padding: 14,
  };

  const servicesGrid = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginTop: 10,
  };

  const checkRow = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 14,
  };

  const actions = {
    display: "flex",
    justifyContent: "center",
    gap: 12,
    marginTop: 16,
    flexWrap: "wrap",
  };

  const btnPrimary = {
    padding: "12px 18px",
    minWidth: 160,
    borderRadius: 12,
    border: "none",
    background: COLORS.terracotta,
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 12px 26px rgba(185,122,99,0.28)",
  };

  const btnOutline = {
    padding: "12px 18px",
    minWidth: 140,
    borderRadius: 12,
    border: "1px solid rgba(185,122,99,0.55)",
    background: "rgba(255,255,255,0.65)",
    color: COLORS.terracotta,
    fontWeight: 800,
    cursor: "pointer",
  };

  const results = {
    marginTop: 18,
    display: "grid",
    gap: 12,
  };

  const note = { marginTop: 10, fontSize: 12, color: COLORS.muted };

  /* =========================
     RENDER
========================= */
  return (
    <div style={page}>
      <div style={shell}>
        {/* FILTER PANEL */}
        <div style={filterCard}>
          <h2 style={title}>Professionals</h2>
          <p style={subtitle}>
            Search by location and service type to find the right support.
          </p>

          <div style={divider} />

          <form onSubmit={handleSubmit}>
            <div>
              <div style={label}>Search keywords</div>
              <input
                style={input}
                value={filters.q}
                onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
                placeholder="e.g., night nurse, lactation, sleep"
              />
            </div>

            <div style={{ height: 14 }} />

            <div style={row3}>
              <div>
                <div style={label}>Zipcode</div>
                <input
                  style={input}
                  value={filters.zipcode}
                  onChange={(e) => setFilters((p) => ({ ...p, zipcode: e.target.value }))}
                  placeholder="e.g., 37203"
                />
              </div>

              <div>
                <div style={label}>City</div>
                <input
                  style={input}
                  value={filters.city}
                  onChange={(e) => setFilters((p) => ({ ...p, city: e.target.value }))}
                  placeholder="e.g., Nashville"
                />
              </div>

              <div>
                <div style={label}>State</div>
                <select
                  style={input}
                  value={filters.state}
                  onChange={(e) => setFilters((p) => ({ ...p, state: e.target.value }))}
                >
                  <option value="">Select</option>
                  {US_STATES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label} ({s.value})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ height: 14 }} />

            {/* SERVICE TYPES */}
            <div>
              <div style={label}>Professional service</div>
              <div style={servicesBox}>
                {serviceTypesLoading && <div style={note}>Loading services…</div>}

                {!serviceTypesLoading && serviceTypesError && (
                  <div style={{ color: "crimson", fontSize: 13 }}>
                    {serviceTypesError}{" "}
                    <button
                      type="button"
                      onClick={fetchServiceTypes}
                      style={{ ...btnOutline, minWidth: 0, padding: "8px 10px", marginLeft: 8 }}
                    >
                      Try again
                    </button>
                  </div>
                )}

                {!serviceTypesLoading && !serviceTypesError && filteredServiceTypes.length === 0 && (
                  <div style={note}>
                    No matching service types found. Expected: Birth Doula, Postpartum Doula, Newborn Care Specialist, Lactation Consultant.
                  </div>
                )}

                {!serviceTypesLoading && !serviceTypesError && filteredServiceTypes.length > 0 && (
                  <div style={servicesGrid}>
                    {filteredServiceTypes.map((st) => (
                      <label key={st.id} style={checkRow}>
                        <input
                          type="checkbox"
                          checked={filters.service_type_ids.includes(Number(st.id))}
                          onChange={() => toggleServiceTypeId(st.id)}
                        />
                        <span>{st.name}</span>
                      </label>
                    ))}
                  </div>
                )}

                <div style={note}>
                  Tip: choose one or more services to narrow results.
                </div>
              </div>
            </div>

            <div style={actions}>
              <button
                type="submit"
                style={btnPrimary}
                onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.terracottaHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = COLORS.terracotta)}
              >
                Search
              </button>

              <button type="button" style={btnOutline} onClick={handleClear}>
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* RESULTS */}
        <div style={results}>
          {loading && <div>Loading...</div>}
          {error && <div style={{ color: "crimson" }}>{error}</div>}

          {!loading && !error && providers.length === 0 ? (
            <div style={{ ...filterCard, textAlign: "center" }}>
              No professionals found with these filters.
            </div>
          ) : null}

          {providers.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
