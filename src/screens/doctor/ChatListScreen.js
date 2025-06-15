import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import chatService from '../../services/ChatService';
import notificationService from '../../services/NotificationService';

const ChatListScreen = () => {
  const navigation = useNavigation();
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize services and load chats
  useEffect(() => {
    initializeServices();
  }, []);

  // Refresh chats when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadChats();
    }, [])
  );

  // Filter chats based on search query
  useEffect(() => {
    let filteredData = [...chats];
    
    // Add AI Chatbot as first item (unless searching)
    if (searchQuery.trim() === '') {
      const aiChatbot = {
        id: 'ai_medical_assistant',
        isAI: true,
        participants: [
          { id: 'doctor_123', name: 'You', type: 'doctor' },
          { id: 'ai_assistant', name: 'Medical AI Assistant', type: 'ai' }
        ],
        lastMessage: {
          text: 'Ask me anything about medical conditions, treatments, or drug interactions...',
          timestamp: new Date().toISOString(),
          senderId: 'ai_assistant'
        },
        lastActivity: new Date().toISOString(),
        unreadCount: 0,
        status: 'online'
      };
      filteredData.unshift(aiChatbot);
    } else {
      // Filter existing chats
      filteredData = chats.filter(chat => {
        const otherParticipant = chat.participants.find(p => p.id !== chatService.currentUserId);
        return otherParticipant?.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
    
    setFilteredChats(filteredData);
  }, [chats, searchQuery]);

  const initializeServices = async () => {
    try {
      // Initialize chat service with current user ID (you'd get this from auth)
      await chatService.initialize('doctor_123');
      await notificationService.initialize();
      loadChats();
    } catch (error) {
      console.error('Error initializing services:', error);
      Alert.alert('Error', 'Failed to initialize chat service');
    }
  };

  const loadChats = async () => {
    try {
      setIsLoading(true);
      const allChats = chatService.getAllChats();
      setChats(allChats);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatPress = (chat) => {
    if (chat.isAI) {
      // Navigate to AI Chat screen
      navigation.navigate('AIChatScreen');
    } else {
      navigation.navigate('ChatScreen', { chatId: chat.id });
    }
  };

  const handleCreateNewChat = () => {
    // For demo purposes, create a new chat with a mock patient
    const mockPatients = [
      { id: 'patient_1', name: 'Sarah Johnson', type: 'patient' },
      { id: 'patient_2', name: 'Michael Chen', type: 'patient' },
      { id: 'patient_3', name: 'Emma Thompson', type: 'patient' },
      { id: 'patient_4', name: 'David Wilson', type: 'patient' },
    ];

    Alert.alert(
      'Start New Chat',
      'Select a patient to start chatting with:',
      [
        ...mockPatients.map(patient => ({
          text: patient.name,
          onPress: () => createNewChat(patient.id, patient.name, patient.type)
        })),
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const createNewChat = async (patientId, patientName, patientType) => {
    try {
      const chat = await chatService.createChat(patientId, patientName, patientType);
      loadChats();
      navigation.navigate('ChatScreen', { chatId: chat.id });
    } catch (error) {
      console.error('Error creating chat:', error);
      Alert.alert('Error', 'Failed to create new chat');
    }
  };

  const formatLastMessageTime = (timestamp) => {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - messageDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const getLastMessagePreview = (chat) => {
    if (!chat.lastMessage) return 'No messages yet';
    
    const message = chat.lastMessage;
    const isFromCurrentUser = message.senderId === chatService.currentUserId;
    const prefix = isFromCurrentUser ? 'You: ' : '';
    
    switch (message.type) {
      case 'call_start':
        return `${prefix}Started a call`;
      case 'call_end':
        return `${prefix}Call ended`;
      default:
        return `${prefix}${message.text}`;
    }
  };

  const renderChatItem = ({ item: chat }) => {
    const otherParticipant = chat.participants.find(p => p.id !== chatService.currentUserId);
    const hasUnread = chat.unreadCount > 0;
    const isAI = chat.isAI;

    return (
      <TouchableOpacity
        style={[
          styles.chatItem, 
          hasUnread && styles.unreadChatItem,
          isAI && styles.aiChatItem
        ]}
        onPress={() => handleChatPress(chat)}
      >
        <View style={styles.avatarContainer}>
          {isAI ? (
            <View style={[styles.avatar, styles.aiAvatar]}>
              <Ionicons name="medical" size={24} color="#ffffff" />
            </View>
          ) : (
            <View style={[styles.avatar, { backgroundColor: getAvatarColor(otherParticipant?.name) }]}>
              <Text style={styles.avatarText}>
                {otherParticipant?.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {chat.status === 'online' && <View style={styles.onlineIndicator} />}
          {isAI && <View style={styles.aiIndicator}>
            <Ionicons name="flash" size={10} color="#ffffff" />
          </View>}
        </View>

        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={[styles.chatName, hasUnread && styles.unreadText, isAI && styles.aiChatName]}>
              {otherParticipant?.name || 'Unknown'}
              {isAI && ' 🤖'}
            </Text>
            <Text style={styles.chatTime}>
              {chat.lastMessage ? formatLastMessageTime(chat.lastMessage.timestamp) : ''}
            </Text>
          </View>
          
          <View style={styles.chatFooter}>
            <Text style={[styles.lastMessage, hasUnread && styles.unreadText, isAI && styles.aiLastMessage]} numberOfLines={1}>
              {getLastMessagePreview(chat)}
            </Text>
            {hasUnread && !isAI && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>
                  {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                </Text>
              </View>
            )}
            {isAI && (
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>AI</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getAvatarColor = (name) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="chatbubbles-outline" size={80} color="#E9ECEF" />
      <Text style={styles.emptyTitle}>No chats yet</Text>
      <Text style={styles.emptySubtitle}>
        Start a conversation with your patients
      </Text>
      <TouchableOpacity style={styles.startChatButton} onPress={handleCreateNewChat}>
        <Text style={styles.startChatButtonText}>Start New Chat</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.newChatButton} onPress={handleCreateNewChat}>
          <Ionicons name="add" size={24} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7F8C8D" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search conversations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#7F8C8D"
        />
      </View>

      {/* Chat List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading chats...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          style={styles.chatList}
          contentContainerStyle={filteredChats.length === 0 ? styles.emptyContainer : null}
          ListEmptyComponent={renderEmptyState}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  newChatButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2C3E50',
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  unreadChatItem: {
    backgroundColor: '#F8F9FF',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#28a745',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  chatTime: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#7F8C8D',
    marginRight: 8,
  },
  unreadText: {
    fontWeight: '600',
    color: '#2C3E50',
  },
  unreadBadge: {
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyContainer: {
    flex: 1,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#7F8C8D',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#ADB5BD',
    textAlign: 'center',
    marginBottom: 30,
  },
  startChatButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  startChatButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  aiChatItem: {
    backgroundColor: '#F8F9FF',
  },
  aiAvatar: {
    backgroundColor: '#4A90E2',
  },
  aiIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#28a745',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  aiChatName: {
    fontWeight: '600',
    color: '#2C3E50',
  },
  aiLastMessage: {
    fontWeight: '600',
    color: '#2C3E50',
  },
  aiBadge: {
    backgroundColor: '#28a745',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  aiBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default ChatListScreen; 