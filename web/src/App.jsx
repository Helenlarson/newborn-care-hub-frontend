import { useEffect, useState } from "react";
import { apiGet } from "./api/client";

export default function App() {
  const [serviceTypes, setServiceTypes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet("/api/service-types/")
      .then(setServiceTypes)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "system-ui" }}>
      <h1>Newborn Care Hub</h1>
      <h2>Service Types (from Django)</h2>

      {error && <pre style={{ color: "crimson" }}>{error}</pre>}

      <ul>
        {serviceTypes.map((st) => (
          <li key={st.id}>
            {st.name} — <code>{st.slug}</code>
          </li>
        ))}
      </ul>

      {!error && serviceTypes.length === 0 && <p>Loading…</p>}
    </div>
  );
}
