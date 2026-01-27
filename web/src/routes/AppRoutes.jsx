import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ProvidersList from "../pages/ProvidersList";
import ProviderDetail from "../pages/ProviderDetail";
import Messages from "../pages/Messages";
import EditProfile from "../pages/EditProfile";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/providers"
        element={
          <ProtectedRoute>
            <ProvidersList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/providers/:id"
        element={
          <ProtectedRoute>
            <ProviderDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
