import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { apiSignup } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState(""); // family | provider

  // user
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // shared profile
  const [displayName, setDisplayName] = useState("");

  // family
  const [city, setCity] = useState("");
  const [zipcode, setZipcode] = useState("");

  // provider
  const [headline, setHeadline] = useState("");
  const [serviceTypes, setServiceTypes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    if (!role || !email || !password || !displayName) return false;

    if (role === "family") return true;
    if (role === "provider") return headline.length > 0;

    return false;
  }, [role, email, password, displayName, headline]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      role,
      user: { email, password },
      profile:
        role === "family"
          ? {
              display_name: displayName,
              city,
              zipcode,
            }
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

      // se backend já retorna token
      if (data.token && data.user) {
        login({ token: data.token, user: data.user });
        navigate("/providers");
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(err?.response?.data?.detail || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: "40px auto", padding: 16 }}>
      <h2>Create your account</h2>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
        {/* USER TYPE */}
        <label>
          I am a:
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">Select user type</option>
            <option value="family">Family</option>
            <option value="provider">Professional</option>
          </select>
        </label>

        {/* COMMON */}
        <input
          placeholder="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* FAMILY */}
        {role === "family" && (
          <>
            <input
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <input
              placeholder="Zipcode"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
            />
          </>
        )}

        {/* PROVIDER */}
        {role === "provider" && (
          <>
            <input
              placeholder="Professional headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
            <input
              placeholder="Service types (comma separated)"
              value={serviceTypes}
              onChange={(e) => setServiceTypes(e.target.value)}
            />
          </>
        )}

        {error && <div style={{ color: "crimson" }}>{error}</div>}

        <button disabled={!canSubmit || loading}>
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>
    </div>
  );
}
