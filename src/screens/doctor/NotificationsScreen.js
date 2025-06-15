import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import notificationService from '../../services/NotificationService';

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [scheduledNotifications, setScheduledNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load notifications when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      
      // Load notification history
      const history = await notificationService.getNotificationHistory();
      setNotifications(history);
      
      // Load scheduled notifications
      const scheduled = notificationService.getScheduledNotifications();
      setScheduledNotifications(scheduled);
      
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, []);

  const handleClearAllNotifications = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notification history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              // Clear notification history
              await notificationService.clearNotificationHistory();
              setNotifications([]);
              Alert.alert('Success', 'All notifications cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear notifications');
            }
          }
        }
      ]
    );
  };

  const handleCancelScheduledNotification = (notificationId) => {
    Alert.alert(
      'Cancel Notification',
      'Are you sure you want to cancel this scheduled notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            const success = notificationService.cancelNotification(notificationId);
            if (success) {
              setScheduledNotifications(prev => 
                prev.filter(notification => notification.id !== notificationId)
              );
              Alert.alert('Success', 'Notification cancelled');
            } else {
              Alert.alert('Error', 'Failed to cancel notification');
            }
          }
        }
      ]
    );
  };

  const formatNotificationTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatScheduledTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment_reminder':
        return 'calendar';
      case 'chat':
        return 'chatbubble';
      case 'call':
        return 'call';
      case 'appointment_ready':
        return 'person';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'appointment_reminder':
        return '#4A90E2';
      case 'chat':
        return '#17a2b8';
      case 'call':
        return '#28a745';
      case 'appointment_ready':
        return '#fd7e14';
      default:
        return '#6c757d';
    }
  };

  const renderNotificationItem = ({ item: notification }) => {
    const iconColor = getNotificationColor(notification.type);
    const iconName = getNotificationIcon(notification.type);

    return (
      <TouchableOpacity
        style={styles.notificationItem}
        onPress={() => {
          // Handle notification tap - navigate to relevant screen
          if (notification.onPress) {
            notification.onPress();
          }
        }}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
          <Ionicons name={iconName} size={20} color="#ffffff" />
        </View>
        
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {notification.message}
          </Text>
          <Text style={styles.notificationTime}>
            {formatNotificationTime(notification.timestamp)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderScheduledNotificationItem = ({ item: notification }) => {
    const iconColor = getNotificationColor(notification.type);
    const iconName = getNotificationIcon(notification.type);
    const isOverdue = new Date(notification.scheduledTime) < new Date();

    return (
      <TouchableOpacity
        style={[styles.scheduledNotificationItem, isOverdue && styles.overdueNotification]}
        onPress={() => handleCancelScheduledNotification(notification.id)}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
          <Ionicons name={iconName} size={20} color="#ffffff" />
        </View>
        
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {notification.message}
          </Text>
          <Text style={[styles.scheduledTime, isOverdue && styles.overdueText]}>
            Scheduled for: {formatScheduledTime(notification.scheduledTime)}
          </Text>
        </View>
        
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancelScheduledNotification(notification.id)}
        >
          <Ionicons name="close-circle" size={24} color="#dc3545" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyNotifications = () => (
    <View style={styles.emptyState}>
      <Ionicons name="notifications-outline" size={80} color="#E9ECEF" />
      <Text style={styles.emptyTitle}>No notifications</Text>
      <Text style={styles.emptySubtitle}>
        You'll see your notifications here when you receive them
      </Text>
    </View>
  );

  const renderEmptyScheduled = () => (
    <View style={styles.emptyState}>
      <Ionicons name="time-outline" size={80} color="#E9ECEF" />
      <Text style={styles.emptyTitle}>No scheduled notifications</Text>
      <Text style={styles.emptySubtitle}>
        Your upcoming appointment reminders will appear here
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Notifications</Text>
        
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={handleClearAllNotifications}
        >
          <Ionicons name="trash-outline" size={24} color="#dc3545" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <View style={styles.tabsWrapper}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Text style={[styles.tabText, styles.activeTabText]}>
              History ({notifications.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>
              Scheduled ({scheduledNotifications.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notification Lists */}
      <View style={styles.content}>
        {/* Recent Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Notifications</Text>
          <FlatList
            data={notifications.slice(0, 10)} // Show last 10 notifications
            renderItem={renderNotificationItem}
            keyExtractor={(item, index) => `notification_${item.id || index}`}
            ListEmptyComponent={renderEmptyNotifications}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Scheduled Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scheduled Notifications</Text>
          <FlatList
            data={scheduledNotifications}
            renderItem={renderScheduledNotificationItem}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={renderEmptyScheduled}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
  },
  clearButton: {
    padding: 8,
  },
  tabContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  tabsWrapper: {
    flexDirection: 'row',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4A90E2',
  },
  tabText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  activeTabText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  scheduledNotificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  overdueNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#ADB5BD',
  },
  scheduledTime: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '500',
  },
  overdueText: {
    color: '#dc3545',
  },
  cancelButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7F8C8D',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#ADB5BD',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default NotificationsScreen; 