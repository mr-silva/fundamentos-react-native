import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storagedProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (storagedProducts) {
        setProducts(JSON.parse(storagedProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      const checkIfNewProduct = products.find(
        searchedProduct => searchedProduct.id === product.id,
      );

      if (!checkIfNewProduct) {
        setProducts(oldProducts => [
          ...oldProducts,
          { ...product, quantity: 1 },
        ]);

        await AsyncStorage.setItem(
          '@GoMarketplace:products',
          JSON.stringify([...products, { ...product, quantity: 1 }]),
        );

        return;
      }

      const updatedExistentProducts = products.map(mappedProduct => {
        if (mappedProduct.id !== product.id) return mappedProduct;

        const updateExistentProduct = {
          ...mappedProduct,
          quantity: mappedProduct.quantity + 1,
        };

        return updateExistentProduct;
      });

      setProducts(updatedExistentProducts);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(updatedExistentProducts),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const incrementProduct = products.map(mappedProduct => {
        if (mappedProduct.id !== id) return mappedProduct;

        const incrementExistentProduct = {
          ...mappedProduct,
          quantity: mappedProduct.quantity + 1,
        };

        return incrementExistentProduct;
      });

      setProducts(incrementProduct);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(incrementProduct),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const decrementProduct = products
        .map(mappedProduct => {
          if (mappedProduct.id !== id) return mappedProduct;

          const decrementExistentProduct = {
            ...mappedProduct,
            quantity: mappedProduct.quantity - 1,
          };

          return decrementExistentProduct;
        })
        .filter(filteredProduct => filteredProduct.quantity > 0);

      setProducts(decrementProduct);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(decrementProduct),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
