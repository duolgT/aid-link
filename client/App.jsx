import { Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Public Pages
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import ServiceDetailsPage from "./pages/ServiceDetailsPage";
import EmergencyPage from "./pages/EmergencyPage";
import ReportPage from "./pages/ReportPage";
import NotFoundPage from "./pages/NotFoundPage";

// Auth Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Protected Pages
import DashboardPage from "./pages/DashboardPage";
import ManageReportsPage from "./pages/ManageReportsPage";
import ManageServicesPage from "./pages/ManageServicesPage";
import ManageGuidesPage from "./pages/ManageGuidesPage";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="services/:id" element={<ServiceDetailsPage />} />
          <Route path="emergency" element={<EmergencyPage />} />
          <Route path="report" element={<ReportPage />} />
        </Route>

        {/* Auth Routes (No Layout) */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="dashboard/reports" element={<ManageReportsPage />} />
          <Route path="dashboard/services" element={<ManageServicesPage />} />
          <Route path="dashboard/guides" element={<ManageGuidesPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
