import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from './NotificationService';
import telnyxService from './TelnyxService';

class ChatService {
  constructor() {
    this.activeChats = new Map();
    this.messageListeners = new Map();
    this.connectionStatus = 'disconnected';
    this.currentUserId = null;
    this.chatListeners = [];
    
    // Initialize Telnyx service event listeners
    this.setupTelnyxListeners();
  }

  setupTelnyxListeners() {
    // Listen for Telnyx events
    telnyxService.addEventListener('incomingCall', (call) => {
      this.handleIncomingCall(call);
    });

    telnyxService.addEventListener('callStateChanged', ({ state, call }) => {
      this.handleCallStateChanged(state, call);
    });

    telnyxService.addEventListener('connected', () => {
      console.log('ChatService: Telnyx connected');
    });

    telnyxService.addEventListener('error', (error) => {
      console.error('ChatService: Telnyx error:', error);
    });
  }

  handleIncomingCall(call) {
    // Find or create chat for the caller
    const callerNumber = call.callerNumber || call.from;
    const callerName = call.callerName || 'Unknown';
    
    // Show notification
    notificationService.showCallNotification(callerName, 'voice', call.callId);
    
    // Notify chat listeners about incoming call
    this.notifyChatListeners('incomingCall', {
      callId: call.callId,
      callerName,
      callerNumber,
      call
    });
  }

  handleCallStateChanged(state, call) {
    // Notify listeners about call state changes
    this.notifyChatListeners('callStateChanged', {
      state,
      call,
      callId: call.callId
    });

    // Add call message to relevant chat
    if (call.callerNumber || call.destinationNumber) {
      const otherNumber = call.direction === 'inbound' 
        ? call.callerNumber 
        : call.destinationNumber;
      
      const chat = this.findChatByPhoneNumber(otherNumber);
      if (chat) {
        this.addCallMessageToChat(chat.id, state, call);
      }
    }
  }

  findChatByPhoneNumber(phoneNumber) {
    for (let chat of this.activeChats.values()) {
      if (chat.phoneNumber === phoneNumber) {
        return chat;
      }
    }
    return null;
  }

  addCallMessageToChat(chatId, callState, call) {
    const chat = this.activeChats.get(chatId);
    if (!chat) return;

    let messageText = '';
    let messageType = 'call_update';

    switch (callState) {
      case 'initiated':
        messageText = call.direction === 'inbound' 
          ? 'Incoming call' 
          : 'Outgoing call';
        messageType = 'call_start';
        break;
      case 'active':
        messageText = 'Call started';
        break;
      case 'ended':
        const duration = call.duration || 0;
        messageText = `Call ended (${this.formatCallDuration(duration)})`;
        messageType = 'call_end';
        break;
      default:
        messageText = `Call ${callState}`;
    }

    const message = {
      id: this.generateMessageId(),
      chatId,
      senderId: call.direction === 'inbound' ? chat.otherParticipant.id : this.currentUserId,
      senderName: call.direction === 'inbound' ? chat.otherParticipant.name : 'You',
      text: messageText,
      type: messageType,
      timestamp: new Date().toISOString(),
      status: 'sent',
      readBy: [this.currentUserId],
      callData: {
        callId: call.callId,
        duration: call.duration,
        direction: call.direction
      }
    };

    chat.messages.push(message);
    chat.lastMessage = message;
    chat.lastActivity = message.timestamp;

    this.activeChats.set(chatId, chat);
    this.saveChats();
    this.notifyMessageListeners(chatId, message);
  }

