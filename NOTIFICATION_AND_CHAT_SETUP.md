# Notification & Chat System Setup Guide

This guide explains how to use the notification and chat systems that have been implemented in the PMS Mobile app.

## 🔔 Notification System

### Overview
The notification system provides automatic appointment reminders and real-time notifications for doctors. It's designed to send notifications 30 minutes, 15 minutes, and 5 minutes before each appointment.

### Features
- **Appointment Reminders**: Automatic notifications before appointments
- **Chat Notifications**: Real-time notifications for new messages
- **Call Notifications**: Alerts for incoming voice/video calls
- **Persistent Storage**: Notifications are saved and persist across app restarts
- **Notification History**: View past notifications
- **Cancellation Support**: Cancel specific notifications when needed

### How It Works

#### 1. Initialization
The notification service is automatically initialized when the AppointmentsScreen loads:

```javascript
// In AppointmentsScreen.js
useEffect(() => {
  initializeAndScheduleNotifications();
}, []);
```

#### 2. Automatic Scheduling
When appointments are loaded, the system automatically schedules reminders:
- 30 minutes before appointment
- 15 minutes before appointment
- 5 minutes before appointment

#### 3. Manual Notification Control
From the appointments screen, tap any appointment to:
- View appointment details
- Start a chat with the patient
- Cancel appointment notifications

### Usage Examples

```javascript
import notificationService from '../services/NotificationService';

// Initialize the service
await notificationService.initialize();

// Schedule a single reminder
const appointmentData = {
  id: 'app1',
  date: '2025-06-15',
  time: '09:00 AM',
  patient: 'John Doe',
  type: 'Check-up',
  duration: '30 mins'
};

notificationService.scheduleAppointmentReminder(appointmentData, 30);

// Cancel notifications for an appointment
notificationService.cancelAppointmentNotifications('app1');

// Show immediate notification
notificationService.showNotification(
  'Test Notification',
  'This is a test message',
  'info'
);
```

## 💬 Chat System

### Overview
The chat system provides real-time messaging, voice calls, and video calls between doctors and patients.

### Features
- **Real-time Messaging**: Send and receive text messages
- **Voice Calls**: Initiate voice calls (framework ready for Agora/Twilio)
- **Video Calls**: Start video consultations (framework ready for Agora/Twilio)
- **Message History**: Persistent message storage
- **Typing Indicators**: Show when someone is typing
- **Read Receipts**: See when messages are read
- **Search**: Search through message history
- **Unread Counters**: Track unread messages

### How It Works

#### 1. Chat List Screen
Access the chat list from the appointments screen by tapping the chat bubble icon in the header.

#### 2. Starting a New Chat
- Tap the "+" button in the chat list
- Select a patient from the list
- Start messaging immediately

#### 3. Individual Chat Screen
- Send text messages
- Tap the phone icon for voice calls
- Tap the video icon for video calls
- Messages are automatically saved and synced

### Usage Examples

```javascript
import chatService from '../services/ChatService';

// Initialize chat service
await chatService.initialize('doctor_123');

// Create a new chat
const chat = await chatService.createChat(
  'patient_456',
  'John Doe',
  'patient'
);

// Send a message
await chatService.sendMessage(chat.id, 'Hello, how are you feeling today?');

// Start a voice call
const callData = await chatService.initiateVoiceCall(chat.id);

// Start a video call
const videoCall = await chatService.initiateVideoCall(chat.id);

// Subscribe to new messages
const unsubscribe = chatService.subscribeToMessages(chat.id, (message) => {
  console.log('New message:', message);
});

// Clean up subscription
unsubscribe();
```

## 🚀 Integration Guide

### Step 1: Adding to Existing Screens
To add chat functionality to any existing screen:

```javascript
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();

// Navigate to chat list
navigation.navigate('ChatListScreen');

// Navigate directly to a chat
navigation.navigate('ChatScreen', { 
  chatId: 'existing_chat_id' 
});

// Or create new chat and navigate
navigation.navigate('ChatScreen', { 
  patientId: 'patient_123',
  patientName: 'Patient Name'
});
```

### Step 2: Setting Up Real-time Features
For production use, you'll want to integrate with a real-time service:

