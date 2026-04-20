import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, Product, AppState } from '../types';
import { suppliers, initialProducts } from '../data/mockData';

interface AppContextType extends AppState {
  setUser: (user: User | null) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'hot-portal-data';

const IMAGE_PREFIX = 'hot-img-';

function restoreImages(prods: Product[]): Product[] {
  return prods.map(p => {
    if (p.image.startsWith(IMAGE_PREFIX)) {
      const stored = localStorage.getItem(p.image);
      return stored ? { ...p, image: stored } : p;
    }
    return p;
  });
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setProducts(restoreImages(data.products || initialProducts));
      } catch (e) {
        setProducts(initialProducts);
      }
    } else {
      setProducts(initialProducts);
    }
  }, []);

  // Save to localStorage when products change.
  // Base64-bilder (data:...) sparas separat per produkt-id för att undvika
  // att ett stort JSON-objekt spränger localStorage-kvoten (5 MB).
  useEffect(() => {
    // Separera ut base64-bilder innan vi serialiserar produktlistan
    const productsForStorage = products.map(p => {
      if (p.image.startsWith('data:')) {
        try {
          localStorage.setItem(IMAGE_PREFIX + p.id, p.image);
        } catch {
          // Kvoten sprängd — behåll URL som fallback, ta bort gammal bild
          localStorage.removeItem(IMAGE_PREFIX + p.id);
        }
        return { ...p, image: IMAGE_PREFIX + p.id }; // platshållare
      }
      return p;
    });

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ products: productsForStorage }));
    } catch {
      // Inga produkter förloras från minnet, bara persistensen misslyckas
    }
  }, [products]);

  const addProduct = (product: Product) => {
    setProducts(prev => [product, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => p.id === id ? { ...p, ...updates } : p)
    );
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        suppliers,
        products,
        setUser,
        addProduct,
        updateProduct,
        logout
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
