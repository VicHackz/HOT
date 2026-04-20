import React from 'react';
import type { ProductCategory, ProductStatus, Supplier } from '../../types';
import { Select } from '../common/Input';
import './FilterBar.css';

interface FilterBarProps {
  suppliers: Supplier[];
  selectedSupplier: string;
  selectedCategory: ProductCategory | 'All';
  selectedStatus: ProductStatus | 'All';
  searchQuery: string;
  onSupplierChange: (supplierId: string) => void;
  onCategoryChange: (category: ProductCategory | 'All') => void;
  onStatusChange: (status: ProductStatus | 'All') => void;
  onSearchChange: (query: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  suppliers,
  selectedSupplier,
  selectedCategory,
  selectedStatus,
  searchQuery,
  onSupplierChange,
  onCategoryChange,
  onStatusChange,
  onSearchChange,
}) => {
  return (
    <div className="filter-bar">
      <div className="filter-row">
        <Select
          label="Supplier"
          value={selectedSupplier}
          onChange={(e) => onSupplierChange(e.target.value)}
        >
          <option value="All">All Suppliers</option>
          {suppliers.map(supplier => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </Select>

        <Select
          label="Category"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value as ProductCategory | 'All')}
        >
          <option value="All">All Categories</option>
          <option value="Sofa">Sofa</option>
          <option value="Chair">Chair</option>
          <option value="Table">Table</option>
          <option value="Fabric">Fabric</option>
          <option value="Other">Other</option>
        </Select>

        <Select
          label="Status"
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value as ProductStatus | 'All')}
        >
          <option value="All">All Status</option>
          <option value="Pending Review">Pending Review</option>
          <option value="Approved">Approved</option>
          <option value="Archived">Archived</option>
        </Select>

        <div className="search-box">
          <label className="input-label">Search Product</label>
          <input
            type="text"
            className="input search-input"
            placeholder="Search by product name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
