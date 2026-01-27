import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 16 }}>
      <h1>Newborn Care Hub</h1>
      <p>
        A platform to connect families with newborn & postpartum professionals:
        Newborn Care Specialists, doulas, sleep consultants, IBCLCs and more.
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
        <Link to="/login" style={btn}>Login</Link>
        <Link to="/signup" style={btnSecondary}>Sign up</Link>
        <Link to="/signup?role=family" style={btn}>Sign up as Family</Link>
        <Link to="/signup?role=provider" style={btn}>Sign up as Professional</Link>
      </div>
    </div>
  );
}

const btn = {
  display: "inline-block",
  padding: "10px 14px",
  border: "1px solid #111",
  textDecoration: "none",
  color: "#111",
};
const btnSecondary = { ...btn, background: "#111", color: "white" };
