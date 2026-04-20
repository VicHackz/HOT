import type { Product } from '../types';

const STORAGE_KEY = 'hot-portal-data';

export const loadProducts = (): Product[] | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return data.products;
    }
  } catch (e) {
    console.error('Failed to load from localStorage:', e);
  }
  return null;
};

export const saveProducts = (products: Product[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ products }));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

export const clearStorage = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
