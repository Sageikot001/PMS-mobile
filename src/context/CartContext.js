import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Storage key for cart data
const CART_KEY = '@cart_items';

// Create the Cart Context
const CartContext = createContext();

// Cart Provider component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load cart items from storage on app start
  useEffect(() => {
    loadCartItems();
  }, []);

  // Load cart items from AsyncStorage
  const loadCartItems = async () => {
    try {
      setLoading(true);
      const storedItems = await AsyncStorage.getItem(CART_KEY);
      if (storedItems) {
        setCartItems(JSON.parse(storedItems));
      }
    } catch (error) {
      console.error('Error loading cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save cart items to AsyncStorage
  const saveCartItems = async (items) => {
    try {
      await AsyncStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart items:', error);
    }
  };

  // Add item to cart
  const addToCart = async (item) => {
    try {
      setLoading(true);
      const newCartItems = [...cartItems];
      
      // Check if item already exists in cart
      const existingItemIndex = newCartItems.findIndex(cartItem => 
        cartItem.id === item.id && cartItem.type === item.type
      );

      if (existingItemIndex >= 0) {
        // Update quantity if item already exists
        newCartItems[existingItemIndex].quantity += item.quantity || 1;
      } else {
        // Add new item to cart
        const cartItem = {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          type: item.type || 'product', // 'product', 'drug', 'package', 'service'
          image: item.image,
          description: item.description,
          pharmacy: item.pharmacy,
          institution: item.institution,
          addedAt: new Date().toISOString(),
          ...item // Include any additional item properties
        };
        newCartItems.push(cartItem);
      }

      setCartItems(newCartItems);
      await saveCartItems(newCartItems);
      
      Alert.alert(
        'Added to Cart', 
        `${item.name} has been added to your cart`,
        [
          { text: 'Continue Shopping', style: 'default' },
          { text: 'View Cart', onPress: () => {
            // This will be handled by the calling component
          }}
        ]
      );
      
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      const newCartItems = cartItems.filter(item => item.id !== itemId);
      setCartItems(newCartItems);
      await saveCartItems(newCartItems);
    } catch (error) {
      console.error('Error removing from cart:', error);
      Alert.alert('Error', 'Failed to remove item from cart');
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId, quantity) => {
    try {
      setLoading(true);
      const newCartItems = cartItems.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      );
      setCartItems(newCartItems);
      await saveCartItems(newCartItems);
    } catch (error) {
      console.error('Error updating quantity:', error);
      Alert.alert('Error', 'Failed to update quantity');
    } finally {
      setLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      setLoading(true);
      setCartItems([]);
      await AsyncStorage.removeItem(CART_KEY);
    } catch (error) {
      console.error('Error clearing cart:', error);
      Alert.alert('Error', 'Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total price
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Get total number of items
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Get items by type
  const getItemsByType = (type) => {
    return cartItems.filter(item => item.type === type);
  };

  // Add package to cart (special handling for pharmacy packages)
  const addPackageToCart = async (packageData, institution) => {
    const packageItem = {
      id: `package_${packageData.id}_${institution.id}`,
      name: packageData.name,
      price: packageData.price,
      quantity: 1,
      type: 'package',
      description: packageData.description,
      itemCount: packageData.itemCount,
      items: packageData.items,
      institution: {
        id: institution.id,
        name: institution.name,
      },
      icon: packageData.icon,
    };

    return await addToCart(packageItem);
  };

  // Add drug to cart
  const addDrugToCart = async (drug) => {
    const drugItem = {
      id: drug.id,
      name: drug.name,
      price: drug.price,
      quantity: 1,
      type: 'drug',
      description: drug.description,
      dosage: drug.dosage,
      brand: drug.brand,
      pharmacy: drug.pharmacy,
      category: drug.category,
    };

    return await addToCart(drugItem);
  };

  // The context value that will be provided
  const cartContextValue = {
    cartItems,
    loading,
    addToCart,
    addPackageToCart,
    addDrugToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    getItemsByType,
    itemCount: getTotalItems(),
    totalPrice: getTotalPrice(),
  };

  return (
    <CartContext.Provider value={cartContextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 