import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { DronesListPage } from "./pages/DronesListPage";
import { DroneCommandPage } from "./pages/DroneCommandPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./hooks/use-auth";

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DronesListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/drones/:id"
          element={
            <ProtectedRoute>
              <DroneCommandPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
