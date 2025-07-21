import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  Alert,
  ScrollView,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';

const Cart = ({ navigation, route }) => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getTotalPrice,
    loading 
  } = useCart();
  
  const [processingCheckout, setProcessingCheckout] = useState(false);

  // Handle quantity update
  const handleQuantityUpdate = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      Alert.alert(
        'Remove Item',
        'Do you want to remove this item from your cart?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Remove', onPress: () => removeFromCart(itemId) }
        ]
      );
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  // Handle checkout process
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Add items to your cart before checking out');
      return;
    }

    Alert.alert(
      'Proceed to Checkout',
      `Total: ₦${getTotalPrice().toLocaleString()}\n\nChoose payment method:`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Pay with Wallet', 
          onPress: () => processCheckout('wallet') 
        },
        { 
          text: 'Pay with Card', 
          onPress: () => processCheckout('card') 
        }
      ]
    );
  };

  // Process checkout
  const processCheckout = async (paymentMethod) => {
    setProcessingCheckout(true);
    
    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create order object
      const order = {
        id: `order_${Date.now()}`,
        items: cartItems,
        totalAmount: getTotalPrice(),
        paymentMethod,
        status: 'pending',
        orderDate: new Date().toISOString(),
      };

      // Clear cart after successful order
      await clearCart();
      
      Alert.alert(
        'Order Placed Successfully!',
        `Your order #${order.id.slice(-6)} has been placed.\n\nTotal: ₦${order.totalAmount.toLocaleString()}\nPayment: ${paymentMethod === 'wallet' ? 'Wallet' : 'Card'}`,
        [
          { text: 'View Orders', onPress: () => navigation.navigate('Orders') },
          { text: 'Continue Shopping', onPress: () => navigation.navigate('Home') }
        ]
      );
      
    } catch (error) {
      Alert.alert('Checkout Failed', 'Please try again later');
    } finally {
      setProcessingCheckout(false);
    }
  };

  // Handle clear cart
  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearCart }
      ]
    );
  };

  // Render individual cart item
  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
          <TouchableOpacity 
            onPress={() => removeFromCart(item.id)}
            style={styles.removeButton}
          >
            <Ionicons name="trash-outline" size={20} color="#ff4444" />
          </TouchableOpacity>
        </View>
        
        {item.description && (
          <Text style={styles.itemDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        
        <View style={styles.itemDetails}>
          {item.type === 'drug' && item.dosage && (
            <Text style={styles.itemDetail}>Dosage: {item.dosage}</Text>
          )}
          {item.type === 'package' && item.itemCount && (
            <Text style={styles.itemDetail}>{item.itemCount} items included</Text>
          )}
          {item.pharmacy && (
            <Text style={styles.itemDetail}>From: {item.pharmacy.name || item.pharmacy}</Text>
          )}
          {item.institution && (
            <Text style={styles.itemDetail}>From: {item.institution.name}</Text>
          )}
        </View>
        
        <View style={styles.itemFooter}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity 
              onPress={() => handleQuantityUpdate(item.id, item.quantity - 1)}
              style={styles.quantityButton}
            >
              <Ionicons name="remove" size={20} color="#007bff" />
            </TouchableOpacity>
            <Text style={styles.quantity}>{item.quantity}</Text>
            <TouchableOpacity 
              onPress={() => handleQuantityUpdate(item.id, item.quantity + 1)}
              style={styles.quantityButton}
            >
              <Ionicons name="add" size={20} color="#007bff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.itemPrice}>
              ₦{(item.price * item.quantity).toLocaleString()}
            </Text>
            {item.quantity > 1 && (
              <Text style={styles.unitPrice}>
                ₦{item.price.toLocaleString()} each
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  // Render empty cart
  const renderEmptyCart = () => (
    <View style={styles.emptyStateContainer}>
      <Ionicons name="cart-outline" size={80} color="#ccc" />
      <Text style={styles.emptyStateTitle}>Your cart is empty</Text>
      <Text style={styles.emptyStateSubtitle}>Add items to your cart to get started</Text>
      <TouchableOpacity 
        style={styles.addItemsButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.addItemsButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  // Cart summary component
  const CartSummary = () => (
    <View style={styles.summaryContainer}>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Subtotal ({cartItems.length} items)</Text>
        <Text style={styles.summaryValue}>₦{getTotalPrice().toLocaleString()}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Delivery Fee</Text>
        <Text style={styles.summaryValue}>₦500</Text>
      </View>
      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>₦{(getTotalPrice() + 500).toLocaleString()}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart ({cartItems.length})</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={handleClearCart}>
            <Ionicons name="trash-outline" size={24} color="#ff4444" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading cart...</Text>
        </View>
      ) : cartItems.length === 0 ? (
        renderEmptyCart()
      ) : (
        <>
          {/* Cart Items */}
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id}
            style={styles.cartList}
            showsVerticalScrollIndicator={false}
          />

          {/* Cart Summary */}
          <CartSummary />

          {/* Checkout Button */}
          <View style={styles.checkoutContainer}>
        <TouchableOpacity 
              style={[styles.checkoutButton, processingCheckout && styles.disabledButton]}
              onPress={handleCheckout}
              disabled={processingCheckout}
            >
              {processingCheckout ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text style={styles.checkoutButtonText}>
                    Proceed to Checkout
                  </Text>
                  <Text style={styles.checkoutButtonSubtext}>
                    ₦{(getTotalPrice() + 500).toLocaleString()}
                  </Text>
                </>
              )}
        </TouchableOpacity>
      </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  cartList: {
    flex: 1,
    padding: 16,
  },
  cartItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemInfo: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  removeButton: {
    padding: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  itemDetails: {
    marginBottom: 12,
  },
  itemDetail: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  quantity: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
  },
  unitPrice: {
    fontSize: 12,
    color: '#888',
  },
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  checkoutContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  checkoutButton: {
    backgroundColor: '#007bff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkoutButtonSubtext: {
    color: '#fff',
    fontSize: 14,
    marginTop: 2,
    opacity: 0.9,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  addItemsButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addItemsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Cart; 