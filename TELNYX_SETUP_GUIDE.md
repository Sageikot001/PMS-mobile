# Telnyx Integration Setup Guide for PMS Mobile

This guide will walk you through setting up Telnyx for real voice and video calling in your Professional PMS mobile application.

## 🚀 Overview

Telnyx provides enterprise-grade WebRTC calling that integrates seamlessly with your existing chat and appointment system. This integration replaces the placeholder calling functionality with real PSTN and SIP calling capabilities.

## 📋 Prerequisites

### 1. Telnyx Portal Account Setup

1. **Create Telnyx Account**
   - Visit [portal.telnyx.com](https://portal.telnyx.com)
   - Sign up for a new account
   - Complete account verification

2. **Create SIP Connection**
   - Navigate to **Voice > SIP Connections**
   - Click **Create SIP Connection**
   - Choose **Credentials Authentication**
   - Generate credentials (Username & Password)
   - Note down the SIP credentials

3. **Configure Outbound Voice Profile**
   - Navigate to **Voice > Outbound Voice Profiles**
   - Create a new profile
   - Configure billing method and routing

4. **Get API Key**
   - Navigate to **API Keys**
   - Create a new API key
   - Store it securely

## 🔧 Development Setup (Current - Simulation Mode)

Your app is currently set up to work in **simulation mode** for development with Expo Go. This allows you to test the calling interface without requiring native builds.

### Features Available in Simulation Mode:
- ✅ Call initiation simulation
- ✅ Call state management (ringing, active, held, ended)
- ✅ Call quality monitoring simulation
- ✅ DTMF tone simulation
- ✅ Mute/unmute simulation
- ✅ Hold/resume simulation
- ✅ Incoming call simulation
- ✅ Complete UI testing

### Testing the Integration:

1. **Start the Test Screen**
   ```javascript
   // Add to your navigation stack
   import TelnyxTestScreen from './src/screens/TelnyxTestScreen';
   
   // In your navigator
   <Stack.Screen name="TelnyxTest" component={TelnyxTestScreen} />
   ```

2. **Navigate to Test Screen**
   ```javascript
   navigation.navigate('TelnyxTest');
   ```

3. **Test Call Features**
   - Enter a phone number
   - Try voice and video calls
   - Test call controls (mute, hold, end)
   - Use the DTMF keypad
   - Simulate incoming calls

## 🚀 Production Setup (Real Telnyx Integration)

For production deployment, you'll need to:

### 1. Create Development Build

Since Telnyx requires native modules, you'll need to create a development build:

```bash
# Install EAS CLI
npm install -g @expo/cli

# Configure EAS Build
eas build:configure

# Create development build
eas build --profile development --platform android
eas build --profile development --platform ios
```

### 2. Install Native Telnyx SDK

```bash
# Install Telnyx React Native SDK
npm install @telnyx/react-native

# For video calling support
npm install react-native-webrtc

# For push notifications
npm install @react-native-firebase/app
npm install @react-native-firebase/messaging
```

### 3. Configure Environment Variables

Create `.env` file in your project root:

```env
TELNYX_SIP_USER=your_sip_username
TELNYX_SIP_PASSWORD=your_sip_password
TELNYX_API_KEY=your_api_key
TELNYX_DEBUG=true
```

### 4. Update TelnyxService for Production

Replace the simulation service with the real Telnyx implementation:

```javascript
// Import the real Telnyx SDK
import { TelnyxRTC } from '@telnyx/react-native';

// In TelnyxService.js
async initialize(config) {
  if (config.isSimulation) {
    // Keep simulation code for development
    return this.initializeSimulation(config);
  }
  
  // Real Telnyx initialization
  this.client = new TelnyxRTC({
    login: config.sipUser,
    password: config.sipPassword,
    pushToken: config.pushToken
  });
  
  this.setupRealEventListeners();
  await this.client.connect();
}
```

## 🎯 Integration Points

### 1. Chat Integration

The Telnyx service is integrated with your existing ChatService:

```javascript
// In ChatService.js
async initiateVoiceCall(chatId, phoneNumber) {
  const call = await telnyxService.makeCall(phoneNumber);
  
  // Add call to chat history
  await this.addMessage(chatId, {
    type: 'call',
    callType: 'voice',
    phoneNumber,
    callId: call.callId,
    timestamp: Date.now()
  });
  
  return call;
}
```

### 2. Appointment Integration

Connect calls to your appointment system:

```javascript
// In your appointment service
async makeAppointmentCall(appointmentId) {
  const appointment = await this.getAppointment(appointmentId);
  
  if (appointment.patientPhone) {
    const call = await telnyxService.makeCall(
      appointment.patientPhone,
      'Dr. ' + appointment.doctorName
    );
    
    // Update appointment with call info
    await this.updateAppointment(appointmentId, {
      callId: call.callId,
      callInitiated: true
    });
  }
}
```

### 3. Notification Integration

Handle incoming calls with notifications:

```javascript
// In NotificationService.js
setupTelnyxNotifications() {
  telnyxService.addEventListener('incomingCall', (call) => {
    this.showCallNotification({
      title: 'Incoming Call',
      body: `Call from ${call.callerName || call.callerNumber}`,
      data: { callId: call.callId }
    });
  });
}
```

## 🔐 Security Considerations

### 1. Credential Management
- Store SIP credentials securely using AsyncStorage
- Use environment variables for API keys
- Implement credential rotation

### 2. Call Encryption
- Telnyx uses SRTP for call encryption
- Ensure TLS is used for signaling

### 3. Authentication
- Implement proper user authentication
- Validate user permissions for making calls

## 📊 Call Quality Monitoring

### 1. Real-time Metrics
```javascript
telnyxService.setCallQualityCallback((metrics) => {
  console.log('Call Quality:', {
    mos: metrics.mos,
    jitter: metrics.jitter,
    rtt: metrics.rtt,
    quality: metrics.quality
  });
});
```

### 2. Call Analytics
- Track call duration
- Monitor call success rates
- Analyze call quality trends

## 🎨 UI Components

### 1. Call Controls
The TelnyxTestScreen demonstrates:
- Call initiation buttons
- Active call controls
- DTMF keypad
- Call quality display

### 2. Integration with Existing UI
```javascript
// In your chat screen
<TouchableOpacity 
  onPress={() => chatService.initiateVoiceCall(chatId, phoneNumber)}
>
  <Text>Call</Text>
</TouchableOpacity>
```

## 🧪 Testing

### 1. Simulation Mode Testing
- Use the TelnyxTestScreen for UI testing
- Test all call states and transitions
- Verify call quality monitoring

### 2. Production Testing
- Test with real phone numbers
- Verify call quality on different networks
- Test push notifications for incoming calls

## 🚀 Deployment

### 1. Development Deployment
```bash
# Start development server
npx expo start --dev-client

# Install on device
expo install --device
```

### 2. Production Deployment
```bash
# Build for production
eas build --profile production --platform android
eas build --profile production --platform ios

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

## 🔧 Troubleshooting

### Common Issues:

1. **Native Module Error in Expo Go**
   - Solution: Use development build instead of Expo Go

2. **Call Quality Issues**
   - Check network connectivity
   - Verify SIP credentials
   - Monitor call quality metrics

3. **Push Notification Issues**
   - Ensure FCM/APNs are configured
   - Verify push token registration

## 📚 Resources

- [Telnyx Documentation](https://developers.telnyx.com/)
- [Expo Development Builds](https://docs.expo.dev/development/introduction/)
- [React Native WebRTC](https://github.com/react-native-webrtc/react-native-webrtc)

## 🎯 Next Steps

1. **Test Current Implementation**
   - Use TelnyxTestScreen to verify simulation
   - Test all call features

2. **Plan Production Migration**
   - Set up Telnyx account
   - Configure development build
   - Test with real calls

3. **Enhance Features**
   - Add call recording
   - Implement call transfer
   - Add video calling UI

## 💡 Benefits of Telnyx Integration

- **Enterprise-grade reliability**
- **Global PSTN coverage**
- **Competitive pricing**
- **Advanced call features**
- **Real-time call analytics**
- **Excellent call quality**

Your PMS mobile app now has a robust foundation for professional calling capabilities that can scale with your business needs. 