import React, { useState } from 'react';
import type { Product } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import './HistoryTable.css';

interface HistoryTableProps {
  products: Product[];
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ products }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (products.length === 0) {
    return (
      <div className="empty-state">
        <p>No products uploaded yet</p>
        <p className="empty-state-hint">Use the Upload Product tab to add your first product</p>
      </div>
    );
  }

  return (
    <>
      <div className="history-table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Color</th>
              <th>Upload Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="history-table-row"
              >
                <td>
                  <img src={product.image} alt={product.productName} className="product-thumbnail" />
                </td>
                <td className="product-name-cell">{product.productName}</td>
                <td>{product.category}</td>
                <td>{product.color}</td>
                <td>{new Date(product.uploadDate).toLocaleDateString()}</td>
                <td>
                  <StatusBadge status={product.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Product Details</h2>
              <button className="modal-close" onClick={() => setSelectedProduct(null)}>×</button>
            </div>

            <div className="modal-body">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.productName}
                className="modal-image"
              />

              <div className="product-details">
                <div className="detail-row">
                  <span className="detail-label">Product Name:</span>
                  <span>{selectedProduct.productName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Category:</span>
                  <span>{selectedProduct.category}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Color:</span>
                  <span>{selectedProduct.color}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Material:</span>
                  <span>{selectedProduct.material}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Weight:</span>
                  <span>{selectedProduct.weight} {selectedProduct.weightUnit}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Dimensions:</span>
                  <span>
                    {selectedProduct.dimensions.width} × {selectedProduct.dimensions.height} × {selectedProduct.dimensions.depth} cm
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Collection:</span>
                  <span>{selectedProduct.collectionName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Season:</span>
                  <span>{selectedProduct.season}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <StatusBadge status={selectedProduct.status} />
                </div>
                {selectedProduct.description && (
                  <div className="detail-row detail-description">
                    <span className="detail-label">Description:</span>
                    <p>{selectedProduct.description}</p>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-label">Upload Date:</span>
                  <span>{new Date(selectedProduct.uploadDate).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
