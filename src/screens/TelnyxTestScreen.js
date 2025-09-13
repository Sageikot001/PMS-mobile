import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
  SafeAreaView
} from 'react-native';
import { chatService, telnyxService } from '../lib/api';
import { getTelnyxInitConfig } from '../config/TelnyxConfig';

const TelnyxTestScreen = ({ navigation }) => {
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [currentCall, setCurrentCall] = useState(null);
  const [callQuality, setCallQuality] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('+1234567890');
  const [callLogs, setCallLogs] = useState([]);

  useEffect(() => {
    initializeTelnyx();
    setupCallListeners();
    
    return () => {
      // Cleanup listeners
      telnyxService.removeEventListener('connected', handleConnectionChange);
      telnyxService.removeEventListener('disconnected', handleConnectionChange);
      telnyxService.removeEventListener('callStateChanged', handleCallStateChange);
      telnyxService.removeEventListener('incomingCall', handleIncomingCall);
    };
  }, []);

  const initializeTelnyx = async () => {
    try {
      // Initialize with simulation config
      const telnyxConfig = getTelnyxInitConfig();
      await chatService.initialize('test-user-id', telnyxConfig);
      
      // Set up call quality monitoring
      chatService.setCallQualityCallback((metrics) => {
        setCallQuality(metrics);
      });
      
      addLog('Telnyx initialized successfully (simulation mode)');
    } catch (error) {
      console.error('Failed to initialize Telnyx:', error);
      addLog(`Initialization failed: ${error.message}`);
    }
  };

  const setupCallListeners = () => {
    telnyxService.addEventListener('connected', handleConnectionChange);
    telnyxService.addEventListener('disconnected', handleConnectionChange);
    telnyxService.addEventListener('callStateChanged', handleCallStateChange);
    telnyxService.addEventListener('incomingCall', handleIncomingCall);
  };

  const handleConnectionChange = () => {
    const state = telnyxService.getCurrentCallState();
    setConnectionStatus(state.isConnected ? 'Connected' : 'Disconnected');
    addLog(`Connection status: ${state.isConnected ? 'Connected' : 'Disconnected'}`);
  };

  const handleCallStateChange = ({ state, call }) => {
    setCurrentCall(call);
    addLog(`Call state changed: ${state}`);
    
    if (state === 'ended') {
      setCurrentCall(null);
      setCallQuality(null);
    }
  };

  const handleIncomingCall = (call) => {
    addLog(`Incoming call from: ${call.callerNumber}`);
    
    Alert.alert(
      'Incoming Call',
      `${call.callerName || call.callerNumber} is calling`,
      [
        {
          text: 'Decline',
          onPress: () => {
            telnyxService.rejectCall();
            addLog('Call rejected');
          }
        },
        {
          text: 'Answer',
          onPress: () => {
            telnyxService.answerCall();
            addLog('Call answered');
          }
        }
      ]
    );
  };

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setCallLogs(prev => [...prev, `${timestamp}: ${message}`].slice(-10)); // Keep last 10 logs
  };

  const makeVoiceCall = async () => {
    try {
      await chatService.initiateVoiceCall('test-chat-id', phoneNumber);
      addLog(`Voice call initiated to ${phoneNumber}`);
    } catch (error) {
      addLog(`Voice call failed: ${error.message}`);
      Alert.alert('Call Failed', error.message);
    }
  };

  const makeVideoCall = async () => {
    try {
      await chatService.initiateVideoCall('test-chat-id', phoneNumber);
      addLog(`Video call initiated to ${phoneNumber}`);
    } catch (error) {
      addLog(`Video call failed: ${error.message}`);
      Alert.alert('Video Call Failed', error.message);
    }
  };

  const endCall = () => {
    if (currentCall) {
      telnyxService.endCall();
      addLog('Call ended by user');
    }
  };

  const toggleMute = () => {
    if (currentCall) {
      const isMuted = telnyxService.toggleMute();
      addLog(`Microphone ${isMuted ? 'muted' : 'unmuted'}`);
    }
  };

  const holdCall = () => {
    if (currentCall && currentCall.state === 'active') {
      telnyxService.holdCall();
      addLog('Call put on hold');
    } else if (currentCall && currentCall.state === 'held') {
      telnyxService.resumeCall();
      addLog('Call resumed');
    }
  };

  const simulateIncomingCall = () => {
    telnyxService.simulateIncomingCall();
    addLog('Simulating incoming call...');
  };

  const sendDTMF = (digit) => {
    if (currentCall && currentCall.state === 'active') {
      telnyxService.sendDTMF(digit);
      addLog(`DTMF tone sent: ${digit}`);
    }
  };

  const getCallStateColor = () => {
    if (!currentCall) return '#6c757d';
    switch (currentCall.state) {
      case 'ringing': return '#ffc107';
      case 'active': return '#28a745';
      case 'held': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Telnyx Test Screen</Text>
        </View>

        {/* Status Section */}
        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>Connection Status</Text>
          <View style={[styles.statusIndicator, { 
            backgroundColor: connectionStatus === 'Connected' ? '#28a745' : '#dc3545' 
          }]}>
            <Text style={styles.statusText}>{connectionStatus}</Text>
          </View>
          
          {telnyxService.isDevelopmentMode() && (
            <Text style={styles.devModeText}>
              🚧 Running in simulation mode for Expo Go development
            </Text>
          )}
        </View>

        {/* Phone Number Input */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Phone Number</Text>
          <TextInput
            style={styles.phoneInput}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
        </View>

        {/* Call Controls */}
        <View style={styles.controlsSection}>
          <Text style={styles.sectionTitle}>Call Controls</Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.callButton} onPress={makeVoiceCall}>
              <Text style={styles.buttonText}>Voice Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.videoButton} onPress={makeVideoCall}>
              <Text style={styles.buttonText}>Video Call</Text>
            </TouchableOpacity>
          </View>

          {currentCall && (
            <View style={styles.activeCallSection}>
              <Text style={[styles.callStateText, { color: getCallStateColor() }]}>
                Call State: {currentCall.state.toUpperCase()}
              </Text>
              
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.controlButton} onPress={toggleMute}>
                  <Text style={styles.buttonText}>
                    {currentCall.muted ? 'Unmute' : 'Mute'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.controlButton} onPress={holdCall}>
                  <Text style={styles.buttonText}>
                    {currentCall.state === 'held' ? 'Resume' : 'Hold'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.endButton} onPress={endCall}>
                  <Text style={styles.buttonText}>End Call</Text>
                </TouchableOpacity>
              </View>

              {/* DTMF Keypad */}
              {currentCall.state === 'active' && (
                <View style={styles.dtmfSection}>
                  <Text style={styles.sectionTitle}>DTMF Keypad</Text>
                  <View style={styles.dtmfGrid}>
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
                      <TouchableOpacity
                        key={digit}
                        style={styles.dtmfButton}
                        onPress={() => sendDTMF(digit)}
                      >
                        <Text style={styles.dtmfText}>{digit}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Call Quality Monitor */}
        {callQuality && (
          <View style={styles.qualitySection}>
            <Text style={styles.sectionTitle}>Call Quality</Text>
            <Text style={styles.qualityText}>Quality: {callQuality.quality}</Text>
            <Text style={styles.qualityText}>MOS Score: {callQuality.mos?.toFixed(2)}</Text>
            <Text style={styles.qualityText}>Jitter: {callQuality.jitter?.toFixed(1)}ms</Text>
            <Text style={styles.qualityText}>RTT: {callQuality.rtt?.toFixed(1)}ms</Text>
          </View>
        )}

        {/* Test Functions */}
        <View style={styles.testSection}>
          <Text style={styles.sectionTitle}>Test Functions</Text>
          <TouchableOpacity style={styles.testButton} onPress={simulateIncomingCall}>
            <Text style={styles.buttonText}>Simulate Incoming Call</Text>
          </TouchableOpacity>
        </View>

        {/* Call Logs */}
        <View style={styles.logsSection}>
          <Text style={styles.sectionTitle}>Call Logs</Text>
          <View style={styles.logsContainer}>
            {callLogs.map((log, index) => (
              <Text key={index} style={styles.logText}>{log}</Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  statusSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 10,
  },
  statusIndicator: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
  },
  devModeText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  inputSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
  },
  controlsSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  callButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  videoButton: {
    backgroundColor: '#6f42c1',
    padding: 15,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: '#17a2b8',
    padding: 12,
    borderRadius: 6,
    flex: 0.3,
    alignItems: 'center',
  },
  endButton: {
    backgroundColor: '#dc3545',
    padding: 12,
    borderRadius: 6,
    flex: 0.3,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#ffc107',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  activeCallSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  callStateText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 15,
  },
  dtmfSection: {
    marginTop: 15,
  },
  dtmfGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dtmfButton: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  dtmfText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#495057',
  },
  qualitySection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  qualityText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 5,
  },
  testSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  logsSection: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  logsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 5,
    maxHeight: 200,
  },
  logText: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 3,
    fontFamily: 'monospace',
  },
});

export default TelnyxTestScreen; 