import { useState } from "react";
import { apiPost, setTokens } from "../api/client";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const data = await apiPost("/api/auth/token/", {
        username,
        password,
      });

      setTokens(data);
      onLogin?.();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: 10, maxWidth: 320 }}
      >
        <input
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>
      </form>

      {error && (
        <pre style={{ color: "crimson", marginTop: 10 }}>
          {error}
        </pre>
      )}
    </div>
  );
}
