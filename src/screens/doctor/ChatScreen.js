import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import chatService from '../../services/ChatService';

const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { chatId } = route.params;
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [chat, setChat] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  
  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadChatData();
    
    // Subscribe to new messages
    unsubscribeRef.current = chatService.subscribeToMessages(chatId, handleNewMessage);
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [chatId]);

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadChatData = async () => {
    try {
      setIsLoading(true);
      
      // Get chat details
      const chatData = chatService.activeChats.get(chatId);
      if (chatData) {
        setChat(chatData);
        
        // Load messages
        const chatMessages = chatService.getChatMessages(chatId);
        setMessages(chatMessages);
        
        // Mark messages as read
        await chatService.markMessagesAsRead(chatId);
      }
    } catch (error) {
      console.error('Error loading chat data:', error);
      Alert.alert('Error', 'Failed to load chat data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewMessage = useCallback((newMessage) => {
    setMessages(prevMessages => [newMessage, ...prevMessages]);
    
    // Mark as read if it's not from current user
    if (newMessage.senderId !== chatService.currentUserId) {
      chatService.markMessagesAsRead(chatId, [newMessage.id]);
    }
    
    // Auto-scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: 0, animated: true });
    }, 100);
  }, [chatId]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    const messageText = inputText.trim();
    setInputText('');
    
    try {
      await chatService.sendMessage(chatId, messageText);
      
      // Clear typing indicator
      setIsTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
      setInputText(messageText); // Restore the message
    }
  };

  const handleInputChange = (text) => {
    setInputText(text);
    
    // Show typing indicator
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to hide typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handleVoiceCall = async () => {
    try {
      const callData = await chatService.initiateVoiceCall(chatId);
      console.log('Voice call initiated:', callData);
      
      // In a real app, navigate to voice call screen
      Alert.alert(
        'Voice Call',
        'Voice call feature would be implemented here with a service like Agora or Twilio',
        [
          { text: 'End Call', onPress: () => chatService.endCall(callData.callId) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('Error initiating voice call:', error);
      Alert.alert('Error', 'Failed to start voice call');
    }
  };

  const handleVideoCall = async () => {
    try {
      const callData = await chatService.initiateVideoCall(chatId);
      console.log('Video call initiated:', callData);
      
      // In a real app, navigate to video call screen
      Alert.alert(
        'Video Call',
        'Video call feature would be implemented here with a service like Agora or Twilio',
        [
          { text: 'End Call', onPress: () => chatService.endCall(callData.callId) },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('Error initiating video call:', error);
      Alert.alert('Error', 'Failed to start video call');
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item: message }) => {
    const isCurrentUser = message.senderId === chatService.currentUserId;
    const showTime = true; // You can implement logic to show time for every nth message
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.sentMessageContainer : styles.receivedMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.sentMessage : styles.receivedMessage
        ]}>
          <Text style={[
            styles.messageText,
            isCurrentUser ? styles.sentMessageText : styles.receivedMessageText
          ]}>
            {message.text}
          </Text>
          
          {showTime && (
            <Text style={[
              styles.messageTime,
              isCurrentUser ? styles.sentMessageTime : styles.receivedMessageTime
            ]}>
              {formatMessageTime(message.timestamp)}
            </Text>
          )}
        </View>
        
        {isCurrentUser && (
          <View style={styles.messageStatus}>
            <Ionicons 
              name={message.readBy.length > 1 ? "checkmark-done" : "checkmark"} 
              size={14} 
              color={message.readBy.length > 1 ? "#4A90E2" : "#7F8C8D"} 
            />
          </View>
        )}
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    
    return (
      <View style={styles.typingContainer}>
        <View style={styles.typingBubble}>
          <View style={styles.typingDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
      </View>
    );
  };

  const getOtherParticipant = () => {
    if (!chat) return null;
    return chat.participants.find(p => p.id !== chatService.currentUserId);
  };

  const otherParticipant = getOtherParticipant();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#2C3E50" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>
              {otherParticipant?.name || 'Chat'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {otherParticipant?.type === 'patient' ? 'Patient' : 'Doctor'}
            </Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.callButton}
              onPress={handleVoiceCall}
            >
              <Ionicons name="call" size={22} color="#4A90E2" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.callButton}
              onPress={handleVideoCall}
            >
              <Ionicons name="videocam" size={22} color="#4A90E2" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          inverted
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderTypingIndicator}
        />

        {/* Input Area */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          <View style={styles.inputRow}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              placeholder="Type a message..."
              value={inputText}
              onChangeText={handleInputChange}
              multiline
              maxLength={1000}
              placeholderTextColor="#7F8C8D"
            />
            
            <TouchableOpacity 
              style={[
                styles.sendButton,
                inputText.trim() ? styles.sendButtonActive : styles.sendButtonInactive
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim()}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color={inputText.trim() ? "#ffffff" : "#7F8C8D"} 
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
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
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  callButton: {
    padding: 8,
    marginLeft: 8,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messagesContent: {
    paddingVertical: 16,
  },
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  sentMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  receivedMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '100%',
  },
  sentMessage: {
    backgroundColor: '#4A90E2',
    borderBottomRightRadius: 4,
  },
  receivedMessage: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  sentMessageText: {
    color: '#ffffff',
  },
  receivedMessageText: {
    color: '#2C3E50',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  sentMessageTime: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  receivedMessageTime: {
    color: '#7F8C8D',
  },
  messageStatus: {
    marginTop: 2,
    marginRight: 4,
  },
  typingContainer: {
    alignSelf: 'flex-start',
    marginVertical: 8,
  },
  typingBubble: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7F8C8D',
    marginHorizontal: 2,
  },
  dot1: {
    animationDelay: '0s',
  },
  dot2: {
    animationDelay: '0.2s',
  },
  dot3: {
    animationDelay: '0.4s',
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    color: '#2C3E50',
    backgroundColor: '#F8F9FA',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  sendButtonActive: {
    backgroundColor: '#4A90E2',
  },
  sendButtonInactive: {
    backgroundColor: '#E9ECEF',
  },
});

export default ChatScreen; 