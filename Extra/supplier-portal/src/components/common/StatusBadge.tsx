import React from 'react';
import type { ProductStatus } from '../../types';
import './StatusBadge.css';

interface StatusBadgeProps {
  status: ProductStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusClass = () => {
    switch (status) {
      case 'Pending Review':
        return 'badge-pending';
      case 'Approved':
        return 'badge-approved';
      case 'Archived':
        return 'badge-archived';
      default:
        return '';
    }
  };

  return (
    <span className={`status-badge ${getStatusClass()}`}>
      {status}
    </span>
  );
};
