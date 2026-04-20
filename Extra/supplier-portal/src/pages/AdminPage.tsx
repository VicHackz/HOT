import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import type { ProductCategory, ProductStatus } from '../types';
import { FilterBar } from '../components/admin/FilterBar';
import { ProductGrid } from '../components/admin/ProductGrid';
import { Button } from '../components/common/Button';
import './AdminPage.css';

export const AdminPage: React.FC = () => {
  const { products, suppliers, logout } = useApp();
  const [selectedSupplier, setSelectedSupplier] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<ProductStatus | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Supplier filter
      if (selectedSupplier !== 'All' && product.supplierId !== selectedSupplier) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'All' && product.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'All' && product.status !== selectedStatus) {
        return false;
      }

      // Search filter
      if (searchQuery && !product.productName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      return true;
    }).sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  }, [products, selectedSupplier, selectedCategory, selectedStatus, searchQuery]);

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div className="container">
          <div className="header-content">
            <div>
              <img src="/logo.png" alt="Home of Textile" className="header-logo" />
              <div className="header-info">
                <h1>Admin Portal</h1>
                <p className="header-subtitle">Manage all supplier uploads</p>
              </div>
            </div>
            <Button variant="ghost" onClick={logout}>
              Log Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container">
        <FilterBar
          suppliers={suppliers}
          selectedSupplier={selectedSupplier}
          selectedCategory={selectedCategory}
          selectedStatus={selectedStatus}
          searchQuery={searchQuery}
          onSupplierChange={setSelectedSupplier}
          onCategoryChange={setSelectedCategory}
          onStatusChange={setSelectedStatus}
          onSearchChange={setSearchQuery}
        />

        <ProductGrid products={filteredProducts} />
      </div>
    </div>
  );
};
