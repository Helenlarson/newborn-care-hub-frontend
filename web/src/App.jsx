import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";

import { apiGet, getAccessToken, clearTokens } from "./api/client";
import Login from "./pages/Login";


export default function App() {
  // ✅ 4.2 — estado de login
  const [logged, setLogged] = useState(Boolean(getAccessToken()));

  const [serviceTypes, setServiceTypes] = useState([]);
  const [error, setError] = useState("");

  // Buscar service types (público)
  useEffect(() => {
    apiGet("/api/service-types/")
      .then(setServiceTypes)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "system-ui" }}>
      <h1>Newborn Care Hub</h1>

      {/* Navegação simples */}
      <nav style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Link to="/">Home</Link>
        <Link to="/login">Login</Link>
        

        {logged && (
          <button
            onClick={() => {
              clearTokens();
              setLogged(false);
            }}
          >
            Logout
          </button>
        )}
      </nav>

      {error && <pre style={{ color: "crimson" }}>{error}</pre>}

      <Routes>
        {/* Home */}
        <Route
          path="/"
          element={
            <div>
              <h2>Service Types</h2>
              <ul>
                {serviceTypes.map((st) => (
                  <li key={st.id}>
                    {st.name} — <code>{st.slug}</code>
                  </li>
                ))}
              </ul>
            </div>
          }
        />

        {/* Login */}
        <Route
          path="/login"
          element={<Login onLogin={() => setLogged(true)} />}
        />
        
      </Routes>
    </div>
  );
}