#### Option 1: Socket.IO
```javascript
// In ChatService.js - replace the simulate response with real socket connection
import io from 'socket.io-client';

class ChatService {
  constructor() {
    this.socket = io('your-websocket-server');
    this.socket.on('new_message', this.handleIncomingMessage);
  }
  
  handleIncomingMessage = (message) => {
    // Handle real incoming messages
    this.notifyMessageListeners(message.chatId, message);
  };
}
```

#### Option 2: Firebase Realtime Database
```javascript
// Add Firebase configuration
import { database } from './firebaseConfig';

// Listen for new messages
database.ref(`chats/${chatId}/messages`).on('child_added', (snapshot) => {
  const message = snapshot.val();
  this.notifyMessageListeners(chatId, message);
});
```

### Step 3: Voice/Video Call Integration

#### Using Agora SDK
```bash
npm install react-native-agora
```

```javascript
// In ChatService.js
import RtcEngine from 'react-native-agora';

const engine = await RtcEngine.create('your-agora-app-id');

// Start video call
async initiateVideoCall(chatId) {
  await engine.enableVideo();
  await engine.startPreview();
  // Navigate to video call screen
}
```

#### Using Twilio SDK
```bash
npm install @twilio/voice-react-native-sdk
```

```javascript
import { Voice } from '@twilio/voice-react-native-sdk';

// Initialize voice calling
const voice = new Voice();
```

## 📱 UI Components

### Notification Badge Component
```javascript
const NotificationBadge = ({ count }) => {
  if (count === 0) return null;
  
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
};
```

### Chat Bubble Component
```javascript
const ChatBubble = ({ message, isCurrentUser }) => {
  return (
    <View style={[
      styles.bubble,
      isCurrentUser ? styles.sentBubble : styles.receivedBubble
    ]}>
      <Text style={styles.messageText}>{message.text}</Text>
      <Text style={styles.timestamp}>
        {formatTime(message.timestamp)}
      </Text>
    </View>
  );
};
```

## 🔧 Configuration

### Notification Settings
```javascript
// Customize notification timing
const customReminderTimes = [60, 30, 15, 5]; // minutes before appointment

// Schedule with custom times
notificationService.scheduleAppointmentReminders(
  appointments,
  customReminderTimes
);
```

### Chat Settings
```javascript
// Configure chat service
const chatConfig = {
  maxMessageLength: 1000,
  messageHistoryLimit: 100,
  typingTimeoutMs: 1000,
  autoSaveInterval: 5000
};
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Notifications Not Showing
- Ensure notification service is initialized
- Check if notifications are scheduled correctly
- Verify system permissions (for production apps)

#### 2. Messages Not Sending
- Check chat service initialization
- Verify network connectivity
- Check AsyncStorage permissions

#### 3. Chat List Empty
- Ensure chat service is initialized with correct user ID
- Check if chats are being created properly
- Verify AsyncStorage data

### Debug Commands
```javascript
// Check scheduled notifications
console.log(notificationService.getScheduledNotifications());

// Check active chats
console.log(chatService.getAllChats());

// Check notification history
const history = await notificationService.getNotificationHistory();
console.log(history);
```

## 🚀 Production Considerations

### 1. Push Notifications
For production, integrate with:
- Firebase Cloud Messaging (FCM)
- Apple Push Notification Service (APNS)
- OneSignal

### 2. Real-time Communication
Consider using:
- Socket.IO for messaging
- WebRTC for video calls
- Agora/Twilio for voice/video

### 3. Data Persistence
Upgrade from AsyncStorage to:
- SQLite for complex queries
- Realm for object database
- Firebase Firestore for cloud sync

### 4. Security
Implement:
- Message encryption
- User authentication
- HIPAA compliance (for healthcare)
- Rate limiting

## 📞 Next Steps

1. **Test the Implementation**: Run the app and test all notification and chat features
2. **Customize UI**: Modify styles and colors to match your brand
3. **Add Real-time Backend**: Integrate with your preferred real-time service
4. **Implement Voice/Video**: Add Agora or Twilio for actual calling
5. **Add Push Notifications**: Set up FCM/APNS for background notifications
6. **Security Audit**: Review and implement security best practices

## 🤝 Support

If you need help implementing any of these features:
1. Check the code comments in the service files
2. Review the example usage in the screen components
3. Test with the provided mock data first
4. Gradually replace mock data with real backend integration

The system is designed to be modular and extensible, so you can easily add new features or modify existing ones as needed. 