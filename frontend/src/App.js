import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationsProvider } from "./context/NotificationsContext";
import { GoalProvider } from "./context/GoalContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DailyEntry from "./pages/DailyEntry";
import Upload from "./pages/Upload";
import Payslip from "./pages/Payslip";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import YearlyOverview from "./pages/YearlyOverview";
import Vacation from "./pages/Vacation";
import SickDays from "./pages/SickDays";
import "./App.css";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <NotificationsProvider>
            <Layout />
          </NotificationsProvider>
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="daily-entry" element={<DailyEntry />} />
        <Route path="upload" element={<Upload />} />
        <Route path="payslip" element={<Payslip />} />
        <Route path="yearly" element={<YearlyOverview />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="vacation" element={<Vacation />} />
        <Route path="sick-days" element={<SickDays />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GoalProvider>
          <div className="App min-h-screen bg-background">
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
            <Toaster position="top-right" richColors />
          </div>
        </GoalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
