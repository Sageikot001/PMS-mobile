import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from './NotificationService';

class ChatService {
  constructor() {
    this.activeChats = new Map();
    this.messageListeners = new Map();
    this.connectionStatus = 'disconnected';
    this.currentUserId = null;
  }

  // Initialize chat service
  async initialize(userId) {
    try {
      this.currentUserId = userId;
      await this.loadChats();
      this.connectionStatus = 'connected';
      console.log('Chat Service initialized for user:', userId);
    } catch (error) {
      console.error('Failed to initialize chat service:', error);
    }
  }

  // Load existing chats from storage
  async loadChats() {
    try {
      const chatsData = await AsyncStorage.getItem(`chats_${this.currentUserId}`);
      if (chatsData) {
        const chats = JSON.parse(chatsData);
        this.activeChats = new Map(Object.entries(chats));
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  }

  // Save chats to storage
  async saveChats() {
    try {
      const chatsObject = Object.fromEntries(this.activeChats);
      await AsyncStorage.setItem(`chats_${this.currentUserId}`, JSON.stringify(chatsObject));
    } catch (error) {
      console.error('Error saving chats:', error);
    }
  }

  // Create or get existing chat
  async createChat(participantId, participantName, participantType = 'patient') {
    const chatId = this.generateChatId(this.currentUserId, participantId);
    
    if (!this.activeChats.has(chatId)) {
      const newChat = {
        id: chatId,
        participants: [
          { id: this.currentUserId, name: 'You', type: 'doctor' },
          { id: participantId, name: participantName, type: participantType }
        ],
        messages: [],
        lastMessage: null,
        lastActivity: new Date().toISOString(),
        unreadCount: 0,
        status: 'active'
      };
      
      this.activeChats.set(chatId, newChat);
      await this.saveChats();
    }
    
    return this.activeChats.get(chatId);
  }

  // Send text message
  async sendMessage(chatId, messageText, messageType = 'text') {
    try {
      const chat = this.activeChats.get(chatId);
      if (!chat) {
        throw new Error('Chat not found');
      }

      const message = {
        id: this.generateMessageId(),
        chatId,
        senderId: this.currentUserId,
        senderName: 'You',
        text: messageText,
        type: messageType,
        timestamp: new Date().toISOString(),
        status: 'sent',
        readBy: [this.currentUserId]
      };

      // Add message to chat
      chat.messages.push(message);
      chat.lastMessage = message;
      chat.lastActivity = message.timestamp;

      // Update chat in memory and storage
      this.activeChats.set(chatId, chat);
      await this.saveChats();

      // Notify listeners
      this.notifyMessageListeners(chatId, message);

      // In a real app, you'd send this to your backend
      // For now, we'll simulate receiving a response
      setTimeout(() => {
        this.simulateResponse(chatId);
      }, 1000 + Math.random() * 2000);

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Simulate receiving a message (for testing)
  async simulateResponse(chatId) {
    const chat = this.activeChats.get(chatId);
    if (!chat) return;

    const otherParticipant = chat.participants.find(p => p.id !== this.currentUserId);
    if (!otherParticipant) return;

    const responses = [
      'Thank you for your message.',
      'I understand your concern.',
      'Let me check that for you.',
      'That sounds good.',
      'I\'ll get back to you shortly.',
      'Please let me know if you have any other questions.'
    ];

    const responseText = responses[Math.floor(Math.random() * responses.length)];
    
    const message = {
      id: this.generateMessageId(),
      chatId,
      senderId: otherParticipant.id,
      senderName: otherParticipant.name,
      text: responseText,
      type: 'text',
      timestamp: new Date().toISOString(),
      status: 'received',
      readBy: []
    };

    chat.messages.push(message);
    chat.lastMessage = message;
    chat.lastActivity = message.timestamp;
    chat.unreadCount += 1;

    this.activeChats.set(chatId, chat);
    await this.saveChats();

    // Notify listeners
    this.notifyMessageListeners(chatId, message);

    // Show notification
    notificationService.showChatNotification(
      otherParticipant.name,
      responseText,
      chatId
    );
  }

  // Subscribe to messages in a chat
  subscribeToMessages(chatId, callback) {
    if (!this.messageListeners.has(chatId)) {
      this.messageListeners.set(chatId, []);
    }
    
    this.messageListeners.get(chatId).push(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.messageListeners.get(chatId);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  // Notify message listeners
  notifyMessageListeners(chatId, message) {
    const listeners = this.messageListeners.get(chatId);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(message);
        } catch (error) {
          console.error('Error in message listener:', error);
        }
      });
    }
  }

  // Mark messages as read
  async markMessagesAsRead(chatId, messageIds = null) {
    const chat = this.activeChats.get(chatId);
    if (!chat) return;

    if (messageIds) {
      // Mark specific messages as read
      chat.messages.forEach(message => {
        if (messageIds.includes(message.id) && !message.readBy.includes(this.currentUserId)) {
          message.readBy.push(this.currentUserId);
        }
      });
    } else {
      // Mark all messages as read
      chat.messages.forEach(message => {
        if (!message.readBy.includes(this.currentUserId)) {
          message.readBy.push(this.currentUserId);
        }
      });
      chat.unreadCount = 0;
    }

    this.activeChats.set(chatId, chat);
    await this.saveChats();
  }

  // Get chat messages
  getChatMessages(chatId, limit = 50, offset = 0) {
    const chat = this.activeChats.get(chatId);
    if (!chat) return [];

    const messages = chat.messages.slice(offset, offset + limit);
    return messages.reverse(); // Return newest first
  }

  // Get all chats
  getAllChats() {
    return Array.from(this.activeChats.values()).sort((a, b) => {
      return new Date(b.lastActivity) - new Date(a.lastActivity);
    });
  }

  // Start voice call
  async initiateVoiceCall(chatId) {
    try {
      const chat = this.activeChats.get(chatId);
      if (!chat) throw new Error('Chat not found');

      const otherParticipant = chat.participants.find(p => p.id !== this.currentUserId);
      
      // Send call initiation message
      await this.sendMessage(chatId, 'Voice call initiated', 'call_start');
      
      // In a real app, you'd integrate with a service like Agora, Twilio, or WebRTC
      console.log('Initiating voice call with:', otherParticipant.name);
      
      // Show notification to other user
      notificationService.showCallNotification(
        'You',
        'voice',
        this.generateCallId()
      );

      return {
        callId: this.generateCallId(),
        type: 'voice',
        participants: chat.participants,
        status: 'initiating'
      };
    } catch (error) {
      console.error('Error initiating voice call:', error);
      throw error;
    }
  }

  // Start video call
  async initiateVideoCall(chatId) {
    try {
      const chat = this.activeChats.get(chatId);
      if (!chat) throw new Error('Chat not found');

      const otherParticipant = chat.participants.find(p => p.id !== this.currentUserId);
      
      // Send call initiation message
      await this.sendMessage(chatId, 'Video call initiated', 'call_start');
      
      // In a real app, you'd integrate with a service like Agora, Twilio, or WebRTC
      console.log('Initiating video call with:', otherParticipant.name);
      
      // Show notification to other user
      notificationService.showCallNotification(
        'You',
        'video',
        this.generateCallId()
      );

      return {
        callId: this.generateCallId(),
        type: 'video',
        participants: chat.participants,
        status: 'initiating'
      };
    } catch (error) {
      console.error('Error initiating video call:', error);
      throw error;
    }
  }

  // End call
  async endCall(callId, duration = 0) {
    try {
      // In a real app, you'd clean up the call session
      console.log('Ending call:', callId);
      
      return {
        callId,
        status: 'ended',
        duration,
        endTime: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error ending call:', error);
      throw error;
    }
  }

  // Delete chat
  async deleteChat(chatId) {
    if (this.activeChats.has(chatId)) {
      this.activeChats.delete(chatId);
      this.messageListeners.delete(chatId);
      await this.saveChats();
      return true;
    }
    return false;
  }

  // Search messages
  searchMessages(query, chatId = null) {
    const results = [];
    const chatsToSearch = chatId ? [this.activeChats.get(chatId)] : Array.from(this.activeChats.values());
    
    chatsToSearch.forEach(chat => {
      if (!chat) return;
      
      chat.messages.forEach(message => {
        if (message.text.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            ...message,
            chatId: chat.id,
            chatName: chat.participants.find(p => p.id !== this.currentUserId)?.name || 'Unknown'
          });
        }
      });
    });
    
    return results.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Helper methods
  generateChatId(userId1, userId2) {
    return [userId1, userId2].sort().join('_');
  }

  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateCallId() {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get connection status
  getConnectionStatus() {
    return this.connectionStatus;
  }

  // Disconnect
  disconnect() {
    this.connectionStatus = 'disconnected';
    this.messageListeners.clear();
    console.log('Chat Service disconnected');
  }
}

// Create singleton instance
const chatService = new ChatService();

export default chatService; 