import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Topbar() {
  const { role, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div style={styles.bar}>
      <Link to="/providers" style={styles.logo}>
        Newborn Care Hub
      </Link>

      <div style={styles.right}>
        <span style={styles.user}>
          {user?.display_name || user?.email}
          {role ? ` (${role})` : ""}
        </span>

        <Link to="/profile/edit" style={styles.link}>Edit Profile</Link>

        <Link to="/messages" style={styles.link}>
          {role === "provider" ? "Family Messages" : "My Messages"}
        </Link>

        <button onClick={handleLogout} style={styles.btn}>Logout</button>
      </div>
    </div>
  );
}

const styles = {
  bar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid #eee",
  },
  logo: { textDecoration: "none", fontWeight: 700, color: "#111" },
  right: { display: "flex", gap: 12, alignItems: "center" },
  link: { textDecoration: "none", color: "#111" },
  btn: { padding: "8px 12px", cursor: "pointer" },
  user: { opacity: 0.8, fontSize: 14 },
};
