import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ConsultationScreen = ({ route }) => {
  const navigation = useNavigation();
  const { patient } = route.params || {};
  const [activeTab, setActiveTab] = useState('patientInfo');
  const [messageText, setMessageText] = useState('');

  // Mock patient data
  const mockPatientData = {
    name: patient?.name || 'John Doe',
    age: '45',
    gender: 'Male',
    bloodPressure: '120/80 mmHg',
    temperature: '99.6°F',
    currentMedications: ['Medication A', 'Medication B'],
  };

  const renderPatientInfoTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Patient Details</Text>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Age:</Text>
        <Text style={styles.detailValue}>{mockPatientData.age}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Gender:</Text>
        <Text style={styles.detailValue}>{mockPatientData.gender}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Blood Pressure:</Text>
        <Text style={styles.detailValue}>{mockPatientData.bloodPressure}</Text>
      </View>
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>Temperature:</Text>
        <Text style={styles.detailValue}>{mockPatientData.temperature}</Text>
      </View>

      <Text style={styles.sectionTitle}>Current Medications</Text>
      {mockPatientData.currentMedications.map((medication, index) => (
        <Text key={index} style={styles.medicationItem}>{medication}</Text>
      ))}
    </ScrollView>
  );

  const renderMedicationsTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Current Medications</Text>
      {mockPatientData.currentMedications.map((medication, index) => (
        <View key={index} style={styles.medicationCard}>
          <Text style={styles.medicationName}>{medication}</Text>
          <Text style={styles.medicationDosage}>Take as prescribed</Text>
        </View>
      ))}
    </ScrollView>
  );

  const renderNotesTab = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Consultation Notes</Text>
      <TextInput
        style={styles.notesInput}
        placeholder="Add consultation notes..."
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />
    </ScrollView>
  );

  const TabButton = ({ title, tabKey, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTabButton]}
      onPress={onPress}
    >
      <Text style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Consult</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Video Call Interface */}
      <View style={styles.videoContainer}>
        {/* Main video area */}
        <View style={styles.mainVideo}>
          <View style={styles.patientVideoPlaceholder}>
            <Ionicons name="person" size={80} color="#7F8C8D" />
          </View>
        </View>

        {/* Doctor's video thumbnail */}
        <View style={styles.doctorVideoThumbnail}>
          <Ionicons name="person" size={30} color="#7F8C8D" />
        </View>

        {/* Call controls */}
        <View style={styles.callControls}>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="mic" size={24} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Ionicons name="videocam-off" size={24} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.controlButton, styles.endCallButton]}>
            <Ionicons name="call" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TabButton
          title="Patient Info"
          tabKey="patientInfo"
          isActive={activeTab === 'patientInfo'}
          onPress={() => setActiveTab('patientInfo')}
        />
        <TabButton
          title="Medications"
          tabKey="medications"
          isActive={activeTab === 'medications'}
          onPress={() => setActiveTab('medications')}
        />
        <TabButton
          title="Notes"
          tabKey="notes"
          isActive={activeTab === 'notes'}
          onPress={() => setActiveTab('notes')}
        />
      </View>

      {/* Tab Content */}
      <View style={styles.contentContainer}>
        {activeTab === 'patientInfo' && renderPatientInfoTab()}
        {activeTab === 'medications' && renderMedicationsTab()}
        {activeTab === 'notes' && renderNotesTab()}
      </View>

      {/* Message Input */}
      <View style={styles.messageContainer}>
        <TextInput
          style={styles.messageInput}
          placeholder="Message"
          value={messageText}
          onChangeText={setMessageText}
        />
        <TouchableOpacity style={styles.sendButton}>
          <Ionicons name="send" size={20} color="#4A90E2" />
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  headerRight: {
    width: 24,
  },
  videoContainer: {
    height: 300,
    backgroundColor: '#000000',
    position: 'relative',
  },
  mainVideo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientVideoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorVideoThumbnail: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 80,
    height: 100,
    backgroundColor: '#333333',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  callControls: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  endCallButton: {
    backgroundColor: '#DC3545',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#4A90E2',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  detailLabel: {
    fontSize: 14,
    color: '#566573',
  },
  detailValue: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  medicationItem: {
    fontSize: 14,
    color: '#2C3E50',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F5',
  },
  medicationCard: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 5,
  },
  medicationDosage: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  notesInput: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    fontSize: 14,
    color: '#2C3E50',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    minHeight: 120,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    color: '#2C3E50',
    marginRight: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ConsultationScreen; 