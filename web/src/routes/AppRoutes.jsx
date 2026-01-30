import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ProvidersList from "../pages/ProvidersList";
import ProviderDetail from "../pages/ProviderDetail";
import Messages from "../pages/Messages";
import EditProfile from "../pages/EditProfile";
import Conversation from "../pages/Conversation";
import ProtectedRoute from "../components/ProtectedRoute";
import Topbar from "../components/Topbar";

function ProtectedPage({ children }) {
  return (
    <ProtectedRoute>
      <Topbar />
      {children}
    </ProtectedRoute>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route
        path="/professionals"
        element={
          <ProtectedPage>
            <ProvidersList />
          </ProtectedPage>
        }
      />

      <Route
        path="/professionals/:id"
        element={
          <ProtectedPage>
            <ProviderDetail />
          </ProtectedPage>
        }
      />

      <Route
        path="/inbox"
        element={
          <ProtectedPage>
            <Messages />
          </ProtectedPage>
        }
      />

      <Route
        path="/conversations/:conversationId"
        element={
          <ProtectedPage>
            <Conversation />
          </ProtectedPage>
        }
      />

      <Route
        path="/profile/edit"
        element={
          <ProtectedPage>
            <EditProfile />
          </ProtectedPage>
        }
      />
    </Routes>
  );
}