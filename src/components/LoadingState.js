import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Modal,
  TouchableOpacity,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Full screen loading overlay
export const FullScreenLoading = ({ 
  visible = true, 
  text = 'Loading...', 
  backgroundColor = 'rgba(0,0,0,0.5)' 
}) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      statusBarTranslucent={true}
    >
      <View style={[styles.fullScreenContainer, { backgroundColor }]}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>{text}</Text>
        </View>
      </View>
    </Modal>
  );
};

// Inline loading component
export const InlineLoading = ({ 
  size = 'small', 
  color = '#007bff', 
  text = '', 
  style = {} 
}) => {
  return (
    <View style={[styles.inlineContainer, style]}>
      <ActivityIndicator size={size} color={color} />
      {text ? <Text style={styles.inlineText}>{text}</Text> : null}
    </View>
  );
};

// Skeleton loading for lists
export const SkeletonItem = ({ height = 80, style = {} }) => {
  return (
    <View style={[styles.skeletonItem, { height }, style]}>
      <View style={styles.skeletonAvatar} />
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonLine} />
        <View style={[styles.skeletonLine, styles.skeletonLineShort]} />
      </View>
    </View>
  );
};

// Skeleton loading for content
export const SkeletonContent = ({ lines = 3, style = {} }) => {
  return (
    <View style={[styles.skeletonContainer, style]}>
      {Array.from({ length: lines }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.skeletonContentLine,
            index === lines - 1 && styles.skeletonContentLineShort,
          ]}
        />
      ))}
    </View>
  );
};

// Button loading state
export const LoadingButton = ({ 
  loading = false, 
  text = 'Submit', 
  loadingText = 'Processing...', 
  onPress,
  style = {},
  textStyle = {},
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.loadingButton,
        (loading || disabled) && styles.loadingButtonDisabled,
        style,
      ]}
      onPress={loading || disabled ? null : onPress}
      disabled={loading || disabled}
    >
      {loading ? (
        <View style={styles.loadingButtonContent}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={[styles.loadingButtonText, textStyle]}>
            {loadingText}
          </Text>
        </View>
      ) : (
        <Text style={[styles.loadingButtonText, textStyle]}>{text}</Text>
      )}
    </TouchableOpacity>
  );
};

// Page loading component
export const PageLoading = ({ message = 'Loading page...' }) => {
  return (
    <View style={styles.pageLoadingContainer}>
      <ActivityIndicator size="large" color="#007bff" />
      <Text style={styles.pageLoadingText}>{message}</Text>
    </View>
  );
};

// Loading state for empty content
export const EmptyStateLoading = ({ 
  title = 'Loading...', 
  subtitle = 'Please wait while we fetch your data' 
}) => {
  return (
    <View style={styles.emptyStateContainer}>
      <ActivityIndicator size="large" color="#007bff" />
      <Text style={styles.emptyStateTitle}>{title}</Text>
      <Text style={styles.emptyStateSubtitle}>{subtitle}</Text>
    </View>
  );
};

// Refresh loading for pull-to-refresh
export const RefreshLoading = ({ visible = false, text = 'Refreshing...' }) => {
  if (!visible) return null;
  
  return (
    <View style={styles.refreshContainer}>
      <ActivityIndicator size="small" color="#007bff" />
      <Text style={styles.refreshText}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  // Full screen loading
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    height: height,
  },
  loadingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  
  // Inline loading
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  inlineText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  
  // Skeleton loading
  skeletonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 1,
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  skeletonContent: {
    flex: 1,
    marginLeft: 12,
  },
  skeletonLine: {
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    marginBottom: 8,
  },
  skeletonLineShort: {
    width: '70%',
  },
  
  // Skeleton content
  skeletonContainer: {
    padding: 16,
  },
  skeletonContentLine: {
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 12,
  },
  skeletonContentLineShort: {
    width: '80%',
  },
  
  // Loading button
  loadingButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  loadingButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  loadingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Page loading
  pageLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pageLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  
  // Empty state loading
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Refresh loading
  refreshContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  refreshText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
});

export default {
  FullScreenLoading,
  InlineLoading,
  SkeletonItem,
  SkeletonContent,
  LoadingButton,
  PageLoading,
  EmptyStateLoading,
  RefreshLoading,
}; 