  formatCallDuration(seconds) {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Initialize chat service
  async initialize(userId, telnyxConfig = null) {
    try {
      this.currentUserId = userId;
      await this.loadChats();
      
      // Initialize Telnyx if config provided
      if (telnyxConfig) {
        await telnyxService.initialize(telnyxConfig);
        await telnyxService.connect();
      }
      
      this.connectionStatus = 'connected';
      console.log('Chat Service initialized for user:', userId);
    } catch (error) {
      console.error('Failed to initialize chat service:', error);
      throw error;
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
  async createChat(participantId, participantName, participantType, phoneNumber = null) {
    try {
      // Check if chat already exists for this participant
      const existingChat = this.findExistingChat(participantId);
      if (existingChat) {
        console.log('📱 Found existing chat:', existingChat.id);
        return existingChat;
      }

      const chatId = this.generateChatId(participantId); // Use participant ID for consistent chat IDs
      
      const chat = {
        id: chatId,
        participants: [
          {
            id: this.currentUserId,
            name: 'You',
            type: 'current_user'
          },
          {
            id: participantId,
            name: participantName,
            type: participantType,
            phoneNumber: phoneNumber
          }
        ],
        otherParticipant: {
          id: participantId,
          name: participantName,
          type: participantType
        },
        messages: [],
        lastMessage: null,
        lastActivity: new Date().toISOString(),
        isRead: true,
        unreadCount: 0,
        phoneNumber: phoneNumber // Store phone number for calling
      };

      this.activeChats.set(chatId, chat);
      await this.saveChats();
      
      // Notify chat listeners about new chat
      this.notifyChatListeners('chatCreated', chat);
      
      console.log('💬 Chat created for participant:', participantName);
      return chat;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    }
  }

  // Find existing chat by participant ID
  findExistingChat(participantId) {
    for (let chat of this.activeChats.values()) {
      const otherParticipant = chat.participants.find(p => p.id !== this.currentUserId);
      if (otherParticipant && otherParticipant.id === participantId) {
        return chat;
      }
    }
    return null;
  }

  // Generate consistent chat ID based on participant
  generateChatId(participantId = null) {
    if (participantId) {
      // Generate consistent ID for same participants
      const sortedIds = [this.currentUserId, participantId].sort();
      return `chat_${sortedIds.join('_')}`;
    }
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

      // DO NOT simulate automatic responses - real chats only
      console.log('💬 Message sent:', message.text);

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
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

  // Start voice call using Telnyx
  async initiateVoiceCall(chatId, phoneNumber = null) {
    try {
      const chat = this.activeChats.get(chatId);
      if (!chat) throw new Error('Chat not found');

      // Get phone number from chat or parameter
      const destinationNumber = phoneNumber || chat.phoneNumber || chat.participants.find(p => p.id !== this.currentUserId)?.phoneNumber;
      
      if (!destinationNumber) {
        throw new Error('No phone number available for this contact');
      }

      // Check Telnyx connection
      if (!telnyxService.getCurrentCallState().isConnected) {
        throw new Error('Not connected to calling service. Please check your connection.');
      }

      // Make call through Telnyx
      const call = await telnyxService.makeCall(
        destinationNumber,
        'Professional', // caller name
        null // caller number (will use default from config)
      );

      // Send call initiation message
      await this.sendMessage(chatId, 'Voice call initiated', 'call_start');
      
      console.log('Voice call initiated:', call.callId);
      
      return {
        callId: call.callId,
        type: 'voice',
        destinationNumber,
        status: 'initiating',
        telnyxCall: call
      };
    } catch (error) {
      console.error('Error initiating voice call:', error);
      throw error;
    }
  }

  // Start video call using Telnyx
  async initiateVideoCall(chatId, phoneNumber = null) {
    try {
      const chat = this.activeChats.get(chatId);
      if (!chat) throw new Error('Chat not found');

      // Get phone number from chat or parameter
      const destinationNumber = phoneNumber || chat.phoneNumber || chat.participants.find(p => p.id !== this.currentUserId)?.phoneNumber;
      
      if (!destinationNumber) {
        throw new Error('No phone number available for this contact');
      }

      // Check Telnyx connection
      if (!telnyxService.getCurrentCallState().isConnected) {
        throw new Error('Not connected to calling service. Please check your connection.');
      }

      // Make video call through Telnyx
      const call = await telnyxService.makeVideoCall(
        destinationNumber,
        'Professional', // caller name
        null // caller number (will use default from config)
      );

      // Send call initiation message
      await this.sendMessage(chatId, 'Video call initiated', 'call_start');
      
      console.log('Video call initiated:', call.callId);
      
      return {
        callId: call.callId,
        type: 'video',
        destinationNumber,
        status: 'initiating',
        telnyxCall: call
      };
    } catch (error) {
      console.error('Error initiating video call:', error);
      throw error;
    }
  }

  // Answer incoming call
  async answerCall(callId) {
    try {
      const success = telnyxService.answerCall();
      if (success) {
        console.log('Call answered:', callId);
        return { success: true, callId };
      } else {
        throw new Error('Failed to answer call');
      }
    } catch (error) {
      console.error('Error answering call:', error);
      throw error;
    }
  }

  // Reject incoming call
  async rejectCall(callId) {
    try {
      const success = telnyxService.rejectCall();
      if (success) {
        console.log('Call rejected:', callId);
        return { success: true, callId };
      } else {
        throw new Error('Failed to reject call');
      }
    } catch (error) {
      console.error('Error rejecting call:', error);
      throw error;
    }
  }

  // End call
  async endCall(callId, duration = 0) {
    try {
      const success = telnyxService.endCall();
      if (success) {
        console.log('Call ended:', callId);
        return {
          callId,
          status: 'ended',
          duration,
          endTime: new Date().toISOString()
        };
      } else {
        throw new Error('Failed to end call');
      }
    } catch (error) {
      console.error('Error ending call:', error);
      throw error;
    }
  }

  // Get current call information
  getCurrentCall() {
    const callState = telnyxService.getCurrentCallState();
    if (callState.hasActiveCall) {
      return {
        callId: telnyxService.activeCall?.callId,
        state: callState.callState,
        direction: callState.callDirection,
        streams: telnyxService.getCallStreams()
      };
    }
    return null;
  }

  // Call control methods
  async holdCall() {
    return telnyxService.holdCall();
  }

  async resumeCall() {
    return telnyxService.resumeCall();
  }

  async toggleMute() {
    return telnyxService.toggleMute();
  }

  async toggleVideo() {
    return telnyxService.toggleVideo();
  }

  async sendDTMF(tone) {
    return telnyxService.sendDTMF(tone);
  }

  // Set up call quality monitoring
  setCallQualityCallback(callback) {
    telnyxService.setCallQualityCallback(callback);
  }

  // Chat listener management
  addChatListener(callback) {
    this.chatListeners.push(callback);
  }

  removeChatListener(callback) {
    const index = this.chatListeners.indexOf(callback);
    if (index > -1) {
      this.chatListeners.splice(index, 1);
    }
  }

  notifyChatListeners(event, data) {
    this.chatListeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('Error in chat listener:', error);
      }
    });
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