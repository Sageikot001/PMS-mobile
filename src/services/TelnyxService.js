import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Note: For Expo Go development, we'll use a simulation approach
// For production builds, you'll need to use the native Telnyx SDK
class TelnyxService {
  constructor() {
    this.client = null;
    this.activeCall = null;
    this.isConnecting = false;
    this.isConnected = false;
    this.listeners = new Map();
    this.callQualityCallback = null;
    
    // Store connection config
    this.config = {
      sipUser: null,
      sipPassword: null,
      pushToken: null,
      debug: false,
      isSimulation: true // Flag for development mode
    };
  }

  // Initialize Telnyx client with credentials
  async initialize(config) {
    try {
      this.config = { ...this.config, ...config };
      
      console.log('TelnyxService: Initializing in development mode (simulation)');
      console.log('TelnyxService: For production, use native build with real Telnyx SDK');
      
      // Simulate connection success after a delay
      setTimeout(() => {
        this.isConnected = true;
        this.isConnecting = false;
        this.notifyListeners('connected');
        this.notifyListeners('ready');
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('TelnyxService: Failed to initialize:', error);
      throw error;
    }
  }

  // Connect to Telnyx
  async connect() {
    if (this.isConnecting || this.isConnected) {
      return;
    }

    try {
      console.log('TelnyxService: Connecting (simulation mode)...');
      this.isConnecting = true;
      
      // Simulate connection delay
      setTimeout(() => {
        this.isConnected = true;
        this.isConnecting = false;
        this.notifyListeners('connected');
      }, 500);
      
    } catch (error) {
      this.isConnecting = false;
      console.error('TelnyxService: Connection failed:', error);
      throw error;
    }
  }

  // Disconnect from Telnyx
  disconnect() {
    console.log('TelnyxService: Disconnecting...');
    this.isConnected = false;
    this.isConnecting = false;
    this.notifyListeners('disconnected');
  }

  // Make an outbound call (simulated)
  async makeCall(destinationNumber, callerName = 'Professional', callerNumber = null) {
    if (!this.isConnected) {
      throw new Error('Not connected to Telnyx. Please connect first.');
    }

    if (this.activeCall) {
      throw new Error('Another call is already in progress');
    }

    try {
      console.log('TelnyxService: Making call to:', destinationNumber);
      
      // Create simulated call object
      const call = this.createSimulatedCall(destinationNumber, 'outbound', false);
      this.activeCall = call;
      
      // Simulate call progression
      this.simulateCallProgression(call);
      
      return call;
    } catch (error) {
      console.error('TelnyxService: Failed to make call:', error);
      throw error;
    }
  }

  // Make a video call (simulated)
  async makeVideoCall(destinationNumber, callerName = 'Professional', callerNumber = null) {
    if (!this.isConnected) {
      throw new Error('Not connected to Telnyx. Please connect first.');
    }

    if (this.activeCall) {
      throw new Error('Another call is already in progress');
    }

    try {
      console.log('TelnyxService: Making video call to:', destinationNumber);
      
      // Create simulated video call object
      const call = this.createSimulatedCall(destinationNumber, 'outbound', true);
      this.activeCall = call;
      
      // Simulate call progression
      this.simulateCallProgression(call);
      
      return call;
    } catch (error) {
      console.error('TelnyxService: Failed to make video call:', error);
      throw error;
    }
  }

  // Create simulated call object
  createSimulatedCall(destinationNumber, direction, isVideo) {
    const callId = this.generateCallId();
    return {
      callId,
      destinationNumber,
      direction,
      isVideo,
      state: 'new',
      startTime: new Date().toISOString(),
      duration: 0,
      muted: false,
      videoEnabled: isVideo
    };
  }

  // Simulate call progression states
  simulateCallProgression(call) {
    // Immediately go to ringing
    setTimeout(() => {
      call.state = 'ringing';
      this.notifyListeners('callStateChanged', { state: 'ringing', call });
    }, 100);

    // Simulate answer after 3-8 seconds
    const answerDelay = 3000 + Math.random() * 5000;
    setTimeout(() => {
      if (call.state === 'ringing') {
        call.state = 'active';
        call.startTime = new Date().toISOString();
        this.notifyListeners('callStateChanged', { state: 'active', call });
        
        // Start call quality monitoring
        if (this.config.debug) {
          this.startCallQualitySimulation(call);
        }
      }
    }, answerDelay);
  }

  // Simulate call quality metrics
  startCallQualitySimulation(call) {
    const qualityInterval = setInterval(() => {
      if (call.state !== 'active') {
        clearInterval(qualityInterval);
        return;
      }

      const metrics = {
        quality: ['excellent', 'good', 'fair', 'poor'][Math.floor(Math.random() * 4)],
        mos: 3.5 + Math.random() * 1.5, // MOS score between 3.5 and 5.0
        jitter: Math.random() * 20, // milliseconds
        rtt: 50 + Math.random() * 100, // round trip time
        inboundAudio: { packetsReceived: Math.floor(Math.random() * 1000) },
        outboundAudio: { packetsSent: Math.floor(Math.random() * 1000) }
      };

      if (this.callQualityCallback) {
        this.callQualityCallback(metrics);
      }
    }, 2000);
  }

  // Answer incoming call
  answerCall() {
    if (this.activeCall && this.activeCall.state === 'ringing') {
      try {
        console.log('TelnyxService: Answering call (simulated)');
        this.activeCall.state = 'active';
        this.notifyListeners('callStateChanged', { state: 'active', call: this.activeCall });
        return true;
      } catch (error) {
        console.error('TelnyxService: Failed to answer call:', error);
        return false;
      }
    }
    return false;
  }

  // Reject incoming call
  rejectCall() {
    if (this.activeCall) {
      try {
        console.log('TelnyxService: Rejecting call (simulated)');
        this.activeCall.state = 'ended';
        this.notifyListeners('callStateChanged', { state: 'ended', call: this.activeCall });
        this.activeCall = null;
        return true;
      } catch (error) {
        console.error('TelnyxService: Failed to reject call:', error);
        return false;
      }
    }
    return false;
  }

  // End active call
  endCall() {
    if (this.activeCall) {
      try {
        console.log('TelnyxService: Ending call (simulated)');
        const endTime = new Date();
        const startTime = new Date(this.activeCall.startTime);
        this.activeCall.duration = Math.floor((endTime - startTime) / 1000);
        this.activeCall.state = 'ended';
        
        this.notifyListeners('callStateChanged', { state: 'ended', call: this.activeCall });
        this.activeCall = null;
        return true;
      } catch (error) {
        console.error('TelnyxService: Failed to end call:', error);
        return false;
      }
    }
    return false;
  }

  // Hold call
  holdCall() {
    if (this.activeCall && this.activeCall.state === 'active') {
      try {
        console.log('TelnyxService: Holding call (simulated)');
        this.activeCall.state = 'held';
        this.notifyListeners('callStateChanged', { state: 'held', call: this.activeCall });
        return true;
      } catch (error) {
        console.error('TelnyxService: Failed to hold call:', error);
        return false;
      }
    }
    return false;
  }

  // Resume call
  resumeCall() {
    if (this.activeCall && this.activeCall.state === 'held') {
      try {
        console.log('TelnyxService: Resuming call (simulated)');
        this.activeCall.state = 'active';
        this.notifyListeners('callStateChanged', { state: 'active', call: this.activeCall });
        return true;
      } catch (error) {
        console.error('TelnyxService: Failed to resume call:', error);
        return false;
      }
    }
    return false;
  }

  // Mute/unmute audio
  toggleMute() {
    if (this.activeCall) {
      try {
        this.activeCall.muted = !this.activeCall.muted;
        console.log('TelnyxService: Toggled mute (simulated):', this.activeCall.muted);
        return this.activeCall.muted;
      } catch (error) {
        console.error('TelnyxService: Failed to toggle mute:', error);
        return false;
      }
    }
    return false;
  }

  // Enable/disable video
  toggleVideo() {
    if (this.activeCall && this.activeCall.isVideo) {
      try {
        this.activeCall.videoEnabled = !this.activeCall.videoEnabled;
        console.log('TelnyxService: Toggled video (simulated):', this.activeCall.videoEnabled);
        return this.activeCall.videoEnabled;
      } catch (error) {
        console.error('TelnyxService: Failed to toggle video:', error);
        return false;
      }
    }
    return false;
  }

  // Send DTMF tones
  sendDTMF(tone) {
    if (this.activeCall && this.activeCall.state === 'active') {
      try {
        console.log('TelnyxService: Sending DTMF tone (simulated):', tone);
        return true;
      } catch (error) {
        console.error('TelnyxService: Failed to send DTMF:', error);
        return false;
      }
    }
    return false;
  }

  // Get call streams for video display (simulated)
  getCallStreams() {
    if (this.activeCall && this.activeCall.isVideo) {
      return {
        localStream: { id: 'local-stream-sim' },
        remoteStream: { id: 'remote-stream-sim' }
      };
    }
    return { localStream: null, remoteStream: null };
  }

  // Simulate incoming call
  simulateIncomingCall(callerNumber = '+1234567890', callerName = 'Test Caller') {
    if (this.activeCall) {
      console.log('TelnyxService: Cannot simulate incoming call - another call in progress');
      return;
    }

    console.log('TelnyxService: Simulating incoming call from:', callerNumber);
    
    const call = {
      callId: this.generateCallId(),
      callerNumber,
      callerName,
      direction: 'inbound',
      state: 'ringing',
      isVideo: false,
      startTime: new Date().toISOString()
    };
    
    this.activeCall = call;
    this.notifyListeners('incomingCall', call);
  }

  // Event listener management
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  notifyListeners(event, data = null) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('TelnyxService: Error in event listener:', error);
        }
      });
    }
  }

  // Set call quality monitoring callback
  setCallQualityCallback(callback) {
    this.callQualityCallback = callback;
  }

  // Get current call state
  getCurrentCallState() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      hasActiveCall: !!this.activeCall,
      callState: this.activeCall ? this.activeCall.state : null,
      callDirection: this.activeCall ? this.activeCall.direction : null,
      isSimulation: this.config.isSimulation
    };
  }

  // Helper method to generate call ID
  generateCallId() {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Save credentials securely
  async saveCredentials(sipUser, sipPassword) {
    try {
      await AsyncStorage.setItem('@telnyx_credentials', JSON.stringify({
        sipUser,
        sipPassword
      }));
    } catch (error) {
      console.error('TelnyxService: Failed to save credentials:', error);
    }
  }

  // Load saved credentials
  async loadCredentials() {
    try {
      const credentials = await AsyncStorage.getItem('@telnyx_credentials');
      if (credentials) {
        return JSON.parse(credentials);
      }
    } catch (error) {
      console.error('TelnyxService: Failed to load credentials:', error);
    }
    return null;
  }

  // Clear saved credentials
  async clearCredentials() {
    try {
      await AsyncStorage.removeItem('@telnyx_credentials');
    } catch (error) {
      console.error('TelnyxService: Failed to clear credentials:', error);
    }
  }

  // Development helper methods
  isDevelopmentMode() {
    return this.config.isSimulation;
  }

  // Test incoming call for development
  testIncomingCall() {
    if (__DEV__) {
      setTimeout(() => {
        this.simulateIncomingCall();
      }, 2000);
    }
  }
}

// Export singleton instance
export default new TelnyxService(); 