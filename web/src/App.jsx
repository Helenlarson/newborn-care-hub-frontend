import AppRoutes from "./routes/AppRoutes";
import Topbar from "./components/Topbar";
import { useLocation } from "react-router-dom";

export default function App() {
  const location = useLocation();
  const hideTopbar = ["/", "/login", "/signup"].includes(location.pathname);

  return (
    <>
      {!hideTopbar && <Topbar />}
      <AppRoutes />
    </>
  );
}
