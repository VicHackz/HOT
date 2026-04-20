import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Button } from '../components/common/Button';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, suppliers } = useApp();

  const handleAdminLogin = () => {
    setUser({ role: 'admin' });
    navigate('/admin');
  };

  const handleSupplierLogin = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (supplier) {
      setUser({ role: 'supplier', supplier });
      navigate('/supplier');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <img src="/logo.png" alt="Home of Textile" className="login-logo" />
          <h1 className="login-title">Supplier Portal</h1>
          <p className="login-subtitle">Select your role to continue</p>
        </div>

        <div className="login-section">
          <h2>Administrator</h2>
          <Button variant="primary" size="lg" fullWidth onClick={handleAdminLogin}>
            Login as Admin
          </Button>
        </div>

        <div className="login-divider">
          <span>OR</span>
        </div>

        <div className="login-section">
          <h2>Suppliers</h2>
          <div className="supplier-grid">
            {suppliers.map(supplier => (
              <button
                key={supplier.id}
                className="supplier-card"
                onClick={() => handleSupplierLogin(supplier.id)}
              >
                <div className="supplier-name">{supplier.name}</div>
                <div className="supplier-country">{supplier.country}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
