import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Topbar() {
  const { role, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const roleLabel =
    role === "professional"
      ? "Professional"
      : role === "family"
      ? "Family"
      : "";

  return (
    <div style={styles.bar}>
      {/* Left side: Logo + Nav */}
      <div style={styles.left}>
        <Link to="/" style={styles.logo}>
          Newborn Care Hub
        </Link>

        <Link to="/" style={styles.link}>
          Home
        </Link>

        <Link to="/blog" style={styles.link}>
          Blog
        </Link>
      </div>

      {/* Right side: User actions */}
      <div style={styles.right}>
        <span style={styles.user}>
          {user?.email}
          {roleLabel ? ` (${roleLabel})` : ""}
        </span>

        <Link to="/profile/edit" style={styles.link}>
          Edit Profile
        </Link>

        <Link to="/inbox" style={styles.link}>
          Messages
        </Link>

        <button onClick={handleLogout} style={styles.btn}>
          Logout
        </button>
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
    backgroundColor: "#fff",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  logo: {
    textDecoration: "none",
    fontWeight: 700,
    color: "#111",
    marginRight: 12,
  },
  right: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  link: {
    textDecoration: "none",
    color: "#111",
    fontSize: 14,
  },
  btn: {
    padding: "8px 12px",
    cursor: "pointer",
  },
  user: {
    opacity: 0.8,
    fontSize: 14,
  },
};
