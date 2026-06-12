import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { prescriptionsAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const ACCENT = '#00897B';

const InfoRow = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value ?? '—'}</Text>
  </View>
);

const PrescriptionDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const pharmacyId = route.params?.pharmacyId ?? user?.pharmacy?._id ?? user?.pharmacyId;
  const [prescription, setPrescription] = useState(route.params?.prescription ?? {});
  const [verifying, setVerifying] = useState(false);
  const [dispensing, setDispensing] = useState(false);

  const isVerified = prescription.verification?.verified === true;
  const isDispensed = !!prescription.dispensing?.dispensedAt;
  const isActive = prescription.status === 'ACTIVE';

  const patientName = prescription.patient?.user?.name ?? prescription.patient?.name ?? 'Patient';
  const doctorName = prescription.doctor?.user?.name ?? prescription.doctor?.name ?? 'Doctor';

  const handleVerify = () => {
    Alert.alert(
      'Verify Prescription',
      'Confirm this prescription is valid and ready for dispensing?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Verify', onPress: async () => {
            setVerifying(true);
            try {
              const res = await prescriptionsAPI.verifyForPharmacy(
                pharmacyId,
                prescription._id ?? prescription.id,
                { verified: true, notes: 'Verified by pharmacist' }
              );
              setPrescription(res?.data?.data ?? { ...prescription, verification: { verified: true, verifiedAt: new Date() } });
              Alert.alert('Verified', 'Prescription verified successfully.');
            } catch (e) {
              Alert.alert('Error', e?.response?.data?.message ?? 'Verification failed.');
            } finally {
              setVerifying(false);
            }
          }
        }
      ]
    );
  };

  const handleDispense = () => {
    Alert.alert(
      'Dispense Medication',
      'Confirm you are dispensing this medication to the patient?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Dispense', onPress: async () => {
            setDispensing(true);
            try {
              const res = await prescriptionsAPI.dispenseForPharmacy(
                pharmacyId,
                prescription._id ?? prescription.id,
                { dispensedBy: user?._id, notes: 'Dispensed by pharmacist' }
              );
              setPrescription(res?.data?.data ?? { ...prescription, status: 'COMPLETED' });
              Alert.alert('Dispensed', 'Medication dispensed. Prescription marked complete.');
            } catch (e) {
              Alert.alert('Error', e?.response?.data?.message ?? 'Dispensing failed.');
            } finally {
              setDispensing(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.title}>Prescription Detail</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Patient & Doctor */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient & Doctor</Text>
          <InfoRow label="Patient" value={patientName} />
          <InfoRow label="Doctor" value={`Dr. ${doctorName}`} />
          <InfoRow label="Diagnosis" value={prescription.diagnosis} />
          <InfoRow label="Notes" value={prescription.notes} />
          <InfoRow label="Date Issued" value={prescription.createdAt ? new Date(prescription.createdAt).toLocaleDateString() : null} />
        </View>

        {/* Medications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medications</Text>
          {(prescription.medications ?? []).length === 0 ? (
            <Text style={styles.noMeds}>No medications listed</Text>
          ) : (
            (prescription.medications ?? []).map((med, idx) => (
              <View key={idx} style={styles.medItem}>
                <View style={styles.medHeader}>
                  <Ionicons name="medical-outline" size={16} color={ACCENT} />
                  <Text style={styles.medName}>{med.name}</Text>
                </View>
                <Text style={styles.medDetail}>Dosage: {med.dosage ?? '—'}</Text>
                <Text style={styles.medDetail}>Frequency: {med.frequency ?? '—'}</Text>
                <Text style={styles.medDetail}>Duration: {med.duration ?? '—'}</Text>
                {med.instructions && <Text style={styles.medDetail}>Instructions: {med.instructions}</Text>}
              </View>
            ))
          )}
        </View>

        {/* Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status</Text>
          <InfoRow label="Status" value={prescription.status} />
          <InfoRow label="Verified" value={isVerified ? `Yes — ${new Date(prescription.verification.verifiedAt).toLocaleDateString()}` : 'No'} />
          <InfoRow label="Dispensed" value={isDispensed ? `Yes — ${new Date(prescription.dispensing.dispensedAt).toLocaleDateString()}` : 'No'} />
        </View>

        {/* Actions */}
        {isActive && !isDispensed && (
          <View style={styles.actions}>
            {!isVerified ? (
              <TouchableOpacity style={styles.verifyBtn} onPress={handleVerify} disabled={verifying}>
                {verifying
                  ? <ActivityIndicator color="#fff" />
                  : <><Ionicons name="checkmark-circle-outline" size={20} color="#fff" /><Text style={styles.btnText}>Verify Prescription</Text></>
                }
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.dispenseBtn} onPress={handleDispense} disabled={dispensing}>
                {dispensing
                  ? <ActivityIndicator color="#fff" />
                  : <><Ionicons name="bag-check-outline" size={20} color="#fff" /><Text style={styles.btnText}>Dispense Medication</Text></>
                }
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E9ECEF',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#2C3E50' },
  content: { padding: 16 },
  section: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#2C3E50', marginBottom: 12 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  infoLabel: { fontSize: 14, color: '#7F8C8D', flex: 1 },
  infoValue: { fontSize: 14, color: '#2C3E50', fontWeight: '500', flex: 1, textAlign: 'right' },
  noMeds: { fontSize: 14, color: '#7F8C8D' },
  medItem: {
    backgroundColor: '#F5F6FA', borderRadius: 8, padding: 12, marginBottom: 8,
  },
  medHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  medName: { fontSize: 15, fontWeight: '700', color: '#2C3E50' },
  medDetail: { fontSize: 13, color: '#555', marginTop: 2 },
  actions: { marginBottom: 8 },
  verifyBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#0288D1', borderRadius: 12, paddingVertical: 14,
  },
  dispenseBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: ACCENT, borderRadius: 12, paddingVertical: 14,
  },
  btnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});

export default PrescriptionDetailScreen;
