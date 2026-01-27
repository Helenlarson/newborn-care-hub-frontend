import { useEffect, useState } from "react";
import { apiGet, getAccessToken } from "../api/client";

export default function FamilyMe() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      setError("No access token found. Please login.");
      return;
    }

    apiGet("/api/family/me/", token)
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Family Profile (/me)</h2>

      {error && <pre style={{ color: "crimson" }}>{error}</pre>}

      {data && (
        <pre style={{ background: "#f5f5f5", padding: 12 }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}

      {!error && !data && <p>Loading…</p>}
    </div>
  );
}
