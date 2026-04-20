import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import './ProductGrid.css';

interface ProductGridProps {
  products: Product[];
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const navigate = useNavigate();

  if (products.length === 0) {
    return (
      <div className="empty-state">
        <p>No products found</p>
        <p className="empty-state-hint">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <>
      <div className="products-count">
        Showing {products.length} product{products.length !== 1 ? 's' : ''}
      </div>
      <div className="product-grid">
        {products.map(product => (
          <div
            key={product.id}
            className="product-card"
            onClick={() => navigate(`/admin/product/${product.id}`)}
          >
            <div className="product-card-image">
              <img src={product.image} alt={product.productName} />
              <div className="product-card-status">
                <StatusBadge status={product.status} />
              </div>
            </div>
            <div className="product-card-content">
              <h3 className="product-card-title">{product.productName}</h3>
              <p className="product-card-supplier">{product.supplierName}</p>
              <div className="product-card-meta">
                <span className="product-card-category">{product.category}</span>
                <span className="product-card-divider">•</span>
                <span className="product-card-color">{product.color}</span>
              </div>
              <div className="product-card-date">
                {new Date(product.uploadDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
