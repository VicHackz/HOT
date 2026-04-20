export type UserRole = 'admin' | 'supplier';

export type ProductStatus = 'Pending Review' | 'Approved' | 'Archived';

export type ProductCategory = 'Sofa' | 'Chair' | 'Table' | 'Fabric' | 'Other';

export interface Supplier {
  id: string;
  name: string;
  country: string;
}

export interface Product {
  id: string;
  supplierId: string;
  supplierName: string;
  image: string;
  productName: string;
  category: ProductCategory;
  color: string;
  material: string;
  weight: number;
  weightUnit: 'kg' | 'g';
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  collectionName: string;
  season: string;
  description: string;
  status: ProductStatus;
  uploadDate: string;
}

export interface User {
  role: UserRole;
  supplier?: Supplier;
}

export interface AppState {
  user: User | null;
  suppliers: Supplier[];
  products: Product[];
}
