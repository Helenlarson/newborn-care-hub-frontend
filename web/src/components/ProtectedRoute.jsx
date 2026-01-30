import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { isAuthed, booting } = useAuth();

  if (booting) return <div style={{ padding: 16 }}>Loading...</div>;
  if (!isAuthed) return <Navigate to="/login" replace />;
  return children;
}