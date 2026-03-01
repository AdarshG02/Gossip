import { BrowserRouter, Routes, Route } from "react-router-dom";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
// import Editor from "./pages/Editor";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/gossip/auth" element={<Auth />} />
        <Route
            path="/gossip/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
        />

        {/* <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/room/:roomId" element={<Editor />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;