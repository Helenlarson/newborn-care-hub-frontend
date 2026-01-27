import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiSignup } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [params] = useSearchParams();
  const preRole = params.get("role"); // "family" or "provider"
  const [role, setRole] = useState(preRole || "");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  // family fields
  const [city, setCity] = useState("");
  const [zipcode, setZipcode] = useState("");

  // provider fields
  const [headline, setHeadline] = useState("");
  const [serviceTypes, setServiceTypes] = useState(""); // CSV simples

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const canSubmit = useMemo(() => {
    if (!role || !email || !password) return false;
    if (role === "family") return !!displayName;
    if (role === "provider") return !!displayName;
    return false;
  }, [role, email, password, displayName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      role,
      user: { email, password },
      profile:
        role === "family"
          ? { display_name: displayName, city, zipcode }
          : {
              display_name: displayName,
              headline,
              service_types: serviceTypes
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            },
    };

    try {
      const data = await apiSignup(payload);
      // Se seu backend já retorna token+user, ótimo:
      if (data.token && data.user) {
        login({ token: data.token, user: data.user });
        navigate("/providers");
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(err?.response?.data?.detail || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: "40px auto", padding: 16 }}>
      <h2>Sign up</h2>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        <label>
          User type
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Select...</option>
            <option value="family">Family</option>
            <option value="provider">Professional</option>
          </select>
        </label>

        <input placeholder="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        {role === "family" && (
          <>
            <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
            <input placeholder="Zipcode" value={zipcode} onChange={(e) => setZipcode(e.target.value)} />
          </>
        )}

        {role === "provider" && (
          <>
            <input placeholder="Headline" value={headline} onChange={(e) => setHeadline(e.target.value)} />
            <input
              placeholder="Service types (comma separated)"
              value={serviceTypes}
              onChange={(e) => setServiceTypes(e.target.value)}
            />
          </>
        )}

        {error && <div style={{ color: "crimson" }}>{error}</div>}

        <button disabled={!canSubmit || loading} type="submit">
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
    </div>
  );
}
