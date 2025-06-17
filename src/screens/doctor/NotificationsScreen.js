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
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import notificationService from '../../services/NotificationService';

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('history'); // 'history' or 'scheduled'
  const [notifications, setNotifications] = useState([]);
  const [scheduledNotifications, setScheduledNotifications] = useState([]);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
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
      const scheduled = await notificationService.getScheduledNotifications();
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

  // Handle notification click - navigate to relevant screen
  const handleNotificationPress = (notification) => {
    if (isSelectionMode) {
      toggleNotificationSelection(notification.id);
      return;
    }

    // Navigate based on notification type and data
    switch (notification.type) {
      case 'appointment_reminder':
        if (notification.appointmentId) {
          navigation.navigate('AppointmentDetails', { 
            appointmentId: notification.appointmentId 
          });
        } else {
          navigation.navigate('Appointments');
        }
        break;
      case 'chat':
        if (notification.chatId) {
          navigation.navigate('ChatScreen', { 
            chatId: notification.chatId 
          });
        } else {
          navigation.navigate('ChatListScreen');
        }
        break;
      case 'call':
        if (notification.chatId) {
          navigation.navigate('ChatScreen', { 
            chatId: notification.chatId 
          });
        } else {
          navigation.navigate('ChatListScreen');
        }
        break;
      case 'appointment_ready':
        if (notification.appointmentId) {
          navigation.navigate('AppointmentDetails', { 
            appointmentId: notification.appointmentId 
          });
        } else {
          navigation.navigate('Appointments');
        }
        break;
      default:
        // Default to appointments screen
        navigation.navigate('Appointments');
        break;
    }
  };

  // Handle long press - enter selection mode
  const handleNotificationLongPress = (notification) => {
    Vibration.vibrate(50); // Haptic feedback
    setIsSelectionMode(true);
    setSelectedNotifications([notification.id]);
  };

  // Toggle notification selection
  const toggleNotificationSelection = (notificationId) => {
    setSelectedNotifications(prev => {
      if (prev.includes(notificationId)) {
        const newSelection = prev.filter(id => id !== notificationId);
        if (newSelection.length === 0) {
          setIsSelectionMode(false);
        }
        return newSelection;
      } else {
        return [...prev, notificationId];
      }
    });
  };

  // Delete selected notifications
  const deleteSelectedNotifications = () => {
    Alert.alert(
      'Delete Notifications',
      `Delete ${selectedNotifications.length} notification${selectedNotifications.length > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationService.deleteNotifications(selectedNotifications);
              setNotifications(prev => 
                prev.filter(notification => !selectedNotifications.includes(notification.id))
              );
              setSelectedNotifications([]);
              setIsSelectionMode(false);
              Alert.alert('Success', 'Notifications deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete notifications');
            }
          }
        }
      ]
    );
  };

  // Cancel selection mode
  const cancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedNotifications([]);
  };

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
    const isSelected = selectedNotifications.includes(notification.id);

    return (
      <TouchableOpacity
        style={[
          styles.notificationItem,
          isSelected && styles.selectedNotificationItem
        ]}
        onPress={() => handleNotificationPress(notification)}
        onLongPress={() => handleNotificationLongPress(notification)}
        delayLongPress={500}
      >
        {isSelectionMode && (
          <View style={styles.selectionIndicator}>
            <Ionicons 
              name={isSelected ? "checkmark-circle" : "ellipse-outline"} 
              size={24} 
              color={isSelected ? "#4A90E2" : "#ADB5BD"} 
            />
          </View>
        )}
        
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
    const isSelected = selectedNotifications.includes(notification.id);

    return (
      <TouchableOpacity
        style={[
          styles.scheduledNotificationItem, 
          isOverdue && styles.overdueNotification,
          isSelected && styles.selectedNotificationItem
        ]}
        onPress={() => {
          if (isSelectionMode) {
            toggleNotificationSelection(notification.id);
          } else {
            handleCancelScheduledNotification(notification.id);
          }
        }}
        onLongPress={() => handleNotificationLongPress(notification)}
        delayLongPress={500}
      >
        {isSelectionMode && (
          <View style={styles.selectionIndicator}>
            <Ionicons 
              name={isSelected ? "checkmark-circle" : "ellipse-outline"} 
              size={24} 
              color={isSelected ? "#4A90E2" : "#ADB5BD"} 
            />
          </View>
        )}
        
        <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
          <Ionicons name={iconName} size={20} color="#ffffff" />
        </View>
        
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationMessage} numberOfLines={2}>
            {notification.message}
          </Text>
          <Text style={[styles.scheduledTime, isOverdue && styles.overdueText]}>
            Scheduled: {formatScheduledTime(notification.scheduledTime)}
          </Text>
          {isOverdue && (
            <Text style={styles.overdueLabel}>OVERDUE</Text>
          )}
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
        
        <Text style={styles.headerTitle}>
          {isSelectionMode ? `${selectedNotifications.length} Selected` : 'Notifications'}
        </Text>
        
        {isSelectionMode ? (
          <View style={styles.selectionActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={deleteSelectedNotifications}
            >
              <Ionicons name="trash" size={24} color="#dc3545" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={cancelSelection}
            >
              <Ionicons name="close" size={24} color="#2C3E50" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => {
                // Debug: Show notification service status
                const status = notificationService.getServiceStatus();
                Alert.alert(
                  'Notification Service Status',
                  `Running: ${status.isServiceRunning}\nScheduled: ${status.scheduledNotificationsCount}\nSent: ${status.sentNotificationsCount}\n\nScheduled Notifications:\n${status.scheduledNotifications.map(n => `${n.title} at ${new Date(n.scheduledTime).toLocaleString()}`).join('\n')}`
                );
              }}
            >
              <Ionicons name="information-circle-outline" size={24} color="#4A90E2" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={handleClearAllNotifications}
            >
              <Ionicons name="trash-outline" size={24} color="#dc3545" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            History ({notifications.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'scheduled' && styles.activeTab]}
          onPress={() => setActiveTab('scheduled')}
        >
          <Text style={[styles.tabText, activeTab === 'scheduled' && styles.activeTabText]}>
            Scheduled ({scheduledNotifications.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'history' ? (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={notifications.length === 0 ? styles.emptyContainer : null}
          ListEmptyComponent={renderEmptyNotifications}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={scheduledNotifications}
          renderItem={renderScheduledNotificationItem}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={scheduledNotifications.length === 0 ? styles.emptyContainer : null}
          ListEmptyComponent={renderEmptyScheduled}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
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
  selectionIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  selectedNotificationItem: {
    backgroundColor: '#E9ECEF',
  },
  overdueLabel: {
    color: '#dc3545',
    fontWeight: '600',
  },
  selectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
  },
  list: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NotificationsScreen; 