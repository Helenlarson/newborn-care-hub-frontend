import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiSignup } from "../api/auth";

function toApiRole(uiRole) {
  if (uiRole === "professional") return "provider";
  return uiRole; // "family"
}

export default function Signup() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  const [role, setRole] = useState(sp.get("role") || ""); // UI: family | professional

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // comuns
  const [displayName, setDisplayName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipcode, setZipcode] = useState("");

  // provider
  const [headline, setHeadline] = useState(""); // ex: Doula
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState("");

  // ✅ service types (checkbox)
  const [serviceTypes, setServiceTypes] = useState([]); // [{id,name,slug}]
  const [serviceTypesLoading, setServiceTypesLoading] = useState(false);
  const [serviceTypesError, setServiceTypesError] = useState("");
  const [selectedServiceTypeIds, setSelectedServiceTypeIds] = useState([]); // number[]

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- carrega service types do backend ---
  async function fetchServiceTypes() {
    const API = import.meta.env.VITE_API_URL; // ex: http://127.0.0.1:8000
    const url = API ? `${API}/service-types/` : `/api/service-types/`;

    setServiceTypesLoading(true);
    setServiceTypesError("");

    try {
      const res = await fetch(url, {
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Unable to load service types (${res.status})`);
      }

      const data = await res.json();
      setServiceTypes(Array.isArray(data) ? data : []);
    } catch (e) {
      setServiceTypesError(
        e?.message || "Unable to load service types."
      );
      setServiceTypes([]);
    } finally {
      setServiceTypesLoading(false);
    }
  }

  // carrega ao virar "professional"
  useEffect(() => {
    if (role === "professional") {
      fetchServiceTypes();
    } else {
      // limpando ao trocar para family
      setSelectedServiceTypeIds([]);
      setServiceTypesError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  function toggleServiceType(id) {
    const n = Number(id);
    setSelectedServiceTypeIds((prev) => {
      const has = prev.includes(n);
      if (has) return prev.filter((x) => x !== n);
      return [...prev, n];
    });
  }

  // ✅ Motivo do bloqueio (pra não ficar "silencioso")
  const submitBlockReason = useMemo(() => {
    if (!role) return "Select your user type";
    if (!displayName) return "Fill in the name.";
    if (!email) return "Fill in the email.";
    if (!password) return "Fill in the password.";
    if (role === "professional" && !headline) return "Fill in the headline.";
    if (role === "professional" && selectedServiceTypeIds.length === 0)
      return "Selecione pelo menos 1 tipo de serviço.";
    return "";
  }, [role, displayName, email, password, headline, selectedServiceTypeIds]);

  const canSubmit = !submitBlockReason && !loading;

  async function handleSubmit(e) {
    e.preventDefault();
    console.log("SUBMIT clicado"); // ✅ confirme no console
    setError("");

    if (submitBlockReason) {
      setError(submitBlockReason);
      return;
    }

    setLoading(true);

    const apiRole = toApiRole(role);

    const payload = {
      role: apiRole, // backend: provider | family
      user: { email, password },
      profile:
        apiRole === "provider"
          ? {
              display_name: displayName,
              headline,
              // ✅ envia IDs escolhidos
              service_type_ids: selectedServiceTypeIds,
              city,
              state,
              zipcode,
              bio,
              photo,
            }
          : {
              display_name: displayName,
              city,
              state,
              zipcode,
              photo,
            },
    };

    try {
      await apiSignup(payload);
      navigate("/login", { replace: true });
    } catch (err) {
      const data = err?.response?.data;
      console.log("Signup error:", data || err);
      const msg =
        data?.detail ||
        data?.message ||
        (data ? JSON.stringify(data, null, 2) : null) ||
        "Failed to create account.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 16 }}>
      <h2>Create account</h2>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          User type:
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Selecione…</option>
            <option value="family">Familiar</option>
            <option value="professional">Profissional</option>
          </select>
        </label>

        <input
          placeholder="Full name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <input
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <input
            placeholder="State"
            value={state}
            onChange={(e) => setState(e.target.value)}
          />
        </div>

        <input
          placeholder="Zipcode"
          value={zipcode}
          onChange={(e) => setZipcode(e.target.value)}
        />

        {role === "professional" && (
          <>
            <input
              placeholder="Headline (ex: Postpartum Doula)"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />

            {/* ✅ CHECKBOXES */}
            <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                Service types (select one or more)
              </div>

              {serviceTypesLoading && <div>Loading service types…</div>}

              {!serviceTypesLoading && serviceTypesError && (
                <div style={{ color: "crimson" }}>
                  {serviceTypesError}{" "}
                  <button
                    type="button"
                    onClick={fetchServiceTypes}
                    style={{ marginLeft: 8 }}
                  >
                    Try again
                  </button>
                </div>
              )}

              {!serviceTypesLoading && !serviceTypesError && serviceTypes.length === 0 && (
                <div>No service types found.</div>
              )}

              {!serviceTypesLoading && !serviceTypesError && serviceTypes.length > 0 && (
                <div style={{ display: "grid", gap: 8 }}>
                  {serviceTypes.map((st) => (
                    <label
                      key={st.id}
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedServiceTypeIds.includes(Number(st.id))}
                        onChange={() => toggleServiceType(st.id)}
                      />
                      <span>{st.name}</span>
                    </label>
                  ))}
                </div>
              )}

              {selectedServiceTypeIds.length === 0 && (
                <div style={{ marginTop: 8, color: "#555", fontSize: 12 }}>
                  * Professional must select at least one service type.
                </div>
              )}
            </div>

            <textarea
              placeholder="Bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />

            <input
              placeholder="Photo (string/url/base64) — optional"
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
            />
          </>
        )}

        {/* ✅ Mostra o motivo quando o botão estiver bloqueado */}
        {!loading && submitBlockReason && (
          <div style={{ color: "crimson", fontSize: 12 }}>
            {submitBlockReason}
          </div>
        )}

        {error && (
          <pre style={{ color: "crimson", whiteSpace: "pre-wrap" }}>
            {error}
          </pre>
        )}

        <button type="submit" disabled={!canSubmit}>
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
    </div>
  );
}