import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../utils/useToast';
import { UploadForm } from '../components/supplier/UploadForm';
import { HistoryTable } from '../components/supplier/HistoryTable';
import { ToastContainer } from '../components/common/Toast';
import { Button } from '../components/common/Button';
import type { Product } from '../types';
import './SupplierPage.css';

type Tab = 'upload' | 'history';

export const SupplierPage: React.FC = () => {
  const { user, products, addProduct, logout } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const { toasts, showToast, removeToast } = useToast();

  if (!user || user.role !== 'supplier' || !user.supplier) {
    return <div>Unauthorized</div>;
  }

  const supplierProducts = products
    .filter(p => p.supplierId === user.supplier!.id)
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

  const handleProductSubmit = (product: Product) => {
    addProduct(product);
    showToast('Product uploaded successfully!', 'success');
    setActiveTab('history');
  };

  return (
    <div className="supplier-page">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <header className="supplier-header">
        <div className="container">
          <div className="header-content">
            <div>
              <img src="/logo.png" alt="Home of Textile" className="header-logo" />
              <div className="header-info">
                <h1>{user.supplier.name}</h1>
                <p className="header-subtitle">{user.supplier.country}</p>
              </div>
            </div>
            <Button variant="ghost" onClick={logout}>
              Log Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'upload' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            Upload Product
          </button>
          <button
            className={`tab ${activeTab === 'history' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Upload History ({supplierProducts.length})
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'upload' ? (
            <UploadForm
              supplierId={user.supplier.id}
              supplierName={user.supplier.name}
              onSubmit={handleProductSubmit}
            />
          ) : (
            <HistoryTable products={supplierProducts} />
          )}
        </div>
      </div>
    </div>
  );
};
