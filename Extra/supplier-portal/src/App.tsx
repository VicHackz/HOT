import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './pages/LoginPage';
import { SupplierPage } from './pages/SupplierPage';
import { AdminPage } from './pages/AdminPage';
import { ProductDetailPage } from './pages/ProductDetailPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: 'admin' | 'supplier' }> = ({
  children,
  role,
}) => {
  const { user } = useApp();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user } = useApp();

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/supplier'} replace /> : <LoginPage />}
      />
      <Route
        path="/supplier"
        element={
          <ProtectedRoute role="supplier">
            <SupplierPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/product/:id"
        element={
          <ProtectedRoute role="admin">
            <ProductDetailPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
