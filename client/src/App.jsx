import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";

function App() {
  const isAuthenticated = localStorage.getItem("token");

  return (
    <HashRouter>
      <Routes>

        {/* Root redirect */}
        <Route
          path="/"
          element={
            isAuthenticated
              ? <Navigate to="/gossip/home" replace />
              : <Navigate to="/gossip/auth" replace />
          }
        />

        <Route path="/gossip/auth" element={<Auth />} />

        <Route
          path="/gossip/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
    
      </Routes>
      </HashRouter>
  );
}

export default App;