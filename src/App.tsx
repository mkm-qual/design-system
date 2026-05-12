import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { useDSStore } from './store/dsStore';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudioPage from './pages/StudioPage';
import ContractsPage from './pages/ContractsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';

function AppInit({ children }: { children: React.ReactNode }) {
  const authInit = useAuthStore(s => s._init);
  const dsInit = useDSStore(s => s._init);

  useEffect(() => {
    authInit();
    dsInit();
  }, []);

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInit>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/*" element={
            <ProtectedRoute>
              <AppShell>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/studio" element={<DashboardPage />} />
                  <Route path="/studio/:id" element={<StudioPage />} />
                  <Route path="/contracts" element={<ContractsPage />} />
                  <Route path="/users" element={
                    <ProtectedRoute requiredRole="admin">
                      <UsersPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AppShell>
            </ProtectedRoute>
          } />
        </Routes>
      </AppInit>
    </BrowserRouter>
  );
}
