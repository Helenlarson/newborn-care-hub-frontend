import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1>Newborn Care Hub</h1>

      <p>
        A platform to connect families with newborn & postpartum professionals.
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <Link to="/login" style={btnSecondary}>Login</Link>
        <Link to="/signup" style={btn}>Sign up</Link>
      </div>
    </div>
  );
}

const btn = {
  padding: "10px 16px",
  border: "1px solid #111",
  textDecoration: "none",
  color: "#111",
};

const btnSecondary = {
  ...btn,
  background: "#111",
  color: "white",
};
