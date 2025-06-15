import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFonts, DancingScript_700Bold } from '@expo-google-fonts/dancing-script';

const PrescriptionPreviewScreen = ({ route, navigation }) => {
  const { prescriptionData, editable = true } = route.params;

  // Load handwritten font
  const [fontsLoaded] = useFonts({
    DancingScript_700Bold,
  });
  if (!fontsLoaded) return null;

  // Clinic info (static for template)
  const clinic = {
    name: 'MEDICAL CENTRE',
    address: '824 14th Street',
    city: 'New York, NY 91743, USA',
    dea: 'DEA# GB 05455616',
    lic: 'LIC # 976269',
  };

  // Patient info (fallbacks for demo)
  const patient = prescriptionData?.patient || {};
  const name = patient.name || 'John Smith';
  const age = patient.age || '34';
  const address = patient.address || '162 Example St, NY';
  const date = prescriptionData?.date || '09-11-12';

  // Medications (array)
  const medications = prescriptionData?.medications || [
    { name: 'Betaloc', dosage: '100mg', sig: '1 tab BID' },
    { name: 'Dorzolamide', dosage: '10mg', sig: '1 tab BID' },
    { name: 'Cimetidine', dosage: '50 mg', sig: '2 tabs TID' },
    { name: 'Oxprelol', dosage: '50mg', sig: '1 tab QD' },
  ];

  // Doctor signature (static for template)
  const doctorSignature = 'Dr. Steve Johnson';

  const handleDownloadPDF = () => {
    Alert.alert('Download PDF', 'PDF download functionality will be implemented with a PDF generation library');
  };

  const handleSendPrescription = () => {
    // Compose the prescription object for the queue
    const prescriptionForQueue = {
      patientId: prescriptionData.patient?.id || 'new',
      patientName: prescriptionData.patient?.name,
      medication: (prescriptionData.medications || []).map(m => `${m.name} ${m.dosage}`).join(', '),
      status: 'Sent',
      date: prescriptionData.date || new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      medications: prescriptionData.medications,
    };
    navigation.navigate('PrescriptionQueue', { newPrescription: prescriptionForQueue });
  };

  const handleSharePrescription = () => {
    Alert.alert('Share Prescription', 'Share functionality will be implemented with React Native Share');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.headerSmall}>{clinic.dea}</Text>
          <Text style={styles.headerSmall}>{clinic.lic}</Text>
        </View>
        <View style={styles.clinicInfo}>
          <Text style={styles.clinicName}>{clinic.name}</Text>
          <Text style={styles.clinicAddress}>{clinic.address}</Text>
          <Text style={styles.clinicAddress}>{clinic.city}</Text>
        </View>
        {/* Patient Info */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name:</Text>
          <Text style={styles.handwritten}>{name}</Text>
          <Text style={styles.infoLabel}>Age:</Text>
          <Text style={styles.handwritten}>{age}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Address:</Text>
          <Text style={styles.handwritten}>{address}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Date:</Text>
          <Text style={styles.handwritten}>{date}</Text>
        </View>
        {/* Rx and Medications */}
        <View style={styles.rxRow}>
          <Text style={styles.rxSymbol}>℞</Text>
          <View style={styles.medList}>
            {medications.map((med, idx) => (
              <Text key={idx} style={styles.medHandwritten}>
                {med.name} {med.dosage} – {med.sig}
              </Text>
            ))}
          </View>
        </View>
        {/* Signature */}
        <View style={styles.signatureSection}>
          <Text style={styles.signatureHandwritten}>{doctorSignature}</Text>
          <Text style={styles.signatureLabel}>signature</Text>
        </View>
        {/* Footer */}
        <View style={styles.footerRow}>
          <View style={styles.footerLeft}>
            <Text style={styles.footerLabel}>LABEL</Text>
            <Text style={styles.footerRefill}>REFILL ⃝ 0 ⃝ 1 ⃝ 2 ⃝ 3 ⃝ 4 ⃝ 5 PRN</Text>
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.footerCode}>W7X-N-RXEC-7</Text>
            <Text style={styles.footerPhone}>1-800-421-4700</Text>
          </View>
        </View>
        {/* Adherence Warnings */}
        <View style={styles.adherenceBox}>
          <Text style={styles.adherenceTitle}>Important Instructions:</Text>
          <Text style={styles.adherenceText}>• Take medication exactly as prescribed</Text>
          <Text style={styles.adherenceText}>• Complete the full course of treatment even if symptoms improve</Text>
          <Text style={styles.adherenceText}>• Do not share this medication with others</Text>
          <Text style={styles.adherenceText}>• Contact your physician immediately if adverse effects occur</Text>
          <Text style={styles.adherenceText}>• Store medication as directed on the package</Text>
          <Text style={styles.adherenceText}>• This prescription is valid for 12 months from date of issue</Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.shareButton} onPress={handleSharePrescription}>
          <Ionicons name="share-outline" size={20} color="#4A90E2" />
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>
        {editable && (
          <TouchableOpacity style={styles.sendButton} onPress={handleSendPrescription}>
            <Text style={styles.sendButtonText}>Send Prescription</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 24,
    minHeight: 700,
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerSmall: {
    fontSize: 13,
    color: '#222',
    fontWeight: '500',
  },
  clinicInfo: {
    alignItems: 'center',
    marginBottom: 18,
  },
  clinicName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    letterSpacing: 1,
  },
  clinicAddress: {
    fontSize: 14,
    color: '#222',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  infoLabel: {
    fontSize: 15,
    color: '#222',
    fontWeight: 'bold',
    marginRight: 4,
  },
  handwritten: {
    fontFamily: 'DancingScript_700Bold',
    color: '#2563eb',
    fontSize: 18,
    marginRight: 16,
    marginBottom: 2,
  },
  rxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 18,
    marginBottom: 24,
  },
  rxSymbol: {
    fontSize: 60,
    color: '#111',
    fontWeight: 'bold',
    marginRight: 18,
    marginTop: -8,
  },
  medList: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  medHandwritten: {
    fontFamily: 'DancingScript_700Bold',
    color: '#2563eb',
    fontSize: 20,
    marginBottom: 6,
  },
  signatureSection: {
    alignItems: 'flex-end',
    marginTop: 32,
    marginBottom: 8,
  },
  signatureHandwritten: {
    fontFamily: 'DancingScript_700Bold',
    color: '#2563eb',
    fontSize: 22,
    marginBottom: 2,
  },
  signatureLabel: {
    fontSize: 12,
    color: '#444',
    fontStyle: 'italic',
    marginRight: 6,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 32,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  footerLeft: {
    flexDirection: 'column',
  },
  footerLabel: {
    fontSize: 13,
    color: '#222',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  footerRefill: {
    fontSize: 13,
    color: '#222',
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  footerCode: {
    fontSize: 13,
    color: '#222',
    fontWeight: 'bold',
  },
  footerPhone: {
    fontSize: 13,
    color: '#222',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    gap: 15,
  },
  shareButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
    marginLeft: 8,
  },
  sendButton: {
    flex: 2,
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  adherenceBox: {
    backgroundColor: '#FFF9E6',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    marginTop: 20,
    marginBottom: 20,
  },
  adherenceTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  adherenceText: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 3,
  },
});

export default PrescriptionPreviewScreen; 