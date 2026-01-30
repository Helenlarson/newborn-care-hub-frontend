import { useMemo, useState } from "react";
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
  const [serviceTypesText, setServiceTypesText] = useState(""); // ex: doula, nanny
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState(""); // por enquanto string (url/base64), ou vazio

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    if (!role || !email || !password || !displayName) return false;
    if (role === "professional" && !headline) return false;
    return true;
  }, [role, email, password, displayName, headline]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const apiRole = toApiRole(role);

    const service_types = serviceTypesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      role: apiRole, // backend: provider | family
      user: { email, password },
      profile:
        apiRole === "provider"
          ? {
              display_name: displayName,
              headline,
              service_types, // array de strings: ["doula"]
              city,
              state,
              zipcode,
              bio,
              photo,
            }
          : {
              // suposição mais provável p/ family (se seu backend pedir mais campos, ele vai acusar)
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
        "Falha no cadastro.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: 16 }}>
      <h2>Criar conta</h2>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          Tipo de usuário:
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Selecione…</option>
            <option value="family">Familiar</option>
            <option value="professional">Profissional</option>
          </select>
        </label>

        <input
          placeholder="Nome de exibição"
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
          placeholder="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <input placeholder="Cidade" value={city} onChange={(e) => setCity(e.target.value)} />
          <input placeholder="Estado" value={state} onChange={(e) => setState(e.target.value)} />
        </div>

        <input placeholder="Zipcode" value={zipcode} onChange={(e) => setZipcode(e.target.value)} />

        {role === "professional" && (
          <>
            <input
              placeholder="Headline (ex: Doula)"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />

            <input
              placeholder='Service types (separados por vírgula) ex: "doula, nanny"'
              value={serviceTypesText}
              onChange={(e) => setServiceTypesText(e.target.value)}
            />

            <textarea placeholder="Bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />

            <input
              placeholder="Photo (string/url/base64) — opcional"
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
            />
          </>
        )}

        {error && (
          <pre style={{ color: "crimson", whiteSpace: "pre-wrap" }}>
            {error}
          </pre>
        )}

        <button type="submit" disabled={!canSubmit || loading}>
          {loading ? "Criando..." : "Criar conta"}
        </button>
      </form>
    </div>
  );
}